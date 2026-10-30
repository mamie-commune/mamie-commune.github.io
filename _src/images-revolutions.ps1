# Télécharge depuis Wikimedia Commons les photos d'illustration des dossiers Révolutions,
# et note pour chacune l'auteur, la licence et l'adresse d'origine (assets/img/revolutions/credits.txt).
# Uniquement des documents d'époque (domaine public) ou des photos de reportage sous licence libre :
# aucune image générée par IA, aucune photo colorisée. Usage : powershell -ExecutionPolicy Bypass -File _src/images-revolutions.ps1
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
$site = Split-Path $PSScriptRoot -Parent
$dir = Join-Path $site "assets\img\revolutions"
New-Item -ItemType Directory -Force $dir | Out-Null
$ua = "MamieCommune-images/1.0 (https://mamiecommune.org)"

# nom du fichier sur le site = fichier sur Commons
$images = [ordered]@{
  "commune-barricade-castiglione" = "File:La Commune 1871. Barricade rue de Castiglione, 1er arrondissement, Paris. PH20145.jpg"
  "commune-canons-montmartre"     = "File:Commune de Paris Canons à Montmartre le 18 mars.jpg"
  "commune-barricade-vendome"     = "File:Communards et barricade place Vendôme. Mai 1871. Commune de Paris, guerre civile, révolution. 1er arrondissement, Paris. PH32369.jpg"
  "commune-colonne-vendome"       = "File:Destruction de la colonne Vendôme, 1871, PH3076.jpg"
  "commune-louise-michel"         = "File:Portrait de Michel Louise (1830-1905), pris à la prison des Chantiers à Versailles. Commune de Paris, 1871. PH19727-4.jpg"
  "makhno-1919"                   = "File:Makhno-1919.jpg"
  "makhno-commandants-1919"       = "File:Nestor Makhno and his Lieutenants, Berdyansk, 1919.jpg"
  "makhno-exil-1925"              = "File:Galina Kouzmenko Makhno et leur fille.png"
  "makhno-cronstadt-1921"         = "File:Kronstadt attack.JPG"
  "espagne-barricade-1936"        = "File:Militiawoman on the barricade.jpg"
  "espagne-manifestation-cnt"     = "File:CNT-AIT-FAI.jpg"
  "espagne-cooperative-cnt"       = "File:CNT-FAI Cooperative Barcelona.jpg"
  "espagne-miliciennes-1936"      = "File:Milicianas CNT-FAI.png"
  "espagne-mujeres-libres"        = "File:Mujeres libres n°1.jpg"
  "zapatistes-encuentro-1996"     = "File:Ejército Zapatista de Liberación Nacional IMG008a-sm (11450146613).jpg"
  "zapatistes-mural"              = "File:An EZLN mural in Chiapas, Mexico.jpg"
  "zapatistes-murales-femmes"     = "File:Murales zapatistas feministas en Chiapas, 2018.jpg"
  "zapatistes-mujeres-que-luchan" = "File:Mujeres que luchan cantando.jpg"
  "rojava-ypj"                    = "File:YPJ fighters with flags.jpg"
  "rojava-assemblee-femmes"       = "File:Women's assembly near Qamislo.jpg"
  "rojava-cooperative"            = "File:Rojava Sewing Cooperative.jpg"
  "panthers-programme-1968"       = "File:Black Panther Party Platform.jpg"
  "panthers-petit-dejeuner"       = "File:Black Panther Party Free Breakfast.jpg"
  "panthers-olympia-1969"         = "File:Black Panther demonstration.jpg"
  "panthers-fred-hampton"         = "File:Fred Hampton speaks at a rally in Grant Park, Chicago, 1969.jpg"
  "panthers-convention-1970"      = "File:Black Panther convention.jpg"
  "mai68-cohn-bendit"             = "File:Studenten, redevoeringen, Bendit Daniel Cohn, Bestanddeelnr 045-0334.jpg"
  "mai68-assemblee-sorbonne"      = "File:Stakingen in Frankrijk. Vergadering op binnenplaats Sorbonne, Bestanddeelnr 921-3739.jpg"
  "mai68-odeon"                   = "File:Stakingen in Frankrijk. Studenten in theater Odeon, Bestanddeelnr 921-3733.jpg"
  "mai68-creche-sorbonne"         = "File:Stakingen in Frankrijk. Kindercreche in Sorbonne, Bestanddeelnr 921-3741.jpg"
  "mai68-affiche-flins"           = "File:FLINS PAS FLICS, AFF2867.jpg"
  "zad-reoccupation-2012"         = "File:W0127-NDdL ZaD Defile 56894.JPG"
  "zad-manif-2012"                = "File:Manifestation de ré-occupation du 17 novembre 2012 à Notre-Dame-des-Landes.jpg"
  "zad-phare-rolandiere"          = "File:Phare de la Rolandière depuis le balcon.jpg"
  "zad-bibliotheque-taslu"        = "File:Bibliothèque du Taslu.jpg"
  "zad-cabane-detruite"           = "File:Cabane détruite dans le bois de Rohanne.jpg"
  "gj-bastille-2018"              = "File:Manifestation de gilets jaunes place de la Bastille (Paris) en 2018.jpg"
  "gj-cabane-necker"              = "File:La cabane des Gilets jaunes au rond-point Necker à Saint-Étienne.jpg"
  "gj-ag-villeneuve"              = "File:Villeneuve-la-Guyard-FR-89-AG Gilets Jaunes 29-11-18-a1.jpg"
  "gj-commercy-2019"              = "File:Gilets jaunes commercy 80151.jpg"
  "gj-cabane-meons"               = "File:Reconstruction de la cabane des Gilets jaunes au rond-point de Méons à Saint-Étienne.jpg"
}

