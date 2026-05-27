using System;
using System.Drawing;
using System.Reflection;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Net.Http;
using System.IO;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Diagnostics;
using System.Text.Json;
using System.Linq;
using System.Runtime.InteropServices;
using System.IO.Compression;
using Microsoft.Identity.Client;

namespace InstallerPanel
{
    public class AppItem
    {
        public string Name { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string Args { get; set; } = string.Empty;
        public DateTime DateUploaded { get; set; } = DateTime.MinValue;
        public string Version { get; set; } = string.Empty;
        public bool Installed { get; set; } = false;
        public bool IsRemote { get; set; } = false;
    }

    public class MainForm : Form
    {
        private ListView listView;
        private Button btnInstall;
        
        private List<AppItem> apps = new();
        private Button btnUpload;
        private Button btnRemove;
        private readonly string packagesDir;
        private readonly string packagesJsonPath;
        private readonly string remoteConfigPath;
        private readonly Dictionary<string, Image> imageCache = new(StringComparer.OrdinalIgnoreCase);
        private static readonly HttpClient SharedHttpClient = new HttpClient(
            new HttpClientHandler { UseDefaultCredentials = true, AllowAutoRedirect = true });
        // Client sem credenciais Windows para URLs públicas do SharePoint Online / OneDrive
        private static readonly HttpClient PublicHttpClient = new HttpClient(
            new HttpClientHandler { AllowAutoRedirect = true })
        {
            DefaultRequestHeaders = { { "User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36" } }
        };

        // MSAL - autenticação interativa Microsoft 365 / SharePoint Online
        private static IPublicClientApplication? _msalApp;
        private static string? _spBearerToken;
        private static DateTime _spTokenExpiry = DateTime.MinValue;

        public MainForm()
        {
            Text = "Instalador - Comgas";
            Width = 800; Height = 600;
            // borda fixa e padding interno para layout consistente
            this.FormBorderStyle = FormBorderStyle.FixedSingle;
            this.Padding = new Padding(12);

            // topo limpo: logo acima dos botões
            var pictureBox = new PictureBox { Left = 10, Top = 10, Width = 160, Height = 60, SizeMode = PictureBoxSizeMode.Zoom, Anchor = AnchorStyles.Top | AnchorStyles.Left, BackColor = Color.Transparent };
            try
            {
                // Procurar logos comuns (png/jpg) e nomes admin/user/fallback
                var variants = new[] { "logo.png", "logo.jpg", "logo.jpeg", "logo_admin.png", "logo_admin.jpg", "logo_user.png", "logo_user.jpg", "logo_fallback.png", "logo_fallback.jpg" };
                Image? embedded = null;
                foreach (var v in variants)
                {
                    embedded = LoadEmbeddedLogo(v);
                    if (embedded != null) break;
                }
                if (embedded != null)
                {
                    SetPictureBoxImage(pictureBox, embedded);
                }
                else
                {
                    string? foundPath = null;
                    foreach (var v in variants)
                    {
                        var p = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, v);
                        if (!File.Exists(p)) p = Path.Combine(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "packages"), v);
                        if (File.Exists(p)) { foundPath = p; break; }
                    }
                    if (foundPath != null)
                    {
                        Image img;
                        if (!imageCache.TryGetValue(foundPath, out var cachedImg))
                        {
                            var raw = Image.FromFile(foundPath);
                            var processed = MakeBackgroundTransparent(raw, Color.White, 30);
                            if (!ReferenceEquals(processed, raw)) raw.Dispose();
                            imageCache[foundPath] = processed;
                            img = processed;
                        }
                        else img = cachedImg;
                        SetPictureBoxImage(pictureBox, img);
                    }
                }
            }
            catch { }
            Controls.Add(pictureBox);

            // mostrar versão do instalador no canto superior direito
            try
            {
                var verText = GetInstallerVersion();
                var lblVersion = new Label
                {
                    Left = 600,
                    Top = 16,
                    Width = 180,
                    Height = 22,
                    Text = "Versão: " + verText,
                    TextAlign = ContentAlignment.TopRight,
                    Anchor = AnchorStyles.Top | AnchorStyles.Right
                };
                lblVersion.Font = new Font(lblVersion.Font.FontFamily, 9f, FontStyle.Regular);
                Controls.Add(lblVersion);
            }
            catch { }

