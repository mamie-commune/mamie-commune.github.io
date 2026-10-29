# Génère le site statique Mamie Commune à partir de _src/.
# Usage : powershell -ExecutionPolicy Bypass -File _src/build.ps1
$ErrorActionPreference = "Stop"
$src  = $PSScriptRoot
$site = Split-Path $src -Parent
$utf8 = New-Object System.Text.UTF8Encoding $false
function Read-Utf8($p) { [IO.File]::ReadAllText($p, [Text.Encoding]::UTF8) }
function Write-Utf8($p, $s) {
  $d = Split-Path $p -Parent
  if (-not (Test-Path $d)) { New-Item -ItemType Directory -Force $d | Out-Null }
  [IO.File]::WriteAllText($p, $s, $utf8)
}
function Esc($s) { [Net.WebUtility]::HtmlEncode($s) }
function JsStr($s) { '"' + ($s -replace '\\', '\\' -replace '"', '\"') + '"' }
function Slug($s) { ($s.ToLower().Normalize([Text.NormalizationForm]::FormD) -replace '\p{Mn}', '' -replace '[^a-z0-9]+', '-').Trim('-') }

$layout = Read-Utf8 (Join-Path $src "layout.html")
$navItems = @(
  @("accueil", "index.html", "Accueil"),
  @("luttes", "experiences/index.html", "Révolutions"),
  @("antifa", "antifascisme/index.html", "Antifascisme"),
  @("bibliotheque", "bibliotheque/index.html", "Bibliothèque"),
  @("carte", "carte.html", "Carte"),
  @("manif", "manif/index.html", "Manif"),
  @("octobre", "mouvement-17-octobre.html", "17 Octobre"),
  @("videos", "videos.html", "Vidéos"),
  @("outils", "guides/index.html", "Outils numériques")
)

function Render-Page($root, $nav, $title, $desc, $body, $scripts) {
  $navHtml = ""
  foreach ($item in $navItems) {
    $cur = ""; if ($item[0] -eq $nav) { $cur = ' aria-current="page"' }
    $navHtml += "<a href=""$root$($item[1])""$cur>$($item[2])</a>"
  }
  $out = $layout.Replace("{{TITLE}}", (Esc $title)).Replace("{{DESC}}", (Esc $desc)).Replace("{{NAV}}", $navHtml).Replace("{{BODY}}", $body).Replace("{{SCRIPTS}}", $scripts)
  $out = Clean-Links ($out.Replace("{{R}}", $root))
  # Version dans l'adresse des scripts et styles : les navigateurs reprennent la dernière version à chaque changement.
  return [regex]::Replace($out, '((?:src|href)="(?!https?:|//)[^"?#]+\.(?:js|css))"', ('$1?v=' + $ver + '"'))
}

# Empreinte des sources : change dès qu'un texte, un style, un script ou une donnée change.
$sha = [Security.Cryptography.SHA1]::Create()
$verFiles = @(Get-ChildItem $src -Recurse -File -Include *.txt, *.html, *.muse | Where-Object { $_.FullName -notmatch '\\textes\\print\\' }) + @(Get-ChildItem (Join-Path $site "assets") -File -Include *.js, *.css -Recurse) + @(Get-Item (Join-Path $site "data\lieux.js"), (Join-Path $site "data\videos.js"), (Join-Path $site "data\mobilisations.js"))
$verBytes = New-Object System.IO.MemoryStream
foreach ($vf in ($verFiles | Sort-Object FullName)) { $bytes = [IO.File]::ReadAllBytes($vf.FullName); $verBytes.Write($bytes, 0, $bytes.Length) }
$ver = ([BitConverter]::ToString($sha.ComputeHash($verBytes.ToArray())) -replace '-', '').Substring(0, 8).ToLower()

