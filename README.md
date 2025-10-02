# SIKI - Scan It Know It

A mobile-first web application for scanning and analyzing product images to provide health assessments.

> **Important Security Notice**: This repository contains placeholder files for sensitive credentials. Never commit actual credentials to version control. See the [Security Considerations](#security-considerations) section for details on proper credential management.

## Project Overview

SIKI is a responsive web application built with Material Design 3 principles that allows users to:
- Capture or upload product images
- Analyze products for health and safety information using OCR and computer vision
- View detailed assessments with clear visual indicators
- Chat with an AI assistant about product details
- Access scan history and report missing products
- Set personal dietary preferences for personalized AI responses
- Experience real-time updates and offline functionality

## Features

### Page 1: Home Screen
- Full-screen camera view with scanning indicator
- Theme toggle (light/dark mode)
- User preferences settings
- Camera switching capability
- Image gallery selection
- Image preview bar with removable thumbnails
- Analyze button (enabled when images are selected)

### Page 2: Product Result Screen
- Product assessment with color-coded results
- Expandable detail sections:
  - Ingredients & Risk Analysis
  - Nutritional Breakdown with progress indicators
  - Reddit Reviews
  - Q&A with AI assistant

## Technical Implementation

### Design System
- Material Design 3 (M3) compliant
- Responsive layout optimized for mobile (<600px width)
- Light and dark theme support
- Roboto font family
- Semantic color scheme (Success, Caution, Warning)

### Technologies Used
- HTML5
- CSS3 with custom properties (variables)
- JavaScript (ES6+)
- Material Icons
- Google Fonts (Roboto)
- Node.js with Express.js (Backend)
- Google Cloud Firestore (Database)
- Tesseract.js (OCR)
- TensorFlow.js with MobileNet (Computer Vision)
- Hugging Face Llama-2 (AI Chat)
- Sharp (Image Optimization)

### Progressive Web App (PWA) Features
- Installable on mobile devices
- Works offline with service worker
- Manifest file for native app experience
- Responsive design for all screen sizes
- Performance optimized with lazy loading

### File Structure
```
SIKI/
├── index.html
├── server.js
├── manifest.json
├── sw.js
├── .env
├── .babelrc
├── jest.config.js
├── config/
│   └── firebase-service-account.json
├── firebase.rules
├── styles/
│   └── main.css
├── scripts/
│   ├── main.js
│   ├── fallback-db.js
│   ├── build.js
│   ├── deploy.js
│   └── optimize.js
├── icons/
│   ├── icon-192x192.png
│   └── icon-512x512.png
├── docs/
│   ├── ai-ml-pipeline-specification.md
│   ├── complete-integration-summary.md
│   ├── deployment-guide.md
│   ├── enhanced-features-summary.md
│   ├── enhancement-summary.md
│   ├── firebase-integration-summary.md
│   ├── firebase-security-rules.md
│   ├── firestore-integration.md
│   ├── fullstack-guide.md
│   ├── hugging-face-integration.md
│   ├── implementation-summary.md
│   ├── next-steps-for-contextual-ai.md
│   ├── project-structure.md
│   ├── real-time-updates.md
│   ├── test-product-label.txt
│   └── user-preferences-feature.md
├── tests/
│   └── app.test.js
├── uploads/
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)
- Google Cloud Platform account with Firebase project
- Hugging Face account with API token

### Installation
1. Clone or download the repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

#### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Create a service account and download the JSON key
4. Create a `config` directory in the project root
5. Rename the file to `firebase-service-account.json` and place it in the `config` directory
6. Update the values in the file with your actual service account credentials

> **Note**: The repository contains a placeholder `firebase-service-account.json` file. Never commit actual service account credentials to version control.

#### Hugging Face Setup
1. Create an account at [Hugging Face](https://huggingface.co/)
2. Generate an API token in your account settings
3. Create a `.env` file from `.env.example` and add your token:
   ```env
   HUGGINGFACE_API_KEY=your_actual_huggingface_api_key
   ```

> **Note**: The repository contains a placeholder `.env` file. Never commit actual API keys to version control.

### Running the Application
1. Build the frontend:
   ```bash
   npm run build
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open your browser and navigate to `http://localhost:3000`

### Development Mode
To run in development mode with hot reloading:
```bash
npm run dev
```

## Usage

1. On the Home Screen:
   - Use the camera button to simulate capturing an image
   - Use the gallery button to select existing images
   - Toggle between light/dark themes using the top-right icon
   - Set dietary preferences using the settings icon
   - Switch camera perspective with the camera switch icon

2. After selecting images:
   - The ANALYZE button becomes enabled
   - Click ANALYZE to view product assessment

3. On the Result Screen:
   - View the overall product assessment
   - Expand sections to see detailed information
   - Use the Q&A section to ask questions about the product
   - Navigate back to the home screen with the back arrow

## API Endpoints

### POST /api/analyze-product
Accepts an image file and returns product analysis data using OCR and computer vision.

### POST /api/chat
Accepts a product ID and query, returns AI-generated response using Hugging Face Llama-2.

### GET /api/history
Returns the user's scan history from Firestore.

### POST /api/report-missing
Reports an unrecognized product for future database inclusion.

### POST /api/user-preferences
Saves user dietary preferences for personalized AI responses.

### GET /api/user-preferences/:userId
Retrieves user dietary preferences.

### POST /api/store-product
Stores product analysis results in Firestore.

### POST /api/chat-log
Logs chat interactions for analytics and history.

## Getting Contextual AI Answers

To get contextual AI answers from the chatbot, you need to:

1. **Configure the Hugging Face API Key**
   - Obtain a real Inference API Key from Hugging Face
   - Replace the placeholder in your `.env` file:
     ```env
     HUGGINGFACE_API_KEY=your_actual_huggingface_api_key
     ```

2. **Ensure Product Analysis Data Exists in Firestore**
   - Run the product analysis endpoint first to save structured data to Firestore
   - This requires correct Firebase credentials in `firebase-service-account.json`

3. **Process**:
   - Ensure Firebase is configured correctly and connected to Firestore
   - Run the `/api/analyze-product` endpoint to analyze a product image
   - Check Firestore to confirm a document was created with the productId
   - Run the `/api/chat` endpoint with the productId to get contextual answers

## AI/ML Pipeline

### Stage 1: OCR - Product Label Analysis
1. Image is processed using Tesseract.js OCR with optimized configuration
2. Extracted text is analyzed to identify product information
3. Results are cached in Firestore to avoid reprocessing

### Stage 2: Computer Vision - Fallback Object Classification
1. If OCR produces insufficient text, MobileNet classifies the image
2. Classification results are matched against fallback database
3. Structured data is returned with contextual information

### Stage 3: Contextual Chat
1. Product data is retrieved from Firestore using productId
2. User preferences are retrieved from Firestore using userId
3. Context-aware prompt is constructed with system message, product data, user preferences, and user query
4. Hugging Face Llama-2 model generates response based on context
5. Interaction is stored in chatHistory collection

## Database Structure (Firestore)

### productAnalysis
Stores results of product analysis with fields:
- id: Unique identifier
- name: Product name
- score: Health score (0-100)
- category: Product category
- nutrition: Nutritional information
- ingredients: List of ingredients
- allergens: List of allergens
- dietary: List of dietary information
- fallback: Boolean indicating if this was a fallback result
- analyzedAt: Timestamp of analysis
- imagePath: Path to original image

### chatHistory
Stores chat interactions with fields:
- productId: Associated product ID
- userId: Associated user ID
- query: User's question
- response: AI's response
- timestamp: When the interaction occurred

### userPreferences
Stores user dietary preferences with fields:
- userId: User identifier
- dietaryRestrictions: List of dietary restrictions
- allergies: List of allergies
- healthGoals: List of health goals
- updatedAt: Timestamp of last update

### missingProducts
Stores reports of unrecognized products with fields:
- productName: Name of the product
- imageUrl: URL of product image (if available)
- reportedAt: When the product was reported
- status: Current status (pending, reviewed, added)

### products
Stores product analysis results from user scans.

### chat_logs
Stores chat interactions for analytics and history.

## Customization

### Theme Colors
The application uses CSS variables for easy theme customization:
- Primary colors for light/dark modes
- Semantic colors for health assessments
- Surface colors for UI components

### Responsive Design
The layout uses:
- rem units for scalable typography
- Flexbox for component alignment
- CSS Grid for complex layouts
- Media queries for responsive breakpoints

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-first design works on all device sizes

## Accessibility
- 48×48px minimum touch targets
- Keyboard navigation support
- Proper ARIA roles for interactive components
- WCAG 2.1 AA contrast compliance

## Development

To modify the application:
1. Edit `index.html` for structure changes
2. Modify files in `styles/` for styling updates
3. Update `scripts/main.js` for frontend functionality changes
4. Update `server.js` for backend API changes

## Testing

Run tests with:
```bash
npm test
```

## Deployment

### Local Development
1. Install dependencies: `npm install`
2. Build frontend: `npm run build`
3. Start server: `npm start`

### Production Deployment
1. Set up Firebase project and service account
2. Configure Hugging Face API token
3. Set environment variables
4. Optimize for performance: `npm run optimize`
5. Deploy to cloud platform (Google Cloud Run, AWS, etc.)
6. Configure reverse proxy (nginx, Apache)
7. Set up SSL certificates

### Deployment Options
- **GitHub Pages**: Use `npm run deploy` for static deployment
- **Firebase Hosting**: Use Firebase CLI for unified deployment
- **Vercel/Netlify**: Connect repository for automatic deployments
- **Traditional Hosting**: Deploy server.js with Node.js

## Performance Optimization

The application includes several performance optimization features:

### Image Optimization
- Automatic image compression using Sharp library
- Quality settings balanced for optimal file size vs. quality

### Lazy Loading
- Images load only when needed
- Improved initial page load time

### Service Worker Enhancements
- Specialized caching strategies for different asset types
- Offline support with fallback data
- Network optimization techniques

### Build Process
- Automated optimization during build
- Asset minification and organization

## Security Considerations

- Validate all user inputs
- Sanitize file uploads
- Implement rate limiting
- Use HTTPS in production
- Secure Firestore with proper security rules
- Protect API endpoints with authentication

### Credential Management

This repository contains placeholder files for sensitive credentials:

1. **Firebase Service Account** (`config/firebase-service-account.json`)
   - Never commit actual service account credentials to version control
   - Each developer should create their own Firebase project and service account
   - Create a `config` directory in the project root
   - Download your service account JSON file and place it in the `config` directory
   - Rename the file to `firebase-service-account.json`
   - Update the values in the file with your actual service account credentials

2. **Hugging Face API Key** (`.env`)
   - Never commit actual API keys to version control
   - Create a `.env` file from `.env.example`
   - Replace placeholder values with your actual credentials

3. **Environment Variables**
   - All sensitive configuration should be stored in environment variables
   - The `.env` file is included in `.gitignore` to prevent accidental commits
   - In production, set environment variables through your deployment platform

### Best Practices

- Regularly rotate API keys and service account credentials
- Use least privilege principles for service accounts
- Monitor usage of API keys and credentials
- Implement proper error handling to avoid exposing sensitive information
- Use environment-specific configuration files
- Never log sensitive information

## Future Enhancements
- Camera API integration for real image capture
- Enhanced AI capabilities for product assessment
- User authentication and personalized recommendations
- Push notifications for product updates
- Social sharing features
- Multi-language support
- Barcode scanning capabilities
- Advanced analytics dashboard
- Real-time collaborative features
- Enhanced offline capabilities