# Backend Deployment Guide

This guide explains how to deploy the SIKI backend separately from the frontend and configure the frontend to connect to it.

## Problem

When deploying the SIKI application to static hosting platforms like Netlify, the frontend works fine but API calls to endpoints like `/api/analyze-product` return 404 errors. This happens because static hosting platforms only serve static files and don't run server-side code.

## Solution

Deploy the backend to a platform that supports Node.js applications, then configure the frontend to use the deployed backend URL.

## Deploying the Backend

### Option 1: Render (Recommended)

1. Create an account at [Render](https://render.com/)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set the build command to: `npm install`
5. Set the start command to: `npm start`
6. Add environment variables:
   - `HUGGINGFACE_API_KEY` - Your Hugging Face API key
   - `GOOGLE_APPLICATION_CREDENTIALS` - Path to your Firebase service account file
   - `PORT` - The port to run the server on (Render will provide this)
7. Deploy the service

### Option 2: Heroku

1. Create an account at [Heroku](https://heroku.com/)
2. Install the Heroku CLI
3. Login to Heroku CLI: `heroku login`
4. Create a new app: `heroku create your-app-name`
5. Set environment variables:
   ```bash
   heroku config:set HUGGINGFACE_API_KEY=your_api_key
   heroku config:set GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
   ```
6. Deploy: `git push heroku main`

### Option 3: Google Cloud Run

1. Install Google Cloud SDK
2. Authenticate: `gcloud auth login`
3. Set project: `gcloud config set project your-project-id`
4. Build and deploy:
   ```bash
   gcloud run deploy siki-backend \
     --source . \
     --platform managed \
     --allow-unauthenticated \
     --set-env-vars HUGGINGFACE_API_KEY=your_api_key
   ```

## Configuring the Frontend

After deploying the backend, you need to update the frontend to use the deployed backend URL.

### Update the API Base URL

In `scripts/main.js`, update the `API_BASE_URL` constant:

```javascript
// Determine the base URL for API calls
// In development, use relative paths
// In production, use the deployed backend URL
const API_BASE_URL = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' || 
                     window.location.hostname === '' ? 
                     '' : 'https://your-deployed-backend-url.com';
```

Replace `https://your-deployed-backend-url.com` with the actual URL of your deployed backend.

### Environment-Specific Configuration

For a more robust solution, you can use environment variables or a configuration file:

1. Create a `config.js` file:
   ```javascript
   // config.js
   const config = {
     development: {
       apiUrl: ''
     },
     production: {
       apiUrl: 'https://your-deployed-backend-url.com'
     }
   };
   
   const environment = process.env.NODE_ENV || 'development';
   export default config[environment];
   ```

2. Update `scripts/main.js` to use the config:
   ```javascript
   import config from './config.js';
   
   const API_BASE_URL = config.apiUrl;
   ```

## Testing the Connection

### Test Endpoints Directly

You can test your deployed backend endpoints directly using tools like curl or Postman:

```bash
# Test the analyze-product endpoint
curl -X POST https://your-deployed-backend-url.com/api/analyze-product

# Test the chat endpoint
curl -X POST https://your-deployed-backend-url.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"productId": "1", "query": "Is this product healthy?"}'
```

### Check Browser Network Tab

1. Open your deployed SIKI app in a browser
2. Open Developer Tools (F12)
3. Go to the Network tab
4. Perform an action that triggers an API call (like analyzing a product)
5. Check that the requests are being sent to the correct URL and returning 200 status codes

## Common Issues and Solutions

### CORS Errors

If you encounter CORS errors, make sure your backend is configured to allow requests from your frontend domain. In `server.js`, the CORS middleware should be configured:

```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-domain.com']
}));
```

### Environment Variables Not Set

Make sure all required environment variables are set in your deployment environment:
- `HUGGINGFACE_API_KEY`
- `GOOGLE_APPLICATION_CREDENTIALS`
- `PORT`

### File Upload Issues

Some deployment platforms have limits on file upload sizes. If you encounter issues with large image uploads, you may need to configure file size limits in your deployment platform settings.

## Monitoring and Logging

### Server Logs

Most deployment platforms provide access to server logs:
- Render: Dashboard → Your Web Service → Logs
- Heroku: `heroku logs --tail`
- Google Cloud Run: Cloud Console → Cloud Run → Your Service → Logs

### Error Tracking

Consider adding error tracking to your backend:
1. Install Sentry: `npm install @sentry/node`
2. Initialize in `server.js`:
   ```javascript
   const Sentry = require('@sentry/node');
   
   Sentry.init({
     dsn: "YOUR_SENTRY_DSN",
     tracesSampleRate: 1.0,
   });
   ```

## Security Considerations

### API Key Protection

Never commit API keys to version control. Use environment variables and ensure they are properly set in your deployment environment.

### Rate Limiting

Implement rate limiting to prevent abuse of your API:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### Input Validation

Always validate and sanitize user inputs:
```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/analyze-product', 
  upload.single('image'),
  body('image').notEmpty().withMessage('Image is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array() });
    }
    // ... rest of the handler
  }
);
```

## Performance Optimization

### Caching

Implement caching for frequently accessed data:
```javascript
const redis = require('redis');
const client = redis.createClient();

app.get('/api/history', async (req, res) => {
  const cacheKey = `user:${userId}:history`;
  
  // Try to get from cache first
  const cached = await client.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  // If not in cache, get from database
  const history = await getHistoryFromDatabase(userId);
  
  // Store in cache for 5 minutes
  await client.setex(cacheKey, 300, JSON.stringify(history));
  
  res.json({ success: true, history });
});
```

### Compression

The backend already includes compression middleware, but you can fine-tune it:
```javascript
app.use(compression({
  level: 6,
  threshold: 100 * 1000, // 100KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

## Conclusion

By deploying the backend separately and configuring the frontend to use the deployed backend URL, you can resolve the 404 errors and have a fully functional SIKI application. Remember to:

1. Deploy the backend to a platform that supports Node.js
2. Update the frontend to use the deployed backend URL
3. Set all required environment variables
4. Test the connection thoroughly
5. Monitor for errors and performance issues

This approach allows you to take advantage of static hosting for the frontend while maintaining the full functionality of your backend services.