# Recopie la carte des mobilisations de 17octobregiletjaune.net/carte/ dans data/mobilisations.js.
# Lancé toutes les heures par .github/workflows/mobilisations.yml (et à la main : powershell -File _src/mobilisations.ps1).
# Leur carte = des lieux (stations-service, sites fixes, lieux ajoutés par les gens) + des actions datées sur ces lieux.
# On ne garde que les lieux qui ont au moins une action. Si leur site ne répond pas, on garde l'ancien fichier.
$ErrorActionPreference = "Stop"
$site = Split-Path $PSScriptRoot -Parent
$sortie = Join-Path (Join-Path $site "data") "mobilisations.js"
$base = "https://17octobregiletjaune.net"

function Lire($chemin) {
  $wc = New-Object System.Net.WebClient
  $wc.Headers["User-Agent"] = "MamieCommune-sync (+https://mamiecommune.org)"
  $wc.Encoding = [Text.Encoding]::UTF8
  return ($wc.DownloadString("$base$chemin") | ConvertFrom-Json)
}

try {
  $actions = (Lire "/api/actions").actions
  $sites = (Lire "/data/sites.json").lieux
  $ajoutes = (Lire "/api/lieux").lieux
  $stations = Lire "/api/stations"
} catch {
  Write-Host "Site du 17 octobre injoignable ($($_.Exception.Message)) : data/mobilisations.js inchangé."
  exit 0
}

# Lieux par identifiant : [lat, lon, genre, nom, commune, code postal]
$lieux = @{}
foreach ($s in $stations) {
  $lieux["$($s.id)"] = @([Math]::Round($s.geom.lat, 5), [Math]::Round($s.geom.lon, 5), "station", "Station-service, $($s.adresse)", "$($s.ville)", "$($s.cp)")
}
# Format des sites et lieux ajoutés : [id, genre, lat, lon, nom, exploitant, commune, cp, dep, …]
foreach ($l in @($sites) + @($ajoutes)) {
  $nom = if ($l[5] -and $l[1] -ne "manif") { "$($l[4]) ($($l[5]))" } else { "$($l[4])" }
  $lieux["$($l[0])"] = @([Math]::Round([double]$l[2], 5), [Math]::Round([double]$l[3], 5), "$($l[1])", $nom, "$($l[6])", "$($l[7])")
}

# Actions d'un lieu : [type, heure, jour (vide = 17 octobre), …, précision du lieu]
$points = New-Object System.Collections.ArrayList
$sansLieu = 0
foreach ($p in ($actions.PSObject.Properties | Sort-Object { [long]$_.Name })) {
  $l = $lieux[$p.Name]
  if (-not $l) { $sansLieu++; continue }
  $liste = @(foreach ($a in $p.Value) {
    $jour = if ($a[2]) { "$($a[2])" } else { "2026-10-17" }
    $precision = if ($a.Count -gt 4) { "$($a[4])" } else { "" }
    , @("$($a[0])", "$($a[1])", $jour, $precision)
  })
  [void]$points.Add(@($l[0], $l[1], $l[2], $l[3], $l[4], $l[5], $liste))
}

$json = ConvertTo-Json -InputObject @($points) -Depth 6 -Compress
# Empreinte du contenu : la date de mise à jour ne change que si les données changent.
$sha = [Security.Cryptography.SHA1]::Create()
$empreinte = ([BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($json))) -replace '-', '').Substring(0, 12).ToLower()
if ((Test-Path $sortie) -and ((Get-Content $sortie -TotalCount 3 -Encoding UTF8) -join "`n") -match "empreinte $empreinte") {
  Write-Host "Carte du 17 octobre : rien de nouveau ($($points.Count) lieux)."
  exit 0
}
# Heure de Paris (nom du fuseau différent sous Windows et sous Linux, où tourne la mise à jour automatique).
$fuseau = try { [TimeZoneInfo]::FindSystemTimeZoneById("Europe/Paris") } catch { [TimeZoneInfo]::FindSystemTimeZoneById("Romance Standard Time") }
$maj = [TimeZoneInfo]::ConvertTimeFromUtc([DateTime]::UtcNow, $fuseau).ToString("yyyy-MM-ddTHH:mm")
$texte = "// Généré par _src/mobilisations.ps1 d'après $base/carte/ — ne pas modifier à la main.`n// empreinte $empreinte`n" +
  "// Lieu : [lat, lon, genre, nom, commune, code postal, [[type d'action, heure, jour, précision], …]]`n" +
  "window.MOBILISATIONS = { maj: `"$maj`", source: `"$base/carte/`", lieux: $json };`n"
[IO.File]::WriteAllText($sortie, $texte, (New-Object Text.UTF8Encoding $false))
Write-Host "Carte du 17 octobre : $($points.Count) lieux avec des actions, mis à jour le $maj ($sansLieu actions sans lieu connu)."
