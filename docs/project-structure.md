# SIKI Project Structure

This document provides an overview of the SIKI application's file structure and organization.

## Project Root

```
SIKI/
├── index.html                 # Main HTML entry point
├── server.js                  # Express.js backend server
├── package.json               # Project metadata and dependencies
├── package-lock.json          # Locked dependency versions
├── README.md                  # Project documentation
├── .env                       # Environment variables
├── .gitignore                 # Git ignored files
├── .babelrc                   # Babel configuration
├── jest.config.js             # Jest testing configuration
├── manifest.json              # PWA manifest file
├── sw.js                      # Service worker
├── firebase-config.js         # Firebase initialization
├── firebase.rules             # Firestore security rules
├── firebase-service-account.json  # Firebase service account (root location - temporary)
├── config/                    # Configuration directory
│   └── firebase-service-account.json  # Firebase service account
├── styles/                    # CSS stylesheets
├── scripts/                   # JavaScript files
├── docs/                      # Documentation files
├── tests/                     # Test files
├── icons/                     # PWA icons
├── uploads/                   # Uploaded images directory
├── dist/                      # Built distribution files
└── node_modules/              # NPM dependencies
```

## Styles Directory

```
styles/
├── main.css                   # Main stylesheet importing all modular styles
├── reset.css                  # CSS reset
├── animations.css             # Animation definitions
├── utilities.css              # Utility classes
├── print.css                  # Print styles
├── dark-mode.css              # Dark theme overrides
├── mobile.css                 # Mobile-specific styles
├── accessibility.css          # Accessibility enhancements
├── components.css             # Component styles
├── grid.css                   # Grid system
├── typography.css             # Typography styles
├── forms.css                  # Form elements
├── navigation.css             # Navigation elements
├── modal.css                  # Modal dialogs
├── loading.css                # Loading indicators
├── notifications.css          # Notification styles
├── cards.css                  # Card components
├── tables.css                 # Table styles
├── charts.css                 # Chart styles
├── progress.css               # Progress indicators
├── badges.css                 # Badge components
├── avatars.css                # Avatar components
├── tooltips.css               # Tooltip styles
├── accordions.css             # Accordion components
├── breadcrumbs.css            # Breadcrumb navigation
├── pagination.css             # Pagination controls
├── tabs.css                   # Tab components
├── sliders.css                # Slider components
├── switches.css               # Switch components
├── ratings.css                # Rating components
└── preferences.css            # Preferences modal styles
```

## Scripts Directory

```
scripts/
├── main.js                    # Frontend application logic
├── build.js                   # Build process automation
├── deploy.js                  # Deployment automation
├── optimize.js                # Performance optimization
├── fallback-db.js             # Static fallback data
└── validate-structure.js      # Project structure validation
```

## Documentation Directory

```
docs/
├── ai-ml-pipeline-specification.md     # AI/ML pipeline details
├── complete-integration-summary.md     # Integration summary
├── deployment-guide.md                 # Deployment instructions
├── enhanced-features-summary.md        # Feature enhancements
├── enhancement-summary.md              # Enhancement summary
├── firebase-integration-summary.md     # Firebase integration
├── firebase-security-rules.md          # Firestore security rules
├── firestore-integration.md            # Firestore integration
├── fullstack-guide.md                  # Fullstack development guide
├── hugging-face-integration.md         # Hugging Face integration
├── implementation-summary.md           # Implementation summary
├── next-steps-for-contextual-ai.md     # AI enhancement roadmap
├── project-structure.md                # This file
├── project-completion-summary.md       # Project completion summary
├── real-time-updates.md                # Real-time updates implementation
├── test-product-label.txt              # Test data
├── user-preferences-feature.md         # User preferences feature
├── final-enhancement-summary.md        # Final enhancement summary
└── pre-deployment-checklist.md         # Deployment checklist
```

## Tests Directory

```
tests/
└── app.test.js                # Jest test suite
```

## Key Files and Their Purposes

| File | Purpose |
|------|---------|
| `index.html` | Main entry point with dual-page structure |
| `server.js` | Backend Express server with all API endpoints |
| `scripts/main.js` | Frontend logic for UI interactions |
| `styles/main.css` | Central stylesheet importing all modular components |
| `firebase-config.js` | Firebase Admin SDK initialization |
| `scripts/fallback-db.js` | Static fallback data for object classification |
| `sw.js` | Service worker for offline support and caching |
| `manifest.json` | PWA configuration for installable app |
| `tests/app.test.js` | Comprehensive test suite |

## Module Architecture

The SIKI application follows a modular architecture:

1. **Frontend**: Single HTML file with show/hide navigation between Home and Result screens
2. **Backend**: Express.js server with modular API endpoints
3. **Database**: Firebase Firestore with real-time capabilities
4. **AI/ML**: Tesseract.js for OCR, TensorFlow.js with MobileNet for computer vision, Hugging Face for chat
5. **Styling**: Modular CSS with main.css importing all component styles
6. **Build**: Automated build process with optimization

## Deployment Structure

For deployment, the application uses a build process that creates a `dist/` directory containing all necessary files:

```
dist/
├── index.html                 # Built HTML file
├── manifest.json              # PWA manifest
├── sw.js                      # Service worker
├── styles/                    # Optimized CSS files
├── scripts/                   # Built JavaScript files
├── icons/                     # App icons
└── docs/                      # Documentation
```

This structure supports deployment to various platforms including GitHub Pages, Firebase Hosting, Vercel, and Netlify.