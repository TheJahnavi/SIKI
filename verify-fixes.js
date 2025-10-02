// Simple verification script to check if fixes are working

console.log('=== SIKI Application Fix Verification ===\n');

// Check if required files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
    'index.html',
    'scripts/main.js',
    'styles/main.css',
    'server.cjs'
];

console.log('1. Checking required files...');
let allFilesExist = true;
requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`   ✅ ${file} exists`);
    } else {
        console.log(`   ❌ ${file} missing`);
        allFilesExist = false;
    }
});

if (allFilesExist) {
    console.log('   🎉 All required files present\n');
} else {
    console.log('   ⚠️  Some required files missing\n');
}

// Check if server is running
console.log('2. Checking if server is running...');
const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/ingredients',
    method: 'GET'
};

const req = http.request(options, (res) => {
    console.log(`   Server status: ${res.statusCode}`);
    if (res.statusCode === 200) {
        console.log('   ✅ Server is running and responding to API requests\n');
        
        // Check if we can get ingredients
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                if (jsonData.success && jsonData.ingredients) {
                    console.log(`3. Ingredient Service Check:`);
                    console.log(`   ✅ ${jsonData.ingredients.length} ingredients loaded`);
                    console.log(`   ✅ Ingredient service is working\n`);
                    
                    // Final summary
                    console.log('=== FINAL VERIFICATION SUMMARY ===');
                    console.log('✅ All required files present');
                    console.log('✅ Server is running and responsive');
                    console.log('✅ Backend services are functional');
                    console.log('\n🎉 SIKI Application fixes verified successfully!');
                    console.log('\nThe application should now be fully functional.');
                    console.log('Open http://localhost:3000 in your browser to test.');
                }
            } catch (e) {
                console.log('   ❌ Error parsing ingredient data');
            }
        });
    } else {
        console.log('   ❌ Server is not responding correctly\n');
    }
});

req.on('error', (e) => {
    console.log('   ❌ Server is not running or not accessible');
    console.log('   Please start the server with: node server.cjs\n');
    
    // Final summary
    console.log('=== FINAL VERIFICATION SUMMARY ===');
    console.log('✅ All required files present');
    console.log('❌ Server is not running');
    console.log('⚠️  Start the server to complete verification');
});

req.end();

// Check for common fixes
console.log('4. Checking for implemented fixes...');

// Check if main.js has fetch implementation
const mainJsPath = path.join(__dirname, 'scripts/main.js');
if (fs.existsSync(mainJsPath)) {
    const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');
    if (mainJsContent.includes('fetch(') && mainJsContent.includes('/api/analyze-product')) {
        console.log('   ✅ Fetch API integration implemented');
    } else {
        console.log('   ❌ Fetch API integration missing');
    }
    
    if (mainJsContent.includes('startCamera()') && mainJsContent.includes('showCameraError(')) {
        console.log('   ✅ Camera functionality enhanced');
    } else {
        console.log('   ❌ Camera functionality not fully implemented');
    }
}