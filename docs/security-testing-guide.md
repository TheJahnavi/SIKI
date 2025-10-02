# Security Testing Guide for SIKI Application

This guide provides instructions for testing and securing the SIKI application to protect user data and prevent security vulnerabilities.

## 🔍 Security Testing Areas

### 1. Client-Side Security
- Sensitive data exposure
- Cross-Site Scripting (XSS)
- Client-side injection
- Insecure DOM manipulation

### 2. Server-Side Security
- Input validation and sanitization
- Authentication and authorization
- Secure API endpoints
- Error handling and logging

### 3. Data Security
- Data encryption
- Secure data transmission
- Data storage security
- Privacy compliance

### 4. Network Security
- HTTPS enforcement
- Secure headers
- Content Security Policy
- Cross-Origin Resource Sharing

### 5. Third-Party Security
- API key protection
- External service integration
- Dependency vulnerabilities
- CDN security

## 🧪 Security Testing Tools

### 1. Automated Security Scanners
- **OWASP ZAP** - Free security scanner
- **Burp Suite** - Professional web security testing
- **Snyk** - Dependency vulnerability scanning
- **npm audit** - Node.js dependency security

### 2. Manual Testing Tools
- **Browser Developer Tools** - Inspect network requests and storage
- **Postman** - API security testing
- **curl/wget** - Command-line HTTP testing
- **Wireshark** - Network traffic analysis

## 🔐 Client-Side Security Testing

### 1. Sensitive Data Exposure
```javascript
// Test: Check for exposed credentials
// In browser console:
Object.keys(localStorage).forEach(key => {
  const value = localStorage.getItem(key);
  if (value.includes('key') || value.includes('secret') || value.includes('token')) {
    console.warn('Potential sensitive data in localStorage:', key, value);
  }
});

Object.keys(sessionStorage).forEach(key => {
  const value = sessionStorage.getItem(key);
  if (value.includes('key') || value.includes('secret') || value.includes('token')) {
    console.warn('Potential sensitive data in sessionStorage:', key, value);
  }
});
```

### 2. Cross-Site Scripting (XSS) Testing
```javascript
// Test: Check for XSS vulnerabilities in input fields
// Try injecting scripts in form fields:
// <script>alert('XSS')</script>
// <img src=x onerror=alert('XSS')>
// javascript:alert('XSS')

// In main.js - Proper input sanitization
function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// Use when displaying user input
document.getElementById('user-content').innerHTML = sanitizeInput(userInput);
```

### 3. Secure Storage Practices
```javascript
// Test: Verify sensitive data is not stored in plain text
// Check localStorage and sessionStorage for API keys, tokens, etc.

// Good: Store only non-sensitive data in client storage
localStorage.setItem('userPreferences', JSON.stringify({
  theme: 'dark',
  dietaryRestrictions: ['vegan', 'gluten-free']
}));

// Bad: Never store sensitive data like API keys or tokens
// localStorage.setItem('apiKey', 'sk-1234567890abcdef'); // DON'T DO THIS
```

## 🔒 Server-Side Security Testing

### 1. Input Validation and Sanitization
```javascript
// In server.js - Enhanced input validation
const { body, validationResult } = require('express-validator');

// Validate product analysis requests
app.post('/api/analyze-product', 
  upload.single('image'),
  body('userId').optional().isAlphanumeric().withMessage('Invalid user ID'),
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid input',
        details: errors.array()
      });
    }
    
    // Continue with processing...
  }
);

// Sanitize user input
const sanitizeHtml = require('sanitize-html');

function sanitizeUserInput(input) {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {}
  });
}
```

### 2. Authentication and Authorization
```javascript
// In server.js - Authentication middleware
function requireAuth(req, res, next) {
  // In a real implementation, verify JWT token or session
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication required' 
    });
  }
  
  // Verify token (simplified example)
  const token = authHeader.substring(7);
  try {
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid token' 
    });
  }
}

// Apply to protected routes
app.post('/api/store-product', requireAuth, (req, res) => {
  // Only authenticated users can store products
});
```

### 3. Secure API Endpoints
```javascript
// In server.js - Rate limiting to prevent abuse
const rateLimit = require('express-rate-limit');

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Analysis endpoint rate limiting (more restrictive)
const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 analysis requests per hour
  message: 'Too many analysis requests. Please try again later.'
});

// Apply rate limiting
app.use('/api/', generalLimiter);
app.post('/api/analyze-product', analysisLimiter);
```

## 🔐 Data Security Testing

### 1. Environment Variable Security
```bash
# Test: Verify .env file is in .gitignore
# Check .gitignore file contains:
# .env
# config/firebase-service-account.json
# *.key
# *.pem

# Test: Verify environment variables are used correctly
# In server.js:
if (!process.env.HUGGINGFACE_API_KEY) {
  console.warn('HUGGINGFACE_API_KEY not set - using fallback mode');
}

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.warn('GOOGLE_APPLICATION_CREDENTIALS not set - Firebase disabled');
}
```