# Adresses propres : les sources gardent « page.html » et « dossier/index.html » (pratique à écrire),
# et les pages publiées pointent vers « page » et « dossier/ ». Le serveur sert page.html pour /page (.htaccess).
function Clean-Url($u) {
  if ($u -match '^(https?:|mailto:|tel:|data:|#|//)') { return $u }
  $m = [regex]::Match($u, '^([^?#]*?)\.html([?#].*)?$')
  if (-not $m.Success) { return $u }
  $p = $m.Groups[1].Value; $rest = $m.Groups[2].Value
  if ($p -eq "index") { $p = "./" } elseif ($p.EndsWith("/index")) { $p = $p.Substring(0, $p.Length - 5) }
  return $p + $rest
}
function Clean-Links($html) {
  return [regex]::Replace($html, '\b(href|action)="([^"]*)"', { param($m) "$($m.Groups[1].Value)=""$(Clean-Url $m.Groups[2].Value)""" })
}

# Lit les fichiers « === slug | catégorie | titre | [signature |] résumé » d'un dossier.
function Read-Collection($dir) {
  $items = @()
  foreach ($f in Get-ChildItem (Join-Path $src $dir) -Filter *.txt | Sort-Object Name) {
    foreach ($p in ((Read-Utf8 $f.FullName) -split "(?m)^=== ")) {
      if ($p.Trim() -eq "") { continue }
      $nl = $p.IndexOf("`n")
      $meta = $p.Substring(0, $nl).Trim() -split "\s\|\s"
      $by = ""; $sum = $meta[3]
      if ($meta.Count -ge 5) { $by = $meta[3].Trim(); $sum = $meta[4] }
      $items += [pscustomobject]@{ slug = $meta[0].Trim(); cat = $meta[1].Trim(); title = $meta[2].Trim(); by = $by; sum = $sum.Trim(); html = $p.Substring($nl + 1).Trim() }
    }
  }
  return $items
}

function Build-Collection($items, $folder, $nav, $label, $kind, $credit, $jsVar) {
  for ($i = 0; $i -lt $items.Count; $i++) {
    $g = $items[$i]
    $toc = ""
    foreach ($m in [regex]::Matches($g.html, '<h2 id="([^"]+)">(.*?)</h2>')) {
      $toc += "<li><a href=""#$($m.Groups[1].Value)"">$([regex]::Replace($m.Groups[2].Value, '<[^>]+>', ''))</a></li>"
    }
    $words = ([regex]::Replace($g.html, '<[^>]+>', ' ') -split '\s+' | Where-Object { $_ }).Count
    $mins = [Math]::Max(2, [Math]::Ceiling($words / 200))
    $nav2 = "<span></span>"
    if ($i -gt 0) { $pv = $items[$i-1]; $nav2 = "<a href=""$($pv.slug).html""><small>← Précédent</small><b>$(Esc $pv.title)</b></a>" }
    if ($i -lt $items.Count - 1) { $nx = $items[$i+1]; $nav2 += "<a href=""$($nx.slug).html""><small>Suivant →</small><b>$(Esc $nx.title)</b></a>" }
    $meta = "<span>$(Esc $g.cat)</span>"
    if ($g.by) { $meta += "<span>$(Esc $g.by)</span>" }
    $meta += "<span>$kind · $mins min</span>"
    $body = @"
<header class="gtitle"><div class="wrap">
  <p class="crumbs"><a href="../index.html">Accueil</a><span>/</span><a href="index.html">$label</a><span>/</span><a href="index.html#$(Slug $g.cat)">$(Esc $g.cat)</a></p>
  <h1>$(Esc $g.title)</h1>
  <p class="lead">$(Esc $g.sum)</p>
  <div class="gmeta">$meta</div>
</div></header>
<div class="wrap glayout">
  <article class="prose">
$($g.html)
$(if ($g.html -match 'class="credit"') { "" } else { $credit })
  <nav class="gnext" aria-label="Pages voisines">$nav2</nav>
  </article>
  <aside class="toc"><h2>Dans cette page</h2><ol>$toc</ol></aside>
</div>
"@
    $title = $g.title; if ($g.by) { $title += " — " + ($g.by -split ' · ')[0] }
    Write-Utf8 (Join-Path $site "$folder\$($g.slug).html") (Render-Page "../" $nav "$title · Mamie Commune" $g.sum $body "")
  }
  $js = "// Généré par _src/build.ps1 — ne pas modifier à la main.`nwindow.$jsVar = [`n"
  $js += ($items | ForEach-Object { "  { slug: $(JsStr $_.slug), cat: $(JsStr $_.cat), t: $(JsStr $_.title), by: $(JsStr $_.by), d: $(JsStr $_.sum) }" }) -join ",`n"
  $js += "`n];`n"
  Write-Utf8 (Join-Path $site "data\$folder.js") $js
}

