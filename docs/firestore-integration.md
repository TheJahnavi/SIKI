# Google Cloud Firestore Integration for SIKI

This document explains how to set up and use Google Cloud Firestore with the SIKI application.

## Prerequisites

1. A Google Cloud Platform account
2. A Firebase project
3. A service account key for Firebase Admin SDK

## Setting Up Firestore

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select an existing project
3. Follow the setup wizard to create your project

### 2. Enable Firestore

1. In the Firebase Console, select your project
2. Click "Firestore Database" in the left navigation
3. Click "Create database"
4. Choose "Start in test mode" (for development) or "Start in locked mode" (for production)
5. Select a location and click "Enable"

### 3. Create a Service Account

1. In the Firebase Console, click the gear icon next to "Project Overview" and select "Project settings"
2. Go to the "Service accounts" tab
3. Click "Generate new private key"
4. Save the JSON file as `firebase-service-account.json` in your project root directory

### 4. Update Configuration

Replace the placeholder values in `firebase-service-account.json` with your actual service account credentials.

## Collections Structure

The SIKI application uses the following Firestore collections:

### 1. productAnalysis
Stores the results of product analysis from OCR and computer vision processing.

Document structure:
```javascript
{
  _id: string,
  name: string,
  score: number,
  category: string,
  nutrition: object,
  ingredients: array,
  fallback: boolean,
  confidence: number, // For fallback results
  message: string,    // For fallback results
  analyzedAt: timestamp,
  imagePath: string
}
```

### 2. chatHistory
Stores the history of chat interactions between users and the AI.

Document structure:
```javascript
{
  productID: string,
  query: string,
  response: string,
  timestamp: timestamp
}
```

### 3. missingProducts
Stores reports of products that couldn't be identified.

Document structure:
```javascript
{
  productName: string,
  imageUrl: string,
  reportedAt: timestamp,
  status: string // 'pending', 'reviewed', 'added'
}
```

## Environment Variables

The application uses the following environment variables:

- `GOOGLE_APPLICATION_CREDENTIALS`: Path to your Firebase service account JSON file
- `HUGGING_FACE_API_KEY`: Your Hugging Face API key for AI chat functionality

Set these in your `.env` file:

```env
GOOGLE_APPLICATION_CREDENTIALS=firebase-service-account.json
HUGGING_FACE_API_KEY=your_hugging_face_api_key_here
PORT=3000
```

## API Endpoints with Firestore Integration

### POST /api/search
Analyzes product images using OCR and computer vision, then stores results in Firestore.

1. Checks Firestore for cached results using image ID
2. Performs OCR or computer vision analysis
3. Stores results in the `productAnalysis` collection
4. Returns analysis data

### POST /api/chat
Provides AI-powered answers to product-related questions using Hugging Face DialoGPT.

1. Retrieves product data from Firestore if available
2. Sends context-aware request to Hugging Face API
3. Stores interaction in the `chatHistory` collection
4. Returns AI-generated response

### GET /api/history
Retrieves the user's scan history from Firestore.

1. Queries the `productAnalysis` collection
2. Returns results ordered by analysis timestamp

### POST /api/report-missing
Reports unrecognized products for future database inclusion.

1. Stores report in the `missingProducts` collection
2. Sets initial status to 'pending'

## Error Handling

The application gracefully handles Firestore connection issues:

- If Firestore initialization fails, the application continues to work with in-memory data
- All Firestore operations are wrapped in try/catch blocks
- Errors are logged but don't crash the application
- Fallback mechanisms ensure core functionality remains available

## Security Considerations

For production deployment, consider implementing:

1. Firebase Security Rules to control data access
2. Authentication for API endpoints
3. Input validation and sanitization
4. Rate limiting for API requests
5. HTTPS encryption for all communications

## Testing Firestore Integration

To test the Firestore integration:

1. Ensure your `firebase-service-account.json` is properly configured
2. Start the server: `npm start`
3. Use the API endpoints to trigger Firestore operations
4. Check the Firebase Console to verify data is being stored correctly

## Troubleshooting

### Common Issues

1. **Firebase Admin SDK initialization fails**
   - Check that your service account JSON file is correctly formatted
   - Verify the file path in `GOOGLE_APPLICATION_CREDENTIALS`
   - Ensure your service account has the necessary permissions

2. **Firestore operations fail**
   - Check your Firebase project settings
   - Verify your service account has Firestore access
   - Ensure your network connection allows access to Google Cloud services

3. **Permission denied errors**
   - Update your Firestore security rules
   - Check your service account permissions in Google Cloud Console

### Logging

The application logs Firestore operations to the console:

- Successful initialization
- Data read/write operations
- Errors and warnings

Check these logs to verify Firestore integration is working correctly.