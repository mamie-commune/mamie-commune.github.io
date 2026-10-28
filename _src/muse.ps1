# Conversion d'un fichier Muse (format de la Bibliothèque anarchiste) en HTML.
# Renvoie un objet { meta, html, toc } ; les liens externes sont rendus en texte simple.

function ConvertFrom-MuseInline([string]$s) {
  # Échappe tout sauf les balises de mise en forme autorisées.
  $s = $s -replace '&(?!(#\d+|#x[0-9a-fA-F]+|[a-zA-Z]+);)', '&amp;'
  $s = $s -replace '<(?!/?(em|strong|sup|sub|br|del|code|i|b)\b)', '&lt;'
  $s = $s -replace '<br\s*/?>', '<br>'
  # Liens : on garde uniquement le texte.
  $s = [regex]::Replace($s, '\[\[([^\]]+)\]\[([^\]]+)\]\]', '$2')
  $s = [regex]::Replace($s, '\[\[([^\]]+)\]\]', '$1')
  # Gras / italique façon Muse.
  $s = [regex]::Replace($s, '(?<![\*\w])\*\*\*(?=\S)(.+?)(?<=\S)\*\*\*(?![\*\w])', '<strong><em>$1</em></strong>')
  $s = [regex]::Replace($s, '(?<![\*\w])\*\*(?=\S)(.+?)(?<=\S)\*\*(?![\*\w])', '<strong>$1</strong>')
  $s = [regex]::Replace($s, '(?<![\*\w])\*(?=\S)(.+?)(?<=\S)\*(?![\*\w])', '<em>$1</em>')
  # Appels de notes.
  $s = [regex]::Replace($s, '(?<=\S)\s?\[(\d+)\]', '<sup class="fnref"><a href="#fn$1" id="ref$1">$1</a></sup>')
  return $s
}

function ConvertFrom-Muse([string]$text) {
  $text = $text -replace "`r", ""
  $lines = $text -split "`n"
  $meta = @{}
  # L'en-tête (#clé valeur) s'arrête à la première ligne vide ; une ligne sans # prolonge la clé précédente.
  $i = 0; $key = $null
  while ($i -lt $lines.Count -and $lines[$i].Trim() -ne "") {
    if ($lines[$i] -match '^;') { $key = $null }
    elseif ($lines[$i] -match '^#(\w+)\s*(.*)$') { $key = $matches[1]; $meta[$key] = $matches[2].Trim() }
    elseif ($key) { $meta[$key] += " " + $lines[$i].Trim() }
    $i++
  }
  $body = $lines[$i..($lines.Count - 1)] | Where-Object { $_ -notmatch '^;( |$)' }

  # Notes de bas de page : « [n] texte » en début de ligne, jusqu'à la ligne vide.
  $notes = [ordered]@{}; $kept = New-Object System.Collections.Generic.List[string]
  $cur = $null
  foreach ($l in $body) {
    if ($l -match '^\[(\d+)\]\s+(.*)$') { $cur = $matches[1]; $notes[$cur] = $matches[2]; continue }
    if ($cur -and $l.Trim() -ne "") { $notes[$cur] += " " + $l.Trim(); continue }
    $cur = $null; $kept.Add($l)
  }

  # Niveaux de titre : le plus petit niveau utilisé devient <h2>.
  $levels = $kept | Where-Object { $_ -match '^(\*{1,5}) \S' } | ForEach-Object { ($_ -split ' ')[0].Length }
  $minL = 1; if ($levels) { $minL = ($levels | Measure-Object -Minimum).Minimum }

  $out = New-Object System.Text.StringBuilder
  $toc = New-Object System.Collections.Generic.List[object]
  $para = New-Object System.Collections.Generic.List[string]
  $env = ""          # quote | verse | center | right
  $list = ""         # ul | ol
  $hn = 0
  $flush = {
    if ($para.Count) {
      if ($env -eq "verse") {
        [void]$out.Append("<p class=""verse"">" + (($para | ForEach-Object { ConvertFrom-MuseInline $_.Trim() }) -join "<br>") + "</p>`n")
      } else {
        $cls = ""; if ($env -eq "center") { $cls = ' class="center"' } elseif ($env -eq "right") { $cls = ' class="right"' }
        [void]$out.Append("<p$cls>" + (ConvertFrom-MuseInline (($para | ForEach-Object { $_.Trim() }) -join " ")) + "</p>`n")
      }
      $para.Clear()
    }
  }
  $closeList = { if ($list) { [void]$out.Append("</$list>`n"); Set-Variable -Name list -Value "" -Scope 1 } }

  foreach ($l in $kept) {
    $t = $l.Trim()
    if ($t -match '^<(quote|verse|center|right)>$') { & $flush; & $closeList; $env = $matches[1]; if ($env -eq "quote") { [void]$out.Append("<blockquote>`n") }; continue }
    if ($t -match '^</(quote|verse|center|right)>$') { & $flush; & $closeList; if ($matches[1] -eq "quote") { [void]$out.Append("</blockquote>`n") }; $env = ""; continue }
    if ($t -eq "") { if ($env -ne "verse") { & $flush } else { & $flush }; continue }
    if ($l -match '^(\*{1,5}) (.+)$') {
      & $flush; & $closeList
      $lv = [Math]::Min(5, $matches[1].Length - $minL + 2); $hn++
      $txt = ConvertFrom-MuseInline $matches[2].Trim()
      [void]$out.Append("<h$lv id=""s$hn"">$txt</h$lv>`n")
      if ($lv -le 3) { $toc.Add([pscustomobject]@{ id = "s$hn"; level = $lv; text = ([regex]::Replace($txt, '<[^>]+>', '')) }) }
      continue
    }
    if ($l -match '^\s+(-|\d+\.)\s+(.*)$') {
      & $flush
      $want = "ul"; if ($matches[1] -ne "-") { $want = "ol" }
      if ($list -ne $want) { & $closeList; [void]$out.Append("<$want>`n"); $list = $want }
      [void]$out.Append("<li>" + (ConvertFrom-MuseInline $matches[2].Trim()) + "</li>`n")
      continue
    }
    if ($list -and $l -match '^\s{2,}\S') { $out.Length -= 6; [void]$out.Append(" " + (ConvertFrom-MuseInline $t) + "</li>`n"); continue }
    & $closeList
    $para.Add($l)
  }
  & $flush; & $closeList

  if ($notes.Count) {
    [void]$out.Append("<section class=""notes"" aria-label=""Notes""><h2 id=""notes"">Notes</h2><ol>`n")
    foreach ($k in $notes.Keys) { [void]$out.Append("<li id=""fn$k"" value=""$k"">" + (ConvertFrom-MuseInline $notes[$k]) + " <a href=""#ref$k"" class=""fnback"" aria-label=""Retour au texte"">↩</a></li>`n") }
    [void]$out.Append("</ol></section>`n")
  }
  return [pscustomobject]@{ meta = $meta; html = $out.ToString(); toc = $toc }
}
