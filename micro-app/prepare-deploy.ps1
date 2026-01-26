# Script de preparación para despliegue en Azure
# Ejecutar desde la carpeta micro-app

Write-Host "=== Preparando paquete de despliegue para Azure ===" -ForegroundColor Cyan

# Limpiar carpeta de despliegue anterior
$deployPath = ".\deploy"
if (Test-Path $deployPath) {
    Remove-Item -Recurse -Force $deployPath
}
New-Item -ItemType Directory -Path $deployPath | Out-Null

Write-Host "1. Compilando Frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build -- --configuration production
Set-Location ..

Write-Host "2. Compilando Backend..." -ForegroundColor Yellow
Set-Location backend
npm run build
Set-Location ..

Write-Host "3. Copiando archivos del Backend..." -ForegroundColor Yellow
# Copiar dist del backend
Copy-Item -Recurse "backend\dist" "$deployPath\dist"
# Copiar package.json y package-lock.json
Copy-Item "backend\package.json" "$deployPath\"
Copy-Item "backend\package-lock.json" "$deployPath\"

Write-Host "4. Copiando archivos del Frontend a public..." -ForegroundColor Yellow
# Crear carpeta public y copiar el frontend compilado
New-Item -ItemType Directory -Path "$deployPath\public" | Out-Null
Copy-Item -Recurse "frontend\dist\micro-app\browser\*" "$deployPath\public\"

Write-Host "5. Creando archivo web.config para Azure..." -ForegroundColor Yellow
$webConfig = @'
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="dist/main.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^dist/main.js\/debug[\/]?" />
        </rule>
        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}"/>
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="dist/main.js"/>
        </rule>
      </rules>
    </rewrite>
    <iisnode node_env="production" watchedFiles="web.config;*.js"/>
  </system.webServer>
</configuration>
'@
$webConfig | Out-File -FilePath "$deployPath\web.config" -Encoding UTF8

Write-Host "6. Creando archivo .deployment..." -ForegroundColor Yellow
$deployment = @'
[config]
command = deploy.cmd
'@
$deployment | Out-File -FilePath "$deployPath\.deployment" -Encoding UTF8

Write-Host "7. Creando script de despliegue deploy.cmd..." -ForegroundColor Yellow
$deployCmd = @'
@echo off
echo Installing production dependencies...
call npm ci --only=production
echo Deployment complete!
'@
$deployCmd | Out-File -FilePath "$deployPath\deploy.cmd" -Encoding UTF8

Write-Host ""
Write-Host "=== Paquete de despliegue listo en ./deploy ===" -ForegroundColor Green
Write-Host ""
Write-Host "Contenido del paquete:" -ForegroundColor Cyan
Get-ChildItem $deployPath -Recurse | Where-Object { -not $_.PSIsContainer } | Select-Object -First 20

Write-Host ""
Write-Host "Para desplegar en Azure:" -ForegroundColor Yellow
Write-Host "1. az webapp up --name <nombre-app> --resource-group <grupo> --runtime 'NODE:20-lts'" -ForegroundColor White
Write-Host "2. O usa VS Code con la extension de Azure App Service" -ForegroundColor White
