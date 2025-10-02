// Main JavaScript for SIKI Mobile-First Web App

// Import configuration
import config from './config.js';

// Use the API base URL from configuration
const API_BASE_URL = config.apiUrl;

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Performance monitoring
if ('performance' in window) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
      console.log('DOM Content Loaded Time:', perfData.domContentLoadedEventEnd - perfData.fetchStart, 'ms');
    }, 0);
  });
}

// DOM Elements
const homePage = document.getElementById('home-page');
const resultPage = document.getElementById('result-page');
const themeToggle = document.getElementById('theme-toggle');
const preferencesButton = document.getElementById('preferences-button');
const cameraSwitch = document.getElementById('camera-switch');
const galleryButton = document.getElementById('gallery-button');
const cameraButton = document.getElementById('camera-button');
const analyzeButton = document.getElementById('analyze-button');
const fileInput = document.getElementById('file-input');
const imagePreviewBar = document.getElementById('image-preview-bar');
const previewContainer = document.querySelector('.preview-container');
const backButton = document.getElementById('back-button');
const expansionPanels = document.querySelectorAll('.expansion-panel');
const cameraViewport = document.querySelector('.camera-viewport');
const cameraStream = document.getElementById('camera-stream');
const captureCanvas = document.getElementById('capture-canvas');

// Preferences Modal Elements
const preferencesModal = document.getElementById('preferences-modal');
const closePreferences = document.querySelector('.close-preferences');
const cancelPreferences = document.querySelector('.cancel-button');
const savePreferences = document.querySelector('.save-button');
const preferenceChips = document.querySelectorAll('.preference-chip');

// Fallback Modal Elements
const fallbackModal = document.getElementById('fallbackModal');
const closeFallbackModal = document.getElementById('closeFallbackModal');
const retryButton = document.getElementById('retryButton');

// State variables
let selectedImages = [];
let currentTheme = 'light';
let isFrontCamera = true;
let currentProduct = null;
let currentUserPreferences = [];
let currentUserId = 'user-' + Date.now(); // In a real app, this would come from authentication
let unsubscribeHistory = null; // For real-time updates
let unsubscribeChat = null; // For real-time updates
let mediaStream = null; // For camera stream
let lastAnalysisAttempt = null; // To track the last analysis attempt

// Check if camera is working properly
function checkCameraStatus() {
    const video = cameraViewport.querySelector('video');
    if (video) {
        // Check if video is actually playing
        if (video.readyState >= 2) { // HAVE_CURRENT_DATA
            console.log('Camera is working properly');
            return true;
        } else {
            console.warn('Camera video is not ready');
            return false;
        }
    } else {
        console.warn('No video element found in camera viewport');
        return false;
    }
}

// Periodically check camera status
function startCameraStatusCheck() {
    setInterval(() => {
        if (mediaStream) {
            checkCameraStatus();
        }
    }, 5000); // Check every 5 seconds
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // Check if we're in a secure context
    if (!isSecureContext) {
        console.warn('Not in a secure context. Camera access may be restricted.');
        // Show a warning to the user
        setTimeout(() => {
            if (cameraViewport) {
                const placeholder = cameraViewport.querySelector('.camera-placeholder');
                if (placeholder) {
                    const instruction = placeholder.querySelector('.camera-instruction');
                    if (instruction) {
                        instruction.innerHTML += '<br><br><strong>Note:</strong> Camera requires HTTPS or localhost. You may need to serve this app locally.';
                    }
                }
            }
        }, 1000);
    }
    
    initializeTheme();
    setupEventListeners();
    loadUserPreferences();
    loadRecentScans();
    initializeCamera();
    
    // Start checking camera status
    startCameraStatusCheck();
    
    // Handle initial page routing based on URL
    handleInitialRouting();
});

// Handle initial routing based on URL hash or path
function handleInitialRouting() {
    // For SPA routing, we'll use hash-based routing
    const hash = window.location.hash;
    
    if (hash === '#/result' && (selectedImages.length > 0 || currentProduct)) {
        navigateToResultPage();
    } else {
        navigateToHomePage();
    }
}

// Theme initialization
function initializeTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    currentTheme = prefersDark ? 'light' : 'dark';
    updateTheme();
}

