# Backend Dockerfile para Digital Ocean App Platform
FROM node:20-alpine

# Crear usuario no-root primero
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

WORKDIR /app

# Debug: mostrar qué hay en el contexto
RUN echo "=== PWD ===" && pwd
COPY . /tmp/context-check
RUN echo "=== Contexto de build ===" && ls -la /tmp/context-check/ && rm -rf /tmp/context-check

# Copiar archivos de dependencias
COPY --chown=nestjs:nodejs package*.json ./

# Instalar todas las dependencias
RUN npm ci

# Copiar código fuente
COPY --chown=nestjs:nodejs . .

# Debug: mostrar estructura antes del build
RUN echo "=== Archivos en /app ===" && ls -la
RUN echo "=== Archivos en src/ ===" && ls -la src/ || echo "No src/ directory"

# Compilar la aplicación
RUN npm run build

# Verificar que el build existe (falla si no existe main.js)
RUN echo "=== Contenido de dist/ ===" && ls -la dist/ && test -f dist/main.js || (echo "ERROR: dist/main.js no existe!" && exit 1)

# Reinstalar solo dependencias de producción
RUN rm -rf node_modules && \
    npm ci --only=production && \
    npm cache clean --force

# Asegurar permisos de todo el directorio
RUN chown -R nestjs:nodejs /app

# Cambiar a usuario no-root
USER nestjs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Comando de inicio
CMD ["node", "dist/main.js"]
