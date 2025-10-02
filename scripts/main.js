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

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    setupEventListeners();
    loadUserPreferences();
    loadRecentScans();
    initializeCamera();
});

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
        // Check if we're on a secure context (HTTPS or localhost)
        if (!isSecureContext) {
            console.warn('Camera access requires secure context (HTTPS or localhost)');
            return;
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
        
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Create video element for camera preview
        const video = document.createElement('video');
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        video.autoplay = true;
        video.playsInline = true;
        video.srcObject = mediaStream;
        
        // Replace camera placeholder with video element
        const cameraPlaceholder = cameraViewport.querySelector('.camera-placeholder');
        if (cameraPlaceholder) {
            cameraViewport.removeChild(cameraPlaceholder);
        }
        cameraViewport.appendChild(video);
        
        console.log('Camera initialized successfully');
    } catch (error) {
        console.error('Error accessing camera:', error);
        // Keep the placeholder if camera access fails
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Preferences button
    preferencesButton.addEventListener('click', openPreferences);
    
    // Camera switch
    cameraSwitch.addEventListener('click', toggleCamera);
    
    // Gallery button
    galleryButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    
    // Camera button
    cameraButton.addEventListener('click', captureAndAddImage);
    
    // Analyze button
    analyzeButton.addEventListener('click', analyzeImages);
    
    // Back button
    backButton.addEventListener('click', navigateToHomePage);
    
    // Expansion panels
    expansionPanels.forEach(panel => {
        const header = panel.querySelector('.panel-header');
        header.addEventListener('click', () => toggleExpansionPanel(panel));
    });
    
    // Chat input
    const chatInput = document.querySelector('.outlined-text-field');
    const sendButton = document.querySelector('.send-button');
    if (chatInput && sendButton) {
        sendButton.addEventListener('click', () => sendChatMessage(chatInput.value));
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendChatMessage(chatInput.value);
            }
        });
    }
    
    // Preferences modal
    closePreferences.addEventListener('click', closePreferencesModal);
    cancelPreferences.addEventListener('click', closePreferencesModal);
    savePreferences.addEventListener('click', saveUserPreferences);
    
    // Preference chips
    preferenceChips.forEach(chip => {
        chip.addEventListener('click', togglePreference);
    });
    
    // Fallback modal
    closeFallbackModal.addEventListener('click', hideFallbackModal);
    retryButton.addEventListener('click', retryAnalysis);
    
    // Set up real-time listeners when on result page
    resultPage.addEventListener('DOMSubtreeModified', setupRealTimeListeners);
}

// Toggle between light and dark themes
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    updateTheme();
}

// Open preferences modal
function openPreferences() {
    preferencesModal.classList.add('active');
}

// Close preferences modal
function closePreferencesModal() {
    preferencesModal.classList.remove('active');
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
    cameraIcon.textContent = isFrontCamera ? 'flip_camera_ios' : 'flip_camera_android';
    
    // Restart camera with new constraints
    if (mediaStream) {
        // Stop current stream
        mediaStream.getTracks().forEach(track => track.stop());
    }
    
    // Initialize camera with new constraints
    initializeCamera();
    
    console.log(`Switched to ${isFrontCamera ? 'front' : 'back'} camera`);
}

// Handle file selection from gallery
function handleFileSelect(event) {
    const files = event.target.files;
    if (files.length > 0) {
        // Add each selected file to the preview
        for (let i = 0; i < files.length; i++) {
            addImageToPreview(files[i]);
        }
        updateAnalyzeButtonState();
    }
}

// Capture image from camera
async function captureImageFromCamera() {
    try {
        const video = cameraViewport.querySelector('video');
        if (!video) {
            throw new Error('No video element found');
        }
        
        // Create canvas to capture image
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
                resolve(file);
            }, 'image/jpeg', 0.9);
        });
    } catch (error) {
        console.error('Error capturing image from camera:', error);
        throw error;
    }
}

// Capture image from camera and add to preview
async function captureAndAddImage() {
    try {
        const imageFile = await captureImageFromCamera();
        addImageToPreview(imageFile);
        updateAnalyzeButtonState();
    } catch (error) {
        console.error('Error capturing image:', error);
        // Fallback to simulated capture
        simulateCameraCapture();
    }
}