$jpeg = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$qual = New-Object Drawing.Imaging.EncoderParameters 1
$qual.Param[0] = New-Object Drawing.Imaging.EncoderParameter ([Drawing.Imaging.Encoder]::Quality), 80L
$credits = New-Object System.Collections.ArrayList
$anciens = @{}
if (Test-Path (Join-Path $dir "credits.txt")) { foreach ($l in [IO.File]::ReadAllLines((Join-Path $dir "credits.txt"))) { $anciens[($l -split ' | ')[0]] = $l } }
$strip = { param($s) ([Net.WebUtility]::HtmlDecode(($s -replace '<[^>]+>', ' ')) -replace '\s+', ' ').Trim() }

foreach ($nom in $images.Keys) {
  if ($anciens[$nom] -and (Test-Path (Join-Path $dir "$nom.jpg"))) { [void]$credits.Add($anciens[$nom]); continue }   # déjà téléchargée
  Start-Sleep -Milliseconds 1500   # rester poli avec l'API de Wikimedia
  $titre = $images[$nom]
  $u = "https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1400&titles=" + [uri]::EscapeDataString($titre)
  $p = ((Invoke-RestMethod -Uri $u -UserAgent $ua).query.pages.PSObject.Properties.Value)[0]
  $i = $p.imageinfo[0]; $m = $i.extmetadata
  $sortie = Join-Path $dir "$nom.jpg"
  $tmp = Join-Path $env:TEMP "mamie-img-$nom"
  $wc = New-Object Net.WebClient; $wc.Headers["User-Agent"] = $ua
  $wc.DownloadFile($(if ($i.thumburl) { $i.thumburl } else { $i.url }), $tmp)
  # Réduit à 1200 px de large au plus, et réencode en JPEG (les PNG aussi).
  $img = [Drawing.Image]::FromFile($tmp)
  $w = [Math]::Min(1200, $img.Width); $h = [int]($img.Height * $w / $img.Width)
  $bmp = New-Object Drawing.Bitmap $w, $h
  $g = [Drawing.Graphics]::FromImage($bmp); $g.Clear([Drawing.Color]::White)
  $g.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($img, 0, 0, $w, $h); $g.Dispose(); $img.Dispose()
  $bmp.Save($sortie, $jpeg, $qual); $bmp.Dispose(); Remove-Item $tmp
  $auteur = & $strip $m.Artist.value
  if ($auteur -match '^(Unknown author)+$|^Anonyme' -or -not $auteur) { $auteur = "photographe inconnu" }
  $auteur = $auteur -replace ' \(.*', '' -replace ', photographe$', ''
  [void]$credits.Add("$nom | $w x $h | $auteur | $(& $strip $m.LicenseShortName.value) | $($i.descriptionurl)")
  Write-Host "$nom.jpg : $w x $h, $([Math]::Round((Get-Item $sortie).Length / 1KB)) Ko · $auteur · $($m.LicenseShortName.value)"
}
[IO.File]::WriteAllLines((Join-Path $dir "credits.txt"), $credits, (New-Object Text.UTF8Encoding $false))
