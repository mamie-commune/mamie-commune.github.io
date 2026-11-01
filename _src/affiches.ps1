# Fabrique les affiches et tracts à imprimer : chaque page _src/affiches/*.html devient
#   agir/affiches/<nom>.pdf (A4, à imprimer) et agir/affiches/<nom>.png (aperçu pour la fiche « Affiches et tracts »).
# Windows + Microsoft Edge nécessaires : à lancer en local, puis envoyer les fichiers avec le reste.
#   powershell -ExecutionPolicy Bypass -File _src/affiches.ps1
$ErrorActionPreference = "Stop"
$racine = Split-Path $PSScriptRoot -Parent
$sources = Join-Path $PSScriptRoot "affiches"
$sortie = Join-Path $racine "agir\affiches"
New-Item -ItemType Directory -Force $sortie | Out-Null
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) { $edge = (Get-Command msedge).Source }
$profil = Join-Path $env:TEMP "mamie-affiches-edge"

foreach ($f in Get-ChildItem $sources -Filter *.html) {
  $url = "file:///$($f.FullName -replace '\\', '/')"
  $pdf = Join-Path $sortie "$($f.BaseName).pdf"
  $png = Join-Path $sortie "$($f.BaseName).png"
  foreach ($opts in @(
      @("--print-to-pdf=`"$pdf`"", "--no-pdf-header-footer"),
      @("--screenshot=`"$png`"", "--window-size=794,1123", "--hide-scrollbars"))) {
    $p = Start-Process -FilePath $edge -ArgumentList (@("--headless=new", "--disable-gpu", "--no-first-run", "--user-data-dir=`"$profil`"", "--virtual-time-budget=5000") + $opts + "`"$url`"") -PassThru -WindowStyle Hidden
    $p.WaitForExit(60000) | Out-Null
  }
  "$($f.BaseName) : $([math]::Round((Get-Item $pdf).Length / 1KB)) Ko (PDF), $([math]::Round((Get-Item $png).Length / 1KB)) Ko (aperçu)"
}
