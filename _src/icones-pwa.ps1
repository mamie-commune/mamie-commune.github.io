# Icônes de l'application (site installable) : Mamie détourée (assets/mamie-logo-1080.png) posée sur le papier crème.
# Produit assets/icone-512.png (icône ordinaire) et assets/icone-masquable-192.png / -512.png (icônes « masquables » :
# Mamie plus petite au centre, pour qu'Android puisse découper un rond ou un carré arrondi sans lui couper la tête).
# Usage (Windows) : powershell -ExecutionPolicy Bypass -File _src/icones-pwa.ps1
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
$site = Split-Path $PSScriptRoot -Parent
$logo = [Drawing.Image]::FromFile((Join-Path $site "assets\mamie-logo-1080.png"))
function Icone($taille, $part, $nom) {
  $bmp = New-Object Drawing.Bitmap $taille, $taille
  $g = [Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = "AntiAlias"; $g.InterpolationMode = "HighQualityBicubic"; $g.PixelOffsetMode = "HighQuality"
  $g.Clear([Drawing.Color]::FromArgb(235, 227, 209))   # papier #ebe3d1
  $c = [int]($taille * $part); $x = [int](($taille - $c) / 2)
  $g.DrawImage($logo, $x, $taille - $c, $c, $c)   # le buste touche le bas, comme un portrait
  $g.Dispose(); $bmp.Save((Join-Path $site "assets\$nom"), [Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
}
Icone 512 0.94 "icone-512.png"
Icone 192 0.8 "icone-masquable-192.png"
Icone 512 0.8 "icone-masquable-512.png"
$logo.Dispose()
Write-Host "OK : icônes 512 et masquables créées dans assets/."
