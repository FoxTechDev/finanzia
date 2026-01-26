# Checklist de Build y Verificación - Frontend

## Pre-Build

### 1. Verificar que el código está limpio
```bash
# Ejecutar linter
npm run lint

# Si hay errores, corregirlos antes de continuar
```

### 2. Ejecutar tests
```bash
# Tests unitarios
npm test

# Tests para CI (sin watch)
npm run test:ci
```

### 3. Limpiar builds anteriores
```bash
# Windows
rmdir /s /q dist
rmdir /s /q .angular

# Linux/Mac
rm -rf dist .angular
```

---

## Build de Producción

### 1. Build básico
```bash
npm run build:prod
```

**Output esperado:**
- Carpeta: `dist/micro-app/browser/`
- Archivos generados:
  - `index.html`
  - `main-[hash].js`
  - `polyfills-[hash].js`
  - `styles-[hash].css`
  - `web.config`
  - `staticwebapp.config.json`
  - Carpeta `assets/`

### 2. Verificar tamaño del bundle
```bash
# Generar estadísticas
npm run build:stats

# Analizar (requiere: npm install -D webpack-bundle-analyzer)
npm run analyze
```

**Tamaños esperados:**
- Initial bundle: ~800KB - 1MB (gzipped: ~250-350KB)
- Lazy chunks: ~50-200KB cada uno

**Red flags:**
- Bundle inicial > 2MB
- Chunks individuales > 500KB
- Dependencias duplicadas
- Librerías completas en lugar de tree-shaken

---

## Verificación Post-Build

### 1. Verificar que los archivos de configuración están presentes
```bash
# Windows
dir dist\micro-app\browser\web.config
dir dist\micro-app\browser\staticwebapp.config.json

# Linux/Mac
ls -la dist/micro-app/browser/web.config
ls -la dist/micro-app/browser/staticwebapp.config.json
```

**Resultado esperado:** Ambos archivos deben existir

### 2. Verificar que el environment es producción
```bash
# Buscar en el bundle si production está en true
# Windows
findstr /C:"production" dist\micro-app\browser\main*.js

# Linux/Mac
grep -r "production" dist/micro-app/browser/main*.js
```

**Resultado esperado:** Debe encontrar `production:!0` o `production:true`

### 3. Verificar output hashing
```bash
# Listar archivos JS
# Windows
dir dist\micro-app\browser\*.js

# Linux/Mac
ls -la dist/micro-app/browser/*.js
```

**Resultado esperado:**
- Todos los archivos deben tener hash: `main-ABC123.js`
- NO debe haber archivos sin hash: `main.js`

### 4. Verificar que no hay source maps
```bash
# Windows
dir dist\micro-app\browser\*.map

# Linux/Mac
ls -la dist/micro-app/browser/*.map
```

**Resultado esperado:** No debe haber archivos `.map` en producción

---

## Testing Local del Build

### Opción 1: Servidor HTTP simple
```bash
# Instalar servidor HTTP global (si no lo tienes)
npm install -g http-server

# Servir desde dist
cd dist/micro-app/browser
http-server -p 8080 -c-1

# Abrir: http://localhost:8080
```

### Opción 2: Angular serve en modo producción
```bash
npm run serve:prod
# Abrir: http://localhost:4200
```

### Opción 3: Live Server (VS Code)
1. Instalar extensión "Live Server"
2. Click derecho en `dist/micro-app/browser/index.html`
3. Seleccionar "Open with Live Server"

---

## Checklist de Funcionalidad

### 1. Verificar routing
- [ ] Página inicial carga correctamente
- [ ] Navegación entre rutas funciona
- [ ] Refresh en ruta no-root funciona (ej: /clientes)
- [ ] Rutas protegidas redirigen a login
- [ ] 404 redirige correctamente

### 2. Verificar autenticación
- [ ] Login funciona
- [ ] Token se guarda en localStorage
- [ ] Header Authorization se envía en peticiones
- [ ] Logout funciona y limpia token
- [ ] Auto-redirect en 401

### 3. Verificar API calls
- [ ] GET requests funcionan
- [ ] POST requests funcionan
- [ ] PUT/PATCH requests funcionan
- [ ] DELETE requests funcionan
- [ ] Errors se manejan correctamente
- [ ] Retry logic funciona en errores de red

### 4. Verificar UI/UX
- [ ] Estilos cargan correctamente
- [ ] Material Design components renderizan bien
- [ ] Responsive en móvil
- [ ] Responsive en tablet
- [ ] Responsive en desktop
- [ ] Loading states visibles
- [ ] Error messages claros

### 5. Verificar performance
- [ ] Primera carga < 3 segundos
- [ ] Lazy chunks cargan bajo demanda
- [ ] No hay múltiples descargas del mismo archivo
- [ ] Caché funciona (refresh rápido)

---

## Performance Testing

### 1. Lighthouse (Chrome DevTools)
```bash
# Abrir Chrome DevTools (F12)
# Ir a tab "Lighthouse"
# Seleccionar "Performance" + "Best Practices" + "SEO"
# Click "Generate report"
```

**Scores esperados:**
- Performance: 90+
- Best Practices: 95+
- SEO: 90+
- Accessibility: 85+

