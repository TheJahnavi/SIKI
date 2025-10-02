// Test script to verify Hugging Face API integration

require('dotenv').config();
const { HfInference } = require('@huggingface/inference');

// Initialize Hugging Face Inference client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

async function testHuggingFace() {
  try {
    console.log('Testing Hugging Face API with your key...');
    
    // Test with a simple model that should be available
    const response = await hf.textClassification({
      model: 'distilbert-base-uncased-finetuned-sst-2-english',
      inputs: 'I love this product!'
    });
    
    console.log('API Response:', response);
    
  } catch (error) {
    console.error('Error testing Hugging Face API:', error.message);
  }
}

// Run the test
testHuggingFace();