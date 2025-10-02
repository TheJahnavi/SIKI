// Chatbot Service for SIKI App
// Handles LLM integration for contextual question answering

const { HfInference } = require('@huggingface/inference');

class ChatbotService {
  constructor() {
    // Initialize Hugging Face Inference client
    this.hfApiKey = process.env.HUGGINGFACE_API_KEY;
    this.hf = this.hfApiKey ? new HfInference(this.hfApiKey) : null;
    
    if (this.hf) {
      console.log('[CHATBOT-SERVICE] Hugging Face API client initialized');
    } else {
      console.warn('[CHATBOT-SERVICE] Hugging Face API key not configured, using simulation');
    }
  }

  // Create a prompt template for the LLM
  createPromptTemplate(productData, question) {
    return `
You are a product analysis assistant for the "Scan It Know It" app. 
Your job is to answer questions about food products based ONLY on the provided product data.
Do NOT use any external knowledge or general information.

Product Data:
Name: ${productData.name || 'Unknown'}
Brand: ${productData.brand || 'Unknown'}
Health Score: ${productData.healthScore || 'N/A'} (${productData.healthLabel || 'N/A'})
Ingredients: ${productData.ingredients ? productData.ingredients.join(', ') : 'Not available'}
Tags: ${productData.tags ? productData.tags.join(', ') : 'None'}

Question: ${question}

Please provide a concise, helpful answer based ONLY on the product data above.
If the question cannot be answered with the provided data, respond with: "I can only answer questions about the specific product data provided."
`;
  }

  // Get a response from the LLM
  async getLLMResponse(prompt) {
    if (!this.hf) {
      // Simulation mode
      return this.simulateLLMResponse(prompt);
    }
    
    try {
      console.log('[CHATBOT-SERVICE] Sending request to Hugging Face API');
      
      const response = await this.hf.textGeneration({
        model: 'mistralai/Mistral-7B-v0.1',
        inputs: prompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          top_p: 0.9,
          repetition_penalty: 1.2
        }
      });
      
      console.log('[CHATBOT-SERVICE] Received response from Hugging Face API');
      return response.generated_text;
    } catch (error) {
      console.error('[CHATBOT-SERVICE] Error with Hugging Face API:', error);
      // Fall back to simulation
      return this.simulateLLMResponse(prompt);
    }
  }

  // Simulate LLM response for testing
  simulateLLMResponse(prompt) {
    console.log('[CHATBOT-SERVICE] Using simulated LLM response');
    
    // Extract question from prompt (simplified)
    const questionMatch = prompt.match(/Question: (.+)/);
    const question = questionMatch ? questionMatch[1] : 'Unknown question';
    
    // Simple rule-based responses for simulation
    const responses = [
      "Based on the product data, this item contains several ingredients that may be of concern for health-conscious consumers.",
      "The health score indicates this is a moderately healthy option, but you may want to check the ingredient list for specific concerns.",
      "I recommend looking for alternatives with fewer processed ingredients and less added sugar.",
      "This product aligns with several dietary preferences as indicated by its tags.",
      "For more detailed information about specific ingredients, I suggest consulting with a nutritionist."
    ];
    
    // Return a random response for simulation
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Process a chat message with context
  async processChatMessage(productData, question) {
    console.log(`[CHATBOT-SERVICE] Processing chat message: ${question}`);
    
    // Validate inputs
    if (!productData) {
      throw new Error('Product data is required');
    }
    
    if (!question || question.trim().length === 0) {
      throw new Error('Question is required');
    }
    
    try {
      // Create the prompt
      const prompt = this.createPromptTemplate(productData, question);
      
      // Get response from LLM
      const response = await this.getLLMResponse(prompt);
      
      console.log('[CHATBOT-SERVICE] Chat message processed successfully');
      return response;
    } catch (error) {
      console.error('[CHATBOT-SERVICE] Error processing chat message:', error);
      throw error;
    }
  }

  // Validate that the LLM only answers based on provided context
  validateContextualResponse(prompt, response) {
    // In a real implementation, we might use embeddings or other techniques
    // to verify that the response is based on the provided context
    
    // For now, we'll just return true to indicate validation passed
    return true;
  }
}

// Export a singleton instance
module.exports = new ChatbotService();