### 2. Secure Data Transmission
```javascript
// In server.js - Ensure HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Set secure headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

### 3. Firebase Security Rules Testing
```javascript
// In firebase.rules - Enhanced Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Product analysis documents
    match /productAnalysis/{document} {
      // Allow read for all users
      allow read: if true;
      
      // Allow create with validation
      allow create: if request.auth != null && 
        request.resource.data.keys().hasAll(['name', 'score']) &&
        request.resource.data.score >= 0 &&
        request.resource.data.score <= 100;
      
      // Allow update only by the user who created it
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      
      // Allow delete only by the user who created it
      allow delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // User preferences
    match /userPreferences/{userId} {
      // Allow read/write only by the user
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    // Chat history
    match /chatHistory/{document} {
      // Allow read for all users
      allow read: if true;
      
      // Allow create with validation
      allow create: if request.auth != null && 
        request.resource.data.keys().hasAll(['query', 'response']);
      
      // No updates or deletes
      allow update, delete: if false;
    }
  }
}
```

## 🌐 Network Security Testing

### 1. HTTPS Enforcement
```javascript
// Test: Verify HTTPS is enforced in production
// Use tools like SSL Labs SSL Test to check SSL configuration

// In server.js - Redirect HTTP to HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.secure || req.header('x-forwarded-proto') === 'https') {
      next();
    } else {
      res.redirect(`https://${req.headers.host}${req.url}`);
    }
  });
}
```

### 2. Content Security Policy
```javascript
// In server.js - Set Content Security Policy
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "connect-src 'self' https://api-inference.huggingface.co https://firestore.googleapis.com; " +
    "frame-src 'none'; " +
    "object-src 'none';"
  );
  next();
});
```

### 3. CORS Configuration
```javascript
// In server.js - Secure CORS configuration
const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'https://scanitknowit.netlify.app',
      // Add other allowed origins
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

## 🔌 Third-Party Security Testing

### 1. API Key Protection
```bash
# Test: Verify API keys are not hardcoded
# Check source code for exposed keys

# Good: Use environment variables
# In .env:
# HUGGINGFACE_API_KEY=your-api-key-here

# In server.js:
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

# Never commit actual API keys to version control
```

### 2. Dependency Security
```bash
# Test: Check for vulnerable dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# For high severity issues
npm audit fix --force
```

### 3. External Service Integration
```javascript
// In server.js - Secure external service calls
async function callHuggingFaceAPI(prompt) {
  try {
    // Validate input
    if (!prompt || prompt.length > 1000) {
      throw new Error('Invalid prompt');
    }
    
    // Use API with proper error handling
    const response = await hf.textGeneration({
      model: 'google/flan-t5-base',
      inputs: prompt,
      parameters: {
        max_new_tokens: 150,
        temperature: 0.7
      }
    });
    
    return response.generated_text;
  } catch (error) {
    // Log error securely (no sensitive data)
    console.error('Hugging Face API error:', error.message);
    
    // Return safe fallback
    return 'Unable to generate response at this time.';
  }
}
```

## 🛡 Security Testing Checklist

### Pre-Deployment Security Testing
- [ ] No sensitive data in client-side code
- [ ] Environment variables properly configured
- [ ] API keys not exposed in version control
- [ ] Input validation implemented for all endpoints
- [ ] Authentication/authorization for protected endpoints
- [ ] Rate limiting for API endpoints
- [ ] HTTPS enforced in production
- [ ] Secure headers implemented
- [ ] Content Security Policy configured
- [ ] CORS properly configured
- [ ] Firebase security rules tested
- [ ] Dependency vulnerabilities checked
- [ ] Error handling doesn't expose sensitive data

### Ongoing Security Monitoring
- [ ] Regular security audits
- [ ] Dependency vulnerability scanning
- [ ] Log monitoring for suspicious activity
- [ ] Security incident response plan
- [ ] Regular security training for developers
- [ ] Penetration testing (annual)
- [ ] Security updates for dependencies

## 🚨 Common Security Vulnerabilities to Avoid

### 1. Insecure Direct Object References (IDOR)
```javascript
// Bad: Direct access to user data without validation
app.get('/api/user-data/:userId', (req, res) => {
  // This allows access to any user's data
  const userData = db.collection('users').doc(req.params.userId).get();
  res.json(userData);
});

// Good: Validate user access
app.get('/api/user-data/:userId', requireAuth, (req, res) => {
  // Only allow access to own data
  if (req.user.id !== req.params.userId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const userData = db.collection('users').doc(req.params.userId).get();
  res.json(userData);
});
```

### 2. Cross-Site Request Forgery (CSRF)
```javascript
// In server.js - CSRF protection
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// Apply to forms
app.use(csrfProtection);

// Include CSRF token in forms
app.get('/form', (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});
```

### 3. Insecure File Uploads
```javascript
// In server.js - Secure file upload
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Additional validation
app.post('/api/analyze-product', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // Validate file type again
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ error: 'Invalid file type' });
  }
  
  // Process file...
});
```

## 📋 Final Security Review

Before public release, verify all security requirements are met:

### Essential Requirements
- [ ] No sensitive data in version control
- [ ] Environment variables properly configured
- [ ] Input validation for all endpoints
- [ ] Authentication for protected endpoints
- [ ] Rate limiting implemented
- [ ] HTTPS enforced in production
- [ ] Secure headers implemented
- [ ] Content Security Policy configured
- [ ] CORS properly configured
- [ ] Firebase security rules validated
- [ ] No high/critical vulnerabilities in dependencies
- [ ] Error handling doesn't expose sensitive data

### Enhanced Requirements
- [ ] Regular security audits scheduled
- [ ] Dependency vulnerability monitoring
- [ ] Log monitoring for security events
- [ ] Security incident response plan
- [ ] Developer security training
- [ ] Penetration testing conducted
- [ ] Security updates process established

This guide should be used throughout development and before each release to ensure the SIKI application maintains strong security practices to protect user data and privacy.