$guides = Read-Collection "guides"
Build-Collection $guides "guides" "outils" "Outils numériques" "Guide" '<p class="credit">Guide rédigé par Mamie Commune d''après les articles du blog « Libérons nos ordis » (licence Creative Commons BY-SA). Cette adaptation est publiée sous la même licence : tu peux la copier, la modifier et la partager en citant la source.</p>' "GUIDES"

# Titre de couverture en étiquettes noires, roses et crème.
function Title-Tags($s) {
  $w = $s -split '\s+'; $out = @(); $n = 0
  for ($k = 0; $k -lt $w.Count; ) {
    $size = 1; if ($w[$k].Length -lt 4 -and $k + 1 -lt $w.Count) { $size = 2 }
    $chunk = ($w[$k..($k + $size - 1)] -join ' ')
    $cls = if ($n % 3 -eq 2) { 2 } else { $n % 2 }
    $out += "<span class=""tg tg$cls"">$(Esc $chunk)</span>"
    $k += $size; $n++
  }
  return $out -join ' '
}
# ---------- livres complets (domaine public) ----------
. (Join-Path $src "muse.ps1")
$printTpl = Read-Utf8 (Join-Path $src "textes\print.html")
$mamieUrl = "file:///" + ((Join-Path $site "assets\mamie.webp") -replace '\\', '/')
$livres = @()
foreach ($row in (Read-Utf8 (Join-Path $src "textes\livres.txt")) -split "`n") {
  if ($row.Trim() -eq "" -or $row.StartsWith("#")) { continue }
  $c = $row -split "\|" | ForEach-Object { $_.Trim() }
  $doc = ConvertFrom-Muse (Read-Utf8 (Join-Path $src "textes\sources\$($c[0].Trim()).muse"))
  $m = $doc.meta
  $title = $m["title"] -replace '\s*\?$', ' ?'
  $author = $m["author"] -replace '^Reclus Élisée$', 'Élisée Reclus'
  $date = ($m["date"] -replace '[^\d]', ' ').Trim() -split '\s+' | Select-Object -Last 1
  $source = ([regex]::Replace(($m["notes"] + ""), '<[^>]+>', '') -replace '\[\[[^\]]+\]\[([^\]]+)\]\]', '$1' -replace '\*', '').Trim()
  $words = ([regex]::Replace($doc.html, '<[^>]+>', ' ') -split '\s+' | Where-Object { $_ }).Count
  $livres += [pscustomobject]@{ id = $c[1].Trim(); cat = $c[2].Trim(); fiche = $c[3].Trim(); d = $c[4].Trim(); title = $title; author = $author; date = $date; source = $source; doc = $doc; words = $words; sub = ($m["subtitle"] + "") }
}

$ficheToLivre = @{}; foreach ($l in $livres) { if ($l.fiche) { $ficheToLivre[$l.fiche] = $l.id } }