### 2. Network Analysis
```bash
# Chrome DevTools → Network tab
# Refrescar página (Ctrl+R)
# Verificar:
```

**Checks:**
- [ ] Initial HTML load < 500ms
- [ ] Total page load < 3s
- [ ] Transferred data < 1MB (first load)
- [ ] Transferred data < 100KB (cached load)
- [ ] No errores 404
- [ ] Recursos sirven con cache headers

### 3. Bundle Analysis
```bash
npm run analyze
```

**Identificar:**
- Librerías más pesadas
- Código duplicado
- Dependencias no utilizadas
- Oportunidades de lazy loading

---

## Checklist de Seguridad

### 1. Headers HTTP
Verificar con DevTools o curl:
```bash
curl -I http://localhost:8080
```

**Headers esperados:**
- [x] `X-Content-Type-Options: nosniff`
- [x] `X-Frame-Options: SAMEORIGIN`
- [x] `X-XSS-Protection: 1; mode=block`
- [x] `Cache-Control` (apropiado para cada tipo de recurso)

### 2. Código fuente
- [ ] No hay source maps en producción
- [ ] No hay console.logs en código minificado
- [ ] No hay API keys o secrets hardcoded
- [ ] Environment variables correctas

### 3. Dependencias
```bash
npm audit

# Si hay vulnerabilidades:
npm audit fix
```

---

## Problemas Comunes y Soluciones

### Build falla con "JavaScript heap out of memory"
```bash
# Aumentar memoria de Node
# Linux/Mac:
NODE_OPTIONS="--max-old-space-size=4096" npm run build:prod

# Windows (PowerShell):
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run build:prod

# Windows (CMD):
set NODE_OPTIONS=--max-old-space-size=4096 && npm run build:prod
```

### Build falla por budget exceeded
```bash
# Opción 1: Analizar y optimizar
npm run analyze

# Opción 2: Aumentar budgets temporalmente en angular.json
# (NO recomendado para producción)
```

### Rutas no funcionan después de desplegar
**Problema:** Azure devuelve 404 en rutas que no son "/"

**Solución:** Verificar que `web.config` o `staticwebapp.config.json` están en dist:
```bash
ls dist/micro-app/browser/web.config
ls dist/micro-app/browser/staticwebapp.config.json
```

### Estilos no cargan
**Problema:** Ruta incorrecta para CSS

**Solución:** Verificar que `<base href="/">` está en index.html

### API calls fallan con CORS
**Problema:** CORS no configurado en backend

**Solución:** Verificar CORS en NestJS:
```typescript
// main.ts
app.enableCors({
  origin: true,
  credentials: true,
});
```

---

## Preparación para Azure

### 1. Crear archivo ZIP para deploy
```bash
# Windows
cd dist\micro-app\browser
tar -a -c -f ..\..\..\deploy.zip *

# Linux/Mac
cd dist/micro-app/browser
zip -r ../../../deploy.zip .
```

### 2. Verificar contenido del ZIP
```bash
# Windows
tar -tf deploy.zip

# Linux/Mac
unzip -l deploy.zip
```

**Debe incluir:**
- `index.html`
- `web.config`
- `staticwebapp.config.json`
- `main-[hash].js`
- `polyfills-[hash].js`
- `styles-[hash].css`
- Carpeta `assets/`

### 3. Subir a Azure
Ver [DEPLOY-AZURE.md](./DEPLOY-AZURE.md) para comandos específicos.

---

## Post-Deploy en Azure

### 1. Verificar que la app carga
```bash
curl -I https://tu-app.azurewebsites.net
```

**Resultado esperado:** `200 OK`

### 2. Verificar routing
```bash
curl -I https://tu-app.azurewebsites.net/clientes
```

**Resultado esperado:** `200 OK` (NO 404)

### 3. Verificar API
```bash
curl https://tu-app.azurewebsites.net/api/health
```

**Resultado esperado:** Response JSON del backend

### 4. Verificar logs
```bash
az webapp log tail --name tu-app --resource-group tu-rg
```

---

## Métricas de Éxito

### Performance
- [ ] First Contentful Paint (FCP) < 1.5s
- [ ] Time to Interactive (TTI) < 3s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] First Input Delay (FID) < 100ms

### Bundle Size
- [ ] Initial bundle < 1MB
- [ ] Lazy chunks < 200KB
- [ ] Total app < 3MB

### Lighthouse Scores
- [ ] Performance: 90+
- [ ] Best Practices: 95+
- [ ] SEO: 90+
- [ ] Accessibility: 85+

---

## Comandos Rápidos

```bash
# Full build + verification
npm run lint && npm run build:prod && cd dist/micro-app/browser && http-server -p 8080

# Build + análisis
npm run build:stats && npm run analyze

# Build + test
npm run build:prod && npm test

# Deploy a Azure (después de build)
cd dist/micro-app/browser && zip -r ../../../deploy.zip . && cd ../../.. && az webapp deployment source config-zip --name tu-app --resource-group tu-rg --src deploy.zip
```

---

## Contacto

Si tienes problemas durante el build o deploy, contacta al equipo de DevOps.

**Última actualización:** 2026-01-25
