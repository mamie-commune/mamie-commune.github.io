# Sélection de la bande selon l'actualité (accueil). Lit les titres des flux de _src/actualite/themes.json
# (sept derniers jours), compte pour chaque thème les titres qui contiennent un de ses mots, et écrit
# data/actualite.json : les thèmes les plus cités, avec trois titres d'exemple chacun.
# Aucune intelligence artificielle : une simple liste de mots, écrite par la bande. Rien n'est envoyé nulle part.
# Usage : powershell -ExecutionPolicy Bypass -File _src/actualite.ps1   (ou pwsh ./_src/actualite.ps1)
$ErrorActionPreference = "Stop"
$site = Split-Path $PSScriptRoot -Parent
# chemins écrits pour Windows et pour Linux (le robot tourne sur une machine Linux de GitHub)
$conf = [IO.File]::ReadAllText((Join-Path (Join-Path $PSScriptRoot "actualite") "themes.json"), [Text.Encoding]::UTF8) | ConvertFrom-Json
$sortie = Join-Path (Join-Path $site "data") "actualite.json"
$depuis = [DateTimeOffset]::UtcNow.AddDays(-[int]$conf.jours)

# Texte sans accents ni majuscules, apostrophes droites : « Grève » et « greve » se rencontrent.
function Plat([string]$s) {
  $s = $s.Normalize([Text.NormalizationForm]::FormD)
  $b = New-Object Text.StringBuilder
  foreach ($c in $s.ToCharArray()) { if ([Globalization.CharUnicodeInfo]::GetUnicodeCategory($c) -ne 'NonSpacingMark') { [void]$b.Append($c) } }
  return ($b.ToString().ToLowerInvariant() -replace "[’‘`]", "'")
}
# Un mot de la liste devient une expression régulière : « grev* » = grève, grévistes… ; sinon le mot entier.
$motifs = @{}
foreach ($t in $conf.themes) {
  $parts = foreach ($m in $t.mots) {
    $m = Plat $m
    if ($m.EndsWith("*")) { "(?<![a-z0-9])" + [regex]::Escape($m.TrimEnd("*")) } else { "(?<![a-z0-9])" + [regex]::Escape($m) + "(?![a-z0-9])" }
  }
  $motifs[$t.id] = New-Object regex (($parts -join "|"), [Text.RegularExpressions.RegexOptions]::Compiled)
}

# 1. Les titres récents de chaque flux (RSS ou Atom)
$titres = New-Object System.Collections.ArrayList
$vus = @{}
foreach ($f in $conf.flux) {
  try {
    $r = Invoke-WebRequest -Uri $f.url -UseBasicParsing -TimeoutSec 30 -Headers @{ "User-Agent" = "MamieCommune-actualite/1.0 (https://mamiecommune.org)" }
    $ms = New-Object IO.MemoryStream; $r.RawContentStream.CopyTo($ms)
    $xml = [xml]([Text.Encoding]::UTF8.GetString($ms.ToArray()).TrimStart([char]0xFEFF))
    $items = @($xml.rss.channel.item) + @($xml.feed.entry) | Where-Object { $_ }
    $n = 0
    foreach ($it in $items) {
      $titre = [string]$(if ($it.title.'#text') { $it.title.'#text' } else { $it.title })
      $lien = [string]$(if ($it.link.href) { $it.link.href } elseif ($it.link -is [string]) { $it.link } else { $it.link[0] })
      # date : pubDate (RSS), dc:date (sites SPIP comme Basta! ou Reporterre), published ou updated (Atom)
      $quand = [string]$(if ($it.pubDate) { $it.pubDate } elseif ($it.date) { $it.date } elseif ($it.published) { $it.published } else { $it.updated })
      $titre = ([Net.WebUtility]::HtmlDecode($titre) -replace '\s+', ' ').Trim()
      if (-not $titre -or -not $lien) { continue }
      $d = [DateTimeOffset]::MinValue
      if ($quand -and [DateTimeOffset]::TryParse($quand, [Globalization.CultureInfo]::InvariantCulture, [Globalization.DateTimeStyles]::AssumeUniversal, [ref]$d)) { if ($d -lt $depuis) { continue } } else { $d = [DateTimeOffset]::UtcNow }
      $cle = Plat $titre
      if ($vus[$cle]) { continue }; $vus[$cle] = 1
      [void]$titres.Add([pscustomobject]@{ titre = $titre; plat = $cle; url = $lien.Trim(); source = $f.nom; date = $d.UtcDateTime.ToString("yyyy-MM-dd") })
      $n++
    }
    Write-Host "$($f.nom) : $n titres récents"
  } catch { Write-Warning "$($f.nom) : flux illisible ($($_.Exception.Message))" }
}
if ($titres.Count -lt 20) { Write-Warning "Trop peu de titres ($($titres.Count)) : on garde la sélection actuelle."; exit 0 }

# 2. Le score de chaque thème = nombre de titres qui contiennent un de ses mots
$res = foreach ($t in $conf.themes) {
  $ok = @($titres | Where-Object { $motifs[$t.id].IsMatch($_.plat) } | Sort-Object date -Descending)
  if ($ok.Count -ge [int]$conf.minimum) {
    [pscustomobject]@{ id = $t.id; nom = $t.nom; score = $ok.Count
      titres = @($ok | Select-Object -First 3 | ForEach-Object { [ordered]@{ titre = $_.titre; url = $_.url; source = $_.source; date = $_.date } }) }
  }
}
$res = @($res | Sort-Object @{ e = "score"; Descending = $true }, id)
$res | ForEach-Object { Write-Host ("{0,-16} {1,3} titres" -f $_.id, $_.score) }

# 3. N'écrire que si les trois premiers thèmes changent, ou si le fichier a plus de trois jours :
# le site n'est pas republié tous les matins pour rien.
$top = ($res | Select-Object -First 3 | ForEach-Object { $_.id }) -join ","
if (Test-Path $sortie) {
  $avant = [IO.File]::ReadAllText($sortie, [Text.Encoding]::UTF8) | ConvertFrom-Json
  $ancienTop = ($avant.themes | Select-Object -First 3 | ForEach-Object { $_.id }) -join ","
  $age = ([datetime]::UtcNow - [datetime]::ParseExact($avant.maj, "yyyy-MM-dd", $null)).TotalDays
  if ($ancienTop -eq $top -and $age -lt 3) { Write-Host "Mêmes thèmes qu'avant ($top) : rien à changer."; exit 0 }
}
$json = [ordered]@{ maj = [datetime]::UtcNow.ToString("yyyy-MM-dd"); titresLus = $titres.Count; themes = $res } | ConvertTo-Json -Depth 6
[IO.File]::WriteAllText($sortie, $json, (New-Object Text.UTF8Encoding $false))
Write-Host "Sélection mise à jour : $top"
