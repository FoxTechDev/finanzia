# Guía Rápida de Despliegue en Producción

## Paso 1: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del backend con las siguientes variables:

```env
NODE_ENV=production
PORT=8080

# Database - Azure MySQL
DB_HOST=your-server.mysql.database.azure.com
DB_PORT=3306
DB_USERNAME=your_username@your-server
DB_PASSWORD=your_secure_password
DB_DATABASE=micro_app
DB_SSL=true
DB_POOL_SIZE=10

# JWT - GENERA UNO NUEVO
# Ejecuta: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=REEMPLAZA_CON_SECRETO_SEGURO
JWT_EXPIRATION=1d

# CORS - Tus dominios de frontend
CORS_ORIGINS=https://your-frontend.azurewebsites.net,https://www.yourdomain.com
```

## Paso 2: Crear Base de Datos en Azure

```bash
# Crear servidor MySQL
az mysql flexible-server create \
  --resource-group micro-app-rg \
  --name micro-app-mysql \
  --location eastus \
  --admin-user adminuser \
  --admin-password YourP@ssw0rd! \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32

# Configurar firewall para permitir servicios de Azure
az mysql flexible-server firewall-rule create \
  --resource-group micro-app-rg \
  --name micro-app-mysql \
  --rule-name AllowAzure \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Crear base de datos
az mysql flexible-server db create \
  --resource-group micro-app-rg \
  --server-name micro-app-mysql \
  --database-name micro_app
```

## Paso 3: Ejecutar Migraciones

```bash
# Instalar dependencias
npm ci

# Ejecutar migraciones
npm run migration:run

# Verificar estado
npm run migration:show
```

## Paso 4: Build y Test Local

```bash
# Build optimizado
npm run build:prod

# Probar localmente
npm run start:prod

# Verificar health check
curl http://localhost:3000/api/health
```

## Paso 5: Desplegar en Azure App Service

### Opción A: Deployment Center (UI)

1. Ve a Azure Portal
2. Crea un App Service (Node 18 LTS)
3. En "Deployment Center", conecta tu repositorio GitHub
4. Configura las variables de entorno en "Configuration"

### Opción B: Azure CLI

```bash
# Crear App Service Plan
az appservice plan create \
  --name micro-app-plan \
  --resource-group micro-app-rg \
  --sku B1 \
  --is-linux

# Crear Web App
az webapp create \
  --resource-group micro-app-rg \
  --plan micro-app-plan \
  --name micro-app-backend \
  --runtime "NODE|18-lts"

# Configurar variables de entorno
az webapp config appsettings set \
  --resource-group micro-app-rg \
  --name micro-app-backend \
  --settings \
    NODE_ENV=production \
    DB_HOST=micro-app-mysql.mysql.database.azure.com \
    DB_USERNAME=adminuser \
    DB_PASSWORD=YourP@ssw0rd! \
    DB_DATABASE=micro_app \
    DB_SSL=true \
    JWT_SECRET=your_generated_secret \
    CORS_ORIGINS=https://your-frontend.azurewebsites.net

# Deploy desde repositorio local
az webapp up \
  --resource-group micro-app-rg \
  --name micro-app-backend \
  --runtime "NODE|18-lts"
```

## Paso 6: Verificar Despliegue

```bash
# Health check
curl https://micro-app-backend.azurewebsites.net/api/health

# Ping
curl https://micro-app-backend.azurewebsites.net/api/health/ping

# Ver logs en tiempo real
az webapp log tail \
  --resource-group micro-app-rg \
  --name micro-app-backend
```

## Paso 7: Configurar HTTPS (Opcional pero Recomendado)

Azure App Service incluye certificado SSL gratis para subdominios *.azurewebsites.net.

Para dominio personalizado:
```bash
# Agregar dominio custom
az webapp config hostname add \
  --webapp-name micro-app-backend \
  --resource-group micro-app-rg \
  --hostname api.yourdomain.com

# Configurar SSL
az webapp config ssl create \
  --resource-group micro-app-rg \
  --name micro-app-backend \
  --hostname api.yourdomain.com
```

## Endpoints Disponibles Post-Despliegue

```
GET  /api/health          - Health check completo
GET  /api/health/ping     - Ping simple
POST /api/auth/login      - Login
POST /api/auth/register   - Registro
GET  /api/users           - Usuarios (requiere auth)
...
```

## Troubleshooting Rápido

### Error: Cannot connect to database
- Verifica `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`
- Confirma que firewall permite conexiones desde Azure
- Verifica que `DB_SSL=true`

### Error: Application failed to start
- Revisa logs: `az webapp log tail --name micro-app-backend --resource-group micro-app-rg`
- Verifica que todas las variables de entorno estén configuradas
- Confirma que el build fue exitoso

### Error: CORS issues
- Verifica `CORS_ORIGINS` incluye tu dominio frontend
- Asegúrate de usar https:// en producción

### Performance lento
- Aumenta `DB_POOL_SIZE` a 15-20
- Escala el App Service Plan a un tier superior
- Revisa slow queries en logs

## Monitoreo Continuo

### Ver métricas
```bash
az monitor metrics list \
  --resource /subscriptions/{sub-id}/resourceGroups/micro-app-rg/providers/Microsoft.Web/sites/micro-app-backend \
  --metric-names CpuPercentage MemoryPercentage HttpResponseTime
```

### Configurar alertas
```bash
az monitor metrics alert create \
  --name high-cpu-alert \
  --resource-group micro-app-rg \
  --scopes /subscriptions/{sub-id}/resourceGroups/micro-app-rg/providers/Microsoft.Web/sites/micro-app-backend \
  --condition "avg Percentage CPU > 80" \
  --window-size 5m \
  --evaluation-frequency 1m
```

## Backup de Base de Datos

```bash
# Backup automático (configurable en Azure Portal)
az mysql flexible-server backup create \
  --resource-group micro-app-rg \
  --server-name micro-app-mysql \
  --backup-name manual-backup-$(date +%Y%m%d)
```

## Escalabilidad

### Escalar horizontalmente (más instancias)
```bash
az appservice plan update \
  --name micro-app-plan \
  --resource-group micro-app-rg \
  --number-of-workers 3
```

### Escalar verticalmente (más recursos)
```bash
az appservice plan update \
  --name micro-app-plan \
  --resource-group micro-app-rg \
  --sku P1V2
```

## Comandos Útiles

```bash
# Restart app
az webapp restart --name micro-app-backend --resource-group micro-app-rg

# Ver configuración actual
az webapp config appsettings list --name micro-app-backend --resource-group micro-app-rg

# SSH a la instancia
az webapp ssh --name micro-app-backend --resource-group micro-app-rg

# Download logs
az webapp log download --name micro-app-backend --resource-group micro-app-rg
```

## Checklist Final

- [ ] Base de datos creada y accesible
- [ ] Variables de entorno configuradas
- [ ] JWT_SECRET generado y seguro
- [ ] Migraciones ejecutadas
- [ ] Build exitoso
- [ ] Health check responde OK
- [ ] Login funciona
- [ ] CORS configurado correctamente
- [ ] HTTPS habilitado
- [ ] Logs monitoreados
- [ ] Alertas configuradas
- [ ] Backup automático habilitado

---

**Soporte**: Para más detalles, ver `PRODUCTION_DEPLOYMENT.md` y `OPTIMIZATION_SUMMARY.md`
