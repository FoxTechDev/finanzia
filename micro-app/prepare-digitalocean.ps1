# Script de preparación para despliegue en Digital Ocean
# Ejecutar: .\prepare-digitalocean.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Preparando despliegue a Digital Ocean" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en la carpeta correcta
if (-not (Test-Path ".\micro-app")) {
    Write-Host "Error: Ejecutar desde la carpeta raiz del proyecto (MICRO)" -ForegroundColor Red
    exit 1
}

Set-Location ".\micro-app"

# 1. Verificar archivos necesarios
Write-Host "[1/5] Verificando archivos de configuracion..." -ForegroundColor Yellow

$requiredFiles = @(
    "backend\Dockerfile",
    "frontend\Dockerfile",
    "frontend\nginx.conf",
    ".do\app.yaml"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "Error: Faltan archivos:" -ForegroundColor Red
    $missingFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    exit 1
}
Write-Host "  OK - Todos los archivos de configuracion existen" -ForegroundColor Green

# 2. Verificar que el build del backend funciona
Write-Host ""
Write-Host "[2/5] Verificando build del backend..." -ForegroundColor Yellow
Set-Location "backend"

if (-not (Test-Path "node_modules")) {
    Write-Host "  Instalando dependencias del backend..." -ForegroundColor Gray
    npm ci --silent
}

Write-Host "  Compilando backend..." -ForegroundColor Gray
$buildResult = npm run build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: El build del backend fallo" -ForegroundColor Red
    Write-Host $buildResult -ForegroundColor Red
    exit 1
}
Write-Host "  OK - Backend compila correctamente" -ForegroundColor Green

Set-Location ".."

# 3. Verificar que el build del frontend funciona
Write-Host ""
Write-Host "[3/5] Verificando build del frontend..." -ForegroundColor Yellow
Set-Location "frontend"

if (-not (Test-Path "node_modules")) {
    Write-Host "  Instalando dependencias del frontend..." -ForegroundColor Gray
    npm ci --silent
}

Write-Host "  Compilando frontend (esto puede tardar)..." -ForegroundColor Gray
$buildResult = npm run build:prod 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: El build del frontend fallo" -ForegroundColor Red
    Write-Host $buildResult -ForegroundColor Red
    exit 1
}
Write-Host "  OK - Frontend compila correctamente" -ForegroundColor Green

Set-Location ".."

# 4. Verificar Docker (opcional)
Write-Host ""
Write-Host "[4/5] Verificando Docker (opcional)..." -ForegroundColor Yellow

$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
if ($dockerInstalled) {
    Write-Host "  Docker encontrado, probando build del backend..." -ForegroundColor Gray
    docker build -t finanzia-backend-test ./backend --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK - Docker build del backend exitoso" -ForegroundColor Green
        docker rmi finanzia-backend-test --force 2>$null
    } else {
        Write-Host "  Advertencia: Docker build fallo (no es critico)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  Docker no instalado - saltando prueba local de contenedores" -ForegroundColor Gray
}

# 5. Recordatorio de configuración
Write-Host ""
Write-Host "[5/5] Checklist antes de desplegar:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  [ ] Codigo subido a GitHub/GitLab" -ForegroundColor White
Write-Host "  [ ] Cuenta de Digital Ocean creada" -ForegroundColor White
Write-Host "  [ ] Editar .do/app.yaml con tu repositorio" -ForegroundColor White
Write-Host "  [ ] Generar JWT_SECRET seguro (32+ caracteres)" -ForegroundColor White
Write-Host ""

Set-Location ".."

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Preparacion completada!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Siguiente paso: Seguir DEPLOY-DIGITALOCEAN.md" -ForegroundColor White
Write-Host ""
