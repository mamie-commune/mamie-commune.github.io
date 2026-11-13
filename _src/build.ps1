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

# ---------- dates (édition du jour, date d'arrivée de chaque page) ----------
$fr = [Globalization.CultureInfo]::GetCultureInfo("fr-FR")
function Date-Fr($d, $avecJour) {
  $j = if ($d.Day -eq 1) { "1er" } else { "$($d.Day)" }
  $s = "$j $($d.ToString('MMMM yyyy', $fr))"
  if ($avecJour) { $s = "$($d.ToString('dddd', $fr)) $s" }
  return $s
}
$edition = Date-Fr (Get-Date) $true
# Chaque page reçoit sa date d'arrivée dans _src/textes/apparitions.txt (adresse=date), ajoutée toute seule à la première
# génération qui la voit : elle sert à la date affichée sur les pages et aux « Dernières publications » de l'accueil.
$fApp = Join-Path $src "textes\apparitions.txt"
$app = [ordered]@{}
foreach ($l in (Read-Utf8 $fApp) -split "`n") { if ($l -match '^([^=#\s]+)=(\S+)') { $app[$Matches[1]] = $Matches[2] } }
$maintenant = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm")
function Date-Page($u) { if (-not $app.Contains($u)) { $app[$u] = $maintenant }; return Date-Fr ([datetime]::ParseExact($app[$u].Substring(0, 10), "yyyy-MM-dd", $null)) $false }

$layout = Read-Utf8 (Join-Path $src "layout.html")
# ---------- les six tiroirs de la boîte à outils ----------
# Tout le site se range dans ces familles : menu, pied de page, fil d'Ariane, accueil, recherche, et page de famille (page).
# Rubrique : clé de menu, adresse, nom, description courte, début des adresses de ses pages (vide = rubrique sans page à elle,
# présentée sur la page de la famille). Une page appartient à la rubrique dont le début d'adresse est le plus long
# (agir/caisse-de-solidarite passe avant agir/). Les pages Contribuer et Rejoins la bande restent hors des tiroirs (bandeau et pied de page).
$familles = @(
  [ordered]@{ id = "apprendre"; nom = "Apprendre"; page = "apprendre.html"; dit = "Comprendre d'où l'on vient"; rubriques = @(
    @("bibliotheque", "bibliotheque/index.html", "Bibliothèque", "Livres en entier, fiches de lecture et centre de ressources", "bibliotheque/|livres/|lecteur|ressources/"),
    @("theorie", "apprendre.html#theorie", "Théorie politique", "Par où commencer, l'État, la propriété, la révolution", "commencer"),
    @("luttes", "experiences/index.html", "Histoire des luttes", "Commune, Espagne 36, Mai 68, MLAC, ZAD, action directe…", "experiences/"),
    @("encyclopedie", "encyclopedie/index.html", "Encyclopédie des mouvements", "Anarchistes, socialistes, féministes, anticoloniaux… : histoire, idées, héritages", "encyclopedie/"),
    @("universite", "universite/index.html", "Université populaire", "Parcours, chronologie, figures et dictionnaire militant", "universite/"),
    @("figures", "figures/index.html", "Figures historiques", "Portraits de penseuses, penseurs, militantes et militants", "figures/"),
    @("glossaire", "glossaire.html", "Dictionnaire militant", "Tous les mots des luttes, expliqués en deux phrases", "glossaire"),
    @("videos", "apprendre.html#culture", "Culture militante", "Documentaires, vidéos de Mamie, images de lutte", "videos")) },
  [ordered]@{ id = "organiser"; nom = "S'organiser"; page = "s-organiser.html"; dit = "Trouver les autres, agir ensemble"; rubriques = @(
    @("ag", "agir/tenir-une-ag.html", "Assemblées générales", "Tenir une AG, décider sans chef", "agir/tenir-une-ag|agir/decider-sans-chef"),
    @("collectifs", "agir/monter-un-collectif.html", "Collectifs", "Monter un collectif, accueillir, durer sans s'épuiser", "agir/monter-un-collectif|agir/accueillir-personnes-trans|agir/eviter-l-epuisement-militant"),
    @("syndicalisme", "s-organiser.html#syndicalisme", "Syndicalisme", "Syndicalisme révolutionnaire, action directe, syndicats", ""),
    @("autogestion", "s-organiser.html#autogestion", "Autogestion", "Usines, villages et territoires gérés par celles et ceux qui y vivent", ""),
    @("greves", "agir/lancer-une-greve.html", "Grèves", "Lancer une grève, tenir un piquet", "agir/lancer-une-greve"),
    @("agir", "agir/index.html", "Organisation collective", "Toutes les fiches, et le guide pour lutter au lycée", "agir/"),
    @("boite-outils", "outils/index.html", "Les outils de Mamie", "Modèles d'AG, comptes rendus, tracts, affiches, caisse, minuteur", "outils/")) },
  [ordered]@{ id = "entraide"; nom = "S'entraider"; page = "s-entraider.html"; dit = "Ne laisser personne sur le carreau"; rubriques = @(
    @("mutualisme", "s-entraider.html#mutualisme", "Mutualisme", "L'entraide organisée, de Proudhon à Kropotkine", ""),
    @("caisses", "agir/caisse-de-solidarite.html", "Caisses de solidarité", "Soutenir grévistes et inculpés, en toute transparence", "agir/caisse-de-solidarite"),
    @("cantines", "s-entraider.html#cantines", "Cantines populaires", "Nourrir la lutte : petits-déjeuners, cabanes, piquets", ""),
    @("cooperatives", "s-entraider.html#cooperatives", "Coopératives", "Produire et partager sans patron", ""),
    @("bibliopop", "s-entraider.html#bibliotheques-populaires", "Bibliothèques populaires", "Lire, prêter, se retrouver", "")) },
  [ordered]@{ id = "defendre"; nom = "Se défendre"; page = "se-defendre.html"; dit = "Face à la police, à l'État et aux fachos"; rubriques = @(
    @("droits", "manif/legal-team.html", "Droits", "En manif, en garde à vue, au lycée", "manif/|agir/lyceens-face-aux-sanctions"),
    @("juridique", "se-defendre.html#juridique", "Ressources juridiques", "Modèles de recours, legal teams, lois à connaître", "manif/modeles"),
    @("antifa", "antifascisme/index.html", "Antifascisme", "Connaître l'extrême droite, ses codes, et agir contre elle", "antifascisme/"),
    @("feminisme", "se-defendre.html#feminisme", "Féminisme", "Autodéfense féministe, violences sexistes et sexuelles", "manif/autodefense-feministe|agir/violences-dans-nos-collectifs"),
    @("outils", "guides/index.html", "Protection numérique", "Signal, vie privée, Linux et logiciels libres", "guides/"),
    @("logiciels", "logiciels/index.html", "Logiciels libres", "L'annuaire : à quoi ils servent, licences et limites", "logiciels/"),
    @("hors-ligne", "hors-ligne.html", "Hors ligne", "Installer le site, packs à imprimer, confidentialité", "hors-ligne|packs/|confidentialite"),
    @("secours", "manif/street-medic.html", "Premiers secours", "Street medic : se préparer, soigner, et après", "manif/street-medic|manif/se-preparer-soin|manif/soigner-en-manif|manif/apres-la-manif")) },
  [ordered]@{ id = "creer"; nom = "Créer"; page = "creer.html"; dit = "Faire parler les murs"; rubriques = @(
    @("affiches", "agir/affiches-et-tracts.html", "Affiches", "À imprimer, à coller, à sérigraphier", "agir/affiches|agir/coller-des-affiches|agir/serigraphie"),
    @("tracts", "agir/faire-un-tract.html", "Tracts", "Faire un tract qu'on a envie de lire", "agir/faire-un-tract"),
    @("fanzines", "creer.html#fanzines", "Fanzines", "Plier, photocopier, diffuser", ""),
    @("journaux", "creer.html#journaux", "Journaux", "De la presse anarchiste d'hier aux journaux d'aujourd'hui", ""),
    @("medias", "creer.html#medias", "Médias indépendants", "Radios, éditions, et faire le sien", "")) },
  [ordered]@{ id = "allies"; nom = "Trouver des alliés"; page = "trouver-des-allies.html"; dit = "La bande est plus grande que tu crois"; rubriques = @(
    @("carte", "carte.html", "Carte des collectifs", "Groupes, syndicats, librairies et lieux près de chez toi", "carte"),
    @("mobilisations", "mouvement-17-octobre.html", "Mobilisations en cours", "Le mouvement du 17 Octobre, jour par jour", "mouvement-17-octobre"),
    @("syndicats", "carte.html?type=syndicat", "Syndicats", "Les syndicats de lutte sur la carte", ""),
    @("associations", "trouver-des-allies.html#associations", "Associations", "Entraide numérique et associations amies", ""),
    @("librairies", "carte.html?type=librairie", "Librairies", "Librairies et bibliothèques militantes", ""),
    @("lieux", "carte.html?type=lieu", "Lieux autogérés", "Locaux, centres et lieux libertaires", ""),
    @("medias-carte", "carte.html?type=media", "Médias indépendants", "Radios, journaux et maisons d'édition", "")) }
)
function Famille-De-Adresse($u) {
  $best = @("", "", ""); $len = 0
  foreach ($f in $familles) {
    if ($u -eq $f.page) { return @($f.id, $f.nom, $f.id) }
    foreach ($r in $f.rubriques) { foreach ($p in ($r[4] -split '\|')) { if ($p -and $u.StartsWith($p) -and $p.Length -gt $len) { $best = @($f.id, $r[2], $r[0]); $len = $p.Length } } }
  }
  return $best
}
# ---------- navigation principale : sept entrées ----------
# Le menu, le pied de page et le fil d'Ariane suivent ces entrées ; les six tiroirs ci-dessus restent des catégories
# internes (étiquettes, recherche, pages thématiques). Chaque entrée : identifiant, nom, page d'accueil de la rubrique,
# phrase courte, liens du menu déroulant (5 au plus : adresse, nom, phrase ; vide = lien direct sans menu),
# et les clés (rubriques ou tiroirs de $familles) qui lui appartiennent.
$menu = @(
  [ordered]@{ id = "bibliotheque"; nom = "Bibliothèque"; page = "bibliotheque/index.html"; dit = "Lire, apprendre, comprendre d'où l'on vient"; liens = @(
    @("bibliotheque/index.html", "Livres et fiches de lecture", "Les classiques en entier, et l'essentiel en quelques pages"),
    @("experiences/index.html", "Histoire des luttes", "De la Commune aux ronds-points"),
    @("universite/index.html", "Université populaire", "Des parcours pour apprendre à son rythme"),
    @("encyclopedie/index.html", "Encyclopédie des mouvements", "Histoire, idées et héritages des mouvements"),
    @("apprendre.html", "Tout pour apprendre", "Théorie, figures, dictionnaire militant, culture militante"))
    cles = "apprendre bibliotheque theorie luttes encyclopedie universite figures glossaire" },
  [ordered]@{ id = "videotheque"; nom = "Vidéothèque"; page = "videos.html"; dit = "Documentaires et vidéos de Mamie"; liens = @(); cles = "videos" },
  [ordered]@{ id = "organiser"; nom = "S'organiser"; page = "s-organiser.html"; dit = "Une lutte, ça se prépare à plusieurs"; liens = @(
    @("agir/tenir-une-ag.html", "Tenir une AG", "Et décider sans chef"),
    @("agir/monter-un-collectif.html", "Monter un collectif", "Qui tient dans la durée"),
    @("agir/lancer-une-greve.html", "Faire grève", "Lancer une grève, tenir un piquet"),
    @("creer.html", "Affiches, tracts, fanzines", "Faire parler les murs"),
    @("outils/index.html", "Les outils de Mamie", "Modèles d'AG, comptes rendus, tracts, caisse"))
    cles = "organiser ag collectifs syndicalisme autogestion greves agir boite-outils creer affiches tracts fanzines journaux medias" },
  [ordered]@{ id = "defendre"; nom = "Se défendre"; page = "se-defendre.html"; dit = "Tes droits, ta sécurité, celle des camarades"; liens = @(
    @("manif/legal-team.html", "Tes droits en manif", "Contrôle, garde à vue, recours"),
    @("manif/street-medic.html", "Premiers secours", "Le soin entre camarades"),
    @("antifascisme/index.html", "Antifascisme", "Connaître l'extrême droite et agir"),
    @("guides/index.html", "Protection numérique", "Signal, données, logiciels libres"))
    cles = "defendre droits juridique antifa feminisme outils logiciels hors-ligne secours" },
  [ordered]@{ id = "lieux"; nom = "Lieux et mobilisations"; page = "trouver-des-allies.html"; dit = "Trouver la bande près de chez toi"; liens = @(
    @("carte.html", "La carte des collectifs", "Groupes, syndicats, librairies, lieux"),
    @("mouvement-17-octobre.html", "Mobilisations en cours", "Le mouvement du 17 Octobre, jour par jour"),
    @("carte.html?type=syndicat", "Syndicats", "Les syndicats de lutte sur la carte"),
    @("carte.html?type=lieu,librairie", "Lieux et librairies", "Lieux autogérés, librairies militantes"))
    cles = "allies carte mobilisations syndicats associations librairies lieux medias-carte" },
  [ordered]@{ id = "entraide"; nom = "Entraide"; page = "s-entraider.html"; dit = "Ne laisser personne sur le carreau"; liens = @(); cles = "entraide mutualisme caisses cantines cooperatives bibliopop" }
)
# ---------- identité : Mamie signe chaque page ----------
# En haut des pages de rubrique, Mamie (son portrait, dessin existant) dit une phrase ; en haut des fiches, un tampon
# dit le type de contenu. Les phrases donnent le ton, jamais une information : les faits restent dans le texte sourcé.
$mamieDit = @{ bibliotheque = "Le savoir n'appartient à personne : prends, lis, fais tourner."; videotheque = "Un film, ça se regarde à plusieurs, et ça se discute après."
  organiser = "Personne ne nous libérera à notre place."; defendre = "Connaître ses droits, c'est bien. Être nombreux, c'est mieux."
  lieux = "Les camarades sont souvent à deux rues de chez toi."; entraide = "La solidarité, pas la charité."; "" = "Sers-toi, imprime, fais tourner." }
