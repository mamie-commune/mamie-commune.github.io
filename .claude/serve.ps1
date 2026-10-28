param([string]$Root = ".", [int]$Port = 8765)
# Petit serveur de prévisualisation : fichiers lus en flux, avec prise en charge des requêtes Range (avance rapide vidéo).
if ($env:PORT) { $Port = [int]$env:PORT }
$root = (Resolve-Path $Root).Path
$types = @{ ".html"="text/html; charset=utf-8"; ".css"="text/css; charset=utf-8"; ".js"="application/javascript; charset=utf-8"; ".json"="application/json"; ".svg"="image/svg+xml"; ".webp"="image/webp"; ".pdf"="application/pdf"; ".mp4"="video/mp4"; ".png"="image/png"; ".jpg"="image/jpeg" }
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$Port/")
$l.Start()
Write-Host "Serving $root on http://localhost:$Port/"
while ($l.IsListening) {
  $ctx = $l.GetContext()
  $res = $ctx.Response
  try {
    $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
    if ($path -eq "") { $path = "index.html" }
    $file = Join-Path $root $path
    if (-not ((Test-Path $file -PathType Leaf) -and ((Resolve-Path $file).Path.StartsWith($root)))) { $res.StatusCode = 404; continue }
    $ext = [IO.Path]::GetExtension($file).ToLower()
    $res.ContentType = $(if ($types[$ext]) { $types[$ext] } else { "application/octet-stream" })
    $res.AddHeader("Accept-Ranges", "bytes")
    $fs = [IO.File]::Open($file, 'Open', 'Read', 'Read')
    try {
      $len = $fs.Length; $start = 0; $end = $len - 1
      $range = $ctx.Request.Headers["Range"]
      if ($range -match '^bytes=(\d*)-(\d*)$') {
        if ($matches[1] -ne "") { $start = [int64]$matches[1] }
        if ($matches[2] -ne "") { $end = [Math]::Min([int64]$matches[2], $len - 1) } elseif ($matches[1] -eq "") { $start = $len - [int64]$matches[2] }
        $res.StatusCode = 206
        $res.AddHeader("Content-Range", "bytes $start-$end/$len")
      }
      $res.ContentLength64 = $end - $start + 1
      $fs.Position = $start
      $buf = New-Object byte[] 262144
      $left = $end - $start + 1
      while ($left -gt 0) {
        $n = $fs.Read($buf, 0, [int][Math]::Min($buf.Length, $left))
        if ($n -le 0) { break }
        $res.OutputStream.Write($buf, 0, $n)
        $left -= $n
      }
    } finally { $fs.Close() }
  } catch {
    # le navigateur coupe souvent la connexion en avançant dans une vidéo : on ignore
  } finally {
    try { $res.Close() } catch {}
  }
}
