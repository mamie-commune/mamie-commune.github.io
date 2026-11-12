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
  "queer-pelletier"               = "File:Madeleine Pelletier 1.jpg"
  "queer-tract-fierte-1970"       = "File:Christopher Street Liberation Day. June 28 1970.jpg"
  "queer-glf-londres-1971"        = "File:Demonstration, with Gay Liberation Front Banner, 1971 (7374381322).jpg"
  # Portraits des Figures de l'anarchisme (Bibliothèque, _src/figures/)
  "figure-proudhon"               = "File:Portrait Pierre-Joseph Proudhon (cropped).jpg"
  "figure-bakounine"              = "File:Bakunin.png"
  "figure-louise-michel"          = "File:Louise Michel2.jpg"
  "figure-reclus"                 = "File:Élisée Reclus, photo par Nadar, 1889.jpg"
  "figure-kropotkine"             = "File:Atelier Nadar - Pierre Kropotkine.jpg"
  "figure-malatesta"              = "File:Malatesta.png"
  "figure-lucy-parsons"           = "File:1886 Photo Lucy Parsons.jpg"
  "figure-pouget"                 = "File:Pouget. Émile, Jean, Joseph. 31 ans, né le 12-10-60 à Rodez (Aveyron). Publiciste. Anarchiste. 26-4-92. MET DP290755.jpg"
  "figure-zo-d-axa"               = "File:Zo d'Axa portrait.jpg"
  "figure-de-cleyre"              = "File:VoltairinedeCleyre.jpg"
  "figure-goldman"                = "File:Portrait Emma Goldman.jpg"
  "figure-flores-magon"           = "File:Ricardo F. Magon LCCN2014686092 Trim.jpg"
  "figure-kanno-sugako"           = "File:Kanno.Suga.jpg"
  "figure-ito-noe"                = "File:Ito Noe 2.jpg"
  "figure-sanchez-saornil"        = "File:Lucia Sanchez Saornil.jpg"
  "figure-durruti"                = "File:Jose Buenaventura Durruti Dumange 1936.jpg"
  "figure-sail-mohamed"           = "File:Mohamed Saïl (détail).jpg"
  "figure-rocker"                 = "File:Rudolf Rocker.jpg"
  "figure-landauer"               = "File:Gustav Landauer (cropped).jpg"
  "figure-bookchin"               = "File:Murray Bookchin (cropped).jpg"
  "figure-ocalan"                 = "File:Abdullah Öcalan.png"
  # Dossier Action directe (_src/experiences/0y-action-directe.txt)
  "ad-courrieres-1906"            = "File:Catastrophe de Courrières - Les mineurs en grève.jpg"
  "ad-iww-paterson-1913"          = "File:IWW Paterson Silk Strike Poster 1913.jpg"
  "ad-seattle-1919"               = "File:General strike participants leaving shipyards, Seattle, February 1919 (MOHAI 11087).jpg"
  "ad-occupation-1936"            = "File:Grévistes-métallurgie-usine-banlieue-Paris1936.jpg"
  "ad-lip-1973"                   = "File:Pour la victoire des grévistes de LIP.jpg"
  "ad-faucheurs"                  = "File:Action des Faucheurs volontaires d'OGM dans l'entrepôt d'Arterris, Carcassonne 01.jpg"
  # Bibliothèque : portraits, journaux et documents d'époque pour les fiches de lecture (novembre 2026)
  "biblio-boetie-manuscrit"                 = "File:La Boétie - Manuscript du Discours de la servitude volontaire, sd.png"
  "biblio-bakounine-1863"                   = "File:Bakunin Lewitski 1863.png"
  "biblio-congres-bale-1869"                = "File:Baselerkongress 1869.jpg"
  "biblio-sonvilier"                        = "File:Hôtel de la Balance à Sonvilier.png"
  "biblio-bakounine-tribune-1869"           = "File:Bakunin speaking.png"
  "biblio-bakounine-1866"                   = "File:Mikhail Bakunin 1866-1.2 V01-1.1.jpg"
  "biblio-bakounine-jeune-1843"             = "File:Young Bakunin with signature.png"
  "biblio-saint-imier-hotel-de-ville"       = "File:Hôtel de Ville à Saint Imier.png"
  "biblio-malatesta-1891"                   = "File:Malatesta, 1891.jpg"
  "biblio-malatesta-bologne-1920"           = "File:Malatesta D'Andrea Borghi.jpg"
  "biblio-malatesta-illava-1920"            = "File:Enrico Malatesta illustration - Karl Illava.jpg"
  "biblio-malatesta-1902"                   = "File:Errico Malatesta The silver messenger.png"
  "biblio-malatesta-1898"                   = "File:Malatesta 1898.jpg"
  "biblio-libertad"                         = "File:Libertad 01.jpg"
  "biblio-l-anarchie-1907"                  = "File:L'anarchie (1907).png"
  "biblio-l-anarchie-1905"                  = "File:L'anarchie-27-12-1905.jpg"
  "biblio-goldman-assise"                   = "File:Emma Goldman seated.jpg"
  "biblio-goldman-union-square-1916"        = "File:Emma Goldman - Union Square, New York, 1916.jpg"
  "biblio-goldman-berkman"                  = "File:Emma Goldman and Alexander Berkman.jpg"
  "biblio-kronstadt-1921"                   = "File:Kronstadt general view, 1921.jpeg"
  "biblio-durruti-funerailles"              = "File:Durruti funeral, Via Laietana.jpg"
  "biblio-proudhon-livre"                   = "File:Proudhon with book and armrest by Nadar – BNF (cropped).jpg"
  "biblio-proudhon-courbet"                 = "File:Courbet, Proudhon et ses enfants, PPPH00634(3).jpg"
  "biblio-proudhon-1848"                    = "File:P. J. Proudhon Né à Besançon, le 15 Janvier 1809 - estampe - btv1b53015371q.jpg"
  "biblio-michel-1880"                      = "File:Louise Michel, grayscale.jpg"
  "biblio-michel-commune"                   = "File:Portrait de Louise Michel (1830-1905), pendant la Commune de Paris 1871. PH15064.jpg"
  "biblio-michel-ere-nouvelle"              = "File:L'Ère nouvelle. Pensée dernière. Souvenirs de Calédonie (Chant des captifs).jpg"
  "biblio-michel-conference-1880"           = "File:1880-12-11, Le Monde illustré, Une conférence de Louise Michel à la salle Graffard.jpg"
  "biblio-michel-vierge-1880"               = "File:Louise Michel 1880.jpg"
  "biblio-michel-caricature-1887"           = "File:Manuel Luque - La Caricature du 3 septembre 1887 - Louise Michel.jpg"
  "biblio-reclus-1900"                      = "File:Élisée Reclus, par Nadar, 1900, grayscale.jpg"
  "biblio-reclus-geographe"                 = "File:M. Elisée Reclus. Géographe - btv1b532261609.jpg"
  "biblio-reclus-vers-1890"                 = "File:Élisée Reclus, RP-F-2001-7-1103A-16 (cropped).jpg"
  "biblio-reclus-1878"                      = "File:Élisée Reclus, by Nadar, 1878, original.jpg"
  "biblio-reclus-gide"                      = "File:Elisée Reclus vers 1900 arch C Gide.jpg"
  "biblio-reclus-rysselberghe"              = "File:Théo van Rysselberghe - Portrait of Elisée Reclus.jpg"
  "biblio-reclus-nadar-2"                   = "File:M. Elisée Reclus - btv1b53118872c.jpg"
  "biblio-reclus-nadar-3"                   = "File:Élisée Reclus, by Nadar, 1875-1895, grayscale.jpg"
  "biblio-esclaves-hilton-head-1862"        = "File:Slaves of the rebel Genl. Thomas F. Drayton, Hilton Head, S.C. LCCN2006683283.jpg"
  "biblio-john-brown-1859"                  = "File:John Brown portrait, 1859.jpg"
  "biblio-harpers-ferry-1859"               = "File:The Harper's Ferry insurrection-The U.S. Marines storming the engine house-Insurgents firing through holes in the doors - from a sketch made on the spot by our special artist. LCCN00652046.jpg"
  "biblio-kropotkine-1900"                  = "File:Peter Kropotkin circa 1900.jpg"
  "biblio-montmartre-18-mars"               = "File:Parc d'artillerie de la Butte Montmartre. 18 mars 1871. PH4142-175.jpg"
  "biblio-kropotkine-nadar"                 = "File:Kropotkin Nadar.png"
  "biblio-esprit-de-revolte-1881"           = "File:First parts of L'Esprit de révolte in Le Révolté.jpg"
  "biblio-le-revolte-1882"                  = "File:Le Révolté.jpg"
  "biblio-kropotkine-1864"                  = "File:Peter Kropotkin 1864.png"
  "biblio-bastille"                         = "File:PRISE DE LA BASTILLE 14 juillet 1789, G.27792.jpg"
  "biblio-entraide-1902"                    = "File:Mutual Aid by Peter Kropotkin cover.jpg"
  "biblio-clairvaux"                        = "File:Prison de Clairvaux La maison-centrale et la cour d'honneur.jpg"
  "biblio-kropotkine-haparanda-1917"        = "File:Krapotkin in Haparanda.jpg"
  "biblio-kropotkine-funerailles"           = "File:Kropotkin's funerals. Head of the Funeral Procession.jpg"
  "biblio-kropotkine-temps-nouveaux-1921"   = "File:Pierre Kropotkine dans Les Temps nouveaux du 1er mars 1921.png"
  "biblio-pataud-1910"                      = "File:Émile Pataud 1910.png"
  "biblio-pouget-delannoy"                  = "File:Émile Pouget.jpg"
  "biblio-fourmies-1891"                    = "File:Le petit Parisien.JPG"
  "biblio-pressense"                        = "File:Francis de Pressensé.png"
  "biblio-vaillant-1893"                    = "File:La dynamite à la chambre Vaillant lançant son engin, G.38052.jpg"
  "biblio-pere-peinard-bourgeoisie"         = "File:La Bourgeoisie (Le Père Peinard).jpg"
  "biblio-pere-peinard-colonies-1891"       = "File:Le Père Peinard anticolonialisme.png"
  "biblio-de-cleyre-1901"                   = "File:Voltairine de Cleyre (Age 35).jpg"
  "biblio-de-cleyre-1898"                   = "File:Voltairine de Cleyre, August 1898.jpg"
  "biblio-de-cleyre-frontispice"            = "File:Voltairine de Cleyre frontispiece.tiff"
  "biblio-de-cleyre-1906"                   = "File:Voltairine de Cleyre (1906).png"
  "biblio-stirner-engels"                   = "File:Max Stirner-k.jpg"
  "biblio-faure-nadar"                      = "File:Sébastien Faure studio portrait.jpg"
  "biblio-faure-police"                     = "File:Fauresebastien police.jpg"
  "biblio-la-ruche-fete"                    = "File:La Ruche un jour de fête.jpg"
  "biblio-grave-steinlen"                   = "File:Portrait of Jean Grave by Théophile Steinlen.jpg"
  "biblio-grave-1893"                       = "File:Gravejean police.jpg"
  "biblio-la-revolte-bureaux-1893"          = "File:L'anarchie à Paris.- Les bureaux du journal La Révolte, 140 rue Mouffetard. G.38045.jpg"
  "biblio-darwin-1881"                      = "File:Charles Darwin 1880.jpg"
  "biblio-dejacque-libertaire"              = "File:Le libertaire 25.png"
  "biblio-parsons-1920"                     = "File:Lucy Parsons.1920.jpg"
  "biblio-pelletier-1910"                   = "File:Agence Rol - 1910 - Madeleine Pelletier.jpg"
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