$tampons = @{ "Guide numérique" = "Fais tourner"; "Fiche de lecture" = "Lu par la bande"; "Histoire de lutte" = "Mémoire des luttes"; "Fiche pratique" = "Sers-toi"
  "Guide pratique" = "Dans le cabas"; "Guide juridique" = "Droit français"; "Dossier antifasciste" = "No pasarán"; "Portrait" = "Portrait"; "Parcours" = "Université populaire"; "Dossier encyclopédique" = "Encyclopédie" }
function Entree-De($cle) { foreach ($e in $menu) { if (($e.cles -split ' ') -contains $cle) { return $e } }; return $null }

# Les trois familles en grandes colonnes, pour l'accueil.
function Familles-Accueil($root) {
  $h = "<div class=""fams"">"
  foreach ($f in $familles) {
    $h += "<section class=""fam fam--$($f.id)"" aria-labelledby=""fam-$($f.id)""><p class=""fam__dit"">$(Esc $f.dit)</p><h3 id=""fam-$($f.id)"">$(Esc $f.nom)</h3><ul class=""fam__list"">"
    foreach ($r in $f.rubriques) { $h += "<li><a href=""$root$($r[1])""><b>$(Esc $r[2])</b><span>$(Esc $r[3])</span></a></li>" }
    $h += "</ul></section>"
  }
  return $h + "</div>"
}

function Render-Page($root, $nav, $title, $desc, $body, $scripts) {
  # Menu : Accueil + sept entrées ; un menu déroulant court seulement pour les rubriques qui en ont besoin.
  $ici = Entree-De $nav
  $navHtml = "<a class=""nav__home"" href=""${root}index.html""$(if ($nav -eq 'accueil') { ' aria-current="page"' })>Accueil</a>"
  $opts = "<option value="""">Partout</option>"
  foreach ($f in $familles) { $opts += "<option value=""$($f.id)"">$(Esc $f.nom)</option>" }
  $pied = "<nav class=""pied-nav"" aria-label=""Les rubriques""><h2>Les rubriques</h2>"
  foreach ($e in $menu) {
    $estIci = $ici -and $ici.id -eq $e.id
    $pied += "<a href=""$root$($e.page)"">$(Esc $e.nom)</a>"
    if (-not $e.liens.Count) { $navHtml += "<a class=""nav__lien"" href=""$root$($e.page)""$(if ($estIci) { ' aria-current="page"' })>$(Esc $e.nom)</a>"; continue }
    $navHtml += "<div class=""nav__fam""><button class=""nav__btn"" type=""button"" aria-expanded=""false"" aria-controls=""menu-$($e.id)""$(if ($estIci) { ' data-ici' })>$(Esc $e.nom)</button>"
    $navHtml += "<div class=""nav__panel"" id=""menu-$($e.id)""><p class=""nav__dit"">$(Esc $e.dit)</p>"
    foreach ($l in $e.liens) { $navHtml += "<a href=""$root$($l[0])""><b>$(Esc $l[1])</b><span>$(Esc $l[2])</span></a>" }
    $navHtml += "<a class=""nav__tout"" href=""$root$($e.page)""><b>Toute la rubrique « $(Esc $e.nom) » →</b></a></div></div>"
  }
  $pied += "</nav><nav class=""pied-nav"" aria-label=""La bande à Mamie""><h2>La bande à Mamie</h2><a href=""${root}commencer.html"">Par où commencer ?</a><a href=""${root}contribuer.html"">Contribuer</a><a href=""${root}rejoindre.html"">Rejoins la bande</a><a href=""${root}boite-a-images.html"">La boîte à images</a><a href=""${root}hors-ligne.html"">Mamie hors ligne</a><a href=""${root}recherche.html"">Chercher</a></nav>"
  # Page d'accueil d'une rubrique : son fil d'Ariane s'arrête sur le nom de la rubrique (Accueil / Se défendre).
  $hub = [regex]::Match($body, '<p class="crumbs"><a [^>]*>Accueil</a><span>/</span><span>([^<]*)</span></p>')
  $estHub = $ici -and $hub.Success -and (Slug $hub.Groups[1].Value) -eq (Slug $ici.nom)
  if ($ici -and -not $estHub) {
    # Fil d'Ariane : la rubrique s'insère après « Accueil », sauf si le fil la nomme déjà (Accueil / Bibliothèque / …).
    $body = ([regex]'<p class="crumbs"><a href="[^"]*index\.html">Accueil</a><span>/</span>(<a [^>]*>|<span>)([^<]*)<').Replace($body, {
      param($m) if ((Slug $m.Groups[2].Value) -eq (Slug $ici.nom)) { return $m.Value }
      $m.Value.Insert($m.Groups[1].Index - $m.Index, "<a href=""$root$($ici.page)"">$(Esc $ici.nom)</a><span>/</span>") }, 1)
    # En bas de page : retour à la rubrique et ses autres portes (4 au plus), au lieu du tiroir entier.
    $autres = @($ici.liens | Select-Object -First 4)
    $liens = ($autres | ForEach-Object { "<li><a href=""$root$($_[0])""><b>$(Esc $_[1])</b><span>$(Esc $_[2])</span></a></li>" }) -join ""
    $liste = if ($liens) { '<ul class="suite__list">' + $liens + '</ul>' } else { "" }
    $body += "<nav class=""suite"" aria-labelledby=""suite-tit""><div class=""wrap""><h2 id=""suite-tit"" class=""suite__tit"">Dans la rubrique <span>$(Esc $ici.nom)</span></h2>$liste<a class=""suite__retour"" href=""$root$($ici.page)"">← Retour à la rubrique « $(Esc $ici.nom) »</a></div></nav>"
  }
  # Identité : tampon sur les fiches (selon leur type), phrase de Mamie sur les autres pages à en-tête.
  $type = [Net.WebUtility]::HtmlDecode([regex]::Match($body, '<span class="gmeta__type">([^<]*)</span>').Groups[1].Value)
  $tampon = if ($type) { if ($tampons[$type]) { $tampons[$type] } else { "Fiche documentaire" } } else { "" }
  if ($tampon) { $body = ([regex]'<header class="gtitle[^"]*"><div class="wrap">').Replace($body, { param($m) $m.Value + "<span class=""tampon"" aria-hidden=""true"">$(Esc $tampon)</span>" }, 1) }
  elseif ($nav -ne "accueil") {
    $phrase = if ($ici) { $mamieDit[$ici.id] } else { $mamieDit[""] }
    $body = ([regex]'(?s)(<header class="gtitle[^"]*"><div class="wrap">.*?<p class="lead">.*?</p>)').Replace($body, { param($m) $m.Value + "<p class=""mamie-dit""><img src=""${root}assets/mamie-logo-192.webp"" alt="""" width=""56"" height=""56"" loading=""lazy""><span><b>Mamie dit :</b> « $(Esc $phrase) »</span></p>" }, 1)
  }
  $out = $layout.Replace("{{TITLE}}", (Esc $title)).Replace("{{DESC}}", (Esc $desc)).Replace("{{NAV}}", $navHtml).Replace("{{PIED}}", $pied).Replace("{{FAMOPTS}}", $opts).Replace("{{BODY}}", $body).Replace("{{SCRIPTS}}", $scripts).Replace("{{EDITION}}", $edition)
  $out = $out.Replace("{{FAMILLES}}", (Familles-Accueil $root))
  if ($out.Contains("{{NOUVEAUTES}}")) { $out = $out.Replace("{{NOUVEAUTES}}", $nouveautes) }
  if ($out.Contains("{{SELECTION}}")) { $out = $out.Replace("{{SELECTION}}", $selection) }
  foreach ($k in $compteurs.Keys) { $out = $out.Replace("{{$k}}", "$($compteurs[$k])") }
  $out = Clean-Links ($out.Replace("{{R}}", $root))
  # Version dans l'adresse des scripts et styles : les navigateurs reprennent la dernière version à chaque changement.
  return [regex]::Replace($out, '((?:src|href)="(?!https?:|//)[^"?#]+\.(?:js|css))"', ('$1?v=' + $ver + '"'))
}

# Empreinte des sources : change dès qu'un texte, un style, un script ou une donnée change.
$sha = [Security.Cryptography.SHA1]::Create()
$verFiles = @(Get-ChildItem $src -Recurse -File -Include *.txt, *.html, *.muse, *.json, *.js | Where-Object { $_.FullName -notmatch '\\textes\\print\\' }) + @(Get-ChildItem (Join-Path $site "assets") -File -Include *.js, *.css -Recurse) + @(Get-Item (Join-Path $site "data\lieux.geojson"), (Join-Path $site "data\videos.js"), (Join-Path $site "data\mobilisations.js"))
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

# ---------- encyclopédie des mouvements : lue avant les autres rubriques ----------
# Dossiers : _src/encyclopedie/*.txt (même format que les Histoires de luttes ; la catégorie = le nom du mouvement,
# trois pages par mouvement, dans l'ordre Histoire, Idées, Héritages). Familles : _src/encyclopedie/familles.json.
# Chaque page du site vers laquelle un dossier renvoie (portrait, lutte, fiche, parcours…) reçoit en retour
# un encadré « Dans l'encyclopédie des mouvements » : les liens vont dans les deux sens, sans les écrire deux fois.
$ency = @(Read-Collection "encyclopedie")
$encyFam = @(((Read-Utf8 (Join-Path $src "encyclopedie\familles.json")) | ConvertFrom-Json).familles)
$encyRetour = @{}
foreach ($g in $ency) {
  foreach ($m in [regex]::Matches($g.html, 'href="\.\./((?:figures|experiences|bibliotheque|universite|antifascisme|agir|manif|guides)/[a-z0-9-]+)\.html')) {
    $cible = "$($m.Groups[1].Value).html"
    if (-not $encyRetour[$cible]) { $encyRetour[$cible] = [ordered]@{} }
    $encyRetour[$cible][$g.slug] = $g
  }
}
function Famille-De-Mouvement($nom) { foreach ($f in $encyFam) { foreach ($mv in $f.mouvements) { if ($mv.nom -eq $nom) { return $f } } }; return $null }
# Onglets d'un dossier : <!-- onglet : Nom --> en tête du texte, sinon le nom habituel selon la place de la page.
$ongletsDefaut = @("Histoire et origines", "Idées et théories", "Expériences et héritages")
function Onglet-De($g, $rang) { $o = [regex]::Match($g.html, '^\s*<!--\s*onglet\s*:\s*(.*?)\s*-->'); if ($o.Success) { return $o.Groups[1].Value }; if ($rang -lt 3) { return $ongletsDefaut[$rang] }; return $g.title }

