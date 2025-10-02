// Configuration file for SIKI App
// This file contains environment-specific settings

// Configuration object with settings for different environments
const config = {
  // Development environment (local development)
  development: {
    // API base URL - empty string for relative paths in development
    apiUrl: '',
    // Debug mode - enables additional logging
    debug: true,
    // Firebase settings
    firebase: {
      // Use emulator in development
      useEmulator: true,
      emulatorHost: 'localhost',
      emulatorPort: 8080
    }
  },
  
  // Production environment (deployed app)
  production: {
    // API base URL - REPLACE WITH YOUR ACTUAL DEPLOYED BACKEND URL
    // Example: 'https://your-app-name.onrender.com' or 'https://your-app.herokuapp.com'
    apiUrl: '', // Empty for relative paths, update when deploying
    // Debug mode - disabled in production
    debug: false,
    // Firebase settings
    firebase: {
      // Use production Firebase in production
      useEmulator: false
    }
  },
  
  // Staging environment (if needed)
  staging: {
    // API base URL - REPLACE WITH YOUR ACTUAL STAGING BACKEND URL
    apiUrl: '', // Empty for relative paths, update when deploying
    // Debug mode - enabled in staging for testing
    debug: true,
    // Firebase settings
    firebase: {
      useEmulator: false
    }
  }
};

// Determine the current environment
// Default to development if not specified
const environment = process.env.NODE_ENV || 'development';

// Export the configuration for the current environment
export default config[environment];