            // FORCE FALLBACK: se houver apenas um arquivo de logo disponível, usá-lo em tamanho maior
            try
            {
                var candidates = new[] { "logo.png", "logo.jpg", "logo_admin.png", "logo_admin.jpg", "logo_user.png", "logo_user.jpg", "logo_fallback.png" };
                var found = new List<string>();
                foreach (var c in candidates)
                {
                    var p = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, c);
                    if (!File.Exists(p)) p = Path.Combine(packagesDir ?? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "packages"), c);
                    if (File.Exists(p)) found.Add(p);
                }
                if (found.Count == 1 && pictureBox.Image == null)
                {
                    // usar esse em tamanho maior (com cache)
                    Image img;
                    if (!imageCache.TryGetValue(found[0], out var cached))
                    {
                        var raw = Image.FromFile(found[0]);
                        var processed = MakeBackgroundTransparent(raw, Color.White, 30);
                        if (!ReferenceEquals(processed, raw)) raw.Dispose();
                        imageCache[found[0]] = processed;
                        img = processed;
                    }
                    else img = cached;
                    pictureBox.Image = img;
                    pictureBox.SizeMode = PictureBoxSizeMode.StretchImage;
                    pictureBox.Height = 90;
                }
            }
            catch { }

            // definir posições dos botões respeitando padding
            int startX = this.Padding.Left;
            int btnTop = 90;
            int btnWidth = 160;
            int gap = 20;

            btnInstall = new Button { Left = startX, Top = btnTop, Width = btnWidth, Text = "Instalar selecionados" };
            btnInstall.Click += async (s,e)=> await InstallSelected();
            Controls.Add(btnInstall);
            // garantir que o pictureBox fique acima do botão Instalar
            try
            {
                pictureBox.Left = btnInstall.Left;
                pictureBox.Top = btnInstall.Top - pictureBox.Height - 6;
            }
            catch { }
            btnUpload = new Button { Left = btnInstall.Left + btnWidth + gap, Top = btnTop, Width = btnWidth, Text = "Upload" };
            btnUpload.Click += async (s,e)=> await UploadFiles();
            // Mostrar Upload sempre (única versão).
            btnUpload.Visible = true;
            btnUpload.Enabled = true;
            Controls.Add(btnUpload);

            btnRemove = new Button { Left = btnUpload.Left + btnWidth + gap, Top = btnTop, Width = btnWidth, Text = "Remover" };
            btnRemove.Click += (s,e)=> RemoveSelected();
            Controls.Add(btnRemove);
            var btnRename = new Button { Left = btnRemove.Left + btnWidth + gap, Top = btnTop, Width = btnWidth, Text = "Renomear" };
            btnRename.Click += (s,e)=> RenameSelected();
            Controls.Add(btnRename);
            var btnUploadFolder = new Button { Left = startX, Top = btnTop + 30, Width = btnWidth, Text = "Upload Pasta" };
            btnUploadFolder.Click += async (s,e) => await UploadFolder();
            Controls.Add(btnUploadFolder);
            var btnSync = new Button { Left = startX + btnWidth + gap, Top = btnTop + 30, Width = btnWidth, Text = "↻ Sincronizar" };
            btnSync.Click += async (s,e) => await SyncFromRemote();
            Controls.Add(btnSync);
            var btnConfigUrl = new Button { Left = startX + (btnWidth + gap) * 2, Top = btnTop + 30, Width = btnWidth, Text = "⚙ Configurar URL" };
            btnConfigUrl.Click += (s,e) => ConfigureRemoteUrl();
            Controls.Add(btnConfigUrl);
            // ajustar listView para preencher a largura disponível menos padding
            int listLeft = this.Padding.Left;
            int listTop = 162;
            int listWidth = this.ClientSize.Width - this.Padding.Left - this.Padding.Right - 20;
            int listHeight = this.ClientSize.Height - listTop - this.Padding.Bottom - 20;
            listView = new ListView { Left = listLeft, Top = listTop, Width = listWidth, Height = listHeight, View = View.Details, CheckBoxes = true, Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right };
            listView.Columns.Add("Aplicação", 230);
            listView.Columns.Add("Data Upload", 160);
            listView.Columns.Add("Versão", 100);
            listView.Columns.Add("Concluído", 80);
            listView.FullRowSelect = true;
            Controls.Add(listView);

            packagesDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "packages");
            packagesJsonPath = Path.Combine(packagesDir, "packages.json");
            remoteConfigPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "remote.config");
            Directory.CreateDirectory(packagesDir);
            // carregar pacotes locais ao iniciar
            LoadLocalPackages();
        }

        private Image? LoadEmbeddedLogo(string fileName)
        {
            try
            {
                var key = "res:" + fileName;
                if (imageCache.TryGetValue(key, out var cached)) return cached;
                var asm = Assembly.GetExecutingAssembly();
                var names = asm.GetManifestResourceNames();
                var match = names.FirstOrDefault(n => n.EndsWith(fileName, StringComparison.OrdinalIgnoreCase));
                if (match != null)
                {
                    using var s = asm.GetManifestResourceStream(match);
                    if (s != null)
                    {
                        var img = Image.FromStream(s);
                        var processed = MakeBackgroundTransparent(img, Color.White, 30);
                        if (!ReferenceEquals(processed, img)) img.Dispose();
                        imageCache[key] = processed;
                        return processed;
                    }
                }
            }
            catch { }
            return null;
        }

        private void SetPictureBoxImage(PictureBox pb, Image img)
        {
            try
            {
                pb.Image = img;
            }
            catch
            {
                pb.Image = img;
            }
        }

        private Image MakeBackgroundTransparent(Image src, Color bgColor, int tolerance)
        {
            try
            {
                var bmp = new Bitmap(src.Width, src.Height, PixelFormat.Format32bppArgb);
                using (var g = Graphics.FromImage(bmp))
                {
                    g.DrawImage(src, 0, 0, src.Width, src.Height);
                }

                var rect = new Rectangle(0, 0, bmp.Width, bmp.Height);
                var bd = bmp.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
                try
                {
                    int bytes = Math.Abs(bd.Stride) * bmp.Height;
                    var pixelData = new byte[bytes];
                    Marshal.Copy(bd.Scan0, pixelData, 0, bytes);
                    for (int i = 0; i < bytes; i += 4)
                    {
                        byte b = pixelData[i];
                        byte g = pixelData[i + 1];
                        byte r = pixelData[i + 2];
                        if (Math.Abs(r - bgColor.R) <= tolerance && Math.Abs(g - bgColor.G) <= tolerance && Math.Abs(b - bgColor.B) <= tolerance)
                        {
                            pixelData[i + 3] = 0; // alpha
                        }
                    }
                    Marshal.Copy(pixelData, 0, bd.Scan0, bytes);
                }
                finally
                {
                    bmp.UnlockBits(bd);
                }
                return bmp;
            }
            catch
            {
                return src;
            }
        }

        // IsAdminEdition removed: projeto usa única versão, método obsoleto

        private string GetInstallerVersion()
        {
            // primeiro, tentar ler o arquivo installer.version gerado pelo build
            try
            {
                var verFile = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "installer.version");
                if (File.Exists(verFile))
                {
                    var txt = File.ReadAllText(verFile).Trim();
                    if (!string.IsNullOrWhiteSpace(txt)) return txt;
                }
            }
            catch { }

            try
            {
                var exe = Application.ExecutablePath;
                if (!string.IsNullOrEmpty(exe) && File.Exists(exe))
                {
                    var ver = FileVersionInfo.GetVersionInfo(exe);
                    var s = ver.ProductVersion ?? ver.FileVersion ?? string.Empty;
                    if (!string.IsNullOrWhiteSpace(s)) return s;
                }
            }
            catch { }

            try
            {
                var asm = Assembly.GetExecutingAssembly();
                var infoAttr = asm.GetCustomAttribute<AssemblyInformationalVersionAttribute>()?.InformationalVersion;
                if (!string.IsNullOrWhiteSpace(infoAttr)) return infoAttr;
                var asmVer = asm.GetName().Version?.ToString();
                if (!string.IsNullOrWhiteSpace(asmVer)) return asmVer;
            }
            catch { }

            return Application.ProductVersion ?? "0.0.0";
        }

        

        private static string BuildSilentArgs(string exePath)
        {
            var ext = Path.GetExtension(exePath).ToLowerInvariant();
            if (ext == ".msi") return "/quiet /norestart";
            if (ext == ".bat") return string.Empty;
            return "/S /silent /quiet /norestart";
        }

        private async Task InstallSelected()
        {
            var checkedItems = listView.CheckedItems.Cast<ListViewItem>().ToList();
            foreach (ListViewItem li in checkedItems)
            {
                var app = li.Tag as AppItem;
                if (app == null) continue;
                try
                {
                    string exePath;
                    if (!string.IsNullOrEmpty(app.Url) && File.Exists(app.Url))
                    {
                        exePath = app.Url;
                    }
                    else if (!string.IsNullOrEmpty(app.Url) && Uri.IsWellFormedUriString(app.Url, UriKind.Absolute))
                    {
                        var downloadUrl = NormalizeDownloadUrl(app.Url);
                        var temp = Path.Combine(Path.GetTempPath(), Path.GetFileName(new Uri(app.Url).LocalPath));

                        // Usar token MSAL em cache se disponível (SharePoint autenticado)
                        HttpResponseMessage resp;
                        if (_spBearerToken != null && DateTime.Now < _spTokenExpiry)
                        {
                            using var authClient = new HttpClient();
                            authClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_spBearerToken}");
                            authClient.DefaultRequestHeaders.Add("User-Agent",
                                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36");
                            resp = await authClient.GetAsync(downloadUrl);
                        }
                        else
                        {
                            resp = await PublicHttpClient.GetAsync(downloadUrl);
                        }
                        resp.EnsureSuccessStatusCode();
                        using (var fs = new FileStream(temp, FileMode.Create, FileAccess.Write, FileShare.None))
                        {
                            await resp.Content.CopyToAsync(fs);
                        }
                        exePath = temp;
                    }
                    else
                    {
                        MessageBox.Show($"Arquivo inválido ou não encontrado: {app.Url}", "Erro", MessageBoxButtons.OK, MessageBoxIcon.Error);
                        continue;
                    }

                    // Extrair ZIP (ex: driver .bat + arquivos complementares)
                    if (Path.GetExtension(exePath).ToLowerInvariant() == ".zip")
                    {
                        var extractDir = Path.Combine(Path.GetTempPath(), "InstallerPanel_" + Path.GetFileNameWithoutExtension(exePath));
                        if (Directory.Exists(extractDir)) Directory.Delete(extractDir, true);
                        Directory.CreateDirectory(extractDir);
                        ZipFile.ExtractToDirectory(exePath, extractDir);
                        var bats = Directory.GetFiles(extractDir, "*.bat", SearchOption.AllDirectories);
                        var exes = Directory.GetFiles(extractDir, "*.exe", SearchOption.AllDirectories);
                        var msis = Directory.GetFiles(extractDir, "*.msi", SearchOption.AllDirectories);
                        var mainFile = bats.FirstOrDefault(f => Path.GetFileName(f).StartsWith("_", StringComparison.OrdinalIgnoreCase))
                            ?? bats.FirstOrDefault() ?? exes.FirstOrDefault() ?? msis.FirstOrDefault();
                        if (mainFile == null)
                        {
                            MessageBox.Show($"Nenhum executável encontrado no ZIP: {app.Name}", "Erro", MessageBoxButtons.OK, MessageBoxIcon.Error);
                            continue;
                        }
                        exePath = mainFile;
                    }

                    var silentArgs = BuildSilentArgs(exePath);
                    var finalArgs = string.IsNullOrWhiteSpace(app.Args) ? silentArgs : $"{silentArgs} {app.Args}";
                    bool isMsi = Path.GetExtension(exePath).ToLowerInvariant() == ".msi";

                    var workDir = Path.GetDirectoryName(exePath) ?? string.Empty;
                    ProcessStartInfo psi;
                    if (isMsi)
                        psi = new ProcessStartInfo("msiexec.exe", $"/i \"{exePath}\" {finalArgs}") { UseShellExecute = true, Verb = "runas", WorkingDirectory = workDir };
                    else if (Path.GetExtension(exePath).ToLowerInvariant() == ".bat")
                        psi = new ProcessStartInfo("cmd.exe", $"/c \"{exePath}\"") { UseShellExecute = true, Verb = "runas", WorkingDirectory = workDir };
                    else
                        psi = new ProcessStartInfo(exePath, finalArgs) { UseShellExecute = true, Verb = "runas", WorkingDirectory = workDir };

                    var proc = Process.Start(psi);
                    if (proc != null)
                    {
                        await proc.WaitForExitAsync();
                        app.Installed = true;
                        if (li.SubItems.Count > 3)
                            li.SubItems[3].Text = "✓";
                        else
                            li.SubItems.Add("✓");
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Erro ao instalar {app?.Name}: {ex.Message}", "Erro", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
            SaveLocalPackages();
            MessageBox.Show("Instalações concluídas.", "Concluído", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }

        private void LoadLocalPackages()
        {
            apps.Clear();
            listView.Items.Clear();
            try
            {
                bool loadedFromJson = false;
                if (File.Exists(packagesJsonPath))
                {
                    try
                    {
                        var js = File.ReadAllText(packagesJsonPath);
                        var list = JsonSerializer.Deserialize<List<AppItem>>(js);
                        if (list != null && list.Count > 0)
                        {
                            apps.AddRange(list);
                            // converter URLs relativas para absolutas e preencher valores ausentes
                            foreach (var a in list)
                            {
                                a.Url = ToAbsoluteUrl(a.Url);
                                if (string.IsNullOrWhiteSpace(a.Name) && !string.IsNullOrEmpty(a.Url))
                                    a.Name = Path.GetFileName(a.Url);
                                if (a.DateUploaded == DateTime.MinValue && !string.IsNullOrEmpty(a.Url) && File.Exists(a.Url))
                                    a.DateUploaded = File.GetLastWriteTime(a.Url);
                                if (string.IsNullOrWhiteSpace(a.Version) && !string.IsNullOrEmpty(a.Url))
                                {
                                    try {
                                        var fv = FileVersionInfo.GetVersionInfo(a.Url);
                                        a.Version = fv.FileVersion ?? fv.ProductVersion ?? string.Empty;
                                    } catch { }
                                }
                            }
                            loadedFromJson = true;
                        }
                    }
                    catch { /* ignore malformed json, fallback to file scan */ }
                }

                if (!loadedFromJson)
                {
                    var files = Directory.GetFiles(packagesDir);
                    foreach (var f in files)
                    {
                        // ignorar o arquivo packages.json que é usado como metadata
                        if (string.Equals(Path.GetFileName(f), "packages.json", StringComparison.OrdinalIgnoreCase)) continue;
                        var ver = string.Empty;
                        try { var fv = FileVersionInfo.GetVersionInfo(f); ver = fv.FileVersion ?? fv.ProductVersion ?? string.Empty; } catch { }
                        apps.Add(new AppItem { Name = Path.GetFileName(f), Url = f, Args = string.Empty, DateUploaded = File.GetLastWriteTime(f), Version = ver });
                    }
                }

                listView.BeginUpdate();
                foreach (var a in apps)
                {
                    var li = new ListViewItem(new[] { a.Name, a.DateUploaded == DateTime.MinValue ? string.Empty : a.DateUploaded.ToString("g"), a.Version, a.Installed ? "✓" : "" }) { Checked = false, Tag = a };
                    if (a.IsRemote) li.ForeColor = Color.DarkBlue;
                    listView.Items.Add(li);
                }
                listView.EndUpdate();
                listView.Refresh();

                // contagem carregada (removido debug)
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Erro ao carregar pacotes locais: {ex.Message}", "Erro", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private string ToRelativeUrl(string absoluteUrl)
        {
            if (string.IsNullOrEmpty(absoluteUrl)) return absoluteUrl;
            if (absoluteUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                absoluteUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
                return absoluteUrl; // URL remota: manter como está
            if (absoluteUrl.StartsWith(packagesDir, StringComparison.OrdinalIgnoreCase))
                return absoluteUrl.Substring(packagesDir.Length).TrimStart(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
            return absoluteUrl;
        }

        private string ToAbsoluteUrl(string relativeUrl)
        {
            if (string.IsNullOrEmpty(relativeUrl)) return relativeUrl;
            if (Path.IsPathRooted(relativeUrl)) return relativeUrl;
            if (relativeUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                relativeUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
                return relativeUrl; // URL remota: manter como está
            return Path.Combine(packagesDir, relativeUrl);
        }

        private void SaveLocalPackages()
        {
            try
            {
                var toSave = apps.Select(a => new AppItem
                {
                    Name = a.Name,
                    Url = ToRelativeUrl(a.Url),
                    Args = a.Args,
                    DateUploaded = a.DateUploaded,
                    Version = a.Version,
                    Installed = a.Installed
                }).ToList();
                var js = JsonSerializer.Serialize(toSave, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(packagesJsonPath, js);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Erro ao salvar metadata: {ex.Message}", "Erro", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private async Task UploadFiles()
        {
            using var dlg = new OpenFileDialog { Multiselect = true };
            if (dlg.ShowDialog() != DialogResult.OK) return;

            foreach (var f in dlg.FileNames)
            {
                try
                {
                    var dest = Path.Combine(packagesDir, Path.GetFileName(f));
                    var destUnique = dest;
                    int i = 1;
                    while (File.Exists(destUnique))
                    {
                        destUnique = Path.Combine(packagesDir, Path.GetFileNameWithoutExtension(f) + "_" + i + Path.GetExtension(f));
                        i++;
                    }
                    File.Copy(f, destUnique);
                    var ver = string.Empty;
                    try { var fv = FileVersionInfo.GetVersionInfo(destUnique); ver = fv.FileVersion ?? fv.ProductVersion ?? string.Empty; } catch { }
                    apps.Add(new AppItem { Name = Path.GetFileName(destUnique), Url = destUnique, Args = string.Empty, DateUploaded = DateTime.Now, Version = ver });
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Falha ao copiar {f}: {ex.Message}", "Erro", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }

            SaveLocalPackages();
            LoadLocalPackages();
        }

        private async Task UploadFolder()
        {
            using var dlg = new FolderBrowserDialog { Description = "Selecione a pasta do pacote (deve conter o arquivo .bat principal)" };
            if (dlg.ShowDialog() != DialogResult.OK) return;

            var sourceDir = dlg.SelectedPath;
            var folderName = Path.GetFileName(sourceDir);
            var destDir = Path.Combine(packagesDir, folderName);
            int idx = 1;
            while (Directory.Exists(destDir))
            {
                destDir = Path.Combine(packagesDir, folderName + "_" + idx);
                idx++;
            }

            try
            {
                Directory.CreateDirectory(destDir);
                foreach (var file in Directory.GetFiles(sourceDir))
                    File.Copy(file, Path.Combine(destDir, Path.GetFileName(file)));

                var batFiles = Directory.GetFiles(destDir, "*.bat");
                if (batFiles.Length == 0)
                {
                    MessageBox.Show("Nenhum arquivo .bat encontrado na pasta selecionada.", "Aviso", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    Directory.Delete(destDir, true);
                    return;
                }

                // Preferir arquivo que começa com _ (convenção _RunAsAdmin.bat)
                var mainBat = batFiles.FirstOrDefault(f => Path.GetFileName(f).StartsWith("_")) ?? batFiles[0];

                apps.Add(new AppItem
                {
                    Name = Path.GetFileNameWithoutExtension(mainBat),
                    Url = mainBat,
                    Args = string.Empty,
                    DateUploaded = DateTime.Now,
                    Version = string.Empty
                });

                SaveLocalPackages();
                LoadLocalPackages();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Erro ao copiar pasta: {ex.Message}", "Erro", MessageBoxButtons.OK, MessageBoxIcon.Error);
                try { if (Directory.Exists(destDir)) Directory.Delete(destDir, true); } catch { }
            }
        }

        private static string NormalizeDownloadUrl(string url)
        {
            if (string.IsNullOrEmpty(url)) return url;
            // SharePoint sharing links precisam de &download=1 para retornar o arquivo diretamente
            if ((url.Contains(".sharepoint.com") || url.Contains("sharepoint.com")) &&
                !url.Contains("download=1"))
            {
                url += (url.Contains("?") ? "&" : "?") + "download=1";
            }
            return url;
        }

        private string GetRemoteUrl()
        {
            try
            {
                if (File.Exists(remoteConfigPath))
                    return File.ReadAllText(remoteConfigPath).Trim();
            }
            catch { }
            return string.Empty;
        }

        private string ConfigureRemoteUrl()
        {
            var current = GetRemoteUrl();
            var url = Prompt.ShowDialog(
                "Cole a URL ou caminho do packages.json remoto.\n" +
                "Exemplos:\n" +
                "• %USERPROFILE%\\OneDrive - Comgas\\FieldServices\\packages.json\n" +
                "• \\\\servidor\\pasta\\packages.json\n" +
                "• https://raw.githubusercontent.com/.../packages.json",
                "Configurar URL Remota", current);
            if (!string.IsNullOrWhiteSpace(url))
            {
                try { File.WriteAllText(remoteConfigPath, url.Trim()); } catch { }
                MessageBox.Show("URL salva. Clique em Sincronizar para carregar os apps.",
                    "OK", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return url.Trim();
            }
            return string.Empty;
        }

        private async Task SyncFromRemote()
        {
            var url = GetRemoteUrl();
            if (string.IsNullOrWhiteSpace(url))
            {
                url = ConfigureRemoteUrl();
                if (string.IsNullOrWhiteSpace(url)) return;
            }
            try
            {
                string json = await DownloadTextAsync(NormalizeDownloadUrl(url));

                var remoteList = JsonSerializer.Deserialize<List<AppItem>>(json);
                if (remoteList == null || remoteList.Count == 0)
                {
                    MessageBox.Show("Nenhum app encontrado na fonte remota.", "Aviso",
                        MessageBoxButtons.OK, MessageBoxIcon.Information);
                    return;
                }
                foreach (var a in remoteList)
                    a.IsRemote = true;
                apps.RemoveAll(a => a.IsRemote);
                apps.AddRange(remoteList);
                SaveLocalPackages();
                LoadLocalPackages();
                MessageBox.Show($"{remoteList.Count} app(s) sincronizado(s) com sucesso.",
                    "Sincronização", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Erro ao sincronizar: {ex.Message}", "Erro",
                    MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        // Tenta baixar texto: público → Windows → login Microsoft
        private async Task<string> DownloadTextAsync(string url)
        {
            // Expandir variáveis de ambiente: %USERPROFILE%, %OneDrive%, etc.
            url = Environment.ExpandEnvironmentVariables(url);

            // Caminho local ou de rede
            if (!url.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                return await File.ReadAllTextAsync(url);

            // Tentativa 1: sem credenciais (links públicos / GitHub raw)
            try
            {
                var resp = await PublicHttpClient.GetAsync(url);
                if (resp.IsSuccessStatusCode)
                {
                    var text = await resp.Content.ReadAsStringAsync();
                    if (!text.TrimStart().StartsWith("<")) return text;
                }
            }
            catch { }

            // Tentativa 2: credenciais Windows (ADFS on-prem)
            try
            {
                using var handler = new HttpClientHandler { UseDefaultCredentials = true, AllowAutoRedirect = true };
                using var client = new HttpClient(handler);
                client.DefaultRequestHeaders.Add("User-Agent",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36");
                var resp2 = await client.GetAsync(url);
                if (resp2.IsSuccessStatusCode)
                {
                    var text2 = await resp2.Content.ReadAsStringAsync();
                    if (!text2.TrimStart().StartsWith("<")) return text2;
                }
            }
            catch { }

            // Tentativa 3: login Microsoft 365 interativo (SharePoint Online corporativo)
            if (url.Contains(".sharepoint.com") || url.Contains("sharepoint.com"))
            {
                var token = await GetSharePointTokenAsync(url);
                if (token != null)
                {
                    using var authClient = new HttpClient();
                    authClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");
                    authClient.DefaultRequestHeaders.Add("User-Agent",
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36");
                    var resp3 = await authClient.GetAsync(url);
                    resp3.EnsureSuccessStatusCode();
                    return await resp3.Content.ReadAsStringAsync();
                }
            }

            throw new InvalidOperationException(
                "Não foi possível acessar o arquivo remoto após todas as tentativas de autenticação.");
        }

        private async Task<string?> GetSharePointTokenAsync(string sharePointUrl)
        {
            // Retornar token em cache se ainda válido
            if (_spBearerToken != null && DateTime.Now < _spTokenExpiry)
                return _spBearerToken;

            var uri = new Uri(sharePointUrl);
            var tenantUrl = $"{uri.Scheme}://{uri.Host}";
            var scopes = new[] { $"{tenantUrl}/AllSites.Read" };

            // Loop para permitir troca de Client ID sem reiniciar
            for (int attempt = 0; attempt < 2; attempt++)
            {
                var clientId = GetMsalClientId();
                _msalApp = PublicClientApplicationBuilder
                    .Create(clientId)
                    .WithAuthority("https://login.microsoftonline.com/common")
                    .WithRedirectUri("http://localhost")
                    .Build();

                // Tentar silencioso com conta já logada
                try
                {
                    var accounts = await _msalApp.GetAccountsAsync();
                    var silent = await _msalApp.AcquireTokenSilent(scopes, accounts.FirstOrDefault()).ExecuteAsync();
                    _spBearerToken = silent.AccessToken;
                    _spTokenExpiry = silent.ExpiresOn.UtcDateTime.ToLocalTime().AddMinutes(-5);
                    return _spBearerToken;
                }
                catch { }

                // Login interativo
                var confirm = MessageBox.Show(
                    "Esta URL requer autenticação no SharePoint.\n\n" +
                    "Será aberta a janela de login da Microsoft.\n" +
                    "Entre com a conta que tem acesso ao SharePoint da Comgas.",
                    "Login necessário", MessageBoxButtons.OKCancel, MessageBoxIcon.Information);

                if (confirm != DialogResult.OK) return null;

                try
                {
                    var result = await _msalApp.AcquireTokenInteractive(scopes)
                        .WithParentActivityOrWindow(this.Handle)
                        .ExecuteAsync();
                    _spBearerToken = result.AccessToken;
                    _spTokenExpiry = result.ExpiresOn.UtcDateTime.ToLocalTime().AddMinutes(-5);
                    return _spBearerToken;
                }
                catch (MsalServiceException msalEx) when (msalEx.Message.Contains("AADSTS700016"))
                {
                    // App não autorizado no tenant — pedir Client ID personalizado
                    var msg =
                        "O aplicativo não está autorizado no tenant da Comgas (AADSTS700016).\n\n" +
                        "O administrador de TI precisa registrar um app no Azure AD.\n\n" +
                        "Passos para o admin (portal.azure.com):\n" +
                        "  1. Azure Active Directory → Registros de aplicativos\n" +
                        "  2. Novo registro → nome: 'Instalador Comgas' → tipo: Público (mobile/desktop)\n" +
                        "  3. Permissões de API → SharePoint → Sites.Read.All (delegada)\n" +
                        "  4. Conceder consentimento do administrador\n" +
                        "  5. Copiar o 'ID do aplicativo (cliente)'\n\n" +
                        "Deseja inserir o Client ID agora?";

                    if (MessageBox.Show(msg, "Autorização necessária",
                            MessageBoxButtons.YesNo, MessageBoxIcon.Warning) == DialogResult.Yes)
                    {
                        var newId = Prompt.ShowDialog("Cole o Client ID do Azure AD:", "Client ID personalizado", clientId);
                        if (!string.IsNullOrWhiteSpace(newId))
                        {
                            SaveMsalClientId(newId.Trim());
                            continue; // Tentar novamente com o novo Client ID
                        }
                    }
                    return null;
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Falha no login: {ex.Message}", "Erro de autenticação",
                        MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return null;
                }
            }
            return null;
        }

        private string GetMsalConfigPath() =>
            Path.Combine(Path.GetDirectoryName(packagesJsonPath)!, "msal.config");

        private string GetMsalClientId()
        {
            var path = GetMsalConfigPath();
            if (File.Exists(path))
            {
                var saved = File.ReadAllText(path).Trim();
                if (!string.IsNullOrEmpty(saved)) return saved;
            }
            return "31359c7f-bd7e-475c-86db-fdb8c937548e"; // PnP Management Shell (padrão)
        }

        private void SaveMsalClientId(string clientId)
        {
            try { File.WriteAllText(GetMsalConfigPath(), clientId); } catch { }
        }

        private void RemoveSelected()
        {
            var toRemove = new List<AppItem>();
            foreach (ListViewItem li in listView.CheckedItems)
            {
                if (li.Tag is AppItem ai) toRemove.Add(ai);
            }
            if (toRemove.Count == 0) return;

            foreach (var ai in toRemove)
            {
                try
                {
                    if (!string.IsNullOrEmpty(ai.Url) && File.Exists(ai.Url))
                    {
                        var parentDir = Path.GetDirectoryName(ai.Url) ?? string.Empty;
                        if (string.Equals(parentDir, packagesDir, StringComparison.OrdinalIgnoreCase))
                            File.Delete(ai.Url);
                        else if (parentDir.StartsWith(packagesDir, StringComparison.OrdinalIgnoreCase) && Directory.Exists(parentDir))
                            Directory.Delete(parentDir, true);
                    }
                }
                catch { }
                apps.RemoveAll(x => x.Url == ai.Url);
            }
            SaveLocalPackages();
            LoadLocalPackages();
        }

        private void RenameSelected()
        {
            ListViewItem? li = null;
            if (listView.SelectedItems.Count > 0)
            {
                li = listView.SelectedItems[0];
            }
            else if (listView.CheckedItems.Count == 1)
            {
                li = listView.CheckedItems[0];
            }
            else if (listView.CheckedItems.Count > 1)
            {
                MessageBox.Show("Selecione apenas um item (clicando no nome) ou desmarque até ficar um item marcado.", "Aviso", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            if (li == null)
            {
                MessageBox.Show("Selecione um item para renomear.", "Aviso", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            if (!(li.Tag is AppItem ai)) return;
            var newName = Prompt.ShowDialog($"Novo nome para '{ai.Name}':", "Renomear aplicativo", ai.Name);
            if (string.IsNullOrWhiteSpace(newName)) return;
            // atualizar metadata e lista
            ai.Name = newName;
            SaveLocalPackages();
            LoadLocalPackages();
        }

        
    }
    // Helper para prompt simples
    public static class Prompt
    {
        public static string ShowDialog(string text, string caption, string defaultValue = "")
        {
            var prompt = new Form()
            {
                Width = 500,
                Height = 150,
                Text = caption,
                StartPosition = FormStartPosition.CenterParent
            };
            var textLabel = new Label() { Left = 10, Top = 10, Text = text, Width = 460 };
            var textBox = new TextBox() { Left = 10, Top = 35, Width = 460, Text = defaultValue };
            var confirmation = new Button() { Text = "OK", Left = 300, Width = 80, Top = 70, DialogResult = DialogResult.OK };
            var cancel = new Button() { Text = "Cancelar", Left = 390, Width = 80, Top = 70, DialogResult = DialogResult.Cancel };
            confirmation.Click += (sender, e) => { prompt.Close(); };
            prompt.Controls.Add(textBox);
            prompt.Controls.Add(confirmation);
            prompt.Controls.Add(cancel);
            prompt.Controls.Add(textLabel);
            prompt.AcceptButton = confirmation;
            var result = prompt.ShowDialog();
            return result == DialogResult.OK ? textBox.Text : string.Empty;
        }
    }

}
