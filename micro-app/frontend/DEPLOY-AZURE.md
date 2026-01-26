# Guía de Despliegue en Azure - Frontend Angular

## Optimizaciones Implementadas

### 1. Configuración de Producción

#### Environment (environment.prod.ts)
- ✅ API URL relativa (`/api`) para despliegue conjunto con backend
- ✅ Logs de desarrollo deshabilitados
- ✅ Timeouts HTTP configurados (30 segundos)
- ✅ Variables de versión para tracking

#### Angular.json
- ✅ `fileReplacements`: Reemplazo automático de environment en build de producción
- ✅ `optimization: true`: Minificación y tree-shaking habilitados
- ✅ `outputHashing: all`: Cache busting para todos los archivos
- ✅ `sourceMap: false`: Source maps deshabilitados en producción
- ✅ `extractLicenses: true`: Extracción de licencias
- ✅ Budgets ajustados (1MB initial, 2MB error)

### 2. Interceptores HTTP

#### Error Interceptor (nuevo)
- ✅ Retry automático con backoff exponencial (1s, 2s, 4s)
- ✅ Máximo 2 reintentos para errores recuperables
- ✅ Manejo inteligente de errores:
  - Reintentar: errores de red (0), timeouts (408), rate limiting (429), errores de servidor (5xx)
  - No reintentar: errores de cliente (4xx), autenticación (401), permisos (403)
- ✅ Mensajes de error amigables para el usuario
- ✅ Logging condicional (solo en desarrollo)

#### Auth Interceptor (existente)
- ✅ Inyección automática de token JWT
- ✅ Redirección a login en errores 401

### 3. Optimizaciones de UI

#### index.html
- ✅ Título corregido (eliminado "p" extra)
- ✅ Meta tags completos para SEO
- ✅ Headers de seguridad (X-UA-Compatible, CSP)
- ✅ PWA meta tags para instalación en móviles
- ✅ Preconnect optimizado para Google Fonts
- ✅ Loading spinner inicial para mejor UX
- ✅ Viewport optimizado (max-scale=5 en lugar de 1)

### 4. Scripts NPM Optimizados

```json
{
  "build:prod": "ng build --configuration production",
  "build:stats": "ng build --configuration production --stats-json",
  "analyze": "webpack-bundle-analyzer dist/micro-app/stats.json",
  "test:ci": "ng test --watch=false --browsers=ChromeHeadless --code-coverage",
  "serve:prod": "ng serve --configuration production"
}
```

### 5. Archivos de Configuración

#### .browserslistrc
Define navegadores soportados para optimización de build:
- Últimas 2 versiones de navegadores modernos
- Navegadores con >1% de uso global
- iOS Safari >= 12
- Excluye IE11 y navegadores obsoletos

