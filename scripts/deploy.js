// Deployment script for SIKI App to GitHub Pages

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to run shell commands
function runCommand(command) {
  try {
    console.log(`Running: ${command}`);
    const output = execSync(command, { encoding: 'utf-8' });
    console.log(output);
    return output;
  } catch (error) {
    console.error(`Error running command: ${command}`);
    console.error(error.stderr || error.message);
    process.exit(1);
  }
}

// Function to deploy to GitHub Pages
function deploy() {
  try {
    console.log('Starting deployment process...');
    
    // Check if we're in a git repository
    runCommand('git status');
    
    // Build the project
    console.log('Building the project...');
    runCommand('npm run build');
    
    // Create deployment directory
    const deployDir = path.join(__dirname, '..', 'dist');
    
    // Check if dist directory exists
    if (!fs.existsSync(deployDir)) {
      console.error('Dist directory does not exist. Run build first.');
      process.exit(1);
    }
    
    // Deploy to GitHub Pages using gh-pages package
    console.log('Deploying to GitHub Pages...');
    runCommand('npx gh-pages -d dist');
    
    console.log('Deployment completed successfully!');
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

// Run deployment if this script is executed directly
if (require.main === module) {
  deploy();
}

module.exports = { deploy };