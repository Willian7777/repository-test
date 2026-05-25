using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
// Habilitar CORS para permitir o frontend local (ajuste em produção)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors();

app.MapGet("/inventory", (string user) =>
{
    // Mock response; integrar com ServiceNow/Intune conforme necessidade
    var items = new[] {
        new { Type = "Laptop", Model = "Dell XPS 13", Serial = "ABC123", AssignedTo = user }
    };
    return Results.Ok(new { User = user, Items = items });
});

app.MapPost("/termo", async (HttpContext http) =>
{
    try
    {
        var req = await JsonSerializer.DeserializeAsync<TermoRequest>(http.Request.Body, new JsonSerializerOptions{PropertyNameCaseInsensitive = true});
        if (req is null) return Results.BadRequest("payload inválido");

        // Use a safe local application data folder instead of solution/OneDrive folder
        var localBase = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData) ?? app.Environment.ContentRootPath;
        var dataDir = Path.Combine(localBase, "TermosApp", "data");
        Directory.CreateDirectory(dataDir);

        var tipo = req.Type ?? "termo";
        var safeName = MakeSafeFileName(req.Nome ?? "sem-nome");
        var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
        var fileName = $"{req.Matricula ?? "no-mat"}_{safeName}_{tipo}_{timestamp}.pdf";
        var filePath = Path.Combine(dataDir, fileName);

        // Gerar PDF real usando PdfSharpCore
        using var document = new PdfSharpCore.Pdf.PdfDocument();
        var page = document.AddPage();
        page.Size = PdfSharpCore.PageSize.A4;
        using var gfx = PdfSharpCore.Drawing.XGraphics.FromPdfPage(page);
        var font = new PdfSharpCore.Drawing.XFont("Arial", 12);

        int margin = 40;
        double y = margin;
        void DrawLine(string text)
        {
            gfx.DrawString(text, font, PdfSharpCore.Drawing.XBrushes.Black, new PdfSharpCore.Drawing.XRect(margin, y, page.Width - margin * 2, 20));
            y += 18;
            if (y > page.Height - margin)
            {
                y = margin;
                page = document.AddPage();
                page.Size = PdfSharpCore.PageSize.A4;
            }
        }

        DrawLine($"TERMO ({tipo.ToUpperInvariant()})");
        DrawLine($"Data: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
        DrawLine($"Matrícula: {req.Matricula}");
        DrawLine($"Nome: {req.Nome}");
        DrawLine($"\nDados do equipamento:");
        DrawLine($"  Tipo: {req.Equipamento?.Tipo}");
        DrawLine($"  Modelo: {req.Equipamento?.Modelo}");
        DrawLine($"  Serial: {req.Equipamento?.Serial}");
        DrawLine($"  IMEI: {req.Equipamento?.Imei}");
        DrawLine($"\nAcessórios: {req.Acessorios}");
        DrawLine($"\nObservações: {req.Observacoes}");

        // Inserir imagens (fotos) se houver
        if (req.Fotos != null && req.Fotos.Count > 0)
        {
            foreach (var b64 in req.Fotos)
            {
                try
                {
                    var commaIndex = b64.IndexOf("base64,", StringComparison.OrdinalIgnoreCase);
                    var payload = commaIndex >= 0 ? b64[(commaIndex + 7)..] : b64;
                    var imageBytes = Convert.FromBase64String(payload);
                    using var ms = new MemoryStream(imageBytes);
                    var img = PdfSharpCore.Drawing.XImage.FromStream(() => ms);

                    // Ajustar tamanho da imagem mantendo proporção
                    const double maxWidth = 400;
                    double imgWidth = img.PointWidth;
                    double imgHeight = img.PointHeight;
                    double scale = Math.Min(1.0, maxWidth / imgWidth);
                    double drawW = imgWidth * scale;
                    double drawH = imgHeight * scale;

                    if (y + drawH > page.Height - margin)
                    {
                        y = margin;
                        page = document.AddPage();
                        page.Size = PdfSharpCore.PageSize.A4;
                        gfx = PdfSharpCore.Drawing.XGraphics.FromPdfPage(page);
                    }

                    gfx.DrawImage(img, margin, y, drawW, drawH);
                    y += drawH + 8;
                }
                catch (Exception imgEx)
                {
                    Console.Error.WriteLine("Falha ao inserir imagem: " + imgEx);
                }
            }
        }

        document.Save(filePath);

        // Simular criação/anexo no ServiceNow
        var incidentNumber = req.IncidentNumber ?? $"INC{new Random().Next(10000,99999)}";

        var result = new {
            FileName = fileName,
            FilePath = filePath,
            IncidentNumber = incidentNumber
        };

        return Results.Ok(result);
    }
    catch (Exception ex)
    {
        // Log completo no console para diagnóstico
        Console.Error.WriteLine("Erro em POST /termo: " + ex.ToString());
        return Results.Problem(detail: "Erro interno ao processar o termo. Veja logs do servidor.", statusCode: 500);
    }
});

// Endpoint para baixar o PDF gerado
app.MapGet("/termo/{fileName}", (string fileName) =>
{
    try
    {
        var localBase = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData) ?? app.Environment.ContentRootPath;
        var dataDir = Path.Combine(localBase, "TermosApp", "data");
        var safe = Path.GetFileName(fileName); // evita path traversal
        var filePath = Path.Combine(dataDir, safe);
        if (!File.Exists(filePath)) return Results.NotFound(new { message = "Arquivo não encontrado" });
        return Results.File(filePath, "application/pdf", fileDownloadName: safe, enableRangeProcessing: true);
    }
    catch (Exception ex)
    {
        Console.Error.WriteLine("Erro em GET /termo/{fileName}: " + ex);
        return Results.Problem(detail: "Erro ao localizar o arquivo.", statusCode: 500);
    }
});

app.Run();

static string MakeSafeFileName(string name)
{
    foreach (var c in Path.GetInvalidFileNameChars()) name = name.Replace(c, '_');
    return name.Replace(' ', '_');
}

public class TermoRequest
{
    [JsonPropertyName("type")] public string? Type { get; set; }
    [JsonPropertyName("matricula")] public string? Matricula { get; set; }
    [JsonPropertyName("nome")] public string? Nome { get; set; }
    [JsonPropertyName("equipamento")] public Equipamento? Equipamento { get; set; }
    [JsonPropertyName("acessorios")] public string? Acessorios { get; set; }
    [JsonPropertyName("observacoes")] public string? Observacoes { get; set; }
    [JsonPropertyName("incidentNumber")] public string? IncidentNumber { get; set; }
    [JsonPropertyName("fotos")] public List<string>? Fotos { get; set; }
}

public class Equipamento
{
    [JsonPropertyName("tipo")] public string? Tipo { get; set; }
    [JsonPropertyName("modelo")] public string? Modelo { get; set; }
    [JsonPropertyName("serial")] public string? Serial { get; set; }
    [JsonPropertyName("imei")] public string? Imei { get; set; }
}