for ($i = 0; $i -lt $livres.Count; $i++) {
  $l = $livres[$i]
  $toc = ($l.doc.toc | Select-Object -First 60 | ForEach-Object { "<li class=""t$($_.level)""><a href=""#$($_.id)"">$(Esc $_.text)</a></li>" }) -join ""
  if ($l.doc.html -match 'id="notes"') { $toc += '<li class="t2"><a href="#notes">Notes</a></li>' }
  $mins = [Math]::Max(1, [Math]::Round($l.words / 230))
  $duree = if ($mins -ge 90) { "$([Math]::Round($mins / 60)) h de lecture" } else { "$mins min de lecture" }
  $ficheBtn = ""; if ($l.fiche) { $ficheBtn = "<a class=""btn"" href=""../bibliotheque/$($l.fiche).html"">Fiche de lecture</a>" }
  $nav2 = "<span></span>"
  if ($i -gt 0) { $pv = $livres[$i-1]; $nav2 = "<a href=""$($pv.id).html""><small>← Précédent</small><b>$(Esc $pv.title)</b></a>" }
  if ($i -lt $livres.Count - 1) { $nx = $livres[$i+1]; $nav2 += "<a href=""$($nx.id).html""><small>Suivant →</small><b>$(Esc $nx.title)</b></a>" }
  $srcLine = ""; if ($l.source) { $srcLine = " Édition : $(Esc $l.source)" }
  $body = @"
<header class="gtitle"><div class="wrap">
  <p class="crumbs"><a href="../index.html">Accueil</a><span>/</span><a href="../bibliotheque/index.html">Bibliothèque</a><span>/</span><a href="../bibliotheque/index.html#livres">Livres complets</a></p>
  <h1>$(Esc $l.title)</h1>
  <p class="lead">$(Esc $l.d)</p>
  <div class="gmeta"><span>$(Esc $l.cat)</span><span>$(Esc $l.author) · $($l.date)</span><span>$duree</span></div>
  <div class="cta"><a class="btn btn--main" href="../lecteur.html?livre=$($l.id)">Lire en PDF</a><a class="btn" href="pdf/$($l.id).pdf" download>Télécharger le PDF</a>$ficheBtn</div>
</div></header>
<div class="wrap glayout">
  <article class="prose livre">
$($l.doc.html)
<p class="credit">Texte intégral, domaine public.$srcLine Mis en page par Mamie Commune d'après la Bibliothèque anarchiste.</p>
  <nav class="gnext" aria-label="Livres voisins">$nav2</nav>
  </article>
  <aside class="toc"><h2>Sommaire</h2><ol>$toc</ol></aside>
</div>
"@
  Write-Utf8 (Join-Path $site "livres\$($l.id).html") (Render-Page "../" "bibliotheque" "$($l.title) — $($l.author) · Mamie Commune" $l.d $body "")

  # Version imprimable, convertie en PDF par _src/pdf.ps1
  $sub = ""; if ($l.sub) { $sub = "<p class=""cover__sub"">$(Esc $l.sub)</p>" }
  $print = $printTpl.Replace("{{TITLE}}", (Esc $l.title)).Replace("{{AUTHOR}}", (Esc $l.author)).Replace("{{DATE}}", $l.date).Replace("{{SUB}}", $sub).Replace("{{MAMIE}}", $mamieUrl).Replace("{{TITLETAGS}}", (Title-Tags $l.title)).Replace("{{SOURCE}}", (Esc $l.source)).Replace("{{BODY}}", $l.doc.html)
  # On ne réécrit que si le contenu change, pour que pdf.ps1 ne régénère que les livres modifiés.
  $pp = Join-Path $src "textes\print\$($l.id).html"
  if (-not (Test-Path $pp) -or (Read-Utf8 $pp) -ne $print) { Write-Utf8 $pp $print }
}
# Livres diffusés tels quels en PDF, avec l'accord de leurs auteurs (pas de texte source à convertir).
# Format : identifiant | thème | fiche liée | titre | auteur | année | pages | présentation | crédit
$pdfList = Join-Path $src "textes\livres-pdf.txt"
if (Test-Path $pdfList) {
  foreach ($row in (Read-Utf8 $pdfList) -split "`n") {
    if ($row.Trim() -eq "" -or $row.StartsWith("#")) { continue }
    $c = $row -split "\|" | ForEach-Object { $_.Trim() }
    $l = [pscustomobject]@{ id = $c[0]; cat = $c[1]; fiche = $c[2]; title = $c[3]; author = $c[4]; date = $c[5]; d = $c[7] }
    $livres += $l
    if ($l.fiche) { $ficheToLivre[$l.fiche] = $l.id }
    $ficheBtn = ""; if ($l.fiche) { $ficheBtn = "<a class=""btn"" href=""../bibliotheque/$($l.fiche).html"">Fiche de lecture</a>" }
    $body = @"
<header class="gtitle"><div class="wrap">
  <p class="crumbs"><a href="../index.html">Accueil</a><span>/</span><a href="../bibliotheque/index.html">Bibliothèque</a><span>/</span><a href="../bibliotheque/index.html#livres">Livres complets</a></p>
  <h1>$(Esc $l.title)</h1>
  <p class="lead">$(Esc $l.d)</p>
  <div class="gmeta"><span>$(Esc $l.cat)</span><span>$(Esc $l.author) · $($l.date)</span><span>$(Esc $c[6]) pages</span></div>
  <div class="cta"><a class="btn btn--main" href="../lecteur.html?livre=$($l.id)">Lire en PDF</a><a class="btn" href="pdf/$($l.id).pdf" download>Télécharger le PDF</a>$ficheBtn</div>
</div></header>
<div class="wrap glayout">
  <article class="prose">
    <p>Ce livre est diffusé ici dans sa mise en page d'origine. Ouvre-le dans le <a href="../lecteur.html?livre=$($l.id)">lecteur PDF</a> ou télécharge-le pour le lire hors ligne, l'imprimer ou le faire circuler.</p>
    $(if ($l.fiche) { "<p>Pour aller à l'essentiel, la <a href=""../bibliotheque/$($l.fiche).html"">fiche de lecture</a> résume chaque chapitre.</p>" })
    <p class="credit">$(Esc $c[8])</p>
  </article>
</div>
"@
    Write-Utf8 (Join-Path $site "livres\$($l.id).html") (Render-Page "../" "bibliotheque" "$($l.title) — $($l.author) · Mamie Commune" $l.d $body "")
  }
}

