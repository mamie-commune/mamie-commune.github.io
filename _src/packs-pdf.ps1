# Fabrique le PDF de chaque pack hors ligne (packs/<id>.pdf) à partir de packs/<id>.html, avec Microsoft Edge sans fenêtre.
# À lancer en local (Windows + Edge) après _src/build.ps1, puis relancer _src/build.ps1 pour que la page Hors ligne
# affiche le bouton « PDF à imprimer ». Les PDF sont envoyés avec le reste.
# Usage : powershell -ExecutionPolicy Bypass -File _src/packs-pdf.ps1
$ErrorActionPreference = "Stop"
$site = Split-Path $PSScriptRoot -Parent
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) { $edge = (Get-Command msedge).Source }
$profil = Join-Path $env:TEMP ("mamie-packs-" + [guid]::NewGuid().ToString("N").Substring(0, 8))
foreach ($f in Get-ChildItem (Join-Path $site "packs") -Filter *.html) {
  $pdf = [IO.Path]::ChangeExtension($f.FullName, ".pdf")
  $url = "file:///" + ($f.FullName -replace '\\', '/')
  $p = Start-Process -FilePath $edge -ArgumentList @("--headless=new", "--disable-gpu", "--no-first-run", "--user-data-dir=`"$profil`"", "--no-pdf-header-footer", "--virtual-time-budget=5000", "--print-to-pdf=`"$pdf`"", "`"$url`"") -PassThru -WindowStyle Hidden
  $p.WaitForExit(60000) | Out-Null
  if (Test-Path $pdf) { Write-Host ("{0} : {1} Ko" -f $f.BaseName, [Math]::Round((Get-Item $pdf).Length / 1024)) } else { Write-Warning "$($f.Name) : pas de PDF" }
}
