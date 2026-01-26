# Despliegue en Digital Ocean App Platform

## Prerequisitos

1. Cuenta en Digital Ocean con método de pago configurado
2. Repositorio en GitHub/GitLab con el código
3. Instalar [doctl](https://docs.digitalocean.com/reference/doctl/how-to/install/) (opcional, para CLI)

## Opción 1: Despliegue desde la Interfaz Web (Recomendado)

### Paso 1: Crear Base de Datos

1. Ir a [Digital Ocean Panel](https://cloud.digitalocean.com/)
2. **Databases** → **Create Database Cluster**
3. Configurar:
   - Engine: **MySQL 8**
   - Plan: **Basic** ($15/mes)
   - Datacenter: El más cercano a tus usuarios
   - Nombre: `finanzia-db`
4. Esperar ~5 minutos a que se cree
5. Guardar las credenciales de conexión

### Paso 2: Subir Código a GitHub

```bash
# Si no tienes repositorio, crear uno
git init
git add .
git commit -m "Initial commit para Digital Ocean"
git remote add origin https://github.com/TU_USUARIO/finanzia.git
git push -u origin main
```

### Paso 3: Crear App en App Platform

1. **Apps** → **Create App**
2. Conectar tu cuenta de GitHub
3. Seleccionar el repositorio `finanzia`
4. Digital Ocean detectará automáticamente los Dockerfiles

### Paso 4: Configurar Componentes

#### Backend (Web Service):
- **Name:** backend
- **Source Directory:** /backend
- **Type:** Web Service (Dockerfile)
- **HTTP Port:** 3000
- **HTTP Route:** /api
- **Instance Size:** Basic ($5/mes)

#### Frontend (Static Site):
- **Name:** frontend
- **Source Directory:** /frontend
- **Type:** Static Site (Dockerfile)
- **HTTP Route:** /

### Paso 5: Configurar Variables de Entorno del Backend

| Variable | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `DB_HOST` | `${finanzia-db.HOSTNAME}` |
| `DB_PORT` | `${finanzia-db.PORT}` |
| `DB_USERNAME` | `${finanzia-db.USERNAME}` |
| `DB_PASSWORD` | `${finanzia-db.PASSWORD}` |
| `DB_DATABASE` | `${finanzia-db.DATABASE}` |
| `DB_SSL` | `true` |
| `JWT_SECRET` | `tu-clave-secreta-muy-larga-de-32-caracteres` |
| `JWT_EXPIRATION` | `1d` |
| `CORS_ORIGINS` | `https://tu-app.ondigitalocean.app` |

### Paso 6: Vincular Base de Datos

1. En la configuración de la App, ir a **Add Resource**
2. Seleccionar **Database**
3. Elegir `finanzia-db`
4. Esto hace disponibles las variables `${finanzia-db.*}`

### Paso 7: Deploy

1. Click en **Create Resources**
2. Esperar ~10-15 minutos
3. Obtener URL de la aplicación

---

## Opción 2: Despliegue con CLI (doctl)

### Instalar y configurar doctl

```bash
# macOS
brew install doctl

# Windows (con Scoop)
scoop install doctl

# Autenticar
doctl auth init
```

### Desplegar con app.yaml

```bash
# Desde la raíz del proyecto
doctl apps create --spec .do/app.yaml
```

### Ver estado del despliegue

```bash
doctl apps list
doctl apps logs <app-id> --type build
doctl apps logs <app-id> --type run
```

---

## Post-Despliegue

### 1. Ejecutar Migraciones

Conectar a la consola del backend en App Platform o ejecutar localmente:

```bash
# Opción A: Desde la consola de App Platform
# Apps → tu-app → Console → backend
npm run migration:run:prod

# Opción B: Localmente con las credenciales de producción
DB_HOST=tu-host.db.ondigitalocean.com \
DB_PORT=25060 \
DB_USERNAME=doadmin \
DB_PASSWORD=tu-password \
DB_DATABASE=defaultdb \
DB_SSL=true \
npm run migration:run:prod
```

### 2. Cargar Datos Iniciales (Seeds)

```bash
npm run seed
```

### 3. Verificar Health Check

```bash
curl https://tu-app.ondigitalocean.app/api/health
```

---

## Costos Estimados

| Recurso | Costo Mensual |
|---------|---------------|
| MySQL Database (Basic) | $15 |
| Backend (basic-xxs) | $5 |
| Frontend (Static Site) | $0 |
| **Total** | **~$20/mes** |

---

## Escalamiento

### Aumentar instancias del backend:
```bash
doctl apps update <app-id> --spec .do/app.yaml
# Modificar instance_count en app.yaml
```

### Upgrade de base de datos:
- Panel → Databases → Resize

---

## Troubleshooting

### Error de conexión a BD
- Verificar que la BD esté vinculada a la App
- Verificar que `DB_SSL=true`
- Revisar logs: `doctl apps logs <app-id>`

### Build falla
- Verificar Dockerfile syntax
- Revisar logs de build en el panel

### Frontend no carga
- Verificar que nginx.conf esté correctamente configurado
- Verificar rutas en App Platform

### CORS errors
- Verificar `CORS_ORIGINS` incluye la URL del frontend
- Formato: `https://tu-app.ondigitalocean.app`

---

## Dominio Personalizado

1. Panel → Apps → tu-app → Settings → Domains
2. Add Domain
3. Configurar DNS con los valores proporcionados
4. SSL se genera automáticamente

---

## CI/CD Automático

Digital Ocean App Platform tiene CI/CD integrado:
- Cada push a `main` dispara un nuevo deploy
- Puedes configurar branches adicionales en App Settings
