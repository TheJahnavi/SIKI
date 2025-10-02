// Main JavaScript for SIKI Mobile-First Web App - Definitive Specification Implementation

// DOM Elements
const page1 = document.getElementById('page-1');
const page2 = document.getElementById('page-2');
const themeToggle = document.getElementById('theme-toggle');
const cameraSwitch = document.getElementById('camera-switch');
const uploadButton = document.getElementById('upload-button');
const cameraButton = document.getElementById('camera-button');
const analyzeButton = document.getElementById('analyze-button');
const uploadInput = document.getElementById('upload-input');
const imagePreviewBar = document.getElementById('image-preview-bar');
const previewContainer = document.querySelector('.preview-container');
const backButton = document.getElementById('back-button');
const expansionPanels = document.querySelectorAll('.expansion-panel');
const cameraViewport = document.querySelector('.camera-viewport');
const cameraStream = document.getElementById('camera-stream');
const captureCanvas = document.getElementById('capture-canvas');
const productNameElement = document.getElementById('product-name');
const productNameResultElement = document.getElementById('product-name-result');
const assessmentTextElement = document.getElementById('assessment-text');
const ingredientsList = document.querySelector('.ingredients-list');
const scoreVisualization = document.querySelector('.score-visualization');

// State variables
let selectedImages = [];
let currentTheme = 'light';
let isFrontCamera = true;
let currentProduct = null;
let mediaStream = null;

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing SIKI App');
    initializeTheme();
    setupEventListeners();
    
    // Delay camera initialization to ensure elements are ready
    setTimeout(() => {
        startCamera(); // Start camera after a short delay
    }, 500);
});

// Initialize theme based on system preference or saved preference
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    updateTheme();
}

// Update theme based on currentTheme variable
function updateTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    const themeIcon = themeToggle.querySelector('.material-icons');
    if (themeIcon) {
        themeIcon.textContent = currentTheme === 'light' ? 'dark_mode' : 'light_mode';
    }
}

// Toggle between light and dark themes
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    updateTheme();
    localStorage.setItem('theme', currentTheme);
}

// Set up all event listeners
function setupEventListeners() {
    // Theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Camera switch
    if (cameraSwitch) {
        cameraSwitch.addEventListener('click', toggleCamera);
    }
    
    // Upload button
    if (uploadButton) {
        uploadButton.addEventListener('click', () => {
            if (uploadInput) {
                uploadInput.click();
            }
        });
    }
    
    // Upload input
    if (uploadInput) {
        uploadInput.addEventListener('change', handleFileSelect);
    }
    
    // Camera button
    if (cameraButton) {
        cameraButton.addEventListener('click', captureImage);
    }
    
    // Analyze button
    if (analyzeButton) {
        analyzeButton.addEventListener('click', analyzeImage);
    }
    
    // Back button
    if (backButton) {
        backButton.addEventListener('click', navigateToHomePage);
    }
    
    // Expansion panels
    if (expansionPanels && expansionPanels.length > 0) {
        expansionPanels.forEach(panel => {
            const header = panel.querySelector('.panel-header');
            if (header) {
                header.addEventListener('click', () => toggleExpansionPanel(panel));
            }
        });
    }
    
    // Chat input
    const chatInput = document.querySelector('.outlined-text-field');
    const sendButton = document.querySelector('.send-button');
    
    if (sendButton) {
        sendButton.addEventListener('click', () => {
            if (chatInput && chatInput.value.trim()) {
                sendChatMessage(chatInput.value);
                chatInput.value = '';
            }
        });
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && chatInput.value.trim()) {
                sendChatMessage(chatInput.value);
                chatInput.value = '';
            }
        });
    }
    
    // Handle Q&A section opening for input area
    const qaPanel = [...expansionPanels].find(panel => 
        panel.querySelector('.panel-title') && 
        panel.querySelector('.panel-title').textContent.includes('Q&A'));
    
    if (qaPanel) {
        const qaHeader = qaPanel.querySelector('.panel-header');
        if (qaHeader) {
            qaHeader.addEventListener('click', () => {
                const qaInputArea = document.querySelector('.qa-input-area');
                setTimeout(() => {
                    if (qaPanel.classList.contains('active')) {
                        if (qaInputArea) {
                            qaInputArea.classList.add('active');
                        }
                    } else {
                        if (qaInputArea) {
                            qaInputArea.classList.remove('active');
                        }
                    }
                }, 300); // Delay to match expansion animation
            });
        }
    }
}

