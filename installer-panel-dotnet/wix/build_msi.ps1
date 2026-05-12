# build_msi.ps1
# Script simples para compilar o .wxs em um MSI usando WiX Toolset (candle.exe + light.exe)

Param(
    [string]$WixSource = "InstallerPanel.wxs",
    [string]$OutDir = "..\publish",
    [string]$OutputMsi = "InstallerPanel.msi",
    [switch]$Sign,
    [string]$TimeStampUrl = "http://timestamp.digicert.com"
)

Set-Location -Path $PSScriptRoot

if (-not (Get-Command candle.exe -ErrorAction SilentlyContinue)) {
    Write-Error "candle.exe não encontrado. Instale WiX Toolset e adicione ao PATH: https://wixtoolset.org/"
    exit 1
}
if (-not (Get-Command light.exe -ErrorAction SilentlyContinue)) {
    Write-Error "light.exe não encontrado. Instale WiX Toolset e adicione ao PATH: https://wixtoolset.org/"
    exit 1
}

$wixobj = [IO.Path]::ChangeExtension($WixSource, ".wixobj")
Write-Host "Compilando $WixSource -> $wixobj"
candle.exe -nologo -out $wixobj $WixSource
if ($LASTEXITCODE -ne 0) { Write-Error "candle falhou"; exit $LASTEXITCODE }

Write-Host "Linkando $wixobj -> $OutputMsi"
light.exe -nologo -out $OutputMsi $wixobj
if ($LASTEXITCODE -ne 0) { Write-Error "light falhou"; exit $LASTEXITCODE }

if ($Sign) {
    if (-not (Get-Command signtool.exe -ErrorAction SilentlyContinue)) {
        Write-Warning "signtool não encontrado; pulando assinatura"
    }
    else {
        Write-Host "Assinando MSI..."
        signtool sign /fd SHA256 /a /tr $TimeStampUrl /td SHA256 $OutputMsi
    }
}

# mover MSI para pasta de saída
if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }
Move-Item -Force -Path $OutputMsi -Destination (Join-Path $OutDir $OutputMsi)
Write-Host "MSI gerado em: " (Join-Path $OutDir $OutputMsi)
