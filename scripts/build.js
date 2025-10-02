// Build script for SIKI App

const fs = require('fs');
const path = require('path');

// Function to copy files
function copyFile(source, target) {
  return new Promise((resolve, reject) => {
    fs.copyFile(source, target, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`Copied ${source} to ${target}`);
        resolve();
      }
    });
  });
}

// Function to create directory if it doesn't exist
function createDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

// Function to optimize CSS files (basic minification)
function optimizeCSS(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Basic CSS minification
    content = content.replace(/\/\*(?!\*\/)[\s\S]*?\*\//g, ''); // Remove comments
    content = content.replace(/\s+/g, ' '); // Remove extra whitespace
    content = content.replace(/\s*([{}:;,])\s*/g, '$1'); // Remove whitespace around separators
    content = content.replace(/;}/g, '}'); // Remove trailing semicolons
    
    fs.writeFileSync(filePath, content);
    console.log(`Optimized CSS: ${filePath}`);
  } catch (error) {
    console.warn(`Failed to optimize CSS ${filePath}:`, error.message);
  }
}

// Function to optimize JS files (basic minification)
function optimizeJS(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Basic JS minification
    content = content.replace(/\/\*(?!\*\/)[\s\S]*?\*\//g, ''); // Remove comments
    content = content.replace(/\/\/[^\n]*\n/g, '\n'); // Remove single line comments
    content = content.replace(/\s+/g, ' '); // Remove extra whitespace
    content = content.replace(/\s*([{}();,:])\s*/g, '$1'); // Remove whitespace around separators
    
    fs.writeFileSync(filePath, content);
    console.log(`Optimized JS: ${filePath}`);
  } catch (error) {
    console.warn(`Failed to optimize JS ${filePath}:`, error.message);
  }
}

// Function to build the project
async function build() {
  try {
    console.log('Starting build process...');
    
    // Create dist directory
    const distDir = path.join(__dirname, '..', 'dist');
    createDir(distDir);
    
    // Copy HTML file
    await copyFile(
      path.join(__dirname, '..', 'index.html'),
      path.join(distDir, 'index.html')
    );
    
    // Copy manifest
    await copyFile(
      path.join(__dirname, '..', 'manifest.json'),
      path.join(distDir, 'manifest.json')
    );
    
    // Copy service worker
    await copyFile(
      path.join(__dirname, '..', 'sw.js'),
      path.join(distDir, 'sw.js')
    );
    
    // Copy README
    await copyFile(
      path.join(__dirname, '..', 'README.md'),
      path.join(distDir, 'README.md')
    );
    
    // Create and copy styles
    const distStylesDir = path.join(distDir, 'styles');
    createDir(distStylesDir);
    
    const styleFiles = [
      'main.css', 'reset.css', 'animations.css', 'utilities.css', 'print.css', 
      'dark-mode.css', 'mobile.css', 'accessibility.css', 'components.css', 
      'grid.css', 'typography.css', 'forms.css', 'navigation.css', 'modal.css', 
      'loading.css', 'notifications.css', 'cards.css', 'tables.css', 'charts.css', 
      'progress.css', 'badges.css', 'avatars.css', 'tooltips.css', 'accordions.css', 
      'breadcrumbs.css', 'pagination.css', 'tabs.css', 'sliders.css', 'switches.css', 
      'ratings.css', 'preferences.css'
    ];
    for (const file of styleFiles) {
      const sourcePath = path.join(__dirname, '..', 'styles', file);
      const targetPath = path.join(distStylesDir, file);
      await copyFile(sourcePath, targetPath);
      
      // Optimize CSS files
      if (file.endsWith('.css')) {
        optimizeCSS(targetPath);
      }
    }
    
    // Create and copy scripts
    const distScriptsDir = path.join(distDir, 'scripts');
    createDir(distScriptsDir);
    
    await copyFile(
      path.join(__dirname, '..', 'scripts', 'main.js'),
      path.join(distScriptsDir, 'main.js')
    );
    
    await copyFile(
      path.join(__dirname, '..', 'scripts', 'fallback-db.js'),
      path.join(distScriptsDir, 'fallback-db.js')
    );
    
    // Optimize JS files
    optimizeJS(path.join(distScriptsDir, 'main.js'));
    optimizeJS(path.join(distScriptsDir, 'fallback-db.js'));
    
    // Create and copy icons
    const distIconsDir = path.join(distDir, 'icons');
    createDir(distIconsDir);
    
    const iconFiles = ['icon-192x192.png', 'icon-512x512.png'];
    for (const file of iconFiles) {
      await copyFile(
        path.join(__dirname, '..', 'icons', file),
        path.join(distIconsDir, file)
      );
    }
    
    // Create and copy docs
    const distDocsDir = path.join(distDir, 'docs');
    createDir(distDocsDir);
    
    const docFiles = [
      'project-structure.md', 'docs.css', 'index.html',
      'ai-ml-pipeline-specification.md',
      'complete-integration-summary.md',
      'firestore-integration.md',
      'hugging-face-integration.md',
      'implementation-summary.md',
      'next-steps-for-contextual-ai.md',
      'test-product-label.txt',
      'user-preferences-feature.md'
    ];
    for (const file of docFiles) {
      await copyFile(
        path.join(__dirname, '..', 'docs', file),
        path.join(distDocsDir, file)
      );
    }
    
    // Create and copy tests
    const distTestsDir = path.join(distDir, 'tests');
    createDir(distTestsDir);
    
    await copyFile(
      path.join(__dirname, '..', 'tests', 'app.test.js'),
      path.join(distTestsDir, 'app.test.js')
    );
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

// Run build if this script is executed directly
if (require.main === module) {
  build();
}

module.exports = { build };