# Backend Dockerfile para Digital Ocean App Platform
FROM node:20-alpine

WORKDIR /app

# Debug: mostrar contenido del contexto
RUN echo "=== Contenido del contexto ===" && pwd

# Copiar archivos de dependencias
COPY package*.json ./

# Debug: verificar package.json
RUN echo "=== Package.json copiado ===" && cat package.json | head -5

# Instalar todas las dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Debug: verificar estructura
RUN echo "=== Estructura de archivos ===" && ls -la && ls -la src/ | head -10

# Compilar la aplicación
RUN npm run build

# Debug: verificar build
RUN echo "=== Contenido de dist ===" && ls -la dist/

# Instalar solo producción y limpiar
RUN rm -rf node_modules && \
    npm ci --only=production && \
    npm cache clean --force

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app
USER nestjs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Comando de inicio
CMD ["node", "dist/main.js"]
