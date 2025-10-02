// Final Camera Test Script for SIKI Application

console.log('=== SIKI Camera Functionality Verification ===\n');

// Check if we're in the SIKI application context
if (typeof document !== 'undefined') {
    console.log('1. Verifying SIKI application context...');
    
    // Check for required elements
    const page1 = document.getElementById('page-1');
    const cameraStream = document.getElementById('camera-stream');
    const cameraViewport = document.querySelector('.camera-viewport');
    const cameraPlaceholder = cameraViewport ? cameraViewport.querySelector('.camera-placeholder') : null;
    
    if (page1 && cameraStream && cameraViewport) {
        console.log('   ✅ SIKI application context detected');
    } else {
        console.log('   ❌ Not in SIKI application context');
        console.log('   Required elements:');
        console.log('   - page-1:', !!page1);
        console.log('   - camera-stream:', !!cameraStream);
        console.log('   - camera-viewport:', !!cameraViewport);
    }
    
    console.log('\n2. Checking camera elements...');
    console.log('   camera-stream display style:', cameraStream ? cameraStream.style.display : 'N/A');
    console.log('   camera-stream srcObject:', cameraStream ? !!cameraStream.srcObject : 'N/A');
    
    if (cameraPlaceholder) {
        console.log('   camera-placeholder display style:', cameraPlaceholder.style.display);
    } else {
        console.log('   camera-placeholder: NOT FOUND');
    }
    
    console.log('\n3. Checking camera API...');
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log('   ✅ Camera API available');
    } else {
        console.log('   ❌ Camera API not available');
    }
    
    console.log('\n4. Checking secure context...');
    if (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        console.log('   ✅ Running in secure context');
    } else {
        console.log('   ❌ NOT running in secure context');
    }
    
    console.log('\n5. Testing event listeners...');
    // Check if the retry button event listener is properly attached
    const retryBtn = document.getElementById('retry-camera');
    if (retryBtn) {
        console.log('   ✅ Retry button found');
        console.log('   Retry button has click listeners:', retryBtn.hasAttribute('data-listener-attached'));
    } else {
        console.log('   ℹ️  Retry button not currently visible');
    }
    
    console.log('\n=== Troubleshooting Guide ===');
    console.log('If camera is still not working:');
    console.log('1. Check browser permissions for camera access');
    console.log('2. Ensure you are using HTTPS or localhost');
    console.log('3. Close other applications using the camera');
    console.log('4. Click the Retry button if visible');
    console.log('5. Refresh the page');
    console.log('6. Check browser console for detailed error messages');
    
} else {
    console.log('Not running in browser context');
}

console.log('\n=== Test Complete ===');