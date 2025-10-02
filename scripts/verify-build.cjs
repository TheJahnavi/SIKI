// Verification script to ensure build works correctly with ES modules

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command) {
  try {
    console.log(`Running: ${command}`);
    const output = execSync(command, { encoding: 'utf-8' });
    console.log(output);
    return true;
  } catch (error) {
    console.error(`Error running command: ${command}`);
    console.error(error.stderr || error.message);
    return false;
  }
}

function verifyBuild() {
  console.log('Verifying build process...');
  
  // Check if package.json has the correct build script
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (packageJson.scripts.build !== 'node scripts/build.cjs') {
    console.error('ERROR: package.json build script is incorrect');
    console.log('Expected: node scripts/build.cjs');
    console.log('Actual:', packageJson.scripts.build);
    return false;
  }
  
  // Check if build.cjs exists
  if (!fs.existsSync('scripts/build.cjs')) {
    console.error('ERROR: scripts/build.cjs does not exist');
    return false;
  }
  
  // Check if build.js no longer exists
  if (fs.existsSync('scripts/build.js')) {
    console.error('ERROR: scripts/build.js still exists (should be deleted)');
    return false;
  }
  
  // Try to run the build command
  console.log('Testing build command...');
  const buildSuccess = runCommand('npm run build');
  
  if (!buildSuccess) {
    console.error('ERROR: Build command failed');
    return false;
  }
  
  // Check if dist directory was created
  if (!fs.existsSync('dist')) {
    console.error('ERROR: dist directory was not created');
    return false;
  }
  
  // Check if key files were copied
  const requiredFiles = [
    'dist/index.html',
    'dist/manifest.json',
    'dist/sw.js',
    'dist/styles/main.css',
    'dist/scripts/main.js'
  ];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      console.error(`ERROR: Required file ${file} was not created`);
      return false;
    }
  }
  
  console.log('✅ All build verification checks passed!');
  console.log('✅ ES module compatibility has been fixed');
  console.log('✅ Netlify should now be able to build successfully');
  return true;
}

// Run verification if this script is executed directly
if (require.main === module) {
  const success = verifyBuild();
  process.exit(success ? 0 : 1);
}

module.exports = { verifyBuild };