// Update theme based on currentTheme variable
function updateTheme() {
    document.body.className = `theme-${currentTheme}`;
    const themeIcon = themeToggle.querySelector('.material-icons');
    themeIcon.textContent = currentTheme === 'light' ? 'dark_mode' : 'light_mode';
}

// Initialize camera
async function initializeCamera() {
    try {
        console.log('Initializing camera...');
        
        // Check if we're on a secure context (HTTPS or localhost)
        if (!isSecureContext) {
            console.warn('Camera access requires secure context (HTTPS or localhost)');
            showCameraPermissionMessage('Camera access requires HTTPS or localhost environment. Try using a local server or HTTPS.');
            return;
        }
        
        // Check if mediaDevices API is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.warn('MediaDevices API not supported');
            showCameraPermissionMessage('Camera not supported in this browser. Please try a modern browser like Chrome or Firefox.');
            return;
        }
        
        // Stop any existing stream
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }
        
        // Get camera stream
        const constraints = {
            video: {
                facingMode: isFrontCamera ? 'user' : 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        };
        
        console.log('Requesting camera access with constraints:', constraints);
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Camera access granted');
        
        // Set the video stream to the camera-stream element
        cameraStream.srcObject = mediaStream;
        cameraStream.style.display = 'block';
        
        // Replace camera placeholder with video element
        const cameraPlaceholder = cameraViewport.querySelector('.camera-placeholder');
        if (cameraPlaceholder) {
            cameraViewport.removeChild(cameraPlaceholder);
        }
        
        // Show the camera stream in the viewport
        cameraStream.style.width = '100%';
        cameraStream.style.height = '100%';
        cameraStream.style.objectFit = 'cover';
        cameraStream.autoplay = true;
        cameraStream.playsInline = true;
        cameraViewport.appendChild(cameraStream);
        
        console.log('Camera initialized successfully');
    } catch (error) {
        console.error('Error accessing camera:', error);
        let errorMessage = 'Camera access denied. Please check browser permissions and try again.';
        
        // Provide more specific error messages
        if (error.name === 'NotAllowedError') {
            errorMessage = 'Camera access was denied. Please allow camera permissions when prompted.';
        } else if (error.name === 'NotFoundError' || error.name === 'OverconstrainedError') {
            errorMessage = 'No camera found or camera not compatible with requested constraints.';
        } else if (error.name === 'NotReadableError') {
            errorMessage = 'Camera is already in use by another application.';
        } else if (error.name === 'AbortError') {
            errorMessage = 'Camera access was interrupted. Please try again.';
        }
        
        showCameraPermissionMessage(errorMessage);
        // Keep the placeholder if camera access fails
    }
}

// Function to show camera permission message
function showCameraPermissionMessage(message) {
    // Remove any existing video element
    if (cameraStream.parentNode === cameraViewport) {
        cameraViewport.removeChild(cameraStream);
    }
    
    const cameraPlaceholder = cameraViewport.querySelector('.camera-placeholder') || 
                             cameraViewport.appendChild(document.createElement('div'));
    cameraPlaceholder.className = 'camera-placeholder';
    cameraPlaceholder.innerHTML = `
        <span class="material-icons">photo_camera</span>
        <p>Point your camera at a product</p>
        <p class="camera-instruction">${message}</p>
        <button id="retry-camera" class="retry-button">Retry Camera Access</button>
        <p class="camera-instruction">Or use the gallery button to select an image</p>
    `;
    
    // Add event listener to retry button
    const retryButton = cameraPlaceholder.querySelector('#retry-camera');
    if (retryButton) {
        retryButton.addEventListener('click', function() {
            console.log('Retry camera access button clicked');
            initializeCamera();
        });
    }
}