// 📸 Start Camera
function startCamera() {
    console.log('Attempting to start camera...');
    
    // Check if we have the required elements
    if (!cameraStream) {
        console.error('Camera stream element not found');
        showCameraError(new Error('Camera stream element not found'));
        return;
    }
    
    // Stop any existing stream
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    
    // Ensure camera stream element is properly configured
    cameraStream.autoplay = true;
    cameraStream.playsInline = true;
    cameraStream.muted = true;
    
    const constraints = {
        video: {
            facingMode: isFrontCamera ? 'user' : 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    };
    
    // Check if we're in a secure context
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        console.warn('Not in secure context - camera may not work');
        showCameraError(new Error('Camera requires HTTPS or localhost'));
        return;
    }
    
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            console.log('Camera stream obtained successfully');
            mediaStream = stream;
            cameraStream.srcObject = stream;
            
            // Make sure the camera stream is visible
            cameraStream.style.display = 'block';
            cameraStream.style.position = 'relative';
            cameraStream.style.zIndex = '1';
            
            // Hide placeholder when camera is active
            const placeholder = cameraViewport.querySelector('.camera-placeholder');
            if (placeholder) {
                placeholder.style.display = 'none';
            }
            
            // Show scanning indicator
            const scanningIndicator = cameraViewport.querySelector('.scanning-indicator');
            if (scanningIndicator) {
                scanningIndicator.style.display = 'block';
            }
            
            console.log('Camera started successfully');
        })
        .catch(err => {
            console.error('Camera error:', err);
            // Provide more user-friendly error messages
            let userMessage = err.message;
            if (err.name === 'NotAllowedError') {
                userMessage = 'Camera access denied. Please allow camera permissions in your browser settings.';
            } else if (err.name === 'NotFoundError') {
                userMessage = 'No camera found. Please connect a camera device.';
            } else if (err.name === 'NotReadableError') {
                userMessage = 'Camera is busy. Please close other applications using the camera.';
            } else if (err.name === 'OverconstrainedError') {
                userMessage = 'Camera constraints cannot be satisfied. Trying fallback options.';
                // Try with simpler constraints
                fallbackCamera();
                return;
            }
            
            showCameraError(new Error(userMessage));
        });
}

// Fallback camera function with simpler constraints
function fallbackCamera() {
    console.log('Trying fallback camera constraints...');
    
    const fallbackConstraints = {
        video: true // Simplest constraint
    };
    
    navigator.mediaDevices.getUserMedia(fallbackConstraints)
        .then(stream => {
            console.log('Fallback camera stream obtained successfully');
            mediaStream = stream;
            cameraStream.srcObject = stream;
            
            // Make sure the camera stream is visible
            cameraStream.style.display = 'block';
            
            // Hide placeholder when camera is active
            const placeholder = cameraViewport.querySelector('.camera-placeholder');
            if (placeholder) {
                placeholder.style.display = 'none';
            }
            
            console.log('Fallback camera started successfully');
        })
        .catch(err => {
            console.error('Fallback camera error:', err);
            let userMessage = 'Unable to access camera. ' + (err.message || 'Please check your camera settings.');
            if (err.name === 'NotAllowedError') {
                userMessage = 'Camera access denied. Please allow camera permissions in your browser settings and click Retry.';
            }
            showCameraError(new Error(userMessage));
        });
}

