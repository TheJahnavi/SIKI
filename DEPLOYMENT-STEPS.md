# SIKI App Deployment Steps

This guide provides a quick checklist to deploy the SIKI application and fix the 404 error.

## Problem
You're seeing "Analysis failed(404). Please try again." because the frontend is trying to reach API endpoints that don't exist when deployed to static hosting like Netlify.

## Solution
Deploy the backend separately and configure the frontend to use the deployed backend URL.

## Step-by-Step Deployment

### 1. Deploy the Backend Server

Choose one of these platforms:

#### Option A: Render (Recommended)
1. Go to [Render](https://render.com/)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set these build settings:
   - Build command: `npm install`
   - Start command: `npm start`
5. Add environment variables:
   ```
   HUGGINGFACE_API_KEY=your_actual_huggingface_api_key
   GOOGLE_APPLICATION_CREDENTIALS=config/firebase-service-account.json
   PORT=3000
   ```
6. Deploy the service
7. Note the deployed URL (e.g., `https://your-app-name.onrender.com`)

#### Option B: Heroku
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables:
   ```bash
   heroku config:set HUGGINGFACE_API_KEY=your_actual_api_key
   heroku config:set GOOGLE_APPLICATION_CREDENTIALS=config/firebase-service-account.json
   ```
5. Deploy: `git push heroku main`

### 2. Update Frontend Configuration

1. Open `scripts/config.js`
2. Update the `production` section:
   ```javascript
   production: {
     // REPLACE WITH YOUR ACTUAL DEPLOYED BACKEND URL
     apiUrl: 'https://your-actual-deployed-backend-url.com',
     debug: false,
     firebase: {
       useEmulator: false
     }
   }
   ```

### 3. Rebuild and Deploy Frontend

1. Build the frontend:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to your static hosting (Netlify, GitHub Pages, etc.)

### 4. Verify Deployment

1. Visit your deployed app
2. Open browser developer tools (F12)
3. Go to the Network tab
4. Try to analyze a product
5. Check that API requests are being sent to your deployed backend URL (not returning 404)

## Troubleshooting

### If Still Getting 404 Errors:
1. Double-check that your backend is running
2. Verify the backend URL in `config.js` is correct
3. Ensure environment variables are set in your deployment platform
4. Check that CORS is properly configured in your backend

### If Getting CORS Errors:
In your `server.js`, make sure CORS is configured to allow your frontend domain:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-domain.com']
}));
```

### If API Keys Not Working:
1. Verify `HUGGINGFACE_API_KEY` is set in backend environment variables
2. Check that `firebase-service-account.json` is properly uploaded to your backend deployment

## Testing Your Deployment

1. Open `test-api-config.html` in your browser
2. Click "Test Configuration" to verify your settings
3. Click "Check API Endpoints" to test connectivity to your backend

## Need Help?

1. Check the detailed guide: `docs/backend-deployment-guide.md`
2. Verify your configuration with the test tools
3. Make sure all environment variables are set