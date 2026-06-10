# Publish the Auditor desktop agent as a self-contained single-file EXE (TZ §21).
#   pwsh deploy/publish-agent.ps1 [-Runtime win-x64] [-Configuration Release]
# Output: agent/publish/Auditor.Agent.Desktop.exe
param(
    [string]$Runtime = "win-x64",
    [string]$Configuration = "Release"
)
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$project = Join-Path $root "src/Auditor.Agent.Desktop/Auditor.Agent.Desktop.csproj"
$outDir = Join-Path $root "publish"

Write-Host "Publishing $Configuration / $Runtime ..." -ForegroundColor Cyan

dotnet publish $project `
    -c $Configuration `
    -r $Runtime `
    --self-contained true `
    -p:PublishSingleFile=true `
    -p:IncludeNativeLibrariesForSelfExtract=true `
    -p:EnableCompressionInSingleFile=true `
    -o $outDir

if ($LASTEXITCODE -ne 0) { throw "publish failed ($LASTEXITCODE)" }
Write-Host "Done → $outDir" -ForegroundColor Green
