# CI/CD Setup Guide

This guide explains how to set up Continuous Integration/Continuous Deployment for the SIKI application using GitHub Actions.

## Overview

With CI/CD configured, every time you push code to the main branch, GitHub Actions will automatically:
1. Build the application
2. Run tests
3. Deploy the frontend to Netlify
4. Deploy the backend to Render

## Prerequisites

1. GitHub repository for your SIKI app
2. Netlify account and site
3. Render account and web service
4. API keys for both platforms

## Setup Instructions

### 1. Configure GitHub Repository Secrets

Go to your GitHub repository settings and add the following secrets under "Settings" → "Secrets and variables" → "Actions":

#### For Netlify Deployment:
- `NETLIFY_AUTH_TOKEN` - Your Netlify personal access token
- `NETLIFY_SITE_ID` - Your Netlify site ID

#### For Render Deployment:
- `RENDER_API_KEY` - Your Render API key
- `RENDER_SERVICE_ID` - Your Render service ID

### 2. Get Netlify Credentials

1. Go to [Netlify](https://netlify.com/)
2. Go to "User Settings" → "Applications"
3. Create a new personal access token
4. Copy the token and add it as `NETLIFY_AUTH_TOKEN` in GitHub secrets
5. Get your site ID from the site settings and add it as `NETLIFY_SITE_ID`

### 3. Get Render Credentials

1. Go to [Render](https://render.com/)
2. Go to "User" → "API Keys"
3. Create a new API key
4. Copy the key and add it as `RENDER_API_KEY` in GitHub secrets
5. Get your service ID from the service settings and add it as `RENDER_SERVICE_ID`

### 4. Configure Render Web Service

1. Create a new Web Service on Render
2. Connect it to your GitHub repository
3. Set the build command to: `npm install`
4. Set the start command to: `npm start`
5. Add environment variables:
   - `HUGGINGFACE_API_KEY` - Your Hugging Face API key
   - `GOOGLE_APPLICATION_CREDENTIALS` - Path to your Firebase service account file
   - `PORT` - 3000

### 5. Configure Netlify Site

1. Create a new site on Netlify
2. Connect it to your GitHub repository
3. Set the publish directory to: `dist`
4. The build will be handled by GitHub Actions, so you can leave the build settings empty

## GitHub Actions Workflows

The repository includes three workflows:

### deploy-frontend.yml
Deploys only the frontend when frontend files are changed.

### deploy-backend.yml
Deploys only the backend when backend files are changed.

### deploy-all.yml
Deploys both frontend and backend when any files are changed.

## Customizing the Workflows

### Path Filters
The workflows use path filters to determine when to run:
- Frontend: HTML, CSS, JS, image files
- Backend: Server files, package.json

You can modify these paths in the workflow files if needed.

### Environment Variables
Make sure all required environment variables are set in your deployment platforms:
- Hugging Face API key
- Firebase service account
- Any other configuration variables

## Monitoring Deployments

### GitHub Actions
1. Go to the "Actions" tab in your repository
2. View the workflow runs
3. Check logs for any errors

### Netlify
1. Go to your site dashboard
2. View deployment logs
3. Check the deployed site

### Render
1. Go to your service dashboard
2. View deployment logs
3. Check the service status

## Troubleshooting

### Deployment Failures
1. Check the GitHub Actions logs for error messages
2. Verify all secrets are correctly configured
3. Ensure environment variables are set in deployment platforms

### 404 Errors After Deployment
1. Verify the backend is running on Render
2. Check that the frontend configuration points to the correct backend URL
3. Ensure CORS is properly configured

### Build Failures
1. Check that all dependencies are correctly listed in package.json
2. Verify Node.js version compatibility
3. Check for syntax errors in the code

## Best Practices

### Branch Strategy
- Use `main` branch for production deployments
- Use feature branches for development
- Create pull requests for code review before merging to main

### Testing
- Add comprehensive tests to your workflow
- Use staging environments for testing
- Implement rollback procedures

### Security
- Never commit API keys or secrets to the repository
- Use GitHub secrets for all sensitive information
- Regularly rotate API keys

## Advanced Configuration

### Custom Domains
If you're using custom domains:
1. Configure them in your deployment platforms
2. Update the frontend configuration accordingly
3. Ensure SSL certificates are properly set up

### Environment-Specific Configurations
You can create separate workflows for different environments:
- Development
- Staging
- Production

### Notifications
Add notifications to your workflows:
```yaml
- name: Notify on failure
  if: failure()
  run: echo "Deployment failed!"
```

## Conclusion

With this CI/CD setup, you can focus on writing code and let GitHub Actions handle the deployment process. Every push to the main branch will automatically trigger a build and deployment to your production environment.