$js = "// Généré par _src/build.ps1 — ne pas modifier à la main.`nwindow.LIVRES = [`n"
$js += ($livres | ForEach-Object { "  { slug: $(JsStr $_.id), cat: $(JsStr $_.cat), t: $(JsStr $_.title), by: $(JsStr "$($_.author) · $($_.date)"), d: $(JsStr $_.d) }" }) -join ",`n"
$js += "`n];`n"
Write-Utf8 (Join-Path $site "data\livres.js") $js

$biblio = Read-Collection "bibliotheque"
foreach ($b in $biblio) {
  if ($ficheToLivre.ContainsKey($b.slug)) {
    $b.html += "`n<div class=""note""><p><strong>Le texte complet est sur Mamie Commune.</strong> <a href=""../livres/$($ficheToLivre[$b.slug]).html"">Lire en ligne</a> ou <a href=""../lecteur.html?livre=$($ficheToLivre[$b.slug])"">ouvrir le PDF</a>.</p></div>"
  }
}
Build-Collection $biblio "bibliotheque" "bibliotheque" "Bibliothèque" "Fiche" '<p class="credit">Fiche de lecture rédigée par Mamie Commune d''après les textes de la Bibliothèque anarchiste francophone. Cette fiche est libre de reproduction.</p>' "BIBLIO"