// Set up all event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        console.log('Theme toggle event listener added');
    } else {
        console.warn('Theme toggle element not found');
    }
    
    // Preferences button
    if (preferencesButton) {
        preferencesButton.addEventListener('click', openPreferences);
        console.log('Preferences button event listener added');
    } else {
        console.warn('Preferences button element not found');
    }
    
    // Camera switch
    if (cameraSwitch) {
        cameraSwitch.addEventListener('click', toggleCamera);
        console.log('Camera switch event listener added');
    } else {
        console.warn('Camera switch element not found');
    }
    
    // Gallery button
    if (galleryButton && fileInput) {
        galleryButton.addEventListener('click', () => {
            console.log('Gallery button clicked');
            fileInput.click();
        });
        fileInput.addEventListener('change', handleFileSelect);
        console.log('Gallery button and file input event listeners added');
    } else {
        console.warn('Gallery button or file input element not found');
    }
    
    // Camera button
    if (cameraButton) {
        cameraButton.addEventListener('click', captureAndAddImage);
        console.log('Camera button event listener added');
    } else {
        console.warn('Camera button element not found');
    }
    
    // Analyze button
    if (analyzeButton) {
        analyzeButton.addEventListener('click', () => analyzeImages());
        console.log('Analyze button event listener added');
    } else {
        console.warn('Analyze button element not found');
    }
    
    // Back button
    if (backButton) {
        backButton.addEventListener('click', navigateToHomePage);
        console.log('Back button event listener added');
    } else {
        console.warn('Back button element not found');
    }
    
    // Expansion panels
    if (expansionPanels && expansionPanels.length > 0) {
        expansionPanels.forEach((panel, index) => {
            const header = panel.querySelector('.panel-header');
            if (header) {
                header.addEventListener('click', () => toggleExpansionPanel(panel));
                console.log(`Expansion panel ${index} event listener added`);
            } else {
                console.warn(`Expansion panel ${index} header not found`);
            }
        });
    } else {
        console.warn('No expansion panels found');
    }
    
    // Chat input
    const chatInput = document.querySelector('.outlined-text-field');
    const sendButton = document.querySelector('.send-button');
    if (chatInput && sendButton) {
        sendButton.addEventListener('click', () => {
            if (chatInput.value.trim()) {
                sendChatMessage(chatInput.value);
                chatInput.value = '';
            }
        });
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && chatInput.value.trim()) {
                sendChatMessage(chatInput.value);
                chatInput.value = '';
            }
        });
        console.log('Chat input event listeners added');
    } else {
        console.warn('Chat input or send button not found');
    }
    
    // Preferences modal
    if (closePreferences) {
        closePreferences.addEventListener('click', closePreferencesModal);
    } else {
        console.warn('Close preferences element not found');
    }
    if (cancelPreferences) {
        cancelPreferences.addEventListener('click', closePreferencesModal);
    } else {
        console.warn('Cancel preferences element not found');
    }
    if (savePreferences) {
        savePreferences.addEventListener('click', saveUserPreferences);
    } else {
        console.warn('Save preferences element not found');
    }
    
    // Preference chips
    if (preferenceChips && preferenceChips.length > 0) {
        preferenceChips.forEach((chip, index) => {
            chip.addEventListener('click', togglePreference);
        });
        console.log('Preference chips event listeners added');
    } else {
        console.warn('No preference chips found');
    }
    
    // Fallback modal
    if (closeFallbackModal) {
        closeFallbackModal.addEventListener('click', hideFallbackModal);
    } else {
        console.warn('Close fallback modal element not found');
    }
    if (retryButton) {
        retryButton.addEventListener('click', retryAnalysis);
    } else {
        console.warn('Retry button element not found');
    }
    
    // Set up real-time listeners when on result page
    if (resultPage) {
        resultPage.addEventListener('DOMSubtreeModified', setupRealTimeListeners);
    }
    
    // Handle browser back/forward navigation
    window.addEventListener('popstate', handleBrowserNavigation);
    
    console.log('All event listeners set up');
}

// Handle browser navigation (back/forward buttons)
function handleBrowserNavigation() {
    handleInitialRouting();
}

// Toggle between light and dark themes
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    updateTheme();
}

// Open preferences modal
function openPreferences() {
    if (preferencesModal) {
        preferencesModal.classList.add('active');
    }
}

// Close preferences modal
function closePreferencesModal() {
    if (preferencesModal) {
        preferencesModal.classList.remove('active');
    }
}

// Toggle preference selection
function togglePreference(e) {
    const chip = e.target;
    chip.classList.toggle('selected');
}

