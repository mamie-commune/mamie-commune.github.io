# Ajoute les nouvelles publications TikTok de @mamie_commune à data/videos.js, et met à jour les vues.
# Lancé par .github/workflows/tiktok.yml (toutes les 3 heures, ou à la main).
#
# Deux façons, toutes deux officielles :
#  1. Automatique : API officielle de TikTok (« Display API »), avec l'autorisation du compte.
#     Secrets GitHub : TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_REFRESH_TOKEN.
#     Sans ces secrets, rien ne se passe (message, pas d'erreur).
#  2. À la main : -Adresse "https://www.tiktok.com/@mamie_commune/video/…" (ou /photo/…).
#     Titre et texte viennent de l'oEmbed public de TikTok ; aucun compte développeur nécessaire.
# Ne jamais écrire les clés dans le dépôt.
param([string]$Adresse = "")

$ErrorActionPreference = "Stop"
$racine = Split-Path -Parent $PSScriptRoot
$fichier = Join-Path $racine "data/videos.js"
$enc = New-Object System.Text.UTF8Encoding($false)
$js = [IO.File]::ReadAllText($fichier, $enc) -replace "`r`n", "`n"
$avant = $js

function JsStr([string]$s) { '"' + ($s -replace '\\', '\\' -replace '"', '\"' -replace "`r?`n", ' ') + '"' }

# Vues à la française : 534, 1 077, 12,2 k, 1,3 M.
function Vues([long]$n) {
  if ($n -ge 1000000) { return ([Math]::Round($n / 1000000, 1)).ToString([Globalization.CultureInfo]::GetCultureInfo("fr-FR")) + " M" }
  if ($n -ge 10000) { return ([Math]::Round($n / 1000, 1)).ToString([Globalization.CultureInfo]::GetCultureInfo("fr-FR")) + " k" }
  return $n.ToString("#,0", [Globalization.CultureInfo]::GetCultureInfo("fr-FR")).Replace([char]0x202F, ' ').Replace([char]0xA0, ' ')
}

# Une légende TikTok → titre court, texte sans mots-dièse, liste de mots-dièse.
function Decouper([string]$legende, [string]$titre) {
  $tags = @([regex]::Matches($legende, '#([\p{L}\p{N}_]+)') | ForEach-Object { $_.Groups[1].Value.ToLower() } | Select-Object -Unique -First 6)
  $texte = ([regex]::Replace($legende, '#[\p{L}\p{N}_]+', '') -replace '\s+', ' ').Trim()
  if (-not $texte) { $texte = "Une publication de Mamie Commune." }
  if (-not $titre -and $texte -match '^(.{6,50}?)[.!?…](\s|$)') { $titre = $Matches[1] }   # première phrase, si elle est courte
  if (-not $titre) {
    $mots = ($texte -split ' ' | Select-Object -First 6) -join ' '
    $titre = $mots.TrimEnd('.', ',', ';', ':', '!', '?', ' ')
    if (($texte -split ' ').Count -gt 6) { $titre += "…" }
  }
  return @{ titre = $titre; texte = $texte; tags = $tags }
}

function Entree($v) {
  $tags = ($v.tags | ForEach-Object { JsStr $_ }) -join ", "
  "  { id: $(JsStr $v.id), type: $(JsStr $v.type), date: $(JsStr $v.date), titre: $(JsStr $v.titre), vues: $(JsStr $v.vues),`n" +
  "    texte: $(JsStr $v.texte),`n" +
  "    tags: [$tags] },"
}

$connues = @([regex]::Matches($js, 'id: "(\d+)"') | ForEach-Object { $_.Groups[1].Value })
$nouvelles = @()
$vuesMaj = @{}

