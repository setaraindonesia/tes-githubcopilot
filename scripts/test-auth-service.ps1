# PowerShell script untuk test auth service
Write-Host "🧪 Testing Auth Service Endpoints..." -ForegroundColor Green

$baseUrl = "http://localhost:3001/api/v1/auth"

Write-Host "🔍 Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ Health Check: " -ForegroundColor Green -NoNewline
    Write-Host ($response | ConvertTo-Json)
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "👤 Testing User Registration..." -ForegroundColor Yellow

$registerData = @{
    username = "testuser123"
    email = "test@setaradapps.com"
    password = "password123"
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/register" -Method POST -Body $registerData -ContentType "application/json"
    Write-Host "✅ Registration: " -ForegroundColor Green -NoNewline  
    Write-Host ($response | ConvertTo-Json)
} catch {
    Write-Host "❌ Registration Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔐 Testing User Login..." -ForegroundColor Yellow

$loginData = @{
    username = "testuser123"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login: " -ForegroundColor Green -NoNewline
    Write-Host ($response | ConvertTo-Json)
    
    $token = $response.token
    
    if ($token) {
        Write-Host ""
        Write-Host "🔑 Testing Protected Endpoint..." -ForegroundColor Yellow
        
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        try {
            $profileResponse = Invoke-RestMethod -Uri "$baseUrl/profile" -Method GET -Headers $headers
            Write-Host "✅ Protected Profile Endpoint: " -ForegroundColor Green -NoNewline
            Write-Host ($profileResponse | ConvertTo-Json)
        } catch {
            Write-Host "❌ Protected Endpoint Failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
} catch {
    Write-Host "❌ Login Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Testing Complete!" -ForegroundColor Green