// Save user preferences
async function saveUserPreferences() {
    // Get selected preferences
    const selectedChips = document.querySelectorAll('.preference-chip.selected');
    currentUserPreferences = Array.from(selectedChips).map(chip => chip.dataset.preference);
    
    // Organize preferences by category
    const preferences = {
        dietaryRestrictions: currentUserPreferences.filter(pref => 
            ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'keto', 'paleo'].includes(pref)),
        allergies: currentUserPreferences.filter(pref => 
            ['nuts', 'peanuts', 'shellfish', 'soy', 'eggs', 'milk'].includes(pref)),
        healthGoals: currentUserPreferences.filter(pref => 
            ['low-sugar', 'high-protein', 'low-calorie', 'heart-healthy'].includes(pref))
    };
    
    // In a real implementation, you would send this to the backend
    try {
        const response = await fetch(`${API_BASE_URL}/api/user-preferences`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUserId,
                preferences: preferences
            })
        });
        
        if (response.ok) {
            console.log('Preferences saved successfully');
            closePreferencesModal();
        } else {
            console.error('Failed to save preferences');
        }
    } catch (error) {
        console.error('Error saving preferences:', error);
    }
}

// Load user preferences
async function loadUserPreferences() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/user-preferences/${currentUserId}`);
        if (response.ok) {
            const data = await response.json();
            if (data.preferences) {
                // Apply preferences to UI
                const allPreferences = [
                    ...(data.preferences.dietaryRestrictions || []),
                    ...(data.preferences.allergies || []),
                    ...(data.preferences.healthGoals || [])
                ];
                
                // Select the corresponding chips
                allPreferences.forEach(pref => {
                    const chip = document.querySelector(`.preference-chip[data-preference="${pref}"]`);
                    if (chip) {
                        chip.classList.add('selected');
                    }
                });
                
                currentUserPreferences = allPreferences;
            }
        }
    } catch (error) {
        console.error('Error loading preferences:', error);
    }
}

// Load recent scans
async function loadRecentScans() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/history`);
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.history) {
                console.log('Recent scans loaded:', data.history);
                // Here you would update the UI with the recent scans
                // For example, populate a recent scans section
            }
        }
    } catch (error) {
        console.error('Error loading recent scans:', error);
    }
}

// Set up real-time listeners for Firestore updates
function setupRealTimeListeners() {
    // This would be implemented when we have Firebase client-side SDK
    // For now, we'll simulate with periodic polling
    console.log('Setting up real-time listeners...');
}

// Toggle between front and back camera
function toggleCamera() {
    isFrontCamera = !isFrontCamera;
    const cameraIcon = cameraSwitch.querySelector('.material-icons');
    if (cameraIcon) {
        cameraIcon.textContent = isFrontCamera ? 'flip_camera_ios' : 'flip_camera_android';
    }
    
    // Restart camera with new constraints
    if (mediaStream) {
        // Stop current stream
        mediaStream.getTracks().forEach(track => {
            console.log('Stopping track:', track.kind);
            track.stop();
        });
        mediaStream = null;
    }
    
    // Clear the camera viewport
    while (cameraViewport.firstChild) {
        cameraViewport.removeChild(cameraViewport.firstChild);
    }
    
    // Show placeholder while initializing
    const placeholder = document.createElement('div');
    placeholder.className = 'camera-placeholder';
    placeholder.innerHTML = `
        <span class="material-icons">photo_camera</span>
        <p>Switching camera...</p>
        <p class="camera-instruction">Please wait</p>
    `;
    cameraViewport.appendChild(placeholder);
    
    // Initialize camera with new constraints after a short delay
    setTimeout(() => {
        initializeCamera();
    }, 500);
    
    console.log(`Switched to ${isFrontCamera ? 'front' : 'back'} camera`);
}

// Handle file selection from gallery
function handleFileSelect(event) {
    console.log('File selected:', event.target.files);
    const files = event.target.files;
    if (files && files.length > 0) {
        // Validate file types
        const validFiles = Array.from(files).filter(file => {
            const isValidType = file.type.startsWith('image/');
            if (!isValidType) {
                console.warn('Invalid file type selected:', file.name, file.type);
            }
            return isValidType;
        });
        
        if (validFiles.length === 0) {
            alert('Please select valid image files (JPEG, PNG, etc.)');
            return;
        }
        
        // Add each selected file to the preview
        validFiles.forEach(file => {
            addImageToPreview(file);
        });
        updateAnalyzeButtonState();
    } else {
        console.log('No files selected');
    }
}