if ($Adresse) {
  # --- À la main, par l'oEmbed public ---
  if ($Adresse -notmatch 'tiktok\.com/@[\w.]+/(video|photo)/(\d+)') { throw "Adresse TikTok non reconnue : $Adresse" }
  $type = $Matches[1]; $id = $Matches[2]
  if ($connues -contains $id) { Write-Host "Cette publication est déjà sur le site."; exit 0 }
  $o = Invoke-RestMethod "https://www.tiktok.com/oembed?url=$([uri]::EscapeDataString($Adresse))"
  $d = Decouper ([string]$o.title) ""
  $nouvelles += @{ id = $id; type = $type; date = (Get-Date).ToString("yyyy-MM-dd"); titre = $d.titre; vues = "0"; texte = $d.texte; tags = $d.tags }
}
else {
  # --- Automatique, par l'API officielle ---
  if (-not ($env:TIKTOK_CLIENT_KEY -and $env:TIKTOK_CLIENT_SECRET -and $env:TIKTOK_REFRESH_TOKEN)) {
    Write-Host "Pas de clés TikTok (secrets TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_REFRESH_TOKEN) : rien à faire."
    exit 0
  }
  $jeton = Invoke-RestMethod -Method Post "https://open.tiktokapis.com/v2/oauth/token/" -ContentType "application/x-www-form-urlencoded" -Body @{
    client_key = $env:TIKTOK_CLIENT_KEY; client_secret = $env:TIKTOK_CLIENT_SECRET; grant_type = "refresh_token"; refresh_token = $env:TIKTOK_REFRESH_TOKEN }
  if (-not $jeton.access_token) { throw "TikTok a refusé le renouvellement de l'autorisation : refaire l'autorisation du compte (voir CLAUDE.md)." }
  if ($jeton.refresh_token -and $jeton.refresh_token -ne $env:TIKTOK_REFRESH_TOKEN -and $env:GITHUB_OUTPUT) {
    # Nouveau jeton de renouvellement : le workflow l'enregistre s'il en a le droit.
    Write-Host "::add-mask::$($jeton.refresh_token)"
    Add-Content $env:GITHUB_OUTPUT "nouveau_jeton=$($jeton.refresh_token)"
  }
  $champs = "id,title,video_description,create_time,view_count,share_url"
  $rep = Invoke-RestMethod -Method Post "https://open.tiktokapis.com/v2/video/list/?fields=$champs" -Headers @{ Authorization = "Bearer $($jeton.access_token)" } -ContentType "application/json" -Body '{"max_count": 20}'
  if ($rep.error.code -and $rep.error.code -ne "ok") { throw "Erreur de l'API TikTok : $($rep.error.code) $($rep.error.message)" }
  foreach ($v in $rep.data.videos) {
    $id = [string]$v.id
    $vues = Vues ([long]$v.view_count)
    if ($connues -contains $id) { $vuesMaj[$id] = $vues; continue }
    $d = Decouper ([string]$v.video_description) ([string]$v.title)
    $type = if ([string]$v.share_url -match '/photo/') { "photo" } else { "video" }
    $date = [DateTimeOffset]::FromUnixTimeSeconds([long]$v.create_time).ToOffset([TimeSpan]::FromHours(1)).ToString("yyyy-MM-dd")
    $nouvelles += @{ id = $id; type = $type; date = $date; titre = $d.titre; vues = $vues; texte = $d.texte; tags = $d.tags }
  }
}

# Vues des publications déjà présentes.
foreach ($id in $vuesMaj.Keys) {
  $js = [regex]::Replace($js, "(id: `"$id`"[^\n]*?vues: )`"[^`"]*`"", "`${1}`"$($vuesMaj[$id])`"")
}
# Nouvelles publications, les plus récentes en premier, en tête de liste.
if ($nouvelles.Count) {
  $bloc = ($nouvelles | Sort-Object { $_.date } -Descending | ForEach-Object { Entree $_ }) -join "`n"
  $js = $js.Replace("window.VIDEOS = [`n", "window.VIDEOS = [`n$bloc`n")
}
if ($js -ne $avant) {   # on ne touche au fichier (et à la date du relevé) que s'il y a du nouveau
  $js = [regex]::Replace($js, 'relevé du [0-9/]+', "relevé du $((Get-Date).ToString('dd/MM/yyyy'))")
  [IO.File]::WriteAllText($fichier, $js, $enc)
}
Write-Host "$($nouvelles.Count) nouvelle(s) publication(s), $($vuesMaj.Count) compteur(s) de vues mis à jour."
