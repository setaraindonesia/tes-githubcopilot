# Railway Services Health Test Script
# Run this after applying non-Docker fix

param(
    [string]$AuthUrl = "",
    [string]$ChatUrl = ""
)

Write-Host "🚀 RAILWAY SERVICES HEALTH CHECK" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan

if (-not $AuthUrl -and -not $ChatUrl) {
    Write-Host "`n📖 USAGE:" -ForegroundColor Yellow
    Write-Host "1. Get URLs from Railway Dashboard:" -ForegroundColor White
    Write-Host "   https://railway.app/project/6462810f-8c5e-42f7-a39c-4226ad83e9a2" -ForegroundColor Cyan
    Write-Host "2. Copy service URLs from Settings → Domains" -ForegroundColor White
    Write-Host "3. Run this script:" -ForegroundColor White
    Write-Host "   .\test-railway-after-fix.ps1 -AuthUrl <auth-url> -ChatUrl <chat-url>" -ForegroundColor Green
    Write-Host "`nExample:" -ForegroundColor Yellow
    Write-Host "   .\test-railway-after-fix.ps1 -AuthUrl 'https://auth-service-production.up.railway.app' -ChatUrl 'https://chat-service-production.up.railway.app'" -ForegroundColor Cyan
    return
}

function Test-Endpoint {
    param([string]$Url, [string]$Name)
    
    if (-not $Url) {
        Write-Host "⏭️  $Name`: URL not provided" -ForegroundColor Yellow
        return $false
    }
    
    try {
        Write-Host "🔍 Testing $Name`: $Url" -ForegroundColor Blue
        $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 15
        Write-Host "✅ $Name`: SUCCESS" -ForegroundColor Green
        Write-Host "   Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
        return $true
    }
    catch {
        Write-Host "❌ $Name`: FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "`n🔍 Testing services..." -ForegroundColor Cyan

$authOk = $false
$chatOk = $false

if ($AuthUrl) {
    $authOk = Test-Endpoint -Url "$AuthUrl/api/v1/health" -Name "Auth Service"
}

if ($ChatUrl) {
    $chatOk = Test-Endpoint -Url "$ChatUrl/api/v1/chat/health" -Name "Chat Service"
}

Write-Host "`n📊 SUMMARY:" -ForegroundColor Yellow
Write-Host "==========" -ForegroundColor Cyan

if ($AuthUrl) {
    if ($authOk) {
        Write-Host "Auth Service: ✅ ONLINE" -ForegroundColor Green
    } else {
        Write-Host "Auth Service: ❌ OFFLINE" -ForegroundColor Red
    }
}

if ($ChatUrl) {
    if ($chatOk) {
        Write-Host "Chat Service: ✅ ONLINE" -ForegroundColor Green
    } else {
        Write-Host "Chat Service: ❌ OFFLINE" -ForegroundColor Red
    }
}

$allOk = ($authOk -or (-not $AuthUrl)) -and ($chatOk -or (-not $ChatUrl))

if ($allOk -and ($AuthUrl -or $ChatUrl)) {
    Write-Host "`n🎉 ALL SERVICES HEALTHY!" -ForegroundColor Green
    Write-Host "`n✅ Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Update Vercel environment variables" -ForegroundColor White
    Write-Host "2. Test end-to-end chat functionality" -ForegroundColor White
    Write-Host "3. Chat app is ready! 🚀" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some services need attention" -ForegroundColor Yellow
    Write-Host "`n🔧 Troubleshooting:" -ForegroundColor Cyan
    Write-Host "1. Check Railway Dashboard deployment logs" -ForegroundColor White
    Write-Host "2. Verify environment variables are set" -ForegroundColor White
    Write-Host "3. Ensure non-Docker settings applied correctly" -ForegroundColor White
}