// Simulate camera capture (fallback)
function simulateCameraCapture() {
    // In a real app, this would capture an image from the camera
    // For demo purposes, we'll create a placeholder
    const placeholderImage = new File([], 'camera-capture.jpg', { type: 'image/jpeg' });
    addImageToPreview(placeholderImage);
    updateAnalyzeButtonState();
}

// Add image to preview bar
function addImageToPreview(file) {
    selectedImages.push(file);
    
    // Show the preview bar
    imagePreviewBar.classList.add('active');
    
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
    previewContainer.appendChild(thumbnail);
}

// Remove image from preview
function removeImage(thumbnailElement, index) {
    // Remove from array
    selectedImages.splice(index, 1);
    
    // Remove from DOM
    thumbnailElement.remove();
    
    // Hide preview bar if no images
    if (selectedImages.length === 0) {
        imagePreviewBar.classList.remove('active');
    }
    
    updateAnalyzeButtonState();
}

// Update analyze button state based on selected images
function updateAnalyzeButtonState() {
    if (selectedImages.length > 0) {
        analyzeButton.classList.remove('disabled');
        analyzeButton.disabled = false;
    } else {
        analyzeButton.classList.add('disabled');
        analyzeButton.disabled = true;
    }
}

// Show fallback modal
function showFallbackModal(message = "We couldn't analyze this item. Try scanning a clearer image or select a product manually.") {
    const messageElement = fallbackModal.querySelector('p');
    if (messageElement) {
        messageElement.textContent = message;
    }
    fallbackModal.classList.remove('hidden');
}

// Hide fallback modal
function hideFallbackModal() {
    fallbackModal.classList.add('hidden');
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
    // Store the attempt for potential retry
    lastAnalysisAttempt = imageFile || (selectedImages.length > 0 ? selectedImages[0] : null);
    
    const imageToAnalyze = imageFile || (selectedImages.length > 0 ? selectedImages[0] : null);
    
    if (!imageToAnalyze) {
        showFallbackModal("No image selected for analysis. Please capture or select an image first.");
        return;
    }
    
    // Show loading state
    const originalButtonText = analyzeButton.innerHTML;
    analyzeButton.innerHTML = '<span class="material-icons">hourglass_empty</span>';
    analyzeButton.classList.add('disabled');
    
    try {
        // In a real implementation, we would send the image to the backend
        const formData = new FormData();
        formData.append('image', imageToAnalyze);
        
        console.log('Sending image for analysis...');
        
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
            showFallbackModal(`Analysis failed (${response.status}). Please try again.`);
        }
    } catch (error) {
        console.error('Analysis failed with exception:', error);
        showFallbackModal("Analysis failed due to a network error. Please check your connection and try again.");
    } finally {
        // Reset button
        analyzeButton.innerHTML = originalButtonText;
        analyzeButton.classList.remove('disabled');
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
    chatInput.value = '';
    
    // Add user message to chat
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble';
    userBubble.style.backgroundColor = 'var(--primary)';
    userBubble.style.color = 'var(--on-primary)';
    userBubble.style.marginBottom = '10px';
    userBubble.style.textAlign = 'right';
    userBubble.innerHTML = `<p>${message}</p>`;
    chatBubbleContainer.appendChild(userBubble);
    
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
                chatBubbleContainer.appendChild(aiBubble);
                
                // Scroll to bottom
                chatBubbleContainer.scrollTop = chatBubbleContainer.scrollHeight;
                
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
        chatBubbleContainer.appendChild(errorBubble);
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
    if (selectedImages.length > 0 || lastAnalysisAttempt) {
        homePage.classList.remove('active');
        resultPage.classList.add('active');
        // Set up real-time listeners when navigating to result page
        setupRealTimeListeners();
    }
}

// Navigate to home page
function navigateToHomePage() {
    resultPage.classList.remove('active');
    homePage.classList.add('active');
    // Clean up real-time listeners when leaving result page
    cleanupRealTimeListeners();
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
    expansionPanels.forEach(p => {
        if (p !== panel) {
            p.classList.remove('active');
        }
    });
    
    // Toggle current panel
    panel.classList.toggle('active');
}