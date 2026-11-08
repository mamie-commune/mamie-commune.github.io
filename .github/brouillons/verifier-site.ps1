# Tests automatiques d'un dossier proposé, sur Windows (le générateur exige PowerShell 5.1).
# À lancer à la racine d'un checkout de main sur lequel le correctif a été appliqué.
# Usage : powershell -ExecutionPolicy Bypass -File verifier-site.ps1 -Garde <garde.json> -Sortie <dossier>
param([Parameter(Mandatory = $true)][string]$Garde, [Parameter(Mandatory = $true)][string]$Sortie)
$ErrorActionPreference = "Continue"
New-Item -ItemType Directory -Force $Sortie | Out-Null
$g = Get-Content $Garde -Raw -Encoding UTF8 | ConvertFrom-Json
$tests = New-Object System.Collections.ArrayList
function Ajouter($nom, $ok, $detail, $bloquant = $true) { [void]$tests.Add([ordered]@{ nom = $nom; ok = [bool]$ok; bloquant = $bloquant; detail = "$detail" }) }

# 1. Génération du site
$sortieBuild = (& powershell -NoProfile -ExecutionPolicy Bypass -File _src/build.ps1 *>&1 | Out-String).Trim()
$okBuild = ($LASTEXITCODE -eq 0) -and ($sortieBuild -match '(?m)^OK :')
Ajouter "Génération du site (_src/build.ps1)" $okBuild ($sortieBuild -split "`n" | Select-Object -Last 15 | Out-String).Trim()
$alertesEncy = @($sortieBuild -split "`n" | Where-Object { $_ -match 'Encyclop' -and $_ -match 'AVERTISSEMENT|WARNING' })
Ajouter "Aucun avertissement du générateur sur l'encyclopédie" ($alertesEncy.Count -eq 0) (($alertesEncy | Out-String).Trim())

# 2. Pages du dossier générées
$manquantes = @($g.pages | Where-Object { -not (Test-Path "encyclopedie/$_.html") })
Ajouter "Pages du dossier générées dans encyclopedie/" ($g.pages.Count -gt 0 -and $manquantes.Count -eq 0) $(if ($manquantes.Count) { "Manquantes : $($manquantes -join ', ')" } else { "$($g.pages.Count) page(s) : $($g.pages -join ', ')" })

# 3. Liens internes (les 4 films hébergés hors du dépôt sont connus et ignorés)
$liens = (& node _src/rapports/robot/liens.js . 2>&1 | Out-String)
$casses = @($liens -split "`n" | Where-Object { $_ -match '^\s+\S.* -> ' -and $_ -notmatch 'films/' } | ForEach-Object { $_.Trim() })
Ajouter "Liens internes" ($LASTEXITCODE -eq 0 -and $casses.Count -eq 0) $(if ($casses.Count) { ($casses | Select-Object -First 30) -join "`n" } else { ($liens -split "`n")[0].Trim() })

# 4. Aucun fichier existant supprimé ni vidé
$supprimes = @(git status --porcelain | Where-Object { $_ -match '^( D|D |DD)' })
$vides = @(git diff --numstat | ForEach-Object { $c = $_ -split "`t"; if ($c[0] -eq '0' -and [int]$c[1] -gt 20 -and (Test-Path $c[2]) -and (Get-Item $c[2]).Length -lt 200) { $c[2] } })
Ajouter "Aucune page existante supprimée ou vidée" ($supprimes.Count -eq 0 -and $vides.Count -eq 0) (($supprimes + $vides) -join "`n")

# 5. Les brouillons ne peuvent pas arriver dans _site
$suivis = @(git ls-files _brouillons-chatgpt)
Ajouter "Aucun brouillon dans la branche proposée" ($suivis.Count -eq 0) ($suivis -join "`n")
$ligne = (Select-String -Path .github/workflows/publier.yml -Pattern 'robocopy \. _site' | Select-Object -First 1).Line
$exclu = $ligne -match '/XD[^/]*_brouillons-chatgpt'
Ajouter "Exclusion des brouillons dans publier.yml de main" $exclu $(if ($exclu) { "Présente." } else { "Absente sur main : elle n'arrivera qu'avec la fusion de contenus-chatgpt (commit 835421d). Sans effet tant que main ne contient aucun brouillon." }) $false

# 6. Simulation de la copie vers _site avec les exclusions réelles, et un brouillon témoin
New-Item -ItemType Directory -Force "_brouillons-chatgpt/dossiers" | Out-Null
Set-Content "_brouillons-chatgpt/dossiers/temoin.md" "témoin" -Encoding UTF8
$xd = ([regex]::Match($ligne, '/XD (.*?) /XF')).Groups[1].Value -split ' '
$xf = ([regex]::Match($ligne, '/XF (.*?) /N')).Groups[1].Value -split ' '
$tmp = Join-Path $env:RUNNER_TEMP "simulation-site"
$liste = (& robocopy . $tmp /E /L /XD @xd /XF @xf /NJH /NJS /NP /NDL /FP | Out-String)
Remove-Item -Recurse -Force "_brouillons-chatgpt"
$fuite = $liste -match '_brouillons-chatgpt'
Ajouter "Simulation de la copie vers _site (brouillon témoin)" (-not $fuite) $(if ($fuite) { "Un brouillon serait copié avec le publier.yml de main." } else { "Aucun brouillon copié." }) $false

$resultat = [ordered]@{ ok = -not ($tests | Where-Object { $_.bloquant -and -not $_.ok }); tests = $tests }
[IO.File]::WriteAllText((Join-Path $Sortie "tests.json"), ($resultat | ConvertTo-Json -Depth 5), (New-Object System.Text.UTF8Encoding $false))
$tests | ForEach-Object { "{0} {1}{2}" -f $(if ($_.ok) { "[réussi]" } elseif ($_.bloquant) { "[ÉCHEC]" } else { "[avertissement]" }), $_.nom, "" }
if (-not $resultat.ok) { Write-Host "Des tests bloquants ont échoué." }
exit 0
