# SIKI Fullstack Application Guide

This document explains how to use and extend the fullstack SIKI application.

## Architecture Overview

The SIKI application follows a client-server architecture:

```
Frontend (Browser) ←→ Backend (Node.js/Express) ←→ Database (MongoDB)
```

### Frontend
- HTML/CSS/JavaScript implementation
- Mobile-first responsive design
- Material Design 3 compliant
- PWA features for offline access

### Backend
- Node.js with Express.js framework
- RESTful API endpoints
- Image processing with Tesseract.js (OCR)
- Computer vision with TensorFlow.js and MobileNet
- AI chat integration with Hugging Face DialoGPT

### Database
- MongoDB for storing product information
- User data and preferences
- Chat logs and interaction history

## API Endpoints

### POST /api/search
Analyzes product images using OCR and computer vision.

**Request:**
```
POST /api/search
Content-Type: multipart/form-data

image: [file data]
```

**Response:**
```json
{
  "success": true,
  "product": {
    "_id": "1",
    "name": "Organic Coconut Water",
    "score": 85,
    "category": "Beverage",
    "nutrition": { "calories": 46, "sugar": 9 },
    "ingredients": ["Coconut Water", "Natural Flavors", "Vitamin C"],
    "imageUrl": "/images/coconut-water.jpg",
    "fallback": false
  }
}
```

### POST /api/chat
Provides AI-powered answers to product-related questions.

**Request:**
```json
POST /api/chat
Content-Type: application/json

{
  "productID": "1",
  "query": "Is this product healthy?"
}
```

**Response:**
```json
{
  "success": true,
  "reply": "This product contains natural ingredients which are generally considered safe for consumption."
}
```

### GET /api/history
Retrieves the user's scan history.

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "_id": "1",
      "name": "Organic Coconut Water",
      "score": 85,
      "timestamp": "2023-05-01T12:00:00Z"
    }
  ]
}
```

### POST /api/report-missing
Reports unrecognized products for future database inclusion.

**Request:**
```json
POST /api/report-missing
Content-Type: application/json

{
  "productName": "Unknown Product",
  "imageUrl": "/images/unknown.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product reported successfully"
}
```

## Implementation Details

### OCR Processing (Tesseract.js)
The application uses Tesseract.js for optical character recognition to extract text from product images:

```javascript
import Tesseract from 'tesseract.js';

const { data: { text } } = await Tesseract.recognize(
  imageFile,
  'eng',
  { logger: info => console.log(info) }
);
```

### Object Classification (TensorFlow.js + MobileNet)
For images without readable labels, the application uses TensorFlow.js with MobileNet for object classification:

```javascript
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

const model = await mobilenet.load();
const predictions = await model.classify(imageElement);
```

### Fallback Database
When OCR and computer vision fail to identify a product, the application uses a fallback database of common objects:

```javascript
// scripts/fallback-db.js
export const fallbackDB = {
  "apple": { 
    score: 95, 
    type: "Raw Food", 
    message: "High in fiber and antioxidants." 
  },
  // ... more objects
};
```

### AI Chat Integration
The chat feature uses Hugging Face's DialoGPT model for conversational AI:

```javascript
// In a real implementation, you would connect to Hugging Face API
const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${HF_API_TOKEN}` },
  body: JSON.stringify({ inputs: prompt })
});
```

## Extending the Application

### Adding New Components
1. Create new CSS files in the `styles/` directory
2. Import them in `styles/main.css`
3. Add HTML structure in `index.html`
4. Implement functionality in `scripts/main.js`

### Adding New API Endpoints
1. Add route definitions in `server.js`
2. Implement business logic
3. Update `scripts/main.js` to call the new endpoints

### Improving AI Capabilities
1. Integrate with more advanced models
2. Add context-aware responses
3. Implement user preference learning

## Testing

Run the test suite with:
```bash
npm test
```

The tests cover:
- API endpoint validation
- Fallback database functionality
- Frontend component interactions

## Deployment

### Local Development
1. Install dependencies: `npm install`
2. Build frontend: `npm run build`
3. Start server: `npm start`

### Production Deployment
1. Set environment variables for MongoDB connection
2. Configure reverse proxy (nginx, Apache)
3. Set up SSL certificates
4. Deploy to cloud platform (Heroku, AWS, etc.)

## Security Considerations

- Validate all user inputs
- Sanitize file uploads
- Implement rate limiting
- Use HTTPS in production
- Secure MongoDB connection
- Protect API endpoints with authentication

## Performance Optimization

- Implement image compression
- Use caching for frequently accessed data
- Optimize database queries
- Minify CSS and JavaScript assets
- Implement lazy loading for images