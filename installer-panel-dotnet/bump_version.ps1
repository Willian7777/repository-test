$vf = Join-Path $PSScriptRoot 'installer.version'
if (-not (Test-Path $vf)) { '0.0.0' | Out-File $vf -Encoding utf8 }
$v = Get-Content $vf -Raw
$v = $v.Trim()
$parts = $v.Split('.')
while ($parts.Length -lt 3) { $parts += '0' }
$a = [int]$parts[0]
$b = [int]$parts[1]
$c = [int]$parts[2]
$c = $c + 1
$nv = "$a.$b.$c"
$nv | Out-File $vf -Encoding utf8
