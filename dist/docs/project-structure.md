# SIKI Project Structure

## Overview

This document describes the file structure and organization of the SIKI mobile-first web application.

## Directory Structure

```
SIKI/
├── index.html              # Main HTML file
├── manifest.json           # PWA manifest file
├── sw.js                   # Service worker for offline functionality
├── package.json            # Project metadata and dependencies
├── README.md               # Project documentation
├── docs/                   # Documentation files
│   ├── docs.css            # Documentation styles
│   └── project-structure.md # This file
├── icons/                  # App icons for PWA
│   ├── icon-192x192.png    # 192x192 icon
│   └── icon-512x512.png    # 512x512 icon
├── scripts/                # JavaScript files
│   └── main.js             # Main application logic
├── styles/                 # CSS files
│   └── main.css            # Main stylesheet
└── tests/                  # Test files
    └── app.test.js         # Application tests
```

## File Descriptions

### Root Files

- **index.html**: The main entry point of the application containing all HTML structure
- **manifest.json**: PWA manifest file defining app metadata for installation
- **sw.js**: Service worker for caching and offline functionality
- **package.json**: NPM package file with project metadata and scripts
- **README.md**: Main project documentation

### Directories

#### docs/
Contains documentation files for the project.

#### icons/
Contains app icons in multiple sizes for PWA installation:
- icon-192x192.png: Standard PWA icon size
- icon-512x512.png: High-resolution icon for larger displays

#### scripts/
Contains all JavaScript files:
- main.js: Main application logic including:
  - Theme management
  - Camera/gallery functionality
  - Image handling
  - Navigation between pages
  - Expansion panel controls
  - Service worker registration

#### styles/
Contains all CSS files:
- main.css: Complete styling for the application including:
  - Material Design 3 implementation
  - Light/dark theme variables
  - Responsive layout
  - Component styling
  - Animations and transitions

#### tests/
Contains test files:
- app.test.js: Unit tests for application functionality

## Component Architecture

### Page 1: Home Screen
- Header overlay with logo and controls
- Camera viewport with scanning line
- Image preview bar
- Action buttons (gallery, camera, analyze)

### Page 2: Product Result Screen
- Top app bar with back navigation
- Score visualization with semantic coloring
- Alternatives call-to-action
- Expandable detail sections:
  - Ingredients & Risk Analysis
  - Nutritional Breakdown
  - Reddit Reviews
  - Q&A with AI

## Theme System

The application implements a comprehensive theme system using CSS variables:
- Light theme with teal primary color (#00BCD4)
- Dark theme with teal primary color (#4DD0E1)
- Semantic colors for health assessments (success, caution, warning)
- Automatic theme detection based on system preference

## Responsive Design

The application is built with a mobile-first approach:
- Base design for screens <600px wide
- Flexible layouts using CSS Flexbox
- rem units for scalable typography
- Media queries for larger screens
- Touch-friendly interface with 48×48px minimum touch targets

## PWA Features

The application implements Progressive Web App features:
- Manifest file for installation
- Service worker for offline functionality
- Responsive design for all devices
- App-like experience with standalone display mode