// Capture image from camera
async function captureImageFromCamera() {
    try {
        // Check if we have a camera stream
        if (!cameraStream.srcObject) {
            throw new Error('No camera stream available. Camera may not be initialized properly.');
        }
        
        // Check if video is actually playing
        if (cameraStream.readyState < 2) { // HAVE_CURRENT_DATA
            throw new Error('Camera is not ready yet. Please wait for camera to initialize.');
        }
        
        // Set canvas dimensions to match video
        captureCanvas.width = cameraStream.videoWidth;
        captureCanvas.height = cameraStream.videoHeight;
        
        // Draw the current video frame to the canvas
        const ctx = captureCanvas.getContext('2d');
        ctx.drawImage(cameraStream, 0, 0, captureCanvas.width, captureCanvas.height);
        
        // Convert canvas to blob
        return new Promise((resolve, reject) => {
            captureCanvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
                    resolve(file);
                } else {
                    reject(new Error('Failed to create image from camera'));
                }
            }, 'image/jpeg', 0.9);
        });
    } catch (error) {
        console.error('Error capturing image from camera:', error);
        throw error;
    }
}

// Capture image from camera and add to preview
async function captureAndAddImage() {
    console.log('Capture button clicked');
    try {
        const imageFile = await captureImageFromCamera();
        if (imageFile) {
            addImageToPreview(imageFile);
            updateAnalyzeButtonState();
        } else {
            throw new Error('Failed to capture image from camera');
        }
    } catch (error) {
        console.error('Error capturing image:', error);
        // Show error to user
        alert('Failed to capture image. Please try again or select an image from your gallery.');
        // Fallback to simulated capture
        simulateCameraCapture();
    }
}

// Simulate camera capture (fallback)
function simulateCameraCapture() {
    console.log('Simulating camera capture');
    // In a real app, this would capture an image from the camera
    // For demo purposes, we'll create a placeholder
    const placeholderImage = new File([], 'camera-capture.jpg', { type: 'image/jpeg' });
    addImageToPreview(placeholderImage);
    updateAnalyzeButtonState();
}

// Add image to preview bar
function addImageToPreview(file) {
    console.log('Adding image to preview:', file);
    selectedImages.push(file);
    
    // Show the preview bar
    if (imagePreviewBar) {
        imagePreviewBar.classList.add('active');
    }
    
    // Create thumbnail element
    const thumbnail = document.createElement('div');
    thumbnail.className = 'preview-thumbnail';
    
    // Create image preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '8px';
        thumbnail.appendChild(img);
    };
    reader.readAsDataURL(file);
    
    // Create close icon
    const closeIcon = document.createElement('div');
    closeIcon.className = 'close-icon material-icons';
    closeIcon.textContent = 'close';
    
    // Add event listener to remove image
    closeIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        removeImage(thumbnail, selectedImages.length - 1);
    });
    
    // Add elements to thumbnail
    thumbnail.appendChild(closeIcon);
    
    // Add thumbnail to container
    if (previewContainer) {
        previewContainer.appendChild(thumbnail);
    }
    
    console.log('Image added to preview');
}

// Remove image from preview
function removeImage(thumbnailElement, index) {
    console.log('Removing image from preview');
    // Remove from array
    selectedImages.splice(index, 1);
    
    // Remove from DOM
    if (thumbnailElement) {
        thumbnailElement.remove();
    }
    
    // Hide preview bar if no images
    if (selectedImages.length === 0 && imagePreviewBar) {
        imagePreviewBar.classList.remove('active');
    }
    
    updateAnalyzeButtonState();
}

