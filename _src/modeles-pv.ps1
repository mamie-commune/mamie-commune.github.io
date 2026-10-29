# Fabrique les PDF des modèles de lettre pour contester un PV de manifestation.
# Sources : _src/textes/modeles-pv/*.html (1re ligne : <!-- Titre | sous-titre -->) → PDF dans manif/modeles/.
# Usage (Windows + Microsoft Edge) : powershell -ExecutionPolicy Bypass -File _src/modeles-pv.ps1
$ErrorActionPreference = "Stop"
$src = $PSScriptRoot
$site = Split-Path $src -Parent
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) { $edge = (Get-Command msedge).Source }
$out = Join-Path $site "manif\modeles"
New-Item -ItemType Directory -Force $out | Out-Null
$tmp = Join-Path $env:TEMP "mamie-modeles"
New-Item -ItemType Directory -Force $tmp | Out-Null
$fonts = "file:///" + ((Join-Path $site "assets\fonts.css") -replace '\\', '/')
$utf8 = New-Object System.Text.UTF8Encoding $false

foreach ($f in Get-ChildItem (Join-Path $src "textes\modeles-pv") -Filter *.html | Sort-Object Name) {
  $raw = [IO.File]::ReadAllText($f.FullName, [Text.Encoding]::UTF8)
  $m = [regex]::Match($raw, '^<!--\s*(.*?)\s*\|\s*(.*?)\s*-->\s*', 'Singleline')
  $titre = $m.Groups[1].Value; $sous = $m.Groups[2].Value
  $body = $raw.Substring($m.Length)
  $html = @"
<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>$titre</title>
<link rel="stylesheet" href="$fonts">
<style>
  @page { size: A4; margin: 18mm 20mm 16mm; }
  body { font: 11pt/1.5 Georgia, "Times New Roman", serif; color: #171414; }
  .entete { border-bottom: 2.5pt solid #171414; padding-bottom: 8pt; margin-bottom: 12pt; }
  .entete h1 { font: 400 17pt/1.15 "Archivo Black", Arial, sans-serif; margin: 0; }
  .entete p { margin: 4pt 0 0; font: 10pt/1.3 "Special Elite", "Courier New", monospace; }
  .entete b { background: #ff5aa8; padding: 0 3pt; font-weight: 400; }
  .aide { background: #f6f0e3; border: 1pt dashed #171414; padding: 6pt 10pt; margin-bottom: 14pt; font: 9.5pt/1.4 Arial, sans-serif; }
  .aide p, .aide ul { margin: 4pt 0; } .aide ul { padding-left: 14pt; }
  mark { background: #fbe08a; padding: 0 2pt; }
  .exp { margin: 0 0 10pt; } .dest { margin: 0 0 10pt 55%; } .date { margin: 0 0 10pt 55%; }
  .rar { font-style: italic; margin: 0 0 8pt; } .objet { margin: 0 0 12pt; }
  .choix { font: 700 9.5pt/1.3 Arial, sans-serif; color: #b8200f; text-transform: uppercase; margin: 12pt 0 2pt; }
  p { margin: 0 0 8pt; } ul { margin: 0 0 8pt; }
  .signature { margin: 18pt 0 18pt 55%; } .pj { font-size: 9.5pt; }
  .pied { margin-top: 16pt; border-top: 1pt solid #999; padding-top: 5pt; font: 8pt/1.3 Arial, sans-serif; color: #555; }
</style></head><body>
<div class="entete"><h1>$titre</h1><p>$sous · <b>Mamie Commune</b> · mamiecommune.org/manif/legal-team</p></div>
$body
<p class="pied">Modèle d'après les trames de la Legal Team Antiraciste, mis en forme par Mamie Commune. À adapter à ta situation ; il ne remplace pas l'avis d'une avocate, d'un avocat ou d'une legal team. Garde une copie de tout ce que tu envoies.</p>
</body></html>
"@
  $page = Join-Path $tmp "$($f.BaseName).html"
  [IO.File]::WriteAllText($page, $html, $utf8)
  $pdf = Join-Path $out "$($f.BaseName).pdf"
  $profile = Join-Path $tmp "edge"
  $p = Start-Process -FilePath $edge -ArgumentList @("--headless=new", "--disable-gpu", "--no-first-run", "--user-data-dir=`"$profile`"", "--no-pdf-header-footer", "--virtual-time-budget=5000", "--print-to-pdf=`"$pdf`"", "`"file:///$($page -replace '\\', '/')`"") -PassThru -WindowStyle Hidden
  $p.WaitForExit(60000) | Out-Null
  Write-Host "$($f.BaseName).pdf : $([Math]::Round((Get-Item $pdf).Length / 1KB)) Ko"
}
