# Backend Dockerfile para Digital Ocean App Platform
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para build)
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar la aplicación y verificar resultado
RUN npm run build && ls -la dist/

# --- Etapa de producción ---
FROM node:20-alpine AS production

WORKDIR /app

# Copiar package.json desde el builder
COPY --from=builder /app/package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar el build compilado desde la etapa anterior
COPY --from=builder /app/dist ./dist

# Nota: Los assets se copian como parte del build si existen

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001
USER nestjs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Comando de inicio
CMD ["node", "dist/main.js"]
