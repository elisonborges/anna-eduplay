# AnnA Stop Arena Host — preparação opcional do Node.js portátil para Windows x64.
# Executar apenas uma vez COM internet. A partida LAN depois não usa internet.
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$target = Join-Path $root 'runtime'
$temp = Join-Path ([System.IO.Path]::GetTempPath()) ('anna-stop-host-' + [guid]::NewGuid())
try {
  New-Item -ItemType Directory -Path $temp -Force | Out-Null
  New-Item -ItemType Directory -Path $target -Force | Out-Null
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  Write-Host 'Consultando a versão LTS do Node.js...'
  $versions = Invoke-RestMethod 'https://nodejs.org/dist/index.json'
  $release = $versions | Where-Object { $_.version -match '^v26\.' -and $_.lts } | Select-Object -First 1
  if (-not $release) { throw 'Não foi encontrada versão Node 26 LTS disponível.' }
  $name = 'node-' + $release.version + '-win-x64'
  $zipName = $name + '.zip'
  $base = 'https://nodejs.org/dist/' + $release.version + '/'
  $zip = Join-Path $temp $zipName
  $sumFile = Join-Path $temp 'SHASUMS256.txt'
  Write-Host ('Baixando runtime oficial: ' + $release.version)
  Invoke-WebRequest -Uri ($base + $zipName) -OutFile $zip -UseBasicParsing
  Invoke-WebRequest -Uri ($base + 'SHASUMS256.txt') -OutFile $sumFile -UseBasicParsing
  $sum = Get-Content $sumFile | Where-Object { $_ -match ([regex]::Escape($zipName) + '$') } | Select-Object -First 1
  if (-not $sum) { throw 'Checksum oficial não encontrado.' }
  $expected = ($sum -split '\s+')[0].ToLowerInvariant()
  $actual = (Get-FileHash -Path $zip -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($expected -ne $actual) { throw 'Checksum do download inválido: arquivo não confiável.' }
  Expand-Archive -Path $zip -DestinationPath $temp -Force
  $exe = Join-Path (Join-Path $temp $name) 'node.exe'
  if (-not (Test-Path $exe)) { throw 'node.exe ausente no arquivo oficial.' }
  Copy-Item $exe (Join-Path $target 'node.exe') -Force
  Write-Host ('Concluído! Runtime: ' + (Join-Path $target 'node.exe')) -ForegroundColor Green
  Write-Host 'Agora abra Iniciar-Stop-Arena-LAN.cmd. Não será preciso internet para jogar.'
} finally {
  Remove-Item -LiteralPath $temp -Force -Recurse -ErrorAction SilentlyContinue
}