# La voix du site : Mamie et sa bande présentent chaque fiche (petite accroche au-dessus du titre, une par rubrique).
$accroches = @{
  "guides" = "L'atelier de la bande à Mamie"; "bibliotheque" = "Mamie a lu pour toi"; "experiences" = "Mamie raconte"
  "antifascisme" = "La bande à Mamie contre l'extrême droite"; "manif" = "Dans le cabas de Mamie"; "agir" = "La bande à Mamie s'organise"; "universite" = "L'université populaire de Mamie"; "figures" = "Mamie les a connus (ou presque)"; "encyclopedie" = "L'encyclopédie de la bande à Mamie"
}
# Type de contenu affiché sur chaque page (et dans la recherche) : chaque rubrique a son modèle de page (classe gpage--dossier).
$types = @{ "encyclopedie" = "Dossier encyclopédique"; "universite" = "Parcours"; "figures" = "Portrait"; "guides" = "Guide numérique"; "bibliotheque" = "Fiche de lecture"; "experiences" = "Histoire de lutte"; "antifascisme" = "Dossier antifasciste"; "manif" = "Guide pratique"; "agir" = "Fiche pratique" }
function Type-De($folder, $g) { if ($folder -eq "manif" -and $g.cat -eq "Legal Team") { return "Guide juridique" }; return $types[$folder] }
function Build-Collection($items, $folder, $nav, $label, $kind, $credit, $jsVar) {
  $accroche = $accroches[$folder]
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
    $type = Type-De $folder $g
    $meta = "<span class=""gmeta__type"">$(Esc $type)</span><span>$(Esc $g.cat)</span>"
    if ($g.by) { $meta += "<span>$(Esc $g.by)</span>" }
    $meta += "<span>$mins min de lecture</span><span>Ajouté le $(Date-Page "$folder/$($g.slug).html")</span>"
    # À lire aussi : les autres pages de la même catégorie (hors pages voisines déjà proposées), sinon rien.
    $voisins = @($items | Where-Object { $_.cat -eq $g.cat -and $_.slug -ne $g.slug -and ($i -eq 0 -or $_.slug -ne $items[$i-1].slug) -and ($i -eq $items.Count - 1 -or $_.slug -ne $items[$i+1].slug) } | Select-Object -First 3)
    $aussi = ""
    if ($voisins.Count) { $aussi = "<section class=""aussi"" aria-labelledby=""aussi-tit""><h2 id=""aussi-tit"" class=""aussi__tit"">À lire aussi · $(Esc $g.cat)</h2><ul>" + (($voisins | ForEach-Object { "<li><a href=""$($_.slug).html""><b>$(Esc $_.title)</b><span>$(Esc $_.sum)</span></a></li>" }) -join "") + "</ul></section>" }
    $navPage = (Famille-De-Adresse "$folder/$($g.slug).html")[2]; if (-not $navPage) { $navPage = $nav }
    # Encyclopédie : barre 1 · 2 · 3 entre les pages du même mouvement, et famille dans les étiquettes.
    $ongletsHtml = ""
    if ($folder -eq "encyclopedie") {
      $soeurs = @($items | Where-Object { $_.cat -eq $g.cat })
      $ongletsHtml = "<nav class=""dossier-nav"" aria-label=""Les pages du dossier $(Esc $g.cat)""><ol>"
      for ($k = 0; $k -lt $soeurs.Count; $k++) {
        $o = Esc (Onglet-De $soeurs[$k] $k)
        if ($soeurs[$k].slug -eq $g.slug) { $ongletsHtml += "<li><a href=""$($g.slug).html"" aria-current=""page""><span>$($k + 1)</span>$o</a></li>" }
        else { $ongletsHtml += "<li><a href=""$($soeurs[$k].slug).html""><span>$($k + 1)</span>$o</a></li>" }
      }
      $ongletsHtml += "</ol></nav>"
      $fm = Famille-De-Mouvement $g.cat
      if ($fm) { $meta = $meta.Replace("<span>$(Esc $g.cat)</span>", "<span>$(Esc $fm.court)</span><span>$(Esc $g.cat)</span>") }
    }
    # Retour depuis l'encyclopédie : les dossiers qui renvoient vers cette page.
    $retour = ""
    $rv = $encyRetour["$folder/$($g.slug).html"]
    if ($rv) { $retour = "<aside class=""ency-renvoi"" aria-labelledby=""ency-$($g.slug)""><h2 id=""ency-$($g.slug)"" class=""ency-renvoi__tit"">Dans l'encyclopédie des mouvements</h2><ul>" + (($rv.Values | ForEach-Object { "<li><a href=""../encyclopedie/$($_.slug).html""><b>$(Esc $_.cat) · $(Esc $_.title)</b><span>$(Esc $_.sum)</span></a></li>" }) -join "") + "</ul></aside>" }
    $body = @"
<header class="gtitle gtitle--$folder"><div class="wrap">
  <p class="crumbs"><a href="../index.html">Accueil</a><span>/</span><a href="index.html">$label</a><span>/</span><a href="index.html#$(Slug $g.cat)">$(Esc $g.cat)</a></p>
  $(if ($accroche) { "<p class=""eyebrow"">$(Esc $accroche)</p>" })
  <h1>$(Esc $g.title)</h1>
  <p class="lead">$(Esc $g.sum)</p>
  <div class="gmeta">$meta</div>
  $ongletsHtml
</div></header>
<div class="wrap glayout gpage--$folder">
  <article class="prose">
$($g.html)
  $retour
$(if ($g.html -match 'class="credit"') { "" } else { $credit })
  $aussi
  <nav class="gnext" aria-label="Pages voisines">$nav2</nav>
  </article>
  <aside class="toc"><h2>Dans cette page</h2><ol>$toc</ol></aside>
</div>
"@
    $title = $g.title; if ($folder -eq "encyclopedie") { $title += " · Encyclopédie des mouvements" } elseif ($g.by) { $title += " — " + ($g.by -split ' · ')[0] }
    Write-Utf8 (Join-Path $site "$folder\$($g.slug).html") (Render-Page "../" $navPage "$title · Mamie Commune" $g.sum $body "")
  }
  $js = "// Généré par _src/build.ps1 — ne pas modifier à la main.`nwindow.$jsVar = [`n"
  $js += ($items | ForEach-Object { "  { slug: $(JsStr $_.slug), cat: $(JsStr $_.cat), t: $(JsStr $_.title), by: $(JsStr $_.by), d: $(JsStr $_.sum) }" }) -join ",`n"
  $js += "`n];`n"
  Write-Utf8 (Join-Path $site "data\$folder.js") $js
}

$guides = Read-Collection "guides"
Build-Collection $guides "guides" "outils" "Protection numérique" "Guide" '<p class="credit">Guide rédigé par la bande à Mamie d''après les articles du blog « Libérons nos ordis » (licence Creative Commons BY-SA). Cette adaptation est publiée sous la même licence : tu peux la copier, la modifier et la partager en citant la source.</p>' "GUIDES"

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
  $livres += [pscustomobject]@{ id = $c[1].Trim(); accord = ($m["droits"] -eq "accord"); cat = $c[2].Trim(); fiche = $c[3].Trim(); d = $c[4].Trim(); title = $title; author = $author; date = $date; source = $source; doc = $doc; words = $words; sub = ($m["subtitle"] + "") }
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
<p class="credit">$(if ($l.accord) { "Texte intégral, diffusé avec l'accord des ayants droit.$srcLine Mis en page par la bande à Mamie." } else { "Texte intégral, domaine public.$srcLine Mis en page par la bande à Mamie d'après la Bibliothèque anarchiste." })</p>
  <nav class="gnext" aria-label="Livres voisins">$nav2</nav>
  </article>
  <aside class="toc"><h2>Sommaire</h2><ol>$toc</ol></aside>
