export const environment = {
  production: true,
  // API URL - Digital Ocean App Platform
  // El backend se despliega como servicio separado con ruta /api
  // La URL se configura automáticamente por el proxy de App Platform
  apiUrl: '/api',

  // Desactivar logs de desarrollo en producción
  enableDebugLogs: false,

  // Configuración de timeouts
  httpTimeout: 30000, // 30 segundos

  // Nombre de la aplicación para tracking
  appName: 'FINANZIA',
  appVersion: '1.0.0',
};
