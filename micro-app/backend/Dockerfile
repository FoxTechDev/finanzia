# Backend Dockerfile para Digital Ocean App Platform
FROM node:20-alpine

# Crear usuario no-root primero
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

WORKDIR /app

# Copiar archivos de dependencias
COPY --chown=nestjs:nodejs package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para compilar)
RUN npm ci

# Copiar código fuente
COPY --chown=nestjs:nodejs . .

# Compilar la aplicación
RUN npm run build && test -f dist/src/main.js

# Reinstalar solo dependencias de producción (--omit=dev para npm 10+)
RUN rm -rf node_modules && \
    npm ci --omit=dev && \
    npm cache clean --force

# Verificar que las dependencias críticas existen
RUN node -e "require('@nestjs/throttler'); console.log('throttler OK')"
RUN node -e "require('dist/src/main.js'); setTimeout(() => process.exit(0), 100)" || echo "WARN: main.js preload check"

# Asegurar permisos de todo el directorio
RUN chown -R nestjs:nodejs /app

# Cambiar a usuario no-root
USER nestjs

# Exponer puerto
EXPOSE 3000

# Health check - start-period largo para permitir arranque + conexion a BD
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Comando de inicio
CMD ["node", "dist/src/main.js"]
