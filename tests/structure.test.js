// Structure validation test for SIKI App

describe('SIKI Project Structure', () => {
  it('should have all required files', () => {
    const fs = require('fs');
    const path = require('path');
    
    // Check for required files
    const requiredFiles = [
      'index.html',
      'server.js',
      'package.json',
      'README.md',
      '.env',
      'manifest.json',
      'sw.js',
      'firebase-config.js',
      'config/firebase-service-account.json'
    ];
    
    requiredFiles.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });
  
  it('should have required directories', () => {
    const fs = require('fs');
    const path = require('path');
    
    // Check for required directories
    const requiredDirs = [
      'scripts',
      'styles',
      'tests',
      'docs',
      'icons',
      'config'
    ];
    
    requiredDirs.forEach(dir => {
      const dirPath = path.join(__dirname, '..', dir);
      expect(fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory()).toBe(true);
    });
  });
  
  it('should have required script files', () => {
    const fs = require('fs');
    const path = require('path');
    
    // Check for required script files
    const requiredScripts = [
      'scripts/main.js',
      'scripts/build.js',
      'scripts/deploy.js',
      'scripts/fallback-db.js'
    ];
    
    requiredScripts.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });
  
  it('should have required style files', () => {
    const fs = require('fs');
    const path = require('path');
    
    // Check for required style files
    const requiredStyles = [
      'styles/main.css',
      'styles/dark-mode.css',
      'styles/mobile.css',
      'styles/components.css'
    ];
    
    requiredStyles.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });
});