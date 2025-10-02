# Simple CI/CD Setup

This document explains the simple CI/CD setup for the SIKI application using GitHub Actions, Netlify, and Render.

## Files Created

### 1. GitHub Actions Workflow (.github/workflows/ci.yml)

This workflow runs on every push to the main branch and every pull request:

```yaml
name: SIKI CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run lint
      - run: npm test
      - name: Run Cypress Tests
        run: npm run test:e2e
```

### 2. Netlify Configuration (netlify.toml)

This file configures how Netlify builds and deploys the frontend:

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "functions"

[dev]
  command = "npm run dev"
  port = 3000
  targetPort = 3000

[[redirects]]
  from = "/api/*"
  to = "https://your-backend-url.com/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## How It Works

### Continuous Integration (CI)
1. Every time you push code to the main branch or create a pull request, GitHub Actions automatically runs:
   - Code checkout
   - Node.js setup
   - Dependency installation
   - Linting
   - Unit tests
   - End-to-end tests with Cypress

### Continuous Deployment (CD)
1. Netlify automatically deploys the frontend when you push to the main branch
2. Render automatically deploys the backend when you push to the main branch
3. No GitHub Secrets are required for this setup
4. Environment variables are configured manually in each platform

## Environment Variables

### Netlify
1. Go to your site settings in Netlify
2. Navigate to "Environment Variables"
3. Add these variables:
   - `HUGGINGFACE_API_KEY` - Your Hugging Face API key
   - Any other frontend environment variables

### Render
1. Go to your web service in Render
2. Navigate to "Environment Variables"
3. Add these variables:
   - `HUGGINGFACE_API_KEY` - Your Hugging Face API key
   - `GOOGLE_APPLICATION_CREDENTIALS` - Your Firebase service account (as JSON)
   - `PORT` - 3000

## No GitHub Secrets Required

This setup doesn't require GitHub Secrets because:
1. Environment variables are configured directly in Netlify and Render
2. Deployment is handled automatically by these platforms
3. GitHub Actions is only used for testing, not deployment

## Benefits

✅ **Free**: No paid services required
✅ **Simple**: Minimal configuration needed
✅ **Automated**: Tests run automatically on every change
✅ **Reliable**: Industry-standard tools and platforms
✅ **Scalable**: Can be enhanced later if needed

## Manual Deployment Process

1. Push code to the main branch
2. GitHub Actions runs tests
3. Netlify automatically builds and deploys the frontend
4. Render automatically builds and deploys the backend
5. Environment variables are already configured in each platform

## Testing

### Local Testing
```bash
npm test          # Run unit tests
npm run test:e2e  # Run end-to-end tests
npm run lint      # Run linting
```

### CI Testing
GitHub Actions automatically runs all tests on every push.

## Troubleshooting

### If Tests Fail
1. Check the GitHub Actions logs for error messages
2. Run the same commands locally to reproduce the issue
3. Fix the code and push again

### If Deployment Fails
1. Check Netlify and Render logs
2. Verify environment variables are correctly set
3. Ensure the build commands are correct

### If API Calls Fail (404 Errors)
1. Make sure the backend is deployed
2. Update the redirect URL in netlify.toml to point to your actual backend
3. Verify environment variables are set correctly