</div>
"@
  Write-Utf8 (Join-Path $site "livres\$($l.id).html") (Render-Page "../" "bibliotheque" "$($l.title) — $($l.author) · Mamie Commune" $l.d $body "")

  # Version imprimable, convertie en PDF par _src/pdf.ps1
  $sub = ""; if ($l.sub) { $sub = "<p class=""cover__sub"">$(Esc $l.sub)</p>" }
  # Mention de droits : domaine public, ou « #droits accord » dans l'en-tête Muse (livre diffusé avec l'accord des ayants droit).
  $print = $printTpl.Replace("{{TITLE}}", (Esc $l.title)).Replace("{{MENTION}}", $(if ($l.accord) { "Texte intégral · avec l'accord des ayants droit" } else { "Texte intégral · domaine public · à diffuser" })).Replace("{{LICENCE}}", $(if ($l.accord) { "Texte diffusé avec l'accord de ses ayants droit, mis en page par Mamie Commune. Pour le faire circuler, renvoie vers mamiecommune.org." } else { "Texte du domaine public, mis en page par Mamie Commune d'après la Bibliothèque anarchiste francophone. Copie, imprime et diffuse librement." })).Replace("{{AUTHOR}}", (Esc $l.author)).Replace("{{DATE}}", $l.date).Replace("{{SUB}}", $sub).Replace("{{MAMIE}}", $mamieUrl).Replace("{{TITLETAGS}}", (Title-Tags $l.title)).Replace("{{SOURCE}}", (Esc $l.source)).Replace("{{BODY}}", $l.doc.html)
  # On ne réécrit que si le contenu change, pour que pdf.ps1 ne régénère que les livres modifiés.
  $pp = Join-Path $src "textes\print\$($l.id).html"
  if (-not (Test-Path $pp) -or (Read-Utf8 $pp) -ne $print) { Write-Utf8 $pp $print }
}
# Livres diffusés tels quels en PDF, avec l'accord de leurs auteurs (pas de texte source à convertir).
# Format : identifiant | thème | fiche liée | titre | auteur | année | pages | présentation | crédit
# Livre sous droits qu'on ne copie pas : deux colonnes en plus, adresse où le lire ou l'acheter | texte du bouton.
$pdfList = Join-Path $src "textes\livres-pdf.txt"
if (Test-Path $pdfList) {
  foreach ($row in (Read-Utf8 $pdfList) -split "`n") {
    if ($row.Trim() -eq "" -or $row.StartsWith("#")) { continue }
    $c = $row -split "\|" | ForEach-Object { $_.Trim() }
    $l = [pscustomobject]@{ id = $c[0]; cat = $c[1]; fiche = $c[2]; title = $c[3]; author = $c[4]; date = $c[5]; d = $c[7] }
    $ailleurs = $c.Count -ge 11 -and $c[9]
    # Livre sur Calaméo : sa liseuse s'ouvre dans la page, au clic seulement (assets/site.js, data-calameo).
    $cal = if ($ailleurs -and $c[9] -match 'calameo\.com/books/(\w+)') { $Matches[1] } else { "" }
    $livres += $l
    if ($l.fiche) { $ficheToLivre[$l.fiche] = $l.id }
    $ficheBtn = ""; if ($l.fiche) { $ficheBtn = "<a class=""btn"" href=""../bibliotheque/$($l.fiche).html"">Fiche de lecture</a>" }
    $body = @"
<header class="gtitle"><div class="wrap">
  <p class="crumbs"><a href="../index.html">Accueil</a><span>/</span><a href="../bibliotheque/index.html">Bibliothèque</a><span>/</span><a href="../bibliotheque/index.html#livres">Livres complets</a></p>
  <h1>$(Esc $l.title)</h1>
  <p class="lead">$(Esc $l.d)</p>
  <div class="gmeta"><span>$(Esc $l.cat)</span><span>$(Esc $l.author) · $($l.date)</span><span>$(Esc $c[6]) pages</span></div>
  <div class="cta">$(if ($cal) { "<a class=""btn btn--main"" href=""#liseuse"">Lire le livre</a><a class=""btn"" href=""$(Esc $c[9])"" rel=""noopener"">Ouvrir sur Calaméo ↗</a>" } elseif ($ailleurs) { "<a class=""btn btn--main"" href=""$(Esc $c[9])"" rel=""noopener"">$(Esc $c[10]) ↗</a>" } else { "<a class=""btn btn--main"" href=""../lecteur.html?livre=$($l.id)"">Lire en PDF</a><a class=""btn"" href=""pdf/$($l.id).pdf"" download>Télécharger le PDF</a>" })$ficheBtn</div>
</div></header>
<div class="wrap glayout">
  <article class="prose">
    $(if ($cal) { "<div class=""liseuse"" id=""liseuse""><button class=""liseuse__go"" type=""button"" data-calameo=""$cal"" aria-label=""Ouvrir la liseuse du livre $(Esc $l.title)""><span class=""vcard__play"" aria-hidden=""true"">▶</span><b>Ouvrir le livre ici</b><small>La liseuse en ligne de l'éditeur (Calaméo) se charge seulement quand tu cliques.</small></button></div>" })
    $(if ($cal) { "<p>Le livre est mis en ligne en entier par les Éditions Divergences. Si tu peux, achète-le en librairie : c'est ce qui fait vivre les petites maisons d'édition militantes.</p>" } elseif ($ailleurs) { "<p>Ce livre est sous droits : la bande à Mamie ne le copie pas ici, elle t'envoie vers celles et ceux qui le diffusent. Si tu peux, achète-le en librairie : c'est ce qui fait vivre les petites maisons d'édition militantes.</p>" } else { "<p>Ce livre est diffusé ici dans sa mise en page d'origine. Ouvre-le dans le <a href=""../lecteur.html?livre=$($l.id)"">lecteur PDF</a> ou télécharge-le pour le lire hors ligne, l'imprimer ou le faire circuler.</p>" })
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
# Texte original de chaque fiche : notre livre complet s'il existe, et l'adresse vérifiée sur la Bibliothèque anarchiste
# (_src/textes/originaux.txt). Il ouvre le bloc « Sources et pour aller plus loin » écrit dans la fiche (<div class="ressources">).
$originaux = @{}
foreach ($l in (Read-Utf8 (Join-Path $src "textes\originaux.txt")) -split "`n") { if ($l -match '^([a-z0-9-]+)=(\S+)') { $originaux[$Matches[1]] = $Matches[2] } }
foreach ($b in $biblio) {
  $note = ""; $orig = @()
  if ($ficheToLivre.ContainsKey($b.slug)) {
    $id = $ficheToLivre[$b.slug]
    $note = "<div class=""note""><p><strong>Le texte complet est sur Mamie Commune.</strong> <a href=""../livres/$id.html"">Lire en ligne</a> ou <a href=""../lecteur.html?livre=$id"">ouvrir le PDF</a>.</p></div>"
    $orig += "<li><a href=""../livres/$id.html"">Le texte complet sur Mamie Commune</a>, à lire en ligne ou en PDF.</li>"
  }
  if ($originaux.ContainsKey($b.slug)) {
    $orig += "<li><a href=""https://fr.anarchistlibraries.net/library/$($originaux[$b.slug])"" rel=""noopener"">« $(Esc $b.title) » sur la Bibliothèque anarchiste</a> : le texte intégral, aussi en PDF et en livre numérique (EPUB).</li>"
  }
  $bloc = ""; if ($orig.Count) { $bloc = "<section><h3>Le texte original</h3><ul>$($orig -join '')</ul></section>" }
  if ($b.html.Contains('<div class="ressources">')) { $b.html = $b.html.Replace('<div class="ressources">', "<div class=""ressources"">$bloc") }
  elseif ($bloc) { $b.html += "`n<h2 id=""sources"">Sources et pour aller plus loin</h2>`n<div class=""ressources"">$bloc</div>" }
  if ($note) { $b.html = $b.html.Replace('<h2 id="sources">', "$note`n<h2 id=""sources"">") }
}
Build-Collection $biblio "bibliotheque" "bibliotheque" "Bibliothèque" "Fiche" '<p class="credit">Fiche de lecture rédigée par la bande à Mamie d''après les textes de la Bibliothèque anarchiste francophone. Cette fiche est libre de reproduction.</p>' "BIBLIO"

$exp = Read-Collection "experiences"
Build-Collection $exp "experiences" "luttes" "Histoires de luttes" "Dossier" '<p class="credit">Dossier rédigé par la bande à Mamie à partir de travaux d''historiennes et d''historiens et de textes des mouvements concernés. Libre de reproduction.</p>' "EXPERIENCES"

$antifa = Read-Collection "antifascisme"
Build-Collection $antifa "antifascisme" "antifa" "Antifascisme" "Fiche" '<p class="credit">Fiche rédigée par la bande à Mamie d''après les ressources publiées par le site antifasciste La Horde. Les originaux (schéma, carte, livre) sont disponibles sur leur site.</p>' "ANTIFA"

# Guide de manif : chaque catégorie des fiches de _src/manif/ devient une rubrique (Legal Team…).
$manif = @(Read-Collection "manif")   # @() : une seule fiche reste une liste
Build-Collection $manif "manif" "manif" "Guide de manif" "Fiche" '<p class="credit">Fiche rédigée par la bande à Mamie. Elle ne remplace pas l''avis d''une avocate ou d''un avocat.</p>' "MANIF"

# Agir ensemble : chaque catégorie des fiches de _src/agir/ devient une rubrique (Décider ensemble…).
$agir = @(Read-Collection "agir")
Build-Collection $agir "agir" "agir" "Agir ensemble" "Fiche" '<p class="credit">Fiche rédigée par la bande à Mamie. Libre de reproduction.</p>' "AGIR"
$figures = @(Read-Collection "figures")
Build-Collection $figures "figures" "figures" "Figures de l'anarchisme" "Portrait" '<p class="credit">Portrait écrit par la bande à Mamie. Photo d''époque issue de Wikimedia Commons. Libre de reproduction.</p>' "FIGURES"
$universite = @(Read-Collection "universite")
Build-Collection $universite "universite" "universite" "Université populaire" "Parcours" '<p class="credit">Parcours préparé par la bande à Mamie à partir des pages, livres et ressources vérifiées du site. Libre de reproduction.</p>' "UNIVERSITE"

# ---------- encyclopédie des mouvements : dossiers, pages de famille, données des filtres ----------
Build-Collection $ency "encyclopedie" "encyclopedie" "Encyclopédie des mouvements" "Dossier" '<p class="credit">Dossier rédigé par la bande à Mamie à partir des textes originaux et des travaux d''historiennes et d''historiens cités en sources. Libre de reproduction.</p>' "ENCYCLOPEDIE"
# Les filtres de la page d'accueil de l'encyclopédie se font par famille (le mouvement reste dans la signature de la carte).
$jsE = "// Généré par _src/build.ps1 depuis _src/encyclopedie/ — ne pas modifier à la main.`nwindow.ENCYCLOPEDIE = [`n"
$jsE += ($ency | ForEach-Object { $fm = Famille-De-Mouvement $_.cat; if (-not $fm) { Write-Warning "Encyclopédie : le mouvement « $($_.cat) » n'est dans aucune famille de familles.json" }
  "  { slug: $(JsStr $_.slug), cat: $(JsStr $(if ($fm) { $fm.court } else { 'Autres' })), t: $(JsStr $_.title), by: $(JsStr $_.cat), d: $(JsStr $_.sum) }" }) -join ",`n"
Write-Utf8 (Join-Path $site "data\encyclopedie.js") ($jsE + "`n];`n")
function Liens-Mouvement($mv, $root) {
  # Un mouvement écrit : ses pages ; sinon « en préparation », sans lien (pas de rubrique fictive).
  $pages = @($ency | Where-Object { $_.cat -eq $mv.nom })
  if (-not $pages.Count) {
    $vers = if ($mv.voir) { " <a href=""$root$($mv.voir[0])"">$(Esc $mv.voir[1]) →</a>" } else { "" }
    return "<li class=""ency-mv ency-mv--prevu""><b>$(Esc $mv.nom)</b><span>Dossier en préparation.$vers</span></li>"
  }
  $h = "<li class=""ency-mv"" id=""$(Slug $mv.nom)""><a class=""ency-mv__nom"" href=""$root" + "encyclopedie/$($pages[0].slug).html"">$(Esc $mv.nom)</a><ol>"
  for ($k = 0; $k -lt $pages.Count; $k++) { $h += "<li><a href=""$root" + "encyclopedie/$($pages[$k].slug).html""><span>$($k + 1)</span>$(Esc (Onglet-De $pages[$k] $k))</a></li>" }
  return $h + "</ol></li>"
}
$encyIndex = "<div class=""ency-fams"">"
foreach ($f in $encyFam) {
  $nb = @($ency | Where-Object { (Famille-De-Mouvement $_.cat).id -eq $f.id } | ForEach-Object { $_.cat } | Select-Object -Unique).Count
  $encyIndex += "<section class=""ency-fam"" aria-labelledby=""fam-$($f.id)""><p class=""ency-fam__n"">Famille $($f.rang)</p><h3 id=""fam-$($f.id)""><a href=""$($f.id).html"">$(Esc $f.nom)</a></h3><p>$(Esc $f.dit)</p><ul class=""ency-mvs"">"
  foreach ($mv in $f.mouvements) { $encyIndex += Liens-Mouvement $mv "../" }
  $encyIndex += "</ul><a class=""ency-fam__go"" href=""$($f.id).html"">Présentation de la famille →</a></section>"
}
$encyIndex += "</div>"
# Une page de présentation par famille : texte de familles.json, mouvements, et ce que le site a déjà sur le sujet.
foreach ($f in $encyFam) {
  $mvs = ($f.mouvements | ForEach-Object { Liens-Mouvement $_ "../" }) -join ""
  $deja = ($f.deja | ForEach-Object { "<li><a href=""../$($_[0])""><b>$(Esc $_[1])</b><span>$(Esc $_[2])</span></a></li>" }) -join ""
  $autres = ($encyFam | Where-Object { $_.id -ne $f.id } | ForEach-Object { "<a href=""$($_.id).html"">$(Esc $_.court)</a>" }) -join ""
  $ecrits = @($f.mouvements | Where-Object { $nm = $_.nom; @($ency | Where-Object { $_.cat -eq $nm }).Count })
  $attente = if ($ecrits.Count -lt @($f.mouvements).Count) { "<div class=""note""><p><strong>Pas encore de dossier pour tous ces mouvements.</strong> La bande les écrit un par un, chacun vérifié avant le suivant. En attendant, le site a déjà de quoi lire sur le sujet, juste en dessous. Tu veux aider ? <a href=""../contribuer.html"">Contribuer</a>.</p></div>" } else { "" }
  $bodyF = @"
<header class="gtitle gtitle--encyclopedie"><div class="wrap">
  <p class="crumbs"><a href="../index.html">Accueil</a><span>/</span><a href="index.html">Encyclopédie des mouvements</a><span>/</span><span>$(Esc $f.court)</span></p>
  <p class="eyebrow">Famille $($f.rang) sur $($encyFam.Count)</p>
  <h1>$(Esc $f.nom)</h1>
  <p class="lead">$(Esc $f.dit)</p>
  <nav class="tiroir-nav" aria-label="Les autres familles">$autres</nav>
</div></header>
<div class="wrap ency-page">
  <div class="prose">
$($f.presentation)
  <p class="doc__relire">Présentation à relire par la bande.</p>
  </div>
  <section class="ency-bloc" aria-labelledby="mvs"><h2 id="mvs">Les mouvements</h2><ul class="ency-mvs">$mvs</ul>$attente</section>
  <section class="ency-bloc" aria-labelledby="deja"><h2 id="deja">Déjà sur le site</h2><ul class="ency-deja">$deja</ul></section>
</div>
"@
  Write-Utf8 (Join-Path $site "encyclopedie\$($f.id).html") (Render-Page "../" "encyclopedie" "$($f.nom) · Encyclopédie des mouvements · Mamie Commune" $f.dit $bodyF "")
}

# ---------- nouveautés de l'accueil ({{NOUVEAUTES}}) ----------
# « À la une » : la page arrivée le plus récemment en grand, puis le fil des suivantes. Une seule entrée par dossier d'Histoires de luttes.
$neuf = @(); $rang = 0; $dossiers = @{}
foreach ($set in @(@($guides, "guides", "Protection numérique"), @($biblio, "bibliotheque", "Fiche de lecture"), @($exp, "experiences", "Histoires de luttes"), @($antifa, "antifascisme", "Antifascisme"), @($manif, "manif", "Guide de manif"), @($agir, "agir", "Agir ensemble"), @($figures, "figures", "Figures de l'anarchisme"), @($universite, "universite", "Université populaire"), @($ency, "encyclopedie", "Encyclopédie des mouvements"))) {
  foreach ($g in $set[0]) {
    $u = "$($set[1])/$($g.slug).html"; $rang++
    if (-not $app.Contains($u)) { $app[$u] = $maintenant }
    if ($set[1] -in @("experiences", "encyclopedie")) { if ($dossiers["$($set[1])/$($g.cat)"]) { continue }; $dossiers["$($set[1])/$($g.cat)"] = 1 }
    $neuf += [pscustomobject]@{ u = $u; d = $app[$u]; r = $rang; k = $set[2]; t = $g.title; s = $g.sum }
  }
}
$lignes = @("# Date d'arrivée de chaque page sur le site (adresse=date et heure). Ajoutée toute seule par _src/build.ps1 ; sert aux « Nouveautés » de l'accueil.") + @($app.Keys | ForEach-Object { "$_=$($app[$_])" })
Write-Utf8 $fApp (($lignes -join "`n") + "`n")
$recents = @($neuf | Sort-Object @{ e = "d"; Descending = $true }, @{ e = "r"; Descending = $true } | Select-Object -First 5)   # la plus récente en grand, puis quatre
$jourDe = { param($x) Date-Fr ([datetime]::ParseExact($x.d.Substring(0, 10), "yyyy-MM-dd", $null)) $false }
$lead = $recents[0]
$nouveautes = "<div class=""une""><article class=""une__lead""><a href=""{{R}}$($lead.u)""><span class=""kicker"">$(Esc $lead.k)</span><h3>$(Esc $lead.t)</h3><p>$(Esc $lead.s)</p><span class=""une__date"">Ajouté le $(& $jourDe $lead)</span></a></article>"
$nouveautes += "<div class=""une__fil""><h3 class=""une__tit"">Et aussi</h3><ol>" + (($recents | Select-Object -Skip 1 | ForEach-Object {
  "<li><a href=""{{R}}$($_.u)""><span class=""kicker"">$(Esc $_.k)</span><b>$(Esc $_.t)</b><span class=""une__date"">$(& $jourDe $_)</span></a></li>" }) -join "") + "</ol></div></div>"

# ---------- sélection de la bande selon l'actualité ({{SELECTION}}, accueil) ----------
# _src/actualite.ps1 (lancé chaque matin par .github/workflows/actualite.yml) écrit data/actualite.json : les thèmes de
# _src/actualite/themes.json les plus présents dans les titres des médias. Chaque thème donne une carte (sa première page
# pas encore prise) ; on complète avec « defaut ». Sans le fichier, ou trop vieux (plus de 10 jours) : la sélection par défaut.
$actuConf = (Read-Utf8 (Join-Path $src "actualite\themes.json")) | ConvertFrom-Json
$actuFile = Join-Path $site "data\actualite.json"
$actu = $null
if (Test-Path $actuFile) {
  $actu = (Read-Utf8 $actuFile) | ConvertFrom-Json
  if (([datetime]::UtcNow - [datetime]::ParseExact($actu.maj, "yyyy-MM-dd", $null)).TotalDays -gt 10) { Write-Warning "Actualité : data/actualite.json a plus de 10 jours, sélection par défaut."; $actu = $null }
}
$cartes = @(); $prises = @{}; $themesPris = @()
if ($actu) {
  foreach ($t in @($actu.themes)) {
    if ($cartes.Count -ge 3) { break }
    $def = $actuConf.themes | Where-Object { $_.id -eq $t.id } | Select-Object -First 1
    if (-not $def) { continue }
    $p = @($def.pages) | Where-Object { -not $prises[$_.url] } | Select-Object -First 1
    if (-not $p) { continue }
    $prises[$p.url] = 1; $themesPris += [pscustomobject]@{ nom = $def.nom; titres = $t.titres }   # le nom vient toujours de themes.json
    $cartes += [pscustomobject]@{ p = $p; actu = $def.nom }
  }
}
foreach ($p in @($actuConf.defaut)) { if ($cartes.Count -ge 3) { break }; if (-not $prises[$p.url]) { $prises[$p.url] = 1; $cartes += [pscustomobject]@{ p = $p; actu = "" } } }
foreach ($c in $cartes) { $chemin = ($c.p.url -split '[#?]')[0]; if (-not (Test-Path (Join-Path $site $chemin)) -and -not (Test-Path (Join-Path $src "pages\$chemin"))) { Write-Warning "Actualité : la page $($c.p.url) n'existe pas." } }
# « de » + nom du thème, avec les contractions du français : de les → des, de le → du.
$deNom = { param($n) if ($n -match '^les ') { "des " + $n.Substring(4) } elseif ($n -match '^le ') { "du " + $n.Substring(3) } else { "de $n" } }
$noms = @($themesPris | ForEach-Object { & $deNom $_.nom })
$intro = switch ($noms.Count) {
  0 { "Trois pages que Mamie mettrait dans toutes les poches en ce moment." }
  1 { "Cette semaine, l'actualité parle beaucoup $($noms[0]). Mamie a sorti du tiroir ce qui aide à y voir clair, et à agir." }
  2 { "Cette semaine, l'actualité parle beaucoup $($noms[0]) et $($noms[1]). Mamie a sorti du tiroir ce qui aide à y voir clair, et à agir." }
  default { "Cette semaine, l'actualité parle beaucoup $($noms[0]), $($noms[1]) et $($noms[2]). Mamie a sorti du tiroir ce qui aide à y voir clair, et à agir." }
}
$selection = "<p class=""sec__intro"">$(Esc $intro)</p></header><div class=""selection"">" + (($cartes | ForEach-Object {
  $a = if ($_.actu) { "<span class=""selection__actu"">Dans l'actu : $(Esc $_.actu)</span>" } else { "" }
  "<a class=""selection__item"" href=""{{R}}$($_.p.url)"">$a<span class=""kicker"">$(Esc $_.p.kicker)</span><h3>$(Esc $_.p.titre)</h3><p>$(Esc $_.p.texte)</p><span class=""selection__mot"">$(Esc $_.p.mot)</span></a>" }) -join "") + "</div>"
if ($themesPris.Count) {
  $sources = (@($actuConf.flux) | ForEach-Object { $_.nom }) -join ", "
  $quand = Date-Fr ([datetime]::ParseExact($actu.maj, "yyyy-MM-dd", $null)) $false
  $selection += "<details class=""selection__sources""><summary>Les titres qui ont guidé ce choix</summary><ul>" + (($themesPris | ForEach-Object { $_.titres } | ForEach-Object {
    "<li><a href=""$(Esc $_.url)"" rel=""noopener"">$(Esc $_.titre)</a> <span>$(Esc $_.source)</span></li>" }) -join "") +
    "</ul><p>Choisi automatiquement le $quand d'après les titres des sept derniers jours de $sources. Sans intelligence artificielle : une liste de thèmes et de mots écrite par la bande, et un simple comptage.</p></details>"
}

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
foreach ($set in @(@($guides, "guides", "Protection numérique"), @($biblio, "bibliotheque", "Fiche de lecture"), @($exp, "experiences", "Histoires de luttes"), @($antifa, "antifascisme", "Antifascisme"), @($manif, "manif", "Guide de manif"), @($agir, "agir", "Agir ensemble"), @($figures, "figures", "Figures de l'anarchisme"), @($universite, "universite", "Université populaire"), @($ency, "encyclopedie", "Encyclopédie des mouvements"))) {
  foreach ($g in $set[0]) {
    $index += [pscustomobject]@{ u = "$($set[1])/$($g.slug).html"; k = $set[2]; y = (Type-De $set[1] $g); t = $g.title; d = $g.sum; x = "$($g.cat) $($g.by) $(Heads $g.html) $(Plain $g.html 600)" }
  }
}
foreach ($f in $encyFam) {
  $index += [pscustomobject]@{ u = "encyclopedie/$($f.id).html"; k = "Encyclopédie des mouvements"; y = "Rubrique"; t = $f.nom; d = $f.dit; x = "$(($f.mouvements | ForEach-Object { $_.nom }) -join ' ') $(Plain $f.presentation 400)" }
}
foreach ($l in $livres) {
  $index += [pscustomobject]@{ u = "livres/$($l.id).html"; k = "Livre complet"; y = "Livre"; t = $l.title; d = $l.d; x = "$($l.author) $($l.date) $($l.cat)" }
}

# ---------- centre de ressources (bibliothèque documentaire) ----------
# Une fiche par ressource dans _src/ressources/*.json (un objet ou une liste d'objets ; les fichiers qui commencent par « _ » sont ignorés).
# Mode d'emploi et vocabulaire : _src/ressources/LISEZMOI.md. Chaque fiche donne ressources/<id>.html, et l'ensemble data/ressources.js.
$resTypes = [ordered]@{ livre = "Livre"; brochure = "Brochure"; article = "Article"; archive = "Archives"; podcast = "Podcast et radio"; documentaire = "Documentaire"; site = "Site indépendant"; logiciel = "Logiciel libre"; guide = "Guide pratique" }
$resThemes = [ordered]@{ "anarchisme" = "Anarchisme"; "communisme-libertaire" = "Communisme libertaire"; "syndicalisme-revolutionnaire" = "Syndicalisme révolutionnaire"; "autogestion" = "Autogestion"; "histoire-ouvriere" = "Histoire ouvrière"; "antifascisme" = "Antifascisme"; "feminisme" = "Féminisme"; "luttes-queer" = "Luttes queer"; "antiracisme" = "Antiracisme"; "anticolonialisme" = "Anticolonialisme"; "ecologie-sociale" = "Écologie sociale"; "communalisme" = "Communalisme"; "internationalisme" = "Internationalisme"; "education-populaire" = "Éducation populaire"; "droits-sociaux" = "Droits sociaux"; "culture-militante" = "Culture militante"; "autonomie-numerique" = "Autonomie numérique" }
$resNiveaux = [ordered]@{ decouverte = "Découverte"; intermediaire = "Intermédiaire"; approfondi = "Approfondi" }
$resNatures = [ordered]@{ militante = "Source militante"; historique = "Document historique"; universitaire = "Source universitaire"; temoignage = "Témoignage"; institutionnelle = "Source institutionnelle" }
$resLangues = [ordered]@{ fr = "Français"; en = "Anglais"; es = "Espagnol"; it = "Italien"; de = "Allemand"; pt = "Portugais"; multilingue = "Plusieurs langues" }
$ressources = @()
foreach ($f in Get-ChildItem (Join-Path $src "ressources") -Filter *.json | Where-Object { -not $_.Name.StartsWith("_") } | Sort-Object Name) {
  # PowerShell 5 rend une liste JSON en un seul objet : le foreach la déplie.
  try { $lu = (Read-Utf8 $f.FullName) | ConvertFrom-Json; foreach ($o in $lu) { $ressources += $o } } catch { Write-Warning "Ressources : $($f.Name) n'est pas un JSON valide ($($_.Exception.Message))" }
}
$vus = @{}
foreach ($r in $ressources) {
  $quoi = "Ressource « $($r.id) »"
  foreach ($champ in "id", "titre", "type", "niveau", "nature", "presentation", "consultation", "source", "url", "verifie") { if (-not $r.$champ) { Write-Warning "$quoi : champ « $champ » vide" } }
  if ($r.id -notmatch '^[a-z0-9-]+$') { Write-Warning "$quoi : identifiant à écrire en minuscules, chiffres et tirets" }
  if ($vus[$r.id]) { Write-Warning "$quoi : identifiant en double" }; $vus[$r.id] = 1
  if (-not $resTypes.Contains([string]$r.type)) { Write-Warning "$quoi : type inconnu « $($r.type) »" }
  if (-not $resNiveaux.Contains([string]$r.niveau)) { Write-Warning "$quoi : niveau inconnu « $($r.niveau) »" }
  if (-not $resNatures.Contains([string]$r.nature)) { Write-Warning "$quoi : nature inconnue « $($r.nature) »" }
  if (-not @($r.themes).Count) { Write-Warning "$quoi : aucune thématique" }
  foreach ($t in @($r.themes)) { if (-not $resThemes.Contains([string]$t)) { Write-Warning "$quoi : thématique inconnue « $t »" } }
  foreach ($l in @($r.langues)) { if (-not $resLangues.Contains([string]$l)) { Write-Warning "$quoi : langue inconnue « $l »" } }
  if ($r.verifie -notmatch '^\d{4}-\d{2}-\d{2}$') { Write-Warning "$quoi : date de vérification à écrire AAAA-MM-JJ" }
}
$ressources = @($ressources | Sort-Object { (Slug $_.titre) })
$dossierRes = Join-Path $site "ressources"; New-Item -ItemType Directory -Force $dossierRes | Out-Null
foreach ($r in $ressources) {
  $auteurs = (@($r.auteurs) | Where-Object { $_ }) -join ", "
  $themesHtml = (@($r.themes) | ForEach-Object { "<a class=""res-tag"" href=""index.html?theme=$_"">$(Esc $resThemes[[string]$_])</a>" }) -join " "
  $langues = (@($r.langues) | ForEach-Object { $resLangues[[string]$_] }) -join ", "
  $interne = -not ($r.url -match '^https?:')
  $verifie = Date-Fr ([datetime]::ParseExact($r.verifie, "yyyy-MM-dd", $null)) $false
  $ligne = { param($k, $v) if ($v) { "<tr><th scope=""row"">$k</th><td>$v</td></tr>" } }
  $table = (& $ligne "Titre" (Esc $r.titre)) + (& $ligne "Autrice, auteur ou collectif" (Esc $auteurs)) + (& $ligne "Date" (Esc $r.date)) +
    (& $ligne "Type de document" "<a href=""index.html?type=$($r.type)"">$(Esc $resTypes[[string]$r.type])</a>") + (& $ligne "Thématiques" $themesHtml) +
    (& $ligne "Niveau de lecture" (Esc $resNiveaux[[string]$r.niveau])) + (& $ligne "Langue" (Esc $langues)) + (& $ligne "Format" (Esc $r.format)) +
    (& $ligne "Nature de la source" (Esc $resNatures[[string]$r.nature])) + (& $ligne "Source originale" (Esc $r.source)) +
    (& $ligne "Adresse" "<a href=""$(Esc $r.url)""$(if (-not $interne) { ' rel="noopener"' })>$(Esc ($r.url -replace '^\.\./', 'mamiecommune.org/' -replace '\.html', ''))</a>") +
    (& $ligne "Licence" (Esc $r.licence)) + (& $ligne "Vérifiée le" $verifie)
  $compl = ""
  if (@($r.complements).Count) {
    $compl = "<h2 id=""complements"">Ressources complémentaires</h2><ul>" + ((@($r.complements) | ForEach-Object { "<li><a href=""$(Esc $_.url)""$(if ($_.url -match '^https?:') { ' rel="noopener"' })>$(Esc $_.titre)</a></li>" }) -join "") + "</ul>"
  }
  $resume = if ($r.resume) { "<h2 id=""resume"">Résumé</h2><p>$(Esc $r.resume)</p>" } else { "<h2 id=""resume"">Résumé</h2><p>Pas encore de résumé : la bande n'a pas encore lu le contenu lui-même.</p>" }
  $bouton = if ($interne) { "Lire sur Mamie Commune →" } else { "Consulter la source originale →" }
  $body = @"
<header class="gtitle"><div class="wrap">
  <p class="crumbs"><a href="../index.html">Accueil</a><span>/</span><a href="../bibliotheque/index.html">Bibliothèque</a><span>/</span><a href="index.html">Centre de ressources</a><span>/</span><a href="index.html?type=$($r.type)">$(Esc $resTypes[[string]$r.type])</a></p>
  <p class="eyebrow">Fiche documentaire</p>
  <h1>$(Esc $r.titre)</h1>
  <p class="lead">$(Esc $r.presentation)</p>
  <div class="gmeta"><span class="gmeta__type">$(Esc $resTypes[[string]$r.type])</span>$(if ($auteurs) { "<span>$(Esc $auteurs)</span>" })$(if ($r.date) { "<span>$(Esc $r.date)</span>" })<span>$(Esc $resNatures[[string]$r.nature])</span><span>$(Esc $resNiveaux[[string]$r.niveau])</span><span>Vérifiée le $verifie</span></div>
</div></header>
<div class="wrap gseule">
  <article class="prose res-fiche">
  <p class="res-go"><a class="btn btn--main" href="$(Esc $r.url)"$(if (-not $interne) { ' rel="noopener"' })>$bouton</a></p>
  $resume
  <p class="res-consult"><b>Ce que la bande a lu pour écrire cette fiche :</b> $(Esc $r.consultation)</p>
  <h2 id="fiche">La fiche</h2>
  <div class="tbl"><table class="res-table"><tbody>$table</tbody></table></div>
  $compl
  <p class="credit">Fiche documentaire rédigée par la bande à Mamie. Elle présente la ressource et renvoie vers sa source originale : le contenu n'est pas recopié ici. Une erreur, un lien mort ? <a href="../contribuer.html">Dis-le à la bande</a>.</p>
  </article>
</div>
"@
  Write-Utf8 (Join-Path $dossierRes "$($r.id).html") (Render-Page "../" "bibliotheque" "$($r.titre) · Centre de ressources · Mamie Commune" $r.presentation $body "")
  $index += [pscustomobject]@{ u = "ressources/$($r.id).html"; k = "Centre de ressources"; y = "Ressource documentaire"; t = $r.titre; d = $r.presentation; x = "$auteurs $($r.date) $($resTypes[[string]$r.type]) $((@($r.themes) | ForEach-Object { $resThemes[[string]$_] }) -join ' ') $($r.source) $($r.resume)" }
}
$vocab = { param($m) "{ " + (($m.Keys | ForEach-Object { "$(JsStr $_): $(JsStr $m[$_])" }) -join ", ") + " }" }
$js = "// Généré par _src/build.ps1 depuis _src/ressources/*.json — ne pas modifier à la main.`n"
$js += "window.RES_VOCAB = { types: $(& $vocab $resTypes), themes: $(& $vocab $resThemes), niveaux: $(& $vocab $resNiveaux), natures: $(& $vocab $resNatures), langues: $(& $vocab $resLangues) };`n"
$js += "window.RESSOURCES = [`n" + (($ressources | ForEach-Object {
  $an = [regex]::Match([string]$_.date, '\d{4}').Value
  "  { id: $(JsStr $_.id), t: $(JsStr $_.titre), a: [$((@($_.auteurs) | ForEach-Object { JsStr $_ }) -join ', ')], dt: $(JsStr $_.date), an: $(if ($an) { $an } else { 'null' }), ty: $(JsStr $_.type), th: [$((@($_.themes) | ForEach-Object { JsStr $_ }) -join ', ')], n: $(JsStr $_.niveau), l: [$((@($_.langues) | ForEach-Object { JsStr $_ }) -join ', ')], nat: $(JsStr $_.nature), p: $(JsStr $_.presentation), src: $(JsStr $_.source), v: $(JsStr $_.verifie) }"
}) -join ",`n") + "`n];`n"
Write-Utf8 (Join-Path $site "data\ressources.js") $js

# ---------- annuaire des logiciels libres (logiciels/) ----------
# Source : _src/logiciels/logiciels.json (une fiche par logiciel, vérifiée : licence, plateformes, site, documentation, limites).
# Tout est écrit dans la page (lisible sans JavaScript et hors ligne) ; assets/logiciels.js ne fait que filtrer.
# Les données sont aussi publiées telles quelles dans data/logiciels.json (format ouvert, réutilisable).
$logCats = [ordered]@{ systeme = "Système"; naviguer = "Naviguer"; communiquer = "Communiquer"; ensemble = "Travailler ensemble"; organiser = "S'organiser"; publier = "Publier et cartographier"; proteger = "Se protéger"; creer = "Créer" }
$logPf = [ordered]@{ ordinateur = "Ordinateur (PC)"; windows = "Windows"; macos = "macOS"; linux = "Linux"; android = "Android"; ios = "iPhone et iPad"; web = "Navigateur web"; serveur = "Serveur à héberger" }
$logDif = [ordered]@{ facile = "Facile"; moyen = "Demande un peu de pratique"; avance = "Avancé" }
$fLog = Join-Path $src "logiciels\logiciels.json"
$logiciels = @(); foreach ($o in ((Read-Utf8 $fLog) | ConvertFrom-Json)) { $logiciels += $o }
$vusL = @{}
foreach ($l in $logiciels) {
  $quoi = "Logiciel « $($l.id) »"
  foreach ($champ in "id", "nom", "categorie", "fonction", "description", "licence", "licenceSource", "site", "documentation", "difficulte", "limites", "verifie") { if (-not $l.$champ) { Write-Warning "$quoi : champ « $champ » vide" } }
  if ($vusL[$l.id]) { Write-Warning "$quoi : identifiant en double" }; $vusL[$l.id] = 1
  if (-not $logCats.Contains([string]$l.categorie)) { Write-Warning "$quoi : catégorie inconnue « $($l.categorie) »" }
  if (-not $logDif.Contains([string]$l.difficulte)) { Write-Warning "$quoi : difficulté inconnue « $($l.difficulte) »" }
  foreach ($p in @($l.plateformes)) { if (-not $logPf.Contains([string]$p)) { Write-Warning "$quoi : plateforme inconnue « $p »" } }
  if ($l.verifie -notmatch '^\d{4}-\d{2}-\d{2}$') { Write-Warning "$quoi : date de vérification à écrire AAAA-MM-JJ" }
  # Règle de l'annuaire : aucun logiciel ne « garantit » la sécurité. On refuse ces mots dans les fiches.
  if ("$($l.description) $($l.fonction) $($l.limites)" -match '(?i)garanti|100 ?%|inviolable|totalement s[ûu]r|s[ée]curit[ée] (absolue|totale)') { Write-Warning "$quoi : promesse de sécurité absolue à retirer" }
}
New-Item -ItemType Directory -Force (Join-Path $site "logiciels") | Out-Null
$lien = { param($t, $u) "<a href=""$(Esc $u)"" rel=""noopener"">$(Esc $t)</a>" }
$fiches = foreach ($l in $logiciels) {
  $verifie = Date-Fr ([datetime]::ParseExact($l.verifie, "yyyy-MM-dd", $null)) $false
  $pfs = (@($l.plateformes) | ForEach-Object { "<li>$(Esc $logPf[[string]$_])</li>" }) -join ""
  $sites = (@($l.site) | ForEach-Object { & $lien $_[0] $_[1] }) -join " · "
  $docs = (@($l.documentation) | ForEach-Object { "<li>$(& $lien $_[0] $_[1])</li>" }) -join ""
  $guide = if ($l.guide) { "<p class=""logi__guide""><a href=""$(Esc $l.guide[0])"">$(Esc $l.guide[1]) →</a></p>" } else { "" }
  $index += [pscustomobject]@{ u = "logiciels/index.html#$($l.id)"; k = "Logiciels libres"; y = "Guide numérique"; t = "$($l.nom) · logiciel libre"; d = $l.fonction; x = "$($l.remplace) $($l.description) $($logCats[[string]$l.categorie])" }
  @"
<article class="logi" id="$($l.id)" data-cat="$($l.categorie)" data-pf="$((@($l.plateformes)) -join ' ')" data-dif="$($l.difficulte)">
  <header class="logi__tete"><p class="logi__cat">$(Esc $logCats[[string]$l.categorie])</p><h3>$(Esc $l.nom)</h3><p class="logi__fonction">$(Esc $l.fonction)</p>$(if ($l.remplace) { "<p class=""logi__remplace"">À la place de : $(Esc $l.remplace)</p>" })</header>
  <p>$(Esc $l.description)</p>
  <dl class="logi__fiche">
    <dt>Licence</dt><dd>$(Esc $l.licence) <a class="logi__src" href="$(Esc $l.licenceSource)" rel="noopener">(source)</a></dd>
    <dt>Plateformes</dt><dd><ul class="logi__pf">$pfs</ul></dd>
    <dt>Site officiel</dt><dd>$sites</dd>
    <dt>Difficulté</dt><dd><span class="logi__dif logi__dif--$($l.difficulte)">$(Esc $logDif[[string]$l.difficulte])</span> $(Esc $l.difficulteDit)</dd>
    <dt>Documentation</dt><dd><ul>$docs</ul></dd>
  </dl>
  <div class="logi__limites"><p><b>Limites, à savoir avant de s'y mettre</b></p><p>$(Esc $l.limites)</p></div>
  $guide
  <p class="logi__verif">Fiche vérifiée le $verifie sur le site officiel et la source de la licence.</p>
</article>
"@
}
$puces = { param($nom, $m) (($m.Keys | ForEach-Object { $k = $_; $n = @($logiciels | Where-Object { ($nom -eq "pf" -and @($_.plateformes) -contains $k) -or ($nom -eq "cat" -and $_.categorie -eq $k) -or ($nom -eq "dif" -and $_.difficulte -eq $k) }).Count; if ($n) { "<button class=""chip"" type=""button"" data-$nom=""$k"" aria-pressed=""false"">$(Esc $m[$k]) · $n</button>" } }) -join "") }
$annu = (Read-Utf8 (Join-Path $src "logiciels\index.html"))
$m = [regex]::Match($annu, '^<!--\s*(.*?)\s*-->\s*', 'Singleline'); $meta = $m.Groups[1].Value -split "\s\|\s"
$body = $annu.Substring($m.Length).Replace("{{LOGI_FICHES}}", ($fiches -join "`n")).Replace("{{LOGI_NB}}", "$($logiciels.Count)").Replace("{{LOGI_CATS}}", (& $puces "cat" $logCats)).Replace("{{LOGI_PF}}", (& $puces "pf" $logPf)).Replace("{{LOGI_DIF}}", (& $puces "dif" $logDif))
Write-Utf8 (Join-Path $site "logiciels\index.html") (Render-Page "../" "logiciels" $meta[0] $meta[1] $body $meta[3])
Copy-Item $fLog (Join-Path $site "data\logiciels.json") -Force

# ---------- carte des collectifs : data/lieux.geojson → data/lieux.js ----------
# La source est data/lieux.geojson (une structure par ligne, données publiques téléchargeables). On en tire data/lieux.js,
# chargé par la carte et la recherche, et on contrôle la qualité : catégories, champs, doublons, coordonnées personnelles.
$catLieux = [ordered]@{
  "libertaire" = @("Groupes anarchistes et libertaires", "#e3141b"); "syndicat" = @("Syndicats", "#ffd23f"); "association" = @("Associations", "#3ddc97")
  "antifa" = @("Collectifs antifascistes", "#6a1b9a"); "librairie" = @("Librairies indépendantes et bibliothèques", "#f4eeee"); "lieu" = @("Lieux autogérés", "#ff6fa8")
  "cooperative" = @("Coopératives", "#a1887f"); "centre-social" = @("Centres sociaux", "#4fc3f7"); "feministe" = @("Associations féministes", "#c2185b")
  "antiraciste" = @("Associations antiracistes", "#ff8a3d"); "media" = @("Médias indépendants", "#b08cff"); "solidarite" = @("Structures de solidarité", "#26a69a")
}
$geo = (Read-Utf8 (Join-Path $site "data\lieux.geojson")) | ConvertFrom-Json
$lieux = @($geo.features); $vusL = @{}; $nomsL = @{}
foreach ($f in $lieux) {
  $p = $f.properties; $quoi = "Carte : « $($p.nom) »"
  foreach ($champ in "id", "nom", "categorie", "description", "source", "etat") { if (-not $p.$champ) { Write-Warning "$quoi : champ « $champ » vide" } }
  if (-not $catLieux.Contains([string]$p.categorie)) { Write-Warning "$quoi : catégorie inconnue « $($p.categorie) »" }
  if ($vusL[$p.id]) { Write-Warning "$quoi : identifiant en double « $($p.id) »" }; $vusL[$p.id] = 1
  $cle = "$(Slug $p.nom)|$($p.departement)"; if ($nomsL[$cle]) { Write-Warning "$quoi : doublon probable (même nom, même département)" }; $nomsL[$cle] = 1
  if ($p.verifie -and $p.verifie -notmatch '^\d{4}-\d{2}-\d{2}$') { Write-Warning "$quoi : date de vérification à écrire AAAA-MM-JJ" }
  if (-not $p.verifie -and $p.etat -ne "a-reverifier") { Write-Warning "$quoi : sans date de vérification, l'état doit être « a-reverifier »" }
  if ($f.geometry) { $x = $f.geometry.coordinates; if ($x[1] -lt -25 -or $x[1] -gt 60 -or $x[0] -lt -65 -or $x[0] -gt 60) { Write-Warning "$quoi : coordonnées étranges" } }
  elseif ($p.portee -ne "national") { Write-Warning "$quoi : pas de position sur la carte (mettre « portee »: « national » si c'est voulu)" }
  # Protection : jamais de coordonnées personnelles. Un portable ou une adresse de rue doit être vérifié à la main.
  $texte = "$($p.contact) $($p.ville) $($p.description)"
  if ($texte -match '(?<!\d)(0|\+33\s?)[67](\s?\d\d){4}') { Write-Warning "$quoi : numéro de portable : vérifier que c'est un contact public publié par la structure" }
  if ($texte -match '\b\d{1,4}(bis|ter)?,?\s+(rue|avenue|boulevard|bd|place|chemin|impasse|allée)\b') { Write-Warning "$quoi : adresse de rue : seulement si c'est un lieu public ouvert au public" }
}
$jsL = "// Généré par _src/build.ps1 depuis data/lieux.geojson — ne pas modifier à la main.`n"
$jsL += "window.CATEGORIES_LIEUX = {`n" + (($catLieux.Keys | ForEach-Object { "  $(JsStr $_): { label: $(JsStr $catLieux[$_][0]), color: $(JsStr $catLieux[$_][1]) }" }) -join ",`n") + "`n};`n"
$jsL += "window.LIEUX_MAJ = $(JsStr $geo.metadata.misAJour);`nwindow.LIEUX = [`n" + (($lieux | ForEach-Object {
  $p = $_.properties; $c = if ($_.geometry) { $_.geometry.coordinates } else { $null }
  $res = (@($p.ressources) | Where-Object { $_ } | ForEach-Object { "[$(JsStr $_.titre), $(JsStr $_.url)]" }) -join ", "
  "  { id: $(JsStr $p.id), n: $(JsStr $p.nom), c: $(JsStr $p.categorie), lat: $(if ($c) { $c[1] } else { 'null' }), lng: $(if ($c) { $c[0] } else { 'null' }), v: $(JsStr $p.ville), dep: $(JsStr $p.departement), pays: $(JsStr $p.pays), portee: $(JsStr $p.portee), org: $(JsStr $p.organisation), d: $(JsStr $p.description), site: $(JsStr $p.site), contact: $(JsStr $p.contact), annuaire: $(JsStr $p.annuaire), source: $(JsStr $p.source), sourceUrl: $(JsStr $p.sourceUrl), verifie: $(JsStr $p.verifie), etat: $(JsStr $p.etat), note: $(JsStr $p.note), res: [$res] }"
}) -join ",`n") + "`n];`n"
Write-Utf8 (Join-Path $site "data\lieux.js") $jsL

# Compteurs de l'accueil ({{NB_LIEUX}}, {{NB_LIVRES}}, {{NB_FICHES}}), calculés à chaque génération.
$compteurs = @{ ENCY_FAMILLES = $encyIndex; NB_ENCY = @($ency | ForEach-Object { $_.cat } | Select-Object -Unique).Count; NB_LIEUX = @($lieux | Where-Object { $_.geometry }).Count; NB_LIVRES = $livres.Count; NB_RESSOURCES = $ressources.Count; NB_FICHES = $guides.Count + $biblio.Count + $antifa.Count + $manif.Count + $agir.Count }

# ---------- packs hors ligne (packs/<id>.html) ----------
# Un pack = plusieurs pages du site réunies dans UN fichier HTML autonome (styles dedans, aucune ressource externe,
# liens vers le site écrits en entier, photos retirées) : il s'ouvre sans connexion, s'imprime et se transmet sur une clé USB.
# Les PDF des packs se font en local avec _src/packs-pdf.ps1 (Windows + Edge). Contenu des packs : uniquement des pages existantes.
$collections = @{ agir = $agir; manif = $manif; guides = $guides; universite = $universite; experiences = $exp; antifascisme = $antifa; figures = $figures }
$creditsCol = @{ agir = "Fiche rédigée par la bande à Mamie. Libre de reproduction."; manif = "Fiche rédigée par la bande à Mamie. Elle ne remplace pas l'avis d'une avocate ou d'un avocat."
  guides = "Guide adapté des articles du blog « Libérons nos ordis » (licence Creative Commons BY-SA)."; universite = "Parcours préparé par la bande à Mamie. Libre de reproduction."
  experiences = "Dossier rédigé par la bande à Mamie. Libre de reproduction."; antifascisme = "Fiche rédigée par la bande à Mamie d'après les ressources de La Horde."; figures = "Portrait écrit par la bande à Mamie. Libre de reproduction." }
$packs = @(
  [ordered]@{ id = "organisation-collective"; nom = "Organisation collective"; dit = "Monter un collectif, tenir une caisse, lancer une grève, prendre soin les uns des autres."; pages = @("agir/monter-un-collectif", "agir/tenir-une-ag", "agir/decider-sans-chef", "agir/caisse-de-solidarite", "agir/lancer-une-greve", "agir/eviter-l-epuisement-militant", "agir/violences-dans-nos-collectifs", "agir/accueillir-personnes-trans") },
  [ordered]@{ id = "assemblee-generale"; nom = "Assemblée générale"; dit = "Préparer, animer et conclure une AG, avec les quatre façons de décider et des feuilles vierges à photocopier."; pages = @("agir/tenir-une-ag", "agir/decider-sans-chef", "special/methodes", "special/feuilles-ag") },
  [ordered]@{ id = "education-populaire"; nom = "Éducation populaire"; dit = "Quatre parcours de l'université populaire et le dictionnaire militant, pour animer un atelier ou lire en groupe."; pages = @("universite/education-populaire", "universite/introduction-anarchisme", "universite/entraide-mutualisme", "universite/autogestion", "special/glossaire") },
  [ordered]@{ id = "droits-et-libertes"; nom = "Droits et libertés"; dit = "Tes droits en manif et en garde à vue (droit français), les gestes de premiers secours et l'autodéfense."; pages = @("manif/legal-team", "manif/personnes-trans-police", "agir/lyceens-face-aux-sanctions", "manif/street-medic", "manif/se-preparer-soin", "manif/soigner-en-manif", "manif/apres-la-manif", "manif/autodefense-feministe") },
  [ordered]@{ id = "autonomie-numerique"; nom = "Autonomie numérique"; dit = "Signal, mots de passe, chiffrement, logiciels libres et outils collaboratifs, avec l'annuaire complet."; pages = @("guides/signal", "guides/proteger-ses-donnees", "guides/gerer-ses-mots-de-passe", "guides/comprendre-le-chiffrement", "guides/stop-gafam", "guides/utiliser-des-logiciels-libres", "guides/choisir-des-outils-collaboratifs", "guides/heberger-des-services", "special/annuaire") },
  [ordered]@{ id = "culture-militante"; nom = "Culture militante"; dit = "Faire un tract, coller des affiches, sérigraphier, et la chronologie des mouvements sociaux."; pages = @("agir/faire-un-tract", "agir/coller-des-affiches", "agir/serigraphie", "universite/histoire-mouvement-anarchiste", "experiences/action-directe-pratique", "special/chronologie") }
)
$siteUrl = "https://mamiecommune.org/"
# Liens d'une page placée dans « dossier/ » : écrits en entier vers le site en ligne, en adresses propres.
function Liens-Absolus($html, $dossier) {
  $baseUri = [Uri]"$siteUrl$dossier"
  return [regex]::Replace($html, '\b(href|src)="([^"]*)"', {
    param($m) $v = [Net.WebUtility]::HtmlDecode($m.Groups[2].Value)
    if ($v -match '^(https?:|mailto:|tel:|data:|#)') { return $m.Value }
    $u = ([Uri]::new($baseUri, $v)).AbsoluteUri -replace '/index\.html(?=$|[?#])', '/' -replace '\.html(?=$|[?#])', ''
    "$($m.Groups[1].Value)=""$(Esc $u)"""
  })
}
# Retire ce qui ne marche pas hors ligne ou alourdit le fichier : photos, vidéos, cadres, scripts, boutons.
function Nettoyer-Pack($html) {
  $html = [regex]::Replace($html, '(?s)<figure class="(photo|horde|yt)[^"]*".*?</figure>', '')
  $html = [regex]::Replace($html, '(?s)<div class="ytwall".*?</div>\s*(?=<h2|<p|<div class="ressources"|$)', '')
  $html = [regex]::Replace($html, '(?s)<(iframe|script|button|video)\b.*?</\1>', '')
  $html = [regex]::Replace($html, '<img\b[^>]*>', '')
  return $html
}
$feuillesAG = @"
<p>Feuilles à photocopier ou à recopier au tableau. Elles reprennent les rubriques des outils « Préparer une AG », « Compte rendu » et « Mandat » du site, à remplir à la main.</p>
<h3>Ordre du jour</h3>
<div class="tbl"><table class="vierge"><thead><tr><th>Point</th><th>Qui le présente</th><th>Temps prévu</th><th>Décision attendue ?</th></tr></thead><tbody>$("<tr><td></td><td></td><td></td><td></td></tr>" * 6)</tbody></table></div>
<p class="ligne">Date : ……………… Lieu : ……………………… Animation : ……………… Prise de notes : ……………… Gardien ou gardienne du temps : ………………</p>
<p class="ligne">Façon de décider choisie : ☐ vote (majorité : ……) ☐ consensus ☐ consentement ☐ mandat</p>
<h3>Compte rendu</h3>
<div class="tbl"><table class="vierge"><thead><tr><th>Point</th><th>Ce qui a été dit (résumé)</th><th>Décision</th></tr></thead><tbody>$("<tr><td></td><td></td><td></td></tr>" * 6)</tbody></table></div>
<div class="tbl"><table class="vierge"><thead><tr><th>Qui fait quoi</th><th>Pour quand</th></tr></thead><tbody>$("<tr><td></td><td></td></tr>" * 5)</tbody></table></div>
<p class="ligne">Personnes présentes : …… Prochaine AG : ………………</p>
<h3>Mandat</h3>
<p class="ligne">L'assemblée du ……………… confie à : ………………………………………</p>
<p class="ligne">La mission : ……………………………………………………………………………………</p>
<p class="ligne">Ce que la personne peut décider seule : ………………………………………………</p>
<p class="ligne">Ce qu'elle doit ramener à l'assemblée : ………………………………………………</p>
<p class="ligne">Jusqu'au : ……………… Compte rendu à faire le : ……………… Révocable à tout moment par l'assemblée.</p>
"@
$logoPack = "data:image/png;base64," + [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $site "assets\icone-masquable-192.png")))
$cssPack = Read-Utf8 (Join-Path $src "packs\pack.css")
New-Item -ItemType Directory -Force (Join-Path $site "packs") | Out-Null
$listePacks = ""
foreach ($p in $packs) {
  $sections = @(); $sommaire = ""; $n = 0
  foreach ($ref in $p.pages) {
    $dossier, $slug = $ref -split '/'
    $n++; $ancre = "s$n"
    if ($dossier -eq "special") {
      switch ($slug) {
        "methodes" { $t = "Quatre façons de décider"; $d = "Vote, consensus, consentement, mandat : ce que chacun permet et ses pièges."; $u = "${siteUrl}outils/#decider"
          $h = [regex]::Match((Read-Utf8 (Join-Path $src "outils\index.html")), '(?s)<div class="methodes">.*?</div>\s*(?=<div class="callout">)').Value }
        "feuilles-ag" { $t = "Feuilles vierges pour l'AG"; $d = "Ordre du jour, compte rendu et mandat, à remplir à la main."; $u = "${siteUrl}outils/"; $h = $feuillesAG }
        "glossaire" { $t = "Dictionnaire militant"; $d = "Tous les mots des luttes, expliqués en deux phrases."; $u = "${siteUrl}glossaire"
          $g = Read-Utf8 (Join-Path $src "pages\glossaire.html"); $g = $g.Substring([regex]::Match($g, '^<!--.*?-->\s*', 'Singleline').Length)
          $h = Liens-Absolus ([regex]::Replace($g, '(?s)<header class="gtitle[^"]*">.*?</header>', '')) "" }
        "annuaire" { $t = "Annuaire des logiciels libres"; $d = "Les $($logiciels.Count) logiciels de la bande, avec leurs limites. Vérifié en $((Date-Fr ([datetime]::ParseExact(($logiciels | Sort-Object verifie | Select-Object -First 1).verifie, 'yyyy-MM-dd', $null)) $false))."; $u = "${siteUrl}logiciels/"
          $h = ($logiciels | ForEach-Object { "<section class=""logi-pack""><h3>$(Esc $_.nom)</h3><p><b>$(Esc $_.fonction)</b> $(Esc $_.description)</p><p><b>Licence :</b> $(Esc $_.licence) <b>Plateformes :</b> $(Esc ((@($_.plateformes) | ForEach-Object { $logPf[[string]$_] }) -join ', ')). <b>Difficulté :</b> $(Esc $logDif[[string]$_.difficulte]). <b>Site :</b> $(Esc (@($_.site)[0][1]))</p><p><b>Limites :</b> $(Esc $_.limites)</p></section>" }) -join "`n" }
        "chronologie" { $t = "Chronologie des mouvements sociaux"; $d = "Les grandes dates, chacune avec sa source."; $u = "${siteUrl}universite/chronologie"
          $evs = @(((Read-Utf8 (Join-Path $src "universite\chronologie.json")) | ConvertFrom-Json).evenements)
          $h = "<ol class=""chrono-pack"">" + (($evs | Sort-Object date | ForEach-Object { "<li><b>$(Esc $_.quand)</b> · $(Esc $_.titre). $(Esc $_.texte) <small>Source : $(Esc $_.source[0])</small></li>" }) -join "") + "</ol>" }
      }
    } else {
      $g = @($collections[$dossier] | Where-Object { $_.slug -eq $slug })[0]
      if (-not $g) { Write-Warning "Pack « $($p.id) » : la page « $ref » n'existe pas"; continue }
      $t = $g.title; $d = $g.sum; $u = "$siteUrl$dossier/$slug"
      $h = Liens-Absolus (Nettoyer-Pack $g.html) "$dossier/"
      if ($h -notmatch 'class="credit"') { $h += "<p class=""credit"">$(Esc $creditsCol[$dossier])</p>" }
    }
    # Les identifiants de titres sont préfixés pour rester uniques dans le pack.
    $h = [regex]::Replace($h, '\bid="([^"]+)"', "id=""$ancre-`$1""")
    $h = [regex]::Replace($h, 'href="#([^"]+)"', "href=""#$ancre-`$1""")   # les liens internes suivent
    $h = $h -replace '<h1\b', '<h2' -replace '</h1>', '</h2>'           # un seul titre principal : celui du pack
    $sommaire += "<li><a href=""#$ancre"">$(Esc $t)</a></li>"
    $sections += "<section class=""partie"" id=""$ancre""><p class=""partie__n"">$n / $($p.pages.Count)</p><h2>$(Esc $t)</h2><p class=""partie__dit"">$(Esc $d)</p>$h<p class=""partie__source"">En ligne, à jour : <a href=""$(Esc $u)"">$(Esc $u)</a></p></section>"
  }
  $html = @"
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pack $(Esc $p.nom) · Mamie Commune</title>
<meta name="description" content="$(Esc $p.dit)">
<style>$cssPack</style>
</head>
<body>
<header class="couv">
  <img src="$logoPack" alt="" width="120" height="120">
  <p class="couv__eyebrow">Pack hors ligne de Mamie Commune</p>
  <h1>$(Esc $p.nom)</h1>
  <p class="couv__dit">$(Esc $p.dit)</p>
  <p class="couv__ed">Édition du $edition · <a href="${siteUrl}hors-ligne#packs">${siteUrl}hors-ligne</a></p>
  <p class="couv__mode">Ce fichier marche sans connexion : garde-le sur ton téléphone ou une clé USB, imprime-le (Ctrl + P ou « Imprimer »), fais-le circuler. Les textes changent : la version en ligne est toujours la plus à jour.</p>
</header>
<nav class="sommaire" aria-label="Sommaire"><h2>Sommaire</h2><ol>$sommaire</ol></nav>
<main>
$($sections -join "`n")
</main>
<footer class="pied"><p>Mamie Commune · la boîte à outils militante de Mamie et de sa bande · <a href="$siteUrl">mamiecommune.org</a>. Sans pub, sans traqueur. Chaque partie garde sa licence, indiquée à sa fin.</p></footer>
</body>
</html>
"@
  Write-Utf8 (Join-Path $site "packs\$($p.id).html") $html
  $pdf = Test-Path (Join-Path $site "packs\$($p.id).pdf")
  $btnPdf = if ($pdf) { "<a class=`"btn`" href=`"packs/$($p.id).pdf`" download=`"mamie-pack-$($p.id).pdf`">PDF à imprimer</a>" } else { "" }
  $listePacks += "<article class=""pack""><h3>$(Esc $p.nom)</h3><p>$(Esc $p.dit)</p><p class=""pack__nb"">$($p.pages.Count) parties · $([Math]::Round(([Text.Encoding]::UTF8.GetByteCount($html)) / 1024)) Ko</p><div class=""pack__actions""><a class=""btn btn--main"" href=""packs/$($p.id).html"" download=""mamie-pack-$($p.id).html"">Télécharger (HTML)</a>$btnPdf<a class=""btn"" href=""packs/$($p.id).html"">Lire</a><button class=""btn"" type=""button"" data-garder=""packs/$($p.id)"" data-libelle=""Garder dans le navigateur"">Garder dans le navigateur</button></div></article>"
}
$compteurs["PACKS"] = $listePacks