$exp = Read-Collection "experiences"
Build-Collection $exp "experiences" "luttes" "Révolutions" "Dossier" '<p class="credit">Dossier rédigé par Mamie Commune à partir de travaux d''historiennes et d''historiens et de textes des mouvements concernés. Libre de reproduction.</p>' "EXPERIENCES"

$antifa = Read-Collection "antifascisme"
Build-Collection $antifa "antifascisme" "antifa" "Antifascisme" "Fiche" '<p class="credit">Fiche rédigée par Mamie Commune d''après les ressources publiées par le site antifasciste La Horde. Les originaux (schéma, carte, livre) sont disponibles sur leur site.</p>' "ANTIFA"

# Guide de manif : chaque catégorie des fiches de _src/manif/ devient une rubrique (Legal Team…).
$manif = @(Read-Collection "manif")   # @() : une seule fiche reste une liste
Build-Collection $manif "manif" "manif" "Guide de manif" "Fiche" '<p class="credit">Fiche rédigée par Mamie Commune. Elle ne remplace pas l''avis d''une avocate ou d''un avocat.</p>' "MANIF"

# ---------- index de la barre de recherche (data/recherche.js) ----------
# Une entrée par page : u = adresse, k = rubrique, t = titre, d = résumé, x = mots en plus (catégorie, intertitres, début du texte).
function Plain($html, $max) {
  $s = [Net.WebUtility]::HtmlDecode([regex]::Replace([regex]::Replace($html, '<(script|style|svg)[\s\S]*?</\1>', ' '), '<[^>]+>', ' '))
  $s = ($s -replace '\s+', ' ').Trim()
  if ($s.Length -gt $max) { $s = $s.Substring(0, $max) }
  return $s
}
function Heads($html) { ([regex]::Matches($html, '<h[23][^>]*>(.*?)</h[23]>') | ForEach-Object { Plain $_.Groups[1].Value 200 }) -join ' · ' }
$index = @()
foreach ($set in @(@($guides, "guides", "Outils numériques"), @($biblio, "bibliotheque", "Fiche de lecture"), @($exp, "experiences", "Révolutions"), @($antifa, "antifascisme", "Antifascisme"), @($manif, "manif", "Guide de manif"))) {
  foreach ($g in $set[0]) {
    $index += [pscustomobject]@{ u = "$($set[1])/$($g.slug).html"; k = $set[2]; t = $g.title; d = $g.sum; x = "$($g.cat) $($g.by) $(Heads $g.html) $(Plain $g.html 600)" }
  }
}
foreach ($l in $livres) {
  $index += [pscustomobject]@{ u = "livres/$($l.id).html"; k = "Livre complet"; t = $l.title; d = $l.d; x = "$($l.author) $($l.date) $($l.cat)" }
}

# ---------- pages ----------
foreach ($f in Get-ChildItem (Join-Path $src "pages") -Filter *.html) {
  $raw = Read-Utf8 $f.FullName
  $m = [regex]::Match($raw, '^<!--\s*(.*?)\s*-->\s*', 'Singleline')
  $meta = $m.Groups[1].Value -split "\s\|\s"
  $body = $raw.Substring($m.Length)
  $scripts = ""; if ($meta.Count -gt 3) { $scripts = $meta[3] }
  $out = $f.Name; $root = ""
  if ($f.BaseName -in @("guides", "bibliotheque", "experiences", "antifascisme", "manif")) { $out = "$($f.BaseName)\index.html"; $root = "../" }
  if ($f.BaseName -eq "404") { $root = "/" }   # servie à n'importe quelle adresse : liens absolus
  Write-Utf8 (Join-Path $site $out) (Render-Page $root $meta[2] $meta[0] $meta[1] $body $scripts)
  if ($f.BaseName -notin @("lecteur", "recherche", "404")) {
    $index += [pscustomobject]@{ u = $out -replace '\\', '/'; k = "Rubrique"; t = ($meta[0] -replace '\s*·\s*Mamie Commune$', ''); d = $meta[1]; x = "$(Heads $body) $([regex]::Matches($body, '<h3[^>]*>(.*?)</h3>') | ForEach-Object { Plain $_.Groups[1].Value 120 })" }
  }
}
# Anciennes adresses remplacées : petite page qui renvoie vers la nouvelle (IONOS redirige déjà via .htaccess).
foreach ($old in @(@("partage.html", "guides/signal"), @("manif\legal-team-belgique.html", "legal-team"))) {
  Write-Utf8 (Join-Path $site $old[0]) "<!doctype html><html lang=""fr""><head><meta charset=""utf-8""><title>Page déplacée · Mamie Commune</title><meta http-equiv=""refresh"" content=""0; url=$($old[1])""><link rel=""canonical"" href=""$($old[1])""><meta name=""robots"" content=""noindex""></head><body><p>Cette page a déménagé : <a href=""$($old[1])"">suivre Mamie</a>.</p></body></html>"
}

