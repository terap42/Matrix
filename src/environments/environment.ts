export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api', // ✅ Ajustez selon votre configuration
  apiTimeout: 30000,
  
  // Configuration de l'app
  appName: 'Plateforme Freelance',
  version: '1.0.0',
  
  // Configuration de pagination par défaut
  defaultPageSize: 10,
  maxPageSize: 100,
  
  // Configuration de debug
  enableDebug: true,
  enableConsoleLog: true,
  api: {
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },
  
  // Configuration pagination par défaut
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100]
  },
  
  // Configuration des toasts
  toast: {
    duration: 3000,
    position: 'top' as const
  },
  
  // Configuration des modales
  modal: {
    backdropDismiss: false,
    keyboardClose: false
  }
  
};
 