// Update analyze button state based on selected images
function updateAnalyzeButtonState() {
    console.log('Updating analyze button state. Selected images:', selectedImages.length);
    if (analyzeButton) {
        if (selectedImages.length > 0) {
            analyzeButton.classList.remove('disabled');
            analyzeButton.disabled = false;
            console.log('Analyze button enabled');
        } else {
            analyzeButton.classList.add('disabled');
            analyzeButton.disabled = true;
            console.log('Analyze button disabled');
        }
    }
}

// Show fallback modal
function showFallbackModal(message = "We couldn't analyze this item. Try scanning a clearer image or select a product manually.") {
    const messageElement = fallbackModal ? fallbackModal.querySelector('p') : null;
    if (messageElement) {
        messageElement.textContent = message;
    }
    if (fallbackModal) {
        fallbackModal.classList.remove('hidden');
    }
}

// Hide fallback modal
function hideFallbackModal() {
    if (fallbackModal) {
        fallbackModal.classList.add('hidden');
    }
}

// Retry analysis
function retryAnalysis() {
    hideFallbackModal();
    if (lastAnalysisAttempt) {
        analyzeImages(lastAnalysisAttempt);
    }
}

// Analyze images using OCR and computer vision
async function analyzeImages(imageFile = null) {
    console.log('Analyzing images...');
    
    // Store the attempt for potential retry
    lastAnalysisAttempt = imageFile || (selectedImages.length > 0 ? selectedImages[0] : null);
    
    const imageToAnalyze = imageFile || (selectedImages.length > 0 ? selectedImages[0] : null);
    
    if (!imageToAnalyze) {
        showFallbackModal("No image selected for analysis. Please capture or select an image first.");
        return;
    }
    
    // Show loading state
    let originalButtonText = '';
    if (analyzeButton) {
        originalButtonText = analyzeButton.innerHTML;
        analyzeButton.innerHTML = '<span class="material-icons">hourglass_empty</span> Analyzing...';
        analyzeButton.classList.add('disabled');
        analyzeButton.disabled = true;
    }
    
    try {
        // In a real implementation, we would send the image to the backend
        const formData = new FormData();
        formData.append('image', imageToAnalyze);
        
        console.log('Sending image for analysis...');
        
        // Check if we have a valid API URL
        if (!API_BASE_URL || API_BASE_URL === 'undefined') {
            throw new Error('API base URL is not configured properly');
        }
        
        const response = await fetch(`${API_BASE_URL}/api/analyze-product`, {
            method: 'POST',
            body: formData
        });
        
        console.log('Analysis response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Analysis response data:', data);
            
            if (data.success) {
                // Process the response
                processProductData(data.product);
                navigateToResultPage();
                
                // Log the product analysis to the backend
                await logProductAnalysis(data.product);
            } else {
                console.error('Analysis failed with message:', data.error);
                showFallbackModal(data.error || "Analysis failed. Please try again with a clearer image.");
            }
        } else {
            const errorText = await response.text();
            console.error('Analysis failed with HTTP error:', response.status, errorText);
            
            let errorMessage = `Analysis failed (${response.status}). Please try again.`;
            if (response.status === 404) {
                errorMessage = "Analysis service not found. Please check if the backend is running.";
            } else if (response.status === 500) {
                errorMessage = "Server error occurred. Please try again later.";
            } else if (response.status === 0) {
                errorMessage = "Network error. Please check your connection and try again.";
            }
            
            showFallbackModal(errorMessage);
        }
    } catch (error) {
        console.error('Analysis failed with exception:', error);
        
        let errorMessage = "Analysis failed due to a network error. Please check your connection and try again.";
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage = "Could not connect to the analysis service. Please make sure the backend server is running.";
        } else if (error.name === 'AbortError') {
            errorMessage = "Analysis request timed out. Please try again.";
        }
        
        showFallbackModal(errorMessage);
    } finally {
        // Reset button
        if (analyzeButton) {
            analyzeButton.innerHTML = originalButtonText;
            analyzeButton.classList.remove('disabled');
            analyzeButton.disabled = false;
        }
    }
}

// Log product analysis to the backend
async function logProductAnalysis(productData) {
    try {
        // Send product analysis to backend for storage
        const response = await fetch(`${API_BASE_URL}/api/store-product`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product: productData,
                userId: currentUserId
            })
        });
        
        if (response.ok) {
            console.log('Product analysis logged successfully');
        } else {
            console.error('Failed to log product analysis');
        }
    } catch (error) {
        console.error('Error logging product analysis:', error);
    }
}

