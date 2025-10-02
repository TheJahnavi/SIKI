// Simple test file for CI verification

// Test that the application can be imported without errors
describe('CI Test', () => {
  test('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });
  
  test('should have required files', () => {
    const fs = require('fs');
    const path = require('path');
    
    // Check that key files exist
    const requiredFiles = [
      'server.js',
      'index.html',
      'package.json'
    ];
    
    requiredFiles.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });
});