#Requires -Version 5.1
<#
.SYNOPSIS
    Publish Auditor.Agent.Desktop as a self-contained single-file EXE to agent/publish/.
.DESCRIPTION
    Run from the repo root:  .\deploy\publish-agent.ps1
    The web app's download endpoint (/api/v1/agent/download) serves
    agent/publish/Auditor.Agent.Desktop.exe — this script produces that file.
.PARAMETER Configuration
    Build configuration. Default: Release.
.PARAMETER SkipClean
    Skip deleting old publish artifacts before building.
#>
param(
    [string]$Configuration = "Release",
    [switch]$SkipClean
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ── Paths ────────────────────────────────────────────────────────────────────
$repoRoot   = Split-Path $PSScriptRoot -Parent
$projectDir = Join-Path $repoRoot "agent\src\Auditor.Agent.Desktop"
$outDir     = Join-Path $repoRoot "agent\publish"
$exeName    = "Auditor.Agent.Desktop.exe"
$exePath    = Join-Path $outDir $exeName

# ── Pre-flight ───────────────────────────────────────────────────────────────
if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    Write-Error ".NET SDK not found. Install from https://dot.net"
}

$sdkVer = (dotnet --version 2>&1)
Write-Host "dotnet SDK: $sdkVer"

if (-not (Test-Path $projectDir)) {
    Write-Error "Project not found: $projectDir"
}

# ── Clean ────────────────────────────────────────────────────────────────────
if (-not $SkipClean -and (Test-Path $outDir)) {
    Write-Host "Cleaning $outDir ..."
    Remove-Item -Recurse -Force $outDir
}

New-Item -ItemType Directory -Force $outDir | Out-Null

# ── Publish ──────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "Publishing $exeName ($Configuration / win-x64 / self-contained) ..."
Write-Host ""

$publishArgs = @(
    "publish", $projectDir,
    "--configuration", $Configuration,
    "--runtime", "win-x64",
    "--self-contained", "true",
    "-p:PublishSingleFile=true",
    "-p:IncludeNativeLibrariesForSelfExtract=true",
    "--output", $outDir,
    "--nologo"
)

& dotnet @publishArgs
if ($LASTEXITCODE -ne 0) {
    Write-Error "dotnet publish failed (exit $LASTEXITCODE)"
}

# ── Verify ───────────────────────────────────────────────────────────────────
if (-not (Test-Path $exePath)) {
    Write-Error "Publish succeeded but $exeName not found in $outDir"
}

$sizeMB = [math]::Round((Get-Item $exePath).Length / 1MB, 1)
Write-Host ""
Write-Host "Published: $exePath  ($sizeMB MB)"
Write-Host ""
Write-Host "Done. Web app will serve the new EXE at /api/v1/agent/download."
