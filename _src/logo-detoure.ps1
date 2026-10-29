# Détoure le portrait de Mamie (assets/mamie.webp) : retire le fond crème, l'étoile rouge et la trame,
# garde la silhouette avec son liseré de papier déchiré. Produit des PNG transparents :
# assets/mamie-logo-1080.png (original transparent, pour les visuels), puis mamie-logo-480.webp (accueil) et mamie-logo-192.webp (logo du site).
# Usage (Windows + Edge) : powershell -ExecutionPolicy Bypass -File _src/logo-detoure.ps1
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
$site = Split-Path $PSScriptRoot -Parent
$tmp = Join-Path $env:TEMP "mamie-detour"; New-Item -ItemType Directory -Force $tmp | Out-Null

# 1. Image en pleine définition (Edge sait lire le WebP, System.Drawing non).
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$src = "file:///" + ((Join-Path $site "assets\mamie.webp") -replace '\\', '/')
$html = Join-Path $tmp "m.html"
[IO.File]::WriteAllText($html, "<!doctype html><html><body style='margin:0;overflow:hidden'><img src='$src' style='display:block;width:1080px;height:1080px'></body></html>")
$png = Join-Path $tmp "mamie-1080.png"
$p = Start-Process $edge -ArgumentList @("--headless=new", "--disable-gpu", "--no-first-run", "--user-data-dir=`"$tmp\prof`"", "--hide-scrollbars", "--force-device-scale-factor=1", "--window-size=1080,1080", "--screenshot=`"$png`"", "`"file:///$($html -replace '\\', '/')`"") -PassThru -WindowStyle Hidden
$p.WaitForExit(30000) | Out-Null

# 2. Détourage : remplissage depuis les bords sur ce qui ressemble au fond (crème jaunâtre, rouge de l'étoile).
#    Le liseré blanc neutre et la capuche noire arrêtent le remplissage. On garde ensuite la plus grande forme.
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System; using System.Collections.Generic; using System.Drawing; using System.Drawing.Imaging;
public static class Detoure {
  static bool Fond(int r, int g, int b) {
    int lum = (r * 3 + g * 6 + b) / 10;
    bool creme = (r - b) >= 14 && lum > 140 && Math.Abs(r - g) < 40;   // papier crème jaunâtre et ses ombres
    bool rouge = r > g + 50 && r > b + 50;                              // étoile rouge
    return creme || rouge;
  }
  public static Bitmap Run(Bitmap src) {
    int w = src.Width, h = src.Height;
    var bmp = src.Clone(new Rectangle(0, 0, w, h), PixelFormat.Format32bppArgb);
    var d = bmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
    var px = new byte[w * h * 4]; System.Runtime.InteropServices.Marshal.Copy(d.Scan0, px, 0, px.Length);
    var fond = new bool[w * h]; var q = new Queue<int>();
    Action<int> essai = (i) => { if (fond[i]) return; int o = i * 4; if (Fond(px[o + 2], px[o + 1], px[o])) { fond[i] = true; q.Enqueue(i); } };
    for (int x = 0; x < w; x++) { essai(x); }                       // haut
    for (int y = 0; y < h; y++) { essai(y * w); essai(y * w + w - 1); } // côtés (le bas est coupé par le cadre)
    while (q.Count > 0) { int i = q.Dequeue(); int x = i % w, y = i / w;
      if (x > 0) essai(i - 1); if (x < w - 1) essai(i + 1); if (y > 0) essai(i - w); if (y < h - 1) essai(i + w); }
    // Plus grande zone restante = Mamie ; les petits points de trame isolés sur le fond disparaissent.
    var zone = new int[w * h]; int n = 0, best = 0, bestSize = 0;
    for (int s = 0; s < w * h; s++) {
      if (fond[s] || zone[s] != 0) continue; n++; int size = 0; q.Enqueue(s); zone[s] = n;
      while (q.Count > 0) { int i = q.Dequeue(); size++; int x = i % w, y = i / w;
        foreach (int j in new[] { x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1 })
          if (j >= 0 && !fond[j] && zone[j] == 0) { zone[j] = n; q.Enqueue(j); } }
      if (size > bestSize) { bestSize = size; best = n; } }
    for (int i = 0; i < w * h; i++) if (zone[i] != best) px[i * 4 + 3] = 0;
    // Morceaux d'étoile rouge coincés dans la silhouette (entre le bras et la capuche) : grandes zones rouges seulement,
    // pour garder les petites joues roses.
    var vu = new bool[w * h]; var lot = new List<int>();
    for (int s = 0; s < w * h; s++) {
      int o = s * 4; if (vu[s] || px[o + 3] == 0 || !(px[o + 2] > px[o + 1] + 50 && px[o + 2] > px[o] + 50)) continue;
      lot.Clear(); q.Enqueue(s); vu[s] = true;
      while (q.Count > 0) { int i = q.Dequeue(); lot.Add(i); int x = i % w, y = i / w;
        foreach (int j in new[] { x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1 }) {
          if (j < 0 || vu[j]) continue; int k = j * 4;
          if (px[k + 3] != 0 && px[k + 2] > px[k + 1] + 50 && px[k + 2] > px[k] + 50) { vu[j] = true; q.Enqueue(j); } } }
      if (lot.Count > 5000) foreach (int i in lot) px[i * 4 + 3] = 0; }
    System.Runtime.InteropServices.Marshal.Copy(px, 0, d.Scan0, px.Length); bmp.UnlockBits(d);
    return bmp;
  }
}
"@
$img = [Drawing.Bitmap]::FromFile($png)
$out = [Detoure]::Run($img); $img.Dispose()
$f1080 = Join-Path $site "assets\mamie-logo-1080.png"
$out.Save($f1080, [Drawing.Imaging.ImageFormat]::Png); $out.Dispose()
Write-Host "mamie-logo-1080.png : $([Math]::Round((Get-Item $f1080).Length / 1KB)) Ko (original transparent, pour les visuels)"

# 3. Versions légères en WebP transparent pour le site (Edge sait l'écrire, System.Drawing non).
foreach ($s in 480, 192) {
  $h = Join-Path $tmp "w$s.html"
  [IO.File]::WriteAllText($h, "<!doctype html><html><body><script>const i=new Image();i.onload=()=>{const c=document.createElement('canvas');c.width=$s;c.height=$s;const g=c.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(i,0,0,$s,$s);document.body.textContent='WEBP:'+c.toDataURL('image/webp',0.86)+':FIN';};i.src='file:///$($f1080 -replace '\\', '/')';</script></body></html>")
  $dom = & $edge --headless=new --disable-gpu --no-first-run "--user-data-dir=$tmp\prof2" --allow-file-access-from-files --virtual-time-budget=5000 --dump-dom "file:///$($h -replace '\\', '/')" 2>$null | Out-String
  $m = [regex]::Match($dom, 'WEBP:data:image/webp;base64,([A-Za-z0-9+/=]+):FIN')
  if (-not $m.Success) { throw "Conversion WebP $s impossible" }
  $f = Join-Path $site "assets\mamie-logo-$s.webp"
  [IO.File]::WriteAllBytes($f, [Convert]::FromBase64String($m.Groups[1].Value))
  Write-Host "mamie-logo-$s.webp : $([Math]::Round((Get-Item $f).Length / 1KB)) Ko"
}