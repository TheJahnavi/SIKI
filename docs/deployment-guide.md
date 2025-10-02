# SIKI App Deployment Guide

This guide explains how to prepare and deploy the SIKI application for production use.

## Prerequisites

Before deploying, ensure you have:

1. Node.js (version 14 or higher)
2. npm (version 6 or higher)
3. A Firebase project with Firestore enabled
4. A Hugging Face API key (optional but recommended)

## Build Process

The SIKI app uses a custom build process that:

1. Copies all necessary files to a `dist` directory
2. Optimizes assets for production
3. Prepares the app for deployment

To build the project:

```bash
npm run build
```

This command runs the [build.js](../scripts/build.js) script which:
- Creates a `dist` directory
- Copies HTML, CSS, JavaScript, and asset files
- Prepares the app for deployment

## Optimization

Before deployment, optimize the app for better performance:

```bash
npm run optimize
```

This command runs the [optimize.js](../scripts/optimize.js) script which:
- Compresses images using Sharp
- Implements lazy loading for images
- Optimizes service worker caching strategies
- Adds offline fallback data

## Testing

Run tests to ensure the application works correctly:

```bash
npm test
```

This runs the Jest test suite which tests:
- API endpoints
- Fallback database functionality
- Core application features

## Deployment Options

### Option 1: GitHub Pages (Static Deployment)

1. Ensure you have a GitHub repository for the project
2. Run the deployment script:

```bash
npm run deploy
```

This command:
- Builds the project
- Deploys the `dist` directory to GitHub Pages
- Uses the `gh-pages` package for deployment

### Option 2: Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize Firebase in your project:
```bash
firebase login
firebase init hosting
```

3. Build and deploy:
```bash
npm run build
firebase deploy
```

### Option 3: Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel --prod
```

### Option 4: Netlify

1. Create a `netlify.toml` file in the project root:
```toml
[build]
  command = "npm run build"
  publish = "dist"
```

2. Connect your GitHub repository to Netlify
3. Netlify will automatically build and deploy on push

## Environment Variables

Ensure the following environment variables are set in your production environment:

```env
# Firebase Configuration
GOOGLE_APPLICATION_CREDENTIALS=firebase-service-account.json

# Hugging Face Configuration
HUGGINGFACE_API_KEY=your_huggingface_api_key

# Server Configuration
PORT=3000
```

## Performance Optimization

### Image Compression
The optimization script uses Sharp to compress images. To manually compress images:

```bash
npm run optimize
```

### Lazy Loading
Images are automatically set to load lazily. This is implemented in the optimization script.

### Service Worker Caching
The service worker implements different caching strategies:
- Images are cached with longer expiration
- Critical assets are cached for offline access
- Network-first strategy for API requests

### Offline Support
The service worker provides offline fallback data for core functionality.

## Security Considerations

### Firebase Security Rules
Ensure your Firebase security rules are properly configured. See [firebase-security-rules.md](firebase-security-rules.md) for details.

### API Keys
Never expose API keys in client-side code. All API calls should go through your backend server.

### HTTPS
Always deploy with HTTPS enabled. Most deployment platforms provide this automatically.

## Monitoring and Analytics

### Firebase Analytics
If using Firebase, you can enable Analytics to track user engagement.

### Error Tracking
Consider implementing error tracking with services like Sentry.

### Performance Monitoring
Use tools like Lighthouse to monitor performance metrics.

## Troubleshooting

### Build Issues
If the build fails:
1. Check that all dependencies are installed: `npm install`
2. Verify file paths in [build.js](../scripts/build.js)
3. Ensure the `dist` directory has write permissions

### Deployment Issues
If deployment fails:
1. Check your deployment platform's documentation
2. Verify environment variables are set correctly
3. Ensure your build command is correct

### Runtime Issues
If the app doesn't work after deployment:
1. Check browser console for errors
2. Verify all API endpoints are accessible
3. Confirm Firebase configuration is correct

## Scaling Considerations

### Database
Firestore can scale automatically, but be mindful of:
- Query efficiency
- Document structure
- Indexes for frequently queried fields

### Compute
For high-traffic applications:
- Consider using a CDN for static assets
- Implement request caching
- Monitor usage quotas

### Storage
For image storage:
- Use compressed formats
- Implement cleanup for old uploads
- Consider cloud storage solutions

## Maintenance

### Regular Updates
- Keep dependencies up to date
- Monitor for security vulnerabilities
- Update Firebase rules as needed

### Backup
- Regularly backup your Firestore database
- Keep copies of service account keys
- Document any custom configurations

This deployment guide should help you successfully deploy the SIKI application to production. Always test thoroughly in a staging environment before deploying to production.