# ---------- boîte à images ({{ARCHIVES}}) : les archives du site, avec leur crédit, réutilisables ----------
# Source : assets/img/revolutions/credits.txt (identifiant | taille | autrice ou auteur | licence | adresse Commons).
$archives = foreach ($l in (Read-Utf8 (Join-Path $site "assets\img\revolutions\credits.txt")) -split "`n") {
  $c = $l -split '\s*\|\s*'; if ($c.Count -lt 5 -or $c[0].Trim().StartsWith("#")) { continue }
  $fic = Get-ChildItem (Join-Path $site "assets\img\revolutions") -Filter "$($c[0].Trim()).*" | Select-Object -First 1
  if (-not $fic) { Write-Warning "Boîte à images : pas de fichier pour « $($c[0]) »"; continue }
  "<figure class=""archive""><a href=""assets/img/revolutions/$($fic.Name)"" aria-label=""Image en grand : $(Esc ($fic.BaseName -replace '-',' '))""><img src=""assets/img/revolutions/$($fic.Name)"" alt="""" loading=""lazy"" width=""240"" height=""180""></a><figcaption>$(Esc $c[2].Trim()) · $(Esc $c[3].Trim()) · <a href=""$(Esc $c[4].Trim())"" rel=""noopener"">Commons</a></figcaption></figure>"
}
$compteurs["ARCHIVES"] = $archives -join ""
$compteurs["NB_ARCHIVES"] = @($archives).Count
# ---------- pages ----------
foreach ($f in Get-ChildItem (Join-Path $src "pages") -Filter *.html) {
  $raw = Read-Utf8 $f.FullName
  $m = [regex]::Match($raw, '^<!--\s*(.*?)\s*-->\s*', 'Singleline')
  $meta = $m.Groups[1].Value -split "\s\|\s"
  $body = $raw.Substring($m.Length)
  $scripts = ""; if ($meta.Count -gt 3) { $scripts = $meta[3] }
  $out = $f.Name; $root = ""
  if ($f.BaseName -in @("guides", "bibliotheque", "experiences", "antifascisme", "manif", "agir", "figures", "ressources", "universite", "encyclopedie")) { $out = "$($f.BaseName)\index.html"; $root = "../" }
  if ($f.BaseName -in @("404", "sans-connexion")) { $root = "/" }   # servies à n'importe quelle adresse : liens absolus   # servie à n'importe quelle adresse : liens absolus
  # La rubrique (menu, fil d'Ariane, tiroir) se déduit de l'adresse ; à défaut, de la clé de l'en-tête.
  $navKey = (Famille-De-Adresse ($out -replace '\\', '/'))[2]; if (-not $navKey) { $navKey = $meta[2] }
  Write-Utf8 (Join-Path $site $out) (Render-Page $root $navKey $meta[0] $meta[1] $body $scripts)
  if ($f.BaseName -notin @("lecteur", "recherche", "404", "sans-connexion")) {
    $index += [pscustomobject]@{ u = $out -replace '\\', '/'; k = "Rubrique"; y = "Rubrique"; t = ($meta[0] -replace '\s*·\s*Mamie Commune$', ''); d = $meta[1]; x = "$(Heads $body) $([regex]::Matches($body, '<h3[^>]*>(.*?)</h3>') | ForEach-Object { Plain $_.Groups[1].Value 120 })" }
  }
}
# ---------- université populaire : chronologie (data/chronologie.js) et pages à part (universite/<nom>.html) ----------
# La chronologie vient de _src/universite/chronologie.json : chaque événement a une date vérifiée et une source.
$chr = (Read-Utf8 (Join-Path $src "universite\chronologie.json")) | ConvertFrom-Json
foreach ($e in @($chr.evenements)) {
  $quoi = "Chronologie : « $($e.titre) »"
  if ($e.date -notmatch '^\d{4}(-\d{2}(-\d{2})?)?$') { Write-Warning "$quoi : date à écrire AAAA, AAAA-MM ou AAAA-MM-JJ" }
  if (-not ($chr.themes.PSObject.Properties.Name -contains $e.theme)) { Write-Warning "$quoi : thème inconnu « $($e.theme) »" }
  if (-not $e.source -or -not $e.source[1]) { Write-Warning "$quoi : pas de source" }
  foreach ($champ in "quand", "titre", "texte") { if (-not $e.$champ) { Write-Warning "$quoi : champ « $champ » vide" } }
}
$jsC = "// Généré par _src/build.ps1 depuis _src/universite/chronologie.json — ne pas modifier à la main.`n"
$jsC += "window.CHRONO_THEMES = { " + (($chr.themes.PSObject.Properties | ForEach-Object { "$(JsStr $_.Name): $(JsStr $_.Value)" }) -join ", ") + " };`n"
$jsC += "window.CHRONOLOGIE = [`n" + ((@($chr.evenements) | Sort-Object date | ForEach-Object { "  { date: $(JsStr $_.date), quand: $(JsStr $_.quand), theme: $(JsStr $_.theme), titre: $(JsStr $_.titre), texte: $(JsStr $_.texte), lien: $(JsStr (Clean-Url $_.lien)), source: [$(JsStr $_.source[0]), $(JsStr (Clean-Url $_.source[1]))] }" }) -join ",`n") + "`n];`n"
Write-Utf8 (Join-Path $site "data\chronologie.js") $jsC
foreach ($f in Get-ChildItem (Join-Path $src "universite") -Filter *.html) {
  $raw = Read-Utf8 $f.FullName
  $m = [regex]::Match($raw, '^<!--\s*(.*?)\s*-->\s*', 'Singleline')
  $meta = $m.Groups[1].Value -split "\s\|\s"
  $body = $raw.Substring($m.Length)
  $scripts = ""; if ($meta.Count -gt 3) { $scripts = $meta[3] }
  $out = "universite\$($f.Name)"
  Write-Utf8 (Join-Path $site $out) (Render-Page "../" "universite" $meta[0] $meta[1] $body $scripts)
  $index += [pscustomobject]@{ u = $out -replace '\\', '/'; k = "Université populaire"; y = "Rubrique"; t = ($meta[0] -replace '\s*·\s*Mamie Commune$', ''); d = $meta[1]; x = (Heads $body) + " " + ((@($chr.evenements) | ForEach-Object { "$($_.quand) $($_.titre)" }) -join " ") }
}
# ---------- les outils de Mamie (outils/) ----------
# Une page par outil dans _src/outils/<nom>.html (même en-tête que les pages) ; index.html devient outils/index.html.
# Les outils marchent entièrement dans le navigateur (assets/outils.js) : rien n'est envoyé, rien n'est enregistré sans le demander.
New-Item -ItemType Directory -Force (Join-Path $site "outils") | Out-Null
foreach ($f in Get-ChildItem (Join-Path $src "outils") -Filter *.html) {
  $raw = Read-Utf8 $f.FullName
  $m = [regex]::Match($raw, '^<!--\s*(.*?)\s*-->\s*', 'Singleline')
  $meta = $m.Groups[1].Value -split "\s\|\s"
  $body = $raw.Substring($m.Length)
  $scripts = ""; if ($meta.Count -gt 3) { $scripts = $meta[3] }
  $out = "outils\$($f.Name)"
  Write-Utf8 (Join-Path $site $out) (Render-Page "../" "boite-outils" $meta[0] $meta[1] $body $scripts)
  $index += [pscustomobject]@{ u = $out -replace '\\', '/'; k = "Les outils de Mamie"; y = "Outil"; t = ($meta[0] -replace '\s*·\s*Mamie Commune$', ''); d = $meta[1]; x = (Heads $body) }
}
# Vidéos dans la recherche : chaque documentaire de la page Vidéos, et chaque publication TikTok de data/videos.js.
$pageVideos = Read-Utf8 (Join-Path $src "pages\videos.html")
foreach ($m in [regex]::Matches($pageVideos, '<article class="doc" id="([^"]+)">[\s\S]*?<h3>(.*?)</h3>\s*<p class="doc__meta">(.*?)</p>([\s\S]*?)</article>')) {
  $index += [pscustomobject]@{ u = "videos.html#$($m.Groups[1].Value)"; k = "Documentaire"; y = "Vidéo"; t = (Plain $m.Groups[2].Value 200); d = (Plain $m.Groups[3].Value 300); x = (Plain $m.Groups[4].Value 600) }
}
foreach ($m in [regex]::Matches((Read-Utf8 (Join-Path $site "data\videos.js")), 'titre: "([^"]+)"[^}]*?texte: "([^"]*)"(?:[^}]*?tags: \[([^\]]*)\])?')) {
  $index += [pscustomobject]@{ u = "videos.html#tiktok"; k = "Vidéo de Mamie"; y = "Vidéo"; t = $m.Groups[1].Value; d = $m.Groups[2].Value; x = ($m.Groups[3].Value -replace '"', '') }
}
# Anciennes adresses remplacées : petite page qui renvoie vers la nouvelle (IONOS redirige déjà via .htaccess).
# Les guides retirés en octobre 2026 (on n'a gardé que l'essentiel) renvoient vers la liste des guides.
$retires = "distribution-gnu-linux manuel-mint personnaliser-mint depannage-mises-a-jour mises-a-jour raccourcis-clavier raccourcis-clavier-detail linux-pour-debutants deja-linux pourquoi-changer liberer-windows acheter-un-ordinateur obtenir-de-l-aide fin-de-windows-10 youtube-sans-pub quitter-facebook blokada libreoffice choisir-un-service ressources-associations flux-rss" -split " "
$anciennes = @(@("partage.html", "guides/signal"), @("manif\legal-team-belgique.html", "legal-team"), @("experiences\lyon-1975-histoire.html", "./"), @("experiences\lyon-1975-debats.html", "./"), @("bibliotheque\les-feuilles-zo-d-axa.html", "../figures/zo-d-axa"), @("bibliotheque\louise-michel-institutrice.html", "../figures/louise-michel")) +($retires | ForEach-Object { , @("guides\$_.html", "./") })
foreach ($old in $anciennes) {
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

# f = famille (apprendre, organiser, defendre), r = rubrique ; les pages hors famille (accueil, mentions…) ont f vide.
$js = "// Généré par _src/build.ps1 — ne pas modifier à la main. Utilisé par assets/recherche.js.`n"
$js += "window.FAMILLES = [" + (($familles | ForEach-Object { $f = $_; "{ id: $(JsStr $f.id), nom: $(JsStr $f.nom), dit: $(JsStr $f.dit), rubriques: [" + (($f.rubriques | ForEach-Object { "{ nom: $(JsStr $_[2]), d: $(JsStr $_[3]), u: $(JsStr (Clean-Url $_[1])) }" }) -join ", ") + "] }" }) -join ", ") + "];`n"
$js += "window.RECHERCHE = [`n"
$js += ($index | ForEach-Object { $fr = Famille-De-Adresse ($_.u -replace '\\', '/'); "  { u: $(JsStr (Clean-Url $_.u)), f: $(JsStr $fr[0]), r: $(JsStr $fr[1]), k: $(JsStr $_.k), y: $(JsStr $_.y), t: $(JsStr $_.t), d: $(JsStr $_.d), x: $(JsStr (($_.x -replace '\s+', ' ').Trim())) }" }) -join ",`n"
$js += "`n];`n"
Write-Utf8 (Join-Path $site "data\recherche.js") $js
# ---------- mode hors ligne : sw.js (service worker) ----------
# Modèle : _src/sw.js. La version suit l'empreinte des sources : à chaque changement, le navigateur voit un nouveau sw.js
# et propose « Mettre à jour ». La liste de départ (la « coquille ») reste petite : le reste est gardé au fil des visites
# ou à la demande (page Hors ligne). Les adresses doivent exister, sinon l'installation échoue : on vérifie ici.
$depart = @("./", "hors-ligne", "sans-connexion", "recherche", "confidentialite", "manifest.webmanifest",
  "assets/style.css?v=$ver", "assets/fonts.css?v=$ver", "assets/site.js?v=$ver", "assets/recherche.js?v=$ver", "assets/hors-ligne.js?v=$ver",
  "data/recherche.js?v=$ver", "data/lieux.js?v=$ver", "assets/mamie-logo-192.webp", "assets/icone-32.png", "assets/icone-192.png")
$depart += @(Get-ChildItem (Join-Path $site "assets\fonts") -Filter *.woff2 | ForEach-Object { "assets/fonts/$($_.Name)" })
foreach ($d in $depart) {
  $chemin = ($d -replace '\?.*$', '') -replace '/', '\'
  if ($chemin -eq ".\") { $chemin = "index.html" } elseif (-not [IO.Path]::GetExtension($chemin)) { $chemin += ".html" }
  if (-not (Test-Path (Join-Path $site $chemin))) { Write-Warning "Hors ligne : « $d » n'existe pas (sw.js)" }
}
$sw = (Read-Utf8 (Join-Path $src "sw.js")).Replace("__VERSION__", $ver).Replace("__PRECACHE__", "[`n  " + (($depart | ForEach-Object { JsStr $_ }) -join ",`n  ") + "`n]")
$sw = "// Généré par _src/build.ps1 depuis _src/sw.js — ne pas modifier à la main.`n" + $sw
Write-Utf8 (Join-Path $site "sw.js") $sw

Write-Host "OK : $($guides.Count) guides, $($biblio.Count) fiches, $($livres.Count) livres, $($ressources.Count) ressources et $($exp.Count) pages de dossiers générés."