#### web.config
Configuración para IIS en Azure App Service:
- ✅ URL Rewrite para Angular routing (SPA)
- ✅ Compresión HTTP (gzip)
- ✅ Headers de seguridad (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- ✅ Cache agresivo para assets (1 año)
- ✅ No-cache para index.html
- ✅ MIME types correctos

#### .dockerignore
Optimiza builds de Docker excluyendo archivos innecesarios

## Pasos para Despliegue en Azure

### Opción 1: Azure App Service (Recomendado para MVP)

#### Pre-requisitos
- Azure CLI instalado
- Cuenta de Azure activa
- Resource Group creado

#### 1. Build de Producción
```bash
cd frontend
npm run build:prod
```

El build genera los archivos optimizados en `dist/micro-app/browser/`

#### 2. Crear App Service
```bash
# Login a Azure
az login

# Crear App Service Plan (si no existe)
az appservice plan create \
  --name finanzia-plan \
  --resource-group finanzia-rg \
  --sku B1 \
  --is-linux

# Crear Web App
az webapp create \
  --name finanzia-app \
  --resource-group finanzia-rg \
  --plan finanzia-plan \
  --runtime "NODE|18-lts"
```

#### 3. Configurar Variables de Entorno (Opcional)
```bash
az webapp config appsettings set \
  --name finanzia-app \
  --resource-group finanzia-rg \
  --settings API_URL="/api"
```

#### 4. Desplegar
```bash
# Opción A: Deploy desde carpeta dist
cd dist/micro-app/browser
zip -r deploy.zip .
az webapp deployment source config-zip \
  --name finanzia-app \
  --resource-group finanzia-rg \
  --src deploy.zip

# Opción B: Deploy desde Git (recomendado para CI/CD)
# Configurar repositorio Git
az webapp deployment source config \
  --name finanzia-app \
  --resource-group finanzia-rg \
  --repo-url https://github.com/tu-repo/finanzia \
  --branch main \
  --manual-integration
```

### Opción 2: Azure Static Web Apps (Ideal para SPAs)

#### 1. Crear Static Web App
```bash
az staticwebapp create \
  --name finanzia-static \
  --resource-group finanzia-rg \
  --location "Central US" \
  --source https://github.com/tu-repo/finanzia \
  --branch main \
  --app-location "/frontend" \
  --output-location "dist/micro-app/browser"
```

#### 2. Configurar archivo `staticwebapp.config.json`
Crear en `frontend/`:
```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*", "/*.{css,scss,js,png,jpg,jpeg,gif,svg,ico,json,woff,woff2,ttf}"]
  },
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["anonymous"]
    }
  ],
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "X-XSS-Protection": "1; mode=block"
  },
  "mimeTypes": {
    ".json": "application/json",
    ".woff": "application/font-woff",
    ".woff2": "application/font-woff2"
  }
}
```

### Opción 3: Azure DevOps Pipeline (CI/CD)

Crear archivo `azure-pipelines.yml` en la raíz del repositorio:

```yaml
trigger:
  branches:
    include:
      - main
  paths:
    include:
      - frontend/*

pool:
  vmImage: 'ubuntu-latest'

variables:
  nodeVersion: '18.x'

stages:
- stage: Build
  displayName: 'Build Frontend'
  jobs:
  - job: BuildJob
    displayName: 'Build Angular App'
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: $(nodeVersion)
      displayName: 'Install Node.js'

    - script: |
        cd frontend
        npm ci
      displayName: 'Install dependencies'

    - script: |
        cd frontend
        npm run build:prod
      displayName: 'Build production'

    - task: CopyFiles@2
      inputs:
        sourceFolder: 'frontend/dist/micro-app/browser'
        contents: '**'
        targetFolder: '$(Build.ArtifactStagingDirectory)'
      displayName: 'Copy build files'

    - task: PublishBuildArtifacts@1
      inputs:
        pathToPublish: '$(Build.ArtifactStagingDirectory)'
        artifactName: 'frontend-drop'
      displayName: 'Publish artifacts'

- stage: Deploy
  displayName: 'Deploy to Azure'
  dependsOn: Build
  condition: succeeded()
  jobs:
  - deployment: DeployWeb
    displayName: 'Deploy to App Service'
    environment: 'production'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureWebApp@1
            inputs:
              azureSubscription: 'Azure-Subscription-Connection'
              appType: 'webApp'
              appName: 'finanzia-app'
              package: '$(Pipeline.Workspace)/frontend-drop'
```

## Verificación Post-Despliegue

### 1. Verificar que la aplicación carga
```bash
curl -I https://finanzia-app.azurewebsites.net
```

### 2. Verificar routing de Angular
```bash
curl -I https://finanzia-app.azurewebsites.net/clientes
# Debe devolver 200 OK, no 404
```

### 3. Verificar compresión
```bash
curl -I -H "Accept-Encoding: gzip" https://finanzia-app.azurewebsites.net
# Debe incluir header: Content-Encoding: gzip
```

### 4. Verificar headers de seguridad
```bash
curl -I https://finanzia-app.azurewebsites.net
# Verificar: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
```

### 5. Análisis de Bundle (local)
```bash
npm run build:stats
npm run analyze
# Abre visualización de webpack-bundle-analyzer
# Identifica oportunidades de optimización adicional
```

## Monitoreo y Logs

### Ver logs en tiempo real
```bash
az webapp log tail \
  --name finanzia-app \
  --resource-group finanzia-rg
```

### Habilitar Application Insights
```bash
az monitor app-insights component create \
  --app finanzia-insights \
  --location centralus \
  --resource-group finanzia-rg

# Conectar a la Web App
az webapp config appsettings set \
  --name finanzia-app \
  --resource-group finanzia-rg \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY=<key>
```

## Troubleshooting

### La aplicación muestra página en blanco
1. Verificar que `web.config` está en la carpeta dist
2. Verificar logs: `az webapp log tail`
3. Verificar que `base href="/"` en index.html

### Errores 404 en rutas de Angular
1. Verificar que URL Rewrite está configurado en `web.config`
2. Para Azure Static Web Apps, verificar `staticwebapp.config.json`

### API no responde
1. Verificar que `apiUrl` en environment.prod.ts es correcto
2. Si backend está en otro dominio, verificar CORS
3. Verificar logs del backend

### Bundle muy grande
1. Ejecutar `npm run analyze` para identificar módulos pesados
2. Verificar que lazy loading está activo
3. Considerar eliminar dependencias no utilizadas

## Optimizaciones Adicionales (Futuro)

### PWA (Progressive Web App)
```bash
ng add @angular/pwa
```

### Prerendering/SSR
```bash
ng add @angular/ssr
```

### CDN para Assets
- Subir assets estáticos a Azure CDN
- Actualizar referencias en angular.json

### Compresión Brotli
- Habilitar en Azure App Service para mejor compresión que gzip

## Recursos

- [Azure App Service Docs](https://docs.microsoft.com/azure/app-service/)
- [Azure Static Web Apps](https://docs.microsoft.com/azure/static-web-apps/)
- [Angular Deployment Guide](https://angular.io/guide/deployment)
- [Angular Build Optimization](https://angular.io/guide/build)
