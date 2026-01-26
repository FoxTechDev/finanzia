# Guía de Despliegue en Producción - Azure

Esta guía proporciona instrucciones paso a paso para desplegar el backend de NestJS en Azure de forma segura y optimizada.

## Optimizaciones Implementadas

### 1. Seguridad (main.ts)
- ✅ **Helmet**: Configurado para proteger contra vulnerabilidades comunes
- ✅ **CORS Dinámico**: Configurado desde variables de entorno
- ✅ **Compresión**: Habilitada para reducir tamaño de respuestas
- ✅ **Validación**: Configurada para no exponer detalles de errores en producción

### 2. Base de Datos (typeorm.config.ts)
- ✅ **Connection Pooling**: Optimizado para Azure (configurable vía `DB_POOL_SIZE`)
- ✅ **SSL**: Soporte para conexiones seguras a Azure Database for MySQL
- ✅ **Logging**: Reducido en producción (solo errors y warnings)
- ✅ **Cache**: Habilitado para consultas frecuentes
- ✅ **Synchronize**: Deshabilitado (usar migraciones)

### 3. Índices de Base de Datos
Se agregaron índices estratégicos en las entidades principales:

#### User
- `email` - Búsquedas de login
- `rolId` - Filtros por rol
- `isActive` - Usuarios activos

#### Prestamo
- `personaId` - Búsqueda por cliente
- `numeroCredito` - Búsqueda por número
- `estado` - Filtros por estado
- `fechaOtorgamiento`, `fechaVencimiento` - Rangos de fechas
- Índices compuestos para consultas complejas

#### PlanPago
- `prestamoId`, `numeroCuota` - Cuota específica
- `fechaVencimiento`, `estado` - Pagos vencidos

#### Pago
- `prestamoId`, `fechaPago` - Historial de pagos
- `numeroPago` - Búsqueda directa
- `estado` - Filtros de estado

#### Solicitud
- `personaId`, `estadoId` - Solicitudes por cliente
- `numeroSolicitud` - Búsqueda directa
- `fechaSolicitud` - Ordenamiento temporal

#### Persona
- `numeroDui`, `numeroNit` - Identificación
- `nombre`, `apellido` - Búsquedas
- `correoElectronico`, `telefono` - Contacto

## Variables de Entorno para Producción

### Obligatorias
```env
NODE_ENV=production
PORT=8080
DB_HOST=your-server.mysql.database.azure.com
DB_USERNAME=your_username
DB_PASSWORD=strong_password_here
DB_DATABASE=micro_app
DB_SSL=true
JWT_SECRET=generate_with_crypto_randomBytes
CORS_ORIGINS=https://your-frontend.azurewebsites.net
```

### Opcionales (Recomendadas)
```env
DB_POOL_SIZE=10
DB_SSL_REJECT_UNAUTHORIZED=true
LOG_LEVEL=error,warn,log
```

## Configuración de Azure

### 1. Azure Database for MySQL

#### Crear Base de Datos
```bash
# Via Azure Portal o CLI
az mysql flexible-server create \
  --resource-group your-rg \
  --name micro-app-db \
  --location eastus \
  --admin-user adminuser \
  --admin-password <strong-password> \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32
```

#### Configurar Firewall
```bash
# Permitir servicios de Azure
az mysql flexible-server firewall-rule create \
  --resource-group your-rg \
  --name micro-app-db \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

#### SSL/TLS
Azure Database for MySQL requiere SSL por defecto. Asegúrate de:
- `DB_SSL=true`
- `DB_SSL_REJECT_UNAUTHORIZED=true`

### 2. Azure App Service

#### Crear App Service
```bash
az webapp create \
  --resource-group your-rg \
  --plan your-app-service-plan \
  --name micro-app-backend \
  --runtime "NODE|18-lts"
```

#### Configurar Variables de Entorno
```bash
az webapp config appsettings set \
  --resource-group your-rg \
  --name micro-app-backend \
  --settings \
    NODE_ENV=production \
    DB_HOST=micro-app-db.mysql.database.azure.com \
    DB_USERNAME=adminuser \
    DB_PASSWORD=<password> \
    DB_DATABASE=micro_app \
    DB_SSL=true \
    JWT_SECRET=<your-secret> \
    CORS_ORIGINS=https://your-frontend.azurewebsites.net
