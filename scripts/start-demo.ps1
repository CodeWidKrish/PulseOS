# Starts PulseOS locally for a demo: API on :8100, website on :3000, then opens Chrome.
# (Port 8100 avoids clashing with other local projects that use 8000.)
# Usage (from the repo root):  powershell -ExecutionPolicy Bypass -File scripts/start-demo.ps1 [-Rebuild]
param([switch]$Rebuild, [int]$ApiPort = 8100)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$api = Join-Path $root "api"
$web = Join-Path $root "web"

if (-not (Test-Path (Join-Path $api ".env"))) {
    Write-Host "api/.env is missing. Copy .env.example to api/.env and set DATABASE_URL (SQLite works: sqlite+aiosqlite:///./pulseos-demo.db)." -ForegroundColor Red
    exit 1
}

# 1. Database: create tables and synthetic demo data (skips if already seeded)
Push-Location $api
python -m app.core.seed
Pop-Location

# 2. API
Start-Process powershell -WorkingDirectory $api -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle='PulseOS API :$ApiPort'; python -m uvicorn app.main:app --port $ApiPort"

# 3. Website (production build for a smooth demo)
if ($Rebuild -or -not (Test-Path (Join-Path $web ".next\BUILD_ID"))) {
    Push-Location $web
    $env:NEXT_PUBLIC_API_URL = "http://localhost:$ApiPort"
    npm run build
    Pop-Location
}
Start-Process powershell -WorkingDirectory $web -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle='PulseOS web :3000'; npx next start -p 3000"

# 4. Wait for both, then open Chrome
foreach ($url in "http://localhost:$ApiPort/api/v1/health", "http://localhost:3000/") {
    for ($i = 0; $i -lt 60; $i++) {
        try { Invoke-WebRequest $url -UseBasicParsing -TimeoutSec 2 | Out-Null; break } catch { Start-Sleep -Seconds 1 }
    }
}
$chrome = @("$env:ProgramFiles\Google\Chrome\Application\chrome.exe", "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe", "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
if ($chrome) { Start-Process $chrome "http://localhost:3000" } else { Start-Process "http://localhost:3000" }
Write-Host "PulseOS is running: http://localhost:3000  (close the two PowerShell windows to stop it)" -ForegroundColor Green