// Show camera error in UI
function showCameraError(error) {
    const placeholder = cameraViewport.querySelector('.camera-placeholder');
    if (placeholder) {
        placeholder.innerHTML = `
            <span class="material-icons">photo_camera</span>
            <p>Camera Access Failed</p>
            <p class="camera-instruction">${error.message || 'Please check your camera permissions'}</p>
            <button id="retry-camera" class="icon-button fab-style">
                <span class="material-icons">replay</span>
                <span>Retry</span>
            </button>
        `;
        
        // Show the placeholder
        placeholder.style.display = 'flex';
        placeholder.style.flexDirection = 'column';
        placeholder.style.alignItems = 'center';
        placeholder.style.justifyContent = 'center';
        placeholder.style.zIndex = '10';
        
        // IMPORTANT: Use setTimeout to ensure the button is rendered before attaching event listener
        setTimeout(() => {
            // Add event listener to the retry button
            const retryBtn = document.getElementById('retry-camera');
            if (retryBtn) {
                // Remove any existing event listeners to prevent duplicates
                retryBtn.removeEventListener('click', handleRetryClick);
                retryBtn.addEventListener('click', handleRetryClick);
                console.log('Retry button event listener attached');
            } else {
                console.error('Retry button not found');
            }
        }, 100);
    }
}

// Separate function for retry button click handler
function handleRetryClick(e) {
    e.stopPropagation();
    console.log('Retry button clicked');
    // Hide the placeholder immediately when retry is clicked
    const placeholder = cameraViewport.querySelector('.camera-placeholder');
    if (placeholder) {
        placeholder.style.display = 'none';
    }
    startCamera();
}

// Toggle between front and back camera
function toggleCamera() {
    isFrontCamera = !isFrontCamera;
    const cameraIcon = cameraSwitch.querySelector('.material-icons');
    if (cameraIcon) {
        cameraIcon.textContent = isFrontCamera ? 'flip_camera_ios' : 'flip_camera_android';
    }
    
    // Restart camera with new constraints
    startCamera();
    
    console.log(`Switched to ${isFrontCamera ? 'front' : 'back'} camera`);
}

// 📸 Capture image from camera
function captureImage() {
    console.log('Capture image function called');
    
    // Check if we have the required elements
    if (!cameraStream || !captureCanvas) {
        console.error('Required elements not found:', {cameraStream, captureCanvas});
        if (cameraStream) {
            alert('Camera not initialized properly');
        } else {
            alert('Camera is not available');
        }
        return;
    }
    
    // Check if the video is ready
    if (cameraStream.readyState < 2) { // HAVE_CURRENT_DATA
        console.warn('Video is not ready yet');
        alert('Camera is not ready yet. Please wait a moment and try again.');
        return;
    }
    
    try {
        // Set canvas dimensions to match video
        captureCanvas.width = cameraStream.videoWidth || 640;
        captureCanvas.height = cameraStream.videoHeight || 480;
        
        console.log('Canvas dimensions:', captureCanvas.width, captureCanvas.height);
        
        // Draw the current video frame to the canvas
        const ctx = captureCanvas.getContext('2d');
        ctx.drawImage(cameraStream, 0, 0, captureCanvas.width, captureCanvas.height);
        
        // Convert canvas to blob and create a file
        captureCanvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
                addImageToPreview(file);
                updateAnalyzeButtonState();
                console.log('Image captured successfully');
            } else {
                console.error('Failed to create blob from canvas');
                alert('Failed to capture image');
            }
        }, 'image/jpeg', 0.9);
    } catch (error) {
        console.error('Error capturing image:', error);
        alert('Error capturing image: ' + error.message);
    }
}

// Handle file selection
function handleFileSelect(e) {
    console.log('File selected:', e.target.files);
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        if (file) {
            addImageToPreview(file);
            updateAnalyzeButtonState();
        }
    }
}