```

#### Configurar Deployment
```bash
# Deployment desde GitHub
az webapp deployment source config \
  --resource-group your-rg \
  --name micro-app-backend \
  --repo-url https://github.com/your-repo \
  --branch main \
  --manual-integration
```

## Scripts NPM para Producción

### Build Optimizado
```bash
npm run build:prod
```
Compila el proyecto con optimizaciones de webpack.

### Ejecutar Migraciones en Producción
```bash
npm run migration:run:prod
```
Ejecuta migraciones pendientes en la base de datos de producción.

### Despliegue Completo
```bash
npm run deploy:azure
```
Build + Migraciones + Start (útil para scripts de CI/CD)

## Checklist Pre-Despliegue

### Seguridad
- [ ] Generar JWT_SECRET seguro: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- [ ] Configurar CORS_ORIGINS con dominios reales
- [ ] Habilitar SSL en base de datos
- [ ] Revisar que `synchronize: false` en TypeORM
- [ ] Validar que passwords no estén en el código

### Base de Datos
- [ ] Crear base de datos en Azure
- [ ] Configurar firewall rules
- [ ] Ejecutar migraciones: `npm run migration:run:prod`
- [ ] Verificar índices creados
- [ ] Ejecutar seeds si es necesario

### Aplicación
- [ ] Configurar todas las variables de entorno
- [ ] Probar build: `npm run build:prod`
- [ ] Verificar logs de inicio
- [ ] Probar endpoint de health check
- [ ] Configurar SSL/HTTPS en App Service

### Monitoreo
- [ ] Configurar Application Insights (opcional)
- [ ] Configurar alertas de errores
- [ ] Configurar logs centralizados
- [ ] Definir métricas de performance

## Optimizaciones de Performance

### Connection Pooling
El pool de conexiones está configurado para manejar múltiples requests simultáneas:
- `connectionLimit`: 10 en producción (ajustable vía `DB_POOL_SIZE`)
- `keepAliveInitialDelay`: 10000ms
- `connectTimeout`: 60000ms

### Caching
TypeORM cache está habilitado en producción:
- Tipo: database
- Duración: 30 segundos
- Cachea consultas repetidas automáticamente

### Compresión
Todas las respuestas HTTP se comprimen automáticamente usando gzip/deflate.

### Logging
En producción solo se registran:
- Errores
- Warnings
- Logs importantes
- Migraciones

## Monitoreo y Debugging

### Ver Logs en Tiempo Real
```bash
az webapp log tail \
  --resource-group your-rg \
  --name micro-app-backend
```

### Ver Métricas
```bash
az monitor metrics list \
  --resource /subscriptions/{sub-id}/resourceGroups/{rg}/providers/Microsoft.Web/sites/{app-name} \
  --metric-names CpuPercentage,MemoryPercentage
```

### Escalar Horizontalmente
```bash
az appservice plan update \
  --resource-group your-rg \
  --name your-plan \
  --number-of-workers 2
```

## Troubleshooting

### Error: Connection Timeout
- Verificar firewall rules de la base de datos
- Verificar que `DB_HOST` sea correcto
- Verificar conectividad de red

### Error: SSL Connection Required
- Configurar `DB_SSL=true`
- Verificar certificados SSL

### Error: Too Many Connections
- Reducir `DB_POOL_SIZE`
- Escalar el tier de la base de datos
- Revisar conexiones no cerradas

### Performance Lento
- Verificar índices en base de datos
- Revisar logs de consultas lentas
- Habilitar cache de TypeORM
- Escalar App Service plan

## Mejores Prácticas

1. **Nunca** commitear archivos `.env` al repositorio
2. **Siempre** usar migraciones para cambios de schema
3. **Validar** variables de entorno al inicio de la aplicación
4. **Rotar** JWT_SECRET periódicamente
5. **Monitorear** uso de recursos y errores
6. **Backup** regular de la base de datos
7. **Testear** en ambiente de staging antes de producción
8. **Documentar** cambios de configuración

## Soporte y Recursos

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service)
- [Azure Database for MySQL](https://docs.microsoft.com/azure/mysql)

---

**Última actualización**: 2026-01-25