# ---------- miniatures YouTube (assets/yt/<id>.jpg) ----------
# Chaque vidéo YouTube citée dans _src (data-yt="…" ou youtube-nocookie.com/embed/…) reçoit sa miniature, hébergée ici
# pour que rien ne soit chargé depuis YouTube avant le clic. Sans connexion, on passe : la carte garde sa couverture dessinée.
$ytIds = Get-ChildItem $src -Recurse -Include *.html, *.txt | ForEach-Object { [regex]::Matches((Read-Utf8 $_.FullName), '(?:data-yt="|youtube-nocookie\.com/embed/)([\w-]{11})') } | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
foreach ($id in $ytIds) {
  $out = Join-Path $site "assets\yt\$id.jpg"
  if (Test-Path $out) { continue }
  try {
    Add-Type -AssemblyName System.Drawing
    $tmp = Join-Path $env:TEMP "yt-$id.jpg"
    $got = $false
    foreach ($n in "maxresdefault", "sddefault", "hqdefault") { try { Invoke-WebRequest "https://i.ytimg.com/vi/$id/$n.jpg" -OutFile $tmp -UseBasicParsing -ErrorAction Stop; $got = $true; break } catch {} }
    if (-not $got) { continue }
    $img = [Drawing.Image]::FromFile($tmp); $bmp = New-Object Drawing.Bitmap 640, 360; $g = [Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = "HighQualityBicubic"; $sh = [int]($img.Width * 9 / 16)
    $g.DrawImage($img, (New-Object Drawing.Rectangle 0, 0, 640, 360), (New-Object Drawing.Rectangle 0, ([int](($img.Height - $sh) / 2)), $img.Width, $sh), "Pixel")
    $enc = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $ep = New-Object Drawing.Imaging.EncoderParameters 1; $ep.Param[0] = New-Object Drawing.Imaging.EncoderParameter([Drawing.Imaging.Encoder]::Quality, [long]78)
    New-Item -ItemType Directory -Force (Split-Path $out) | Out-Null
    $bmp.Save($out, $enc, $ep); $g.Dispose(); $bmp.Dispose(); $img.Dispose(); Remove-Item $tmp
  } catch { Write-Warning "Miniature YouTube $id non récupérée : $($_.Exception.Message)" }
}

$js = "// Généré par _src/build.ps1 — ne pas modifier à la main. Utilisé par assets/recherche.js.`nwindow.RECHERCHE = [`n"
$js += ($index | ForEach-Object { "  { u: $(JsStr (Clean-Url $_.u)), k: $(JsStr $_.k), t: $(JsStr $_.t), d: $(JsStr $_.d), x: $(JsStr (($_.x -replace '\s+', ' ').Trim())) }" }) -join ",`n"
$js += "`n];`n"
Write-Utf8 (Join-Path $site "data\recherche.js") $js
Write-Host "OK : $($guides.Count) guides, $($biblio.Count) fiches, $($livres.Count) livres et $($exp.Count) pages de dossiers générés."