// Process product data and update UI
function processProductData(product) {
    currentProduct = product;
    
    // Update product name
    const productNameElement = document.querySelector('.product-name');
    if (productNameElement) {
        productNameElement.textContent = product.name;
    }
    
    // Update assessment text and color based on score
    const assessmentTextElement = document.querySelector('.assessment-text');
    if (assessmentTextElement) {
        let assessmentText, bgColor, textColor;
        if (product.score >= 80) {
            assessmentText = "Overall Health Assessment: Excellent";
            bgColor = "var(--success-color)";
            textColor = "var(--on-success)";
        } else if (product.score >= 60) {
            assessmentText = "Overall Health Assessment: Good";
            bgColor = "var(--caution-color)";
            textColor = "var(--on-caution)";
        } else {
            assessmentText = "Overall Health Assessment: Poor";
            bgColor = "var(--warning-color)";
            textColor = "var(--on-warning)";
        }
        
        assessmentTextElement.textContent = assessmentText;
        const scoreVisualization = document.querySelector('.score-visualization');
        if (scoreVisualization) {
            scoreVisualization.style.backgroundColor = bgColor;
            scoreVisualization.style.color = textColor;
        }
    }
    
    // Update ingredients list
    const ingredientsList = document.querySelector('.ingredients-list');
    if (ingredientsList && product.ingredients && product.ingredients.length > 0) {
        ingredientsList.innerHTML = '';
        product.ingredients.forEach(ingredient => {
            const li = document.createElement('li');
            li.textContent = ingredient.name || ingredient;
            
            // For demo purposes, we'll add risk indicators
            const span = document.createElement('span');
            // In a real app, this would come from the analysis
            const risk = Math.random() > 0.7 ? 'caution' : Math.random() > 0.9 ? 'warning' : 'safe';
            span.className = risk;
            span.textContent = risk === 'safe' ? ' - Safe' : 
                              risk === 'caution' ? ' - Caution' : ' - Warning';
            li.appendChild(span);
            
            ingredientsList.appendChild(li);
        });
    }
    
    // Update nutrition data
    const nutritionPanel = document.querySelectorAll('.expansion-panel')[1];
    if (nutritionPanel && product.nutrition) {
        const panelContent = nutritionPanel.querySelector('.panel-content');
        if (panelContent) {
            // Clear existing content
            panelContent.innerHTML = '';
            
            // Add nutrition items
            Object.keys(product.nutrition).forEach(key => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'nutrition-item';
                
                const labelSpan = document.createElement('span');
                labelSpan.className = 'nutrition-label';
                labelSpan.textContent = key.charAt(0).toUpperCase() + key.slice(1);
                
                const valueSpan = document.createElement('span');
                valueSpan.className = 'nutrition-value';
                valueSpan.textContent = product.nutrition[key];
                
                const progressBar = document.createElement('div');
                progressBar.className = 'progress-bar';
                
                const progressFill = document.createElement('div');
                progressFill.className = 'progress-fill';
                // In a real app, this would be based on actual nutritional values
                if (key === 'sugar') {
                    const sugarValue = parseInt(product.nutrition[key]) || 0;
                    progressFill.classList.add(sugarValue > 10 ? 'warning' : 'success');
                    progressFill.style.width = Math.min(100, sugarValue * 5) + '%';
                } else if (key === 'calories') {
                    const calValue = parseInt(product.nutrition[key]) || 0;
                    progressFill.classList.add(calValue > 200 ? 'warning' : 'success');
                    progressFill.style.width = Math.min(100, calValue / 2) + '%';
                } else {
                    progressFill.classList.add('success');
                    progressFill.style.width = '50%';
                }
                
                progressBar.appendChild(progressFill);
                
                itemDiv.appendChild(labelSpan);
                itemDiv.appendChild(valueSpan);
                itemDiv.appendChild(progressBar);
                
                panelContent.appendChild(itemDiv);
            });
        }
    }
    
    // Show/hide alternatives CTA based on product score
    const alternativesCta = document.querySelector('.alternatives-cta');
    if (alternativesCta) {
        if (product.score < 70) {
            alternativesCta.style.display = 'flex';
        } else {
            alternativesCta.style.display = 'none';
        }
    }
}

