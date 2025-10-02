# Hugging Face Integration for SIKI

This document explains how to set up and use Hugging Face AI services with the SIKI application.

## Prerequisites

1. A Hugging Face account
2. An API token for accessing Hugging Face Inference API

## Setting Up Hugging Face Integration

### 1. Create a Hugging Face Account

1. Go to [Hugging Face](https://huggingface.co/)
2. Click "Sign up" to create a new account or "Sign in" if you already have one

### 2. Get Your API Token

1. After logging in, click on your profile picture in the top right corner
2. Select "Settings"
3. Go to the "Access Tokens" section
4. Click "New token"
5. Give your token a name (e.g., "SIKI App")
6. Select the role (typically "Read" is sufficient for inference)
7. Click "Create token"
8. Copy the generated token

### 3. Update Configuration

Add your API token to the `.env` file:

```env
HUGGINGFACE_API_KEY=your_actual_huggingface_api_key_here
```

Note: If your API token doesn't have sufficient permissions for the Inference API, the application will automatically fall back to enhanced template-based responses.

## AI Models Used

### 1. google/flan-t5-base
Used for the chat functionality to provide conversational AI responses.

This model is freely available and provides good quality responses for general questions.

## How the Integration Works

### 1. Context-Aware Prompts

When a user asks a question about a product, the application:

1. Retrieves the product analysis data from Firestore (if available)
2. Retrieves user preferences from Firestore (if available)
3. Constructs a context-aware prompt that includes:
   - Product information (name, category, nutrition, ingredients)
   - User preferences (dietary restrictions, allergies, health goals)
   - User's question
4. Sends this prompt to the Hugging Face Inference API
5. Returns the AI-generated response to the user

Example prompt structure:
```
You are SIKI, a friendly, helpful, and concise product analysis assistant. Your only source of truth is the JSON data provided below. Do not use outside knowledge. If the answer is not in the JSON, state that you cannot find the information.

USER DIETARY PREFERENCES:
{"allergies": ["nuts"], "dietaryRestrictions": ["vegan"], "healthGoals": ["low-sugar"]}

PRODUCT DATA:
{"name": "Organic Coconut Water", "category": "Beverage", "nutrition": {"calories": "46", "sugar": "9g"}, "ingredients": [{"name": "Coconut Water"}, {"name": "Natural Flavors"}, {"name": "Vitamin C"}], "allergens": [], "dietary": ["vegan", "gluten-free", "keto-friendly"]}

USER QUESTION:
Is this product keto-friendly?
```

### 2. Response Handling

The application:

1. Processes the response from Hugging Face
2. Stores the interaction in Firestore for future reference
3. Returns the response to the frontend

If the Hugging Face API is unavailable or returns an error, the application uses an enhanced template-based response system that:
- Analyzes the product data and user preferences
- Provides intelligent responses based on specific query patterns
- Handles common questions about keto-friendliness, vegan status, allergies, and health scores
- Falls back to general responses when specific information isn't available

## API Endpoint Implementation

### POST /api/chat

The chat endpoint in `server.js` handles the Hugging Face integration:

1. Validates the request (ensures a query is provided)
2. Retrieves product data from Firestore if a product ID is provided
3. Retrieves user preferences from Firestore if a user ID is provided
4. Constructs a context-aware prompt
5. Attempts to call the Hugging Face Inference API
6. Falls back to enhanced template responses if the API call fails
7. Stores the interaction in Firestore
8. Returns the response to the client

## Error Handling

The application gracefully handles Hugging Face API issues:

- If no API key is provided, the application uses enhanced template responses
- If the API call fails due to permissions or other issues, the application falls back to enhanced template responses
- All API operations are wrapped in try/catch blocks
- Errors are logged but don't crash the application

## Rate Limiting and Quotas

Hugging Face has rate limits for API usage:

- Free tier: 30,000 requests per month
- Paid tiers available for higher usage

The application is designed to handle rate limiting gracefully by:

1. Implementing fallback responses when the API is unavailable
2. Logging API usage for monitoring
3. Providing clear error messages to users

## Testing the Integration

To test the Hugging Face integration:

1. Ensure your API key is correctly set in the `.env` file
2. Start the server: `npm start`
3. Make a request to the `/api/chat` endpoint with a product ID and query
4. Verify that you receive an AI-generated response

Example test request:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"productId": "1", "query": "Is this product healthy?", "userId": "user-123"}'
```

## Troubleshooting

### Common Issues

1. **Invalid API token**
   - Verify your API token is correct and has not expired
   - Check that the token has the necessary permissions
   - Ensure there are no extra spaces or characters in the token

2. **Insufficient permissions**
   - If you see "This authentication method does not have sufficient permissions", you may need to request access to the Inference API
   - The application will automatically fall back to enhanced template responses in this case

3. **Rate limiting**
   - Check the Hugging Face dashboard for usage statistics
   - Implement request caching to reduce API calls
   - Consider upgrading to a paid tier for higher usage

4. **Model not responding**
   - Verify the model name is correct
   - Check Hugging Face status page for service issues
   - Try a different model if the issue persists

### Logging

The application logs Hugging Face operations to the console:

- Successful API calls
- Response times
- Errors and warnings

Check these logs to verify the Hugging Face integration is working correctly.

## Customization

### Changing Models

To use a different model:

1. Update the model name in the `server.js` file:
   ```javascript
   const response = await hf.textGeneration({
     model: 'new-model-name',
     // ... other parameters
   });
   ```

2. Adjust parameters as needed for the new model

### Adjusting Parameters

You can customize the text generation parameters:

- `max_new_tokens`: Maximum number of tokens to generate
- `temperature`: Controls randomness (0.0 to 1.0)
- `top_p`: Controls diversity via nucleus sampling
- `repetition_penalty`: Reduces repetition

Example with custom parameters:
```javascript
const response = await hf.textGeneration({
  model: 'google/flan-t5-base',
  inputs: context,
  parameters: {
    max_new_tokens: 150,
    temperature: 0.7,
    top_p: 0.9,
    repetition_penalty: 1.2,
    return_full_text: false
  }
});
```

## Security Considerations

For production deployment, consider:

1. Keeping your API token secure (use environment variables, not hardcoded values)
2. Implementing request validation to prevent abuse
3. Adding authentication to your API endpoints
4. Monitoring API usage for unusual patterns
5. Using HTTPS for all communications