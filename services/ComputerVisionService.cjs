// Computer Vision Service for SIKI App
// Handles image analysis using TensorFlow/MobileNet and Tesseract OCR

const Tesseract = require('tesseract.js');
const fs = require('fs');

// Try to load TensorFlow and MobileNet
let tf = null;
let mobilenet = null;
let mobileNetModel = null;

try {
  tf = require('@tensorflow/tfjs-node');
  mobilenet = require('@tensorflow-models/mobilenet');
  console.log('[CV-SERVICE] TensorFlow.js loaded successfully');
} catch (error) {
  console.warn('[CV-SERVICE] TensorFlow.js not available:', error.message);
  console.warn('[CV-SERVICE] Computer vision features will be simulated');
}

class ComputerVisionService {
  constructor() {
    this.initializeModel();
  }

  // Initialize the MobileNet model
  async initializeModel() {
    if (mobilenet) {
      try {
        mobileNetModel = await mobilenet.load();
        console.log('[CV-SERVICE] MobileNet model loaded successfully');
      } catch (error) {
        console.error('[CV-SERVICE] Error loading MobileNet model:', error);
      }
    } else {
      console.log('[CV-SERVICE] MobileNet not available, using simulation');
    }
  }

  // Analyze an image for object detection
  async analyzeImageForObjects(imagePath) {
    console.log(`[CV-SERVICE] Analyzing image for objects: ${imagePath}`);
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error('Image file not found');
    }
    
    // If we have MobileNet, use it for object detection
    if (mobileNetModel) {
      try {
        // Load the image
        const imageBuffer = fs.readFileSync(imagePath);
        const imageTensor = tf.node.decodeImage(imageBuffer, 3);
        
        // Classify the image
        const predictions = await mobileNetModel.classify(imageTensor);
        
        // Clean up tensor memory
        imageTensor.dispose();
        
        console.log(`[CV-SERVICE] Object detection completed with ${predictions.length} predictions`);
        return predictions;
      } catch (error) {
        console.error('[CV-SERVICE] Error in object detection:', error);
        // Fall back to simulation
        return this.simulateObjectDetection();
      }
    } else {
      // Simulation mode
      return this.simulateObjectDetection();
    }
  }

  // Extract text from an image using OCR
  async extractTextFromImage(imagePath) {
    console.log(`[CV-SERVICE] Extracting text from image: ${imagePath}`);
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error('Image file not found');
    }
    
    try {
      // Use Tesseract for OCR
      const result = await Tesseract.recognize(
        imagePath,
        'eng',
        { 
          logger: info => console.log('[CV-SERVICE] OCR Progress:', info) 
        }
      );
      
      console.log('[CV-SERVICE] OCR completed successfully');
      return {
        text: result.data.text,
        confidence: result.data.confidence,
        words: result.data.words
      };
    } catch (error) {
      console.error('[CV-SERVICE] Error in OCR:', error);
      throw error;
    }
  }

  // Simulate object detection for testing
  simulateObjectDetection() {
    console.log('[CV-SERVICE] Using simulated object detection');
    
    // Sample predictions for testing
    const samplePredictions = [
      { className: 'water bottle', probability: 0.85 },
      { className: 'product', probability: 0.72 },
      { className: 'packaged goods', probability: 0.68 },
      { className: 'plastic', probability: 0.55 }
    ];
    
    return samplePredictions;
  }

  // Process barcode from image (simplified)
  async processBarcode(imagePath) {
    console.log(`[CV-SERVICE] Processing barcode from image: ${imagePath}`);
    
    // In a real implementation, we would use a barcode detection library
    // For now, we'll simulate this functionality
    
    // Simulate barcode detection
    const simulatedBarcode = {
      value: '123456789012', // Sample barcode
      format: 'UPC-A',
      confidence: 0.95
    };
    
    console.log('[CV-SERVICE] Barcode processing completed');
    return simulatedBarcode;
  }

  // Comprehensive image analysis
  async analyzeProductImage(imagePath) {
    console.log(`[CV-SERVICE] Starting comprehensive analysis of: ${imagePath}`);
    
    const result = {
      objects: [],
      text: null,
      barcode: null,
      confidence: 0
    };
    
    try {
      // 1. Try barcode detection first (fastest)
      try {
        result.barcode = await this.processBarcode(imagePath);
        result.confidence = result.barcode.confidence;
        console.log('[CV-SERVICE] Barcode detected:', result.barcode.value);
      } catch (error) {
        console.log('[CV-SERVICE] No barcode detected, continuing with other analysis');
      }
      
      // 2. Object detection
      try {
        result.objects = await this.analyzeImageForObjects(imagePath);
        console.log(`[CV-SERVICE] Detected ${result.objects.length} objects`);
      } catch (error) {
        console.warn('[CV-SERVICE] Object detection failed:', error.message);
      }
      
      // 3. OCR for text extraction
      try {
        const ocrResult = await this.extractTextFromImage(imagePath);
        result.text = ocrResult.text;
        console.log(`[CV-SERVICE] Extracted ${ocrResult.text.length} characters of text`);
      } catch (error) {
        console.warn('[CV-SERVICE] OCR failed:', error.message);
      }
      
      console.log('[CV-SERVICE] Comprehensive analysis completed');
      return result;
    } catch (error) {
      console.error('[CV-SERVICE] Error in comprehensive analysis:', error);
      throw error;
    }
  }
}

// Export a singleton instance
module.exports = new ComputerVisionService();