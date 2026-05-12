# Gerar MSI (WiX) — InstallerPanel

Pré-requisitos
- WiX Toolset (candle.exe / light.exe) disponível no PATH — https://wixtoolset.org/
- Opcional: `signtool.exe` e certificado para assinar o MSI

Como gerar o MSI (exemplo)

1. Certifique-se de já ter gerado a pasta `publish\win-x64` com o exe (já feito pelo `dotnet publish`).
2. Abra PowerShell com permissões administrativas.
3. Entre na pasta `wix` e execute:

```powershell
cd path\to\installer-panel-dotnet\wix
.\build_msi.ps1 -Sign
```

O script compila `InstallerPanel.wxs` com `candle.exe` e vincula com `light.exe`. O MSI resultante será movido para `..\publish` como `InstallerPanel.msi`.

Notas
- Ajuste o `Version` no `InstallerPanel.wxs` antes de gerar novas releases.
- Se quiser criar um instalador que inclua toda a pasta (dependências), adicione mais arquivos `<File>` no `<Component>` ou use fragmentos e o `Heat.exe` para gerar automaticamente um `ComponentGroup`.
- Teste o MSI em máquina VM antes de distribuir em produção.