// Send chat message to AI
async function sendChatMessage(message) {
    if (!message.trim() || !currentProduct) return;
    
    const chatInput = document.querySelector('.outlined-text-field');
    const chatBubbleContainer = document.querySelector('.panel-content');
    
    // Clear input
    if (chatInput) {
        chatInput.value = '';
    }
    
    // Add user message to chat
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble';
    userBubble.style.backgroundColor = 'var(--primary)';
    userBubble.style.color = 'var(--on-primary)';
    userBubble.style.marginBottom = '10px';
    userBubble.style.textAlign = 'right';
    userBubble.innerHTML = `<p>${message}</p>`;
    if (chatBubbleContainer) {
        chatBubbleContainer.appendChild(userBubble);
    }
    
    try {
        // Send message to backend
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productId: currentProduct.id,
                query: message,
                userId: currentUserId
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                // Add AI response to chat
                const aiBubble = document.createElement('div');
                aiBubble.className = 'chat-bubble';
                aiBubble.style.marginBottom = '10px';
                aiBubble.innerHTML = `<p>${data.reply}</p>`;
                if (chatBubbleContainer) {
                    chatBubbleContainer.appendChild(aiBubble);
                }
                
                // Scroll to bottom
                if (chatBubbleContainer) {
                    chatBubbleContainer.scrollTop = chatBubbleContainer.scrollHeight;
                }
                
                // Log chat interaction
                await logChatInteraction(message, data.reply);
            } else {
                throw new Error('Failed to get AI response');
            }
        } else {
            throw new Error('Failed to get AI response');
        }
    } catch (error) {
        console.error('Chat error:', error);
        const errorBubble = document.createElement('div');
        errorBubble.className = 'chat-bubble';
        errorBubble.style.marginBottom = '10px';
        errorBubble.innerHTML = `<p>Sorry, I couldn't process your request. Please try again.</p>`;
        if (chatBubbleContainer) {
            chatBubbleContainer.appendChild(errorBubble);
        }
    }
}

// Log chat interaction to the backend
async function logChatInteraction(query, response) {
    try {
        // Send chat log to backend for storage
        const chatLogResponse = await fetch(`${API_BASE_URL}/api/chat-log`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productId: currentProduct ? currentProduct.id : null,
                userId: currentUserId,
                query: query,
                response: response
            })
        });
        
        if (chatLogResponse.ok) {
            console.log('Chat interaction logged successfully');
        } else {
            console.error('Failed to log chat interaction');
        }
    } catch (error) {
        console.error('Error logging chat interaction:', error);
    }
}

// Navigate to result page
function navigateToResultPage() {
    console.log('Navigating to result page');
    if ((selectedImages.length > 0 || lastAnalysisAttempt || currentProduct) && homePage && resultPage) {
        homePage.classList.remove('active');
        resultPage.classList.add('active');
        // Update URL for SPA routing
        window.location.hash = '#/result';
        // Set up real-time listeners when navigating to result page
        setupRealTimeListeners();
    }
}

// Navigate to home page
function navigateToHomePage() {
    console.log('Navigating to home page');
    if (homePage && resultPage) {
        resultPage.classList.remove('active');
        homePage.classList.add('active');
        // Update URL for SPA routing
        window.location.hash = '';
        // Clean up real-time listeners when leaving result page
        cleanupRealTimeListeners();
    }
}

// Clean up real-time listeners
function cleanupRealTimeListeners() {
    if (unsubscribeHistory) {
        unsubscribeHistory();
        unsubscribeHistory = null;
    }
    if (unsubscribeChat) {
        unsubscribeChat();
        unsubscribeChat = null;
    }
}

// Toggle expansion panel
function toggleExpansionPanel(panel) {
    // Close all other panels
    if (expansionPanels) {
        expansionPanels.forEach(p => {
            if (p !== panel) {
                p.classList.remove('active');
            }
        });
    }
    
    // Toggle current panel
    if (panel) {
        panel.classList.toggle('active');
    }
}