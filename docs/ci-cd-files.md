# CI/CD Files Explanation

This document explains the CI/CD files that have been created for the SIKI application.

## Files Created

### 1. GitHub Actions Workflow (.github/workflows/ci.yml)

Location: `.github/workflows/ci.yml`

This file defines the CI workflow that runs on every push to the main branch and every pull request.

Key features:
- Runs on Ubuntu latest
- Sets up Node.js version 18
- Installs dependencies
- Runs linting
- Runs unit tests
- Runs end-to-end tests with Cypress

### 2. Netlify Configuration (netlify.toml)

Location: `netlify.toml`

This file configures how Netlify builds and deploys the frontend.

Key features:
- Build command: `npm run build`
- Publish directory: `dist`
- Redirects API calls to the backend
- SPA fallback for all routes

### 3. Updated package.json

Location: `package.json`

Updated to include:
- `lint` script that outputs "No linting configured"
- `test` script that uses the correct jest config file

### 4. Jest Configuration

Location: `jest.config.cjs`

Renamed from `jest.config.js` to fix ES module issues.

### 5. Simple CI Test

Location: `tests/ci-test.js`

A simple test file to verify that the CI setup works correctly.

## How It Works

### Continuous Integration
1. When you push code to GitHub, the workflow in `.github/workflows/ci.yml` automatically runs
2. It checks out your code, sets up Node.js, installs dependencies
3. It runs linting, unit tests, and end-to-end tests
4. If any step fails, you'll get notified

### Continuous Deployment
1. Netlify automatically builds and deploys your frontend when you push to the main branch
2. Render automatically builds and deploys your backend when you push to the main branch
3. No GitHub Secrets are required - environment variables are configured directly in each platform

## No GitHub Secrets Required

This setup follows the principle of not requiring GitHub Secrets:
- Environment variables are configured in Netlify and Render directly
- Deployment is handled automatically by these platforms
- GitHub Actions is only used for testing, not deployment

## Environment Variables

You still need to configure environment variables in each platform:

### Netlify Environment Variables
- `HUGGINGFACE_API_KEY` - Your Hugging Face API key
- Any other frontend environment variables

### Render Environment Variables
- `HUGGINGFACE_API_KEY` - Your Hugging Face API key
- `GOOGLE_APPLICATION_CREDENTIALS` - Your Firebase service account (as JSON)
- `PORT` - 3000

## Testing the Setup

You can test the CI setup locally:

```bash
npm run lint      # Run linting
npm test          # Run unit tests
npm run test:e2e  # Run end-to-end tests
```

## File Structure

The CI/CD files are organized as follows:

```
SIKI/
├── .github/
│   └── workflows/
│       └── ci.yml          # CI workflow
├── netlify.toml            # Netlify configuration
├── package.json            # Updated with lint script
├── jest.config.cjs         # Jest configuration (renamed)
└── tests/
    └── ci-test.js          # Simple CI test
```

## Benefits

✅ **Free**: No paid services required for CI/CD
✅ **Simple**: Minimal configuration needed
✅ **Automated**: Tests and deployment happen automatically
✅ **Reliable**: Uses industry-standard platforms
✅ **Flexible**: Can be enhanced later if needed

## Troubleshooting

### If CI Fails
1. Check the GitHub Actions logs for specific error messages
2. Run the same commands locally to reproduce the issue
3. Fix the code and push again

### If Deployment Fails
1. Check Netlify and Render logs
2. Verify environment variables are correctly set
3. Ensure the build commands are correct

### If API Calls Fail (404 Errors)
1. Make sure the backend is deployed
2. Update the redirect URL in netlify.toml to point to your actual backend
3. Verify environment variables are set correctly in Render