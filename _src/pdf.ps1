# Convertit les pages imprimables de _src/textes/print/ en PDF (livres/pdf/) avec Edge sans interface.
# Usage : powershell -ExecutionPolicy Bypass -File _src/pdf.ps1 [-Force]
param([switch]$Force)
$ErrorActionPreference = "Stop"
$src = $PSScriptRoot
$site = Split-Path $src -Parent
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) { $edge = (Get-Command msedge).Source }
$outDir = Join-Path $site "livres\pdf"
New-Item -ItemType Directory -Force $outDir | Out-Null
$profile = Join-Path $env:TEMP "cyberanar-edge-pdf"

$n = 0
foreach ($f in Get-ChildItem (Join-Path $src "textes\print") -Filter *.html) {
  $pdf = Join-Path $outDir "$($f.BaseName).pdf"
  if (-not $Force -and (Test-Path $pdf) -and (Get-Item $pdf).LastWriteTime -gt $f.LastWriteTime) { continue }
  $url = "file:///" + ($f.FullName -replace '\\', '/')
  $p = Start-Process -FilePath $edge -ArgumentList @("--headless=new", "--disable-gpu", "--no-first-run", "--user-data-dir=`"$profile`"", "--no-pdf-header-footer", "--virtual-time-budget=15000", "--print-to-pdf=`"$pdf`"", "`"$url`"") -PassThru -WindowStyle Hidden
  if (-not $p.WaitForExit(180000)) { $p.Kill(); Write-Host "Délai dépassé : $($f.BaseName)"; continue }
  if (Test-Path $pdf) { $n++; Write-Host ("{0,-40} {1,8:N0} Ko" -f $f.BaseName, ((Get-Item $pdf).Length / 1KB)) } else { Write-Host "Échec : $($f.BaseName)" }
}
Write-Host "PDF générés : $n"
