# Find My Biz — Supabase Setup Script (Step 3)
param(
    [Parameter(Mandatory = $false)]
    [string]$ProjectRef,

    [Parameter(Mandatory = $false)]
    [switch]$SkipLink
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "`n=== Find My Biz — Supabase Setup (Step 3) ===" -ForegroundColor Green

# Ensure Node in PATH
$nodePath = "C:\Program Files\nodejs"
if (Test-Path $nodePath) {
    $env:Path = "$nodePath;$env:Path"
}

# Check Supabase CLI
$supabase = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabase) {
    Write-Host "Installing Supabase CLI..." -ForegroundColor Yellow
    npm install -g supabase
}

Set-Location $ProjectRoot

if (-not $SkipLink) {
    if (-not $ProjectRef) {
        Write-Host "`nProject ref required. Find it in Supabase Dashboard -> Settings -> General" -ForegroundColor Yellow
        $ProjectRef = Read-Host "Enter your Supabase project ref"
    }

    Write-Host "`nLinking to project $ProjectRef..." -ForegroundColor Cyan
    supabase link --project-ref $ProjectRef
}

Write-Host "`nPushing migrations..." -ForegroundColor Cyan
supabase db push

Write-Host "`nRunning seed data..." -ForegroundColor Cyan
$seedFiles = @(
    "supabase\seed\001_provinces_districts.sql",
    "supabase\seed\002_cities.sql",
    "supabase\seed\003_suburbs.sql",
    "supabase\seed\004_categories.sql"
)

foreach ($file in $seedFiles) {
    Write-Host "  Seeding: $file" -ForegroundColor Gray
    Get-Content $file -Raw | supabase db execute
}

Write-Host "`nVerifying setup..." -ForegroundColor Cyan
$verifySql = @"
SELECT
  (SELECT COUNT(*) FROM provinces) AS provinces,
  (SELECT COUNT(*) FROM cities) AS cities,
  (SELECT COUNT(*) FROM suburbs) AS suburbs,
  (SELECT COUNT(*) FROM categories) AS categories,
  (SELECT COUNT(*) FROM storage.buckets) AS buckets;
"@
$verifySql | supabase db execute

Write-Host "`n=== Setup complete! ===" -ForegroundColor Green
Write-Host "Next: Copy API keys to .env.local (see supabase/SETUP.md)" -ForegroundColor Yellow
Write-Host "  NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Gray
Write-Host "  NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Gray
Write-Host "  SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Gray