// Add image to preview bar
function addImageToPreview(file) {
    console.log('Adding image to preview:', file);
    if (!file) return;
    
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
        if (e.target && e.target.result) {
            img.src = e.target.result;
            thumbnail.appendChild(img);
        }
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
    if (index >= 0 && index < selectedImages.length) {
        selectedImages.splice(index, 1);
    }
    
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

// 🧠 Analyze image function
async function analyzeImage() {
    if (selectedImages.length === 0) {
        alert('Please capture or upload an image first');
        return;
    }
    
    console.log('Analyzing image:', selectedImages[0]);
    
    // Show loading state
    let originalText = 'ANALYZE';
    let originalHTML = '';
    if (analyzeButton) {
        originalHTML = analyzeButton.innerHTML;
        analyzeButton.innerHTML = '<span>Analyzing...</span>';
        analyzeButton.disabled = true;
    }
    
    try {
        // Create FormData for the image
        const formData = new FormData();
        formData.append('image', selectedImages[0]);
        
        // Send to backend for analysis
        const response = await fetch('/api/analyze-product', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                processProductData(result.product);
                navigateToResultPage();
            } else {
                alert('Analysis failed: ' + (result.error || 'Unknown error'));
            }
        } else {
            alert('Analysis failed: Server error ' + response.status);
        }
    } catch (error) {
        console.error('Analysis error:', error);
        alert('Analysis failed: ' + error.message);
    } finally {
        // Reset button
        if (analyzeButton) {
            analyzeButton.innerHTML = originalHTML || '<span>ANALYZE</span><span class="material-icons">send</span>';
            analyzeButton.disabled = false;
        }
    }
}

// Process product data and update UI
function processProductData(product) {
    currentProduct = product;
    
    // Update product name
    if (productNameElement) {
        productNameElement.textContent = product.name || 'Unknown Product';
    }
    if (productNameResultElement) {
        productNameResultElement.textContent = product.name || 'Unknown Product';
    }
    
    // Update assessment text and color based on score
    if (assessmentTextElement) {
        const assessment = product.assessment || product.message || 'Overall Health Assessment: Unknown';
        assessmentTextElement.textContent = assessment;
    }
    
    // Set background color based on score
    let bgColor, textColor;
    const score = product.score || 50;
    if (score >= 80) {
        bgColor = "var(--success)";
        textColor = "var(--on-success)";
    } else if (score >= 60) {
        bgColor = "var(--caution)";
        textColor = "var(--on-caution)";
    } else {
        bgColor = "var(--warning)";
        textColor = "var(--on-warning)";
    }
    
    if (scoreVisualization) {
        scoreVisualization.style.backgroundColor = bgColor;
        scoreVisualization.style.color = textColor;
    }
    
    // Update ingredients list
    if (ingredientsList) {
        ingredientsList.innerHTML = '';
        const ingredients = product.ingredients || [];
        if (ingredients.length > 0) {
            ingredients.forEach(ingredient => {
                const li = document.createElement('li');
                li.textContent = ingredient.name || ingredient;
                
                // Add risk class if needed
                if (ingredient.risk && ingredient.risk !== 'safe') {
                    li.classList.add(ingredient.risk);
                }
                
                ingredientsList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'No ingredients data available';
            ingredientsList.appendChild(li);
        }
    }
    
    // Update nutrition data
    const nutritionPanel = [...expansionPanels].find(panel => 
        panel.querySelector('.panel-title') && 
        panel.querySelector('.panel-title').textContent.includes('Nutritional'));
    
    if (nutritionPanel) {
        const panelContent = nutritionPanel.querySelector('.panel-content');
        if (panelContent) {
            // Clear existing content
            panelContent.innerHTML = '';
            
            // Add nutrition items
            const nutrition = product.nutrition || {};
            Object.keys(nutrition).forEach(key => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'nutrition-item';
                
                const labelSpan = document.createElement('span');
                labelSpan.className = 'nutrition-label';
                labelSpan.textContent = key.charAt(0).toUpperCase() + key.slice(1);
                
                const valueSpan = document.createElement('span');
                valueSpan.className = 'nutrition-value';
                valueSpan.textContent = nutrition[key];
                
                const progressBar = document.createElement('div');
                progressBar.className = 'progress-bar';
                
                const progressFill = document.createElement('div');
                progressFill.className = 'progress-fill';
                
                // Set color based on key and value
                if (key === 'sugar') {
                    const sugarValue = parseInt(nutrition[key]) || 0;
                    progressFill.classList.add(sugarValue > 15 ? 'warning' : 'success');
                    progressFill.style.width = Math.min(100, sugarValue * 4) + '%';
                } else if (key === 'calories') {
                    const calValue = parseInt(nutrition[key]) || 0;
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
            
            // If no nutrition data, show message
            if (Object.keys(nutrition).length === 0) {
                panelContent.innerHTML = '<p>No nutrition data available</p>';
            }
        }
    }
    
    // Show/hide alternatives CTA based on product score
    const alternativesCta = document.querySelector('.alternatives-cta');
    if (alternativesCta) {
        if (score < 70) {
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
    const chatBubbleContainer = document.querySelector('.expansion-panel .panel-content');
    
    // Clear input
    if (chatInput) {
        chatInput.value = '';
    }
    
    // Add user message to chat
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble';
    userBubble.style.backgroundColor = 'var(--primary-light)';
    userBubble.style.color = 'var(--on-primary)';
    userBubble.style.marginBottom = '10px';
    userBubble.style.textAlign = 'right';
    userBubble.innerHTML = `<p>${message}</p>`;
    
    if (chatBubbleContainer) {
        chatBubbleContainer.appendChild(userBubble);
        
        // Scroll to bottom
        chatBubbleContainer.scrollTop = chatBubbleContainer.scrollHeight;
    }
    
    try {
        // Send to backend chat API
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product: currentProduct,
                query: message
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                // Add AI response to chat
                const aiBubble = document.createElement('div');
                aiBubble.className = 'chat-bubble';
                aiBubble.style.marginBottom = '10px';
                aiBubble.innerHTML = `<p>${result.reply}</p>`;
                
                if (chatBubbleContainer) {
                    chatBubbleContainer.appendChild(aiBubble);
                    
                    // Scroll to bottom
                    chatBubbleContainer.scrollTop = chatBubbleContainer.scrollHeight;
                }
            } else {
                throw new Error(result.error || 'Chat service error');
            }
        } else {
            throw new Error('Server error: ' + response.status);
        }
    } catch (error) {
        console.error('Chat error:', error);
        // Add error message to chat
        const errorBubble = document.createElement('div');
        errorBubble.className = 'chat-bubble';
        errorBubble.style.marginBottom = '10px';
        errorBubble.innerHTML = `<p>Error: ${error.message}</p>`;
        
        if (chatBubbleContainer) {
            chatBubbleContainer.appendChild(errorBubble);
            
            // Scroll to bottom
            chatBubbleContainer.scrollTop = chatBubbleContainer.scrollHeight;
        }
    }
}

// Navigate to result page
function navigateToResultPage() {
    console.log('Navigating to result page');
    if (page1) page1.classList.remove('active');
    if (page2) page2.classList.add('active');
}

// Navigate to home page
function navigateToHomePage() {
    console.log('Navigating to home page');
    if (page2) page2.classList.remove('active');
    if (page1) page1.classList.add('active');
    
    // Reset UI elements
    resetUI();
}

// Reset UI elements when navigating back to home
function resetUI() {
    // Clear selected images
    selectedImages = [];
    
    // Hide preview bar
    if (imagePreviewBar) {
        imagePreviewBar.classList.remove('active');
    }
    if (previewContainer) {
        previewContainer.innerHTML = '';
    }
    
    // Reset analyze button
    updateAnalyzeButtonState();
    
    // Close all expansion panels
    if (expansionPanels) {
        expansionPanels.forEach(panel => {
            panel.classList.remove('active');
        });
    }
    
    // Hide QA input area
    const qaInputArea = document.querySelector('.qa-input-area');
    if (qaInputArea) {
        qaInputArea.classList.remove('active');
    }
    
    // Restart camera
    startCamera();
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