# Fallback Modal Implementation

This document explains the implementation of the fallback message modal in the SIKI application, which provides a better user experience when product analysis fails.

## Overview

The fallback modal is displayed when the product analysis process encounters an error. It provides users with a clear error message and options to retry the analysis or close the modal.

## Implementation Details

### HTML Structure

The fallback modal is defined in `index.html` with the following structure:

```html
<div id="fallbackModal" class="modal hidden">
    <div class="modal-content">
        <h2>Oops! Something went wrong</h2>
        <p>We couldn't analyze this item. Try scanning a clearer image or select a product manually.</p>
        <div class="modal-actions">
            <button id="retryButton" class="modal-button primary">Retry</button>
            <button id="closeFallbackModal" class="modal-button secondary">OK</button>
        </div>
    </div>
</div>
```

### CSS Styling

The modal styling is defined in `styles/modal.css` with the following key classes:

- `#fallbackModal` - The main modal container
- `.modal-content` - The content area of the modal
- `.modal-actions` - Container for the action buttons
- `.modal-button` - Base styling for modal buttons
- `.modal-button.primary` - Primary action button (Retry)
- `.modal-button.secondary` - Secondary action button (OK)

### JavaScript Functionality

The modal functionality is implemented in `scripts/main.js` with the following functions:

#### showFallbackModal(message)
Displays the fallback modal with an optional custom message.

#### hideFallbackModal()
Hides the fallback modal.

#### retryAnalysis()
Hides the modal and retries the last analysis attempt.

## Error Handling Improvements

The server-side error handling in `server.js` has been enhanced with detailed logging:

1. **Enhanced Error Logging Middleware**: Catches and logs all unhandled errors with timestamps and stack traces.

2. **Detailed API Route Logging**: Each API route now logs entry, exit, and any errors that occur during processing.

3. **OCR Analysis Logging**: Detailed logging of the OCR process including progress updates and text extraction.

4. **Computer Vision Logging**: Comprehensive logging of the computer vision classification process.

5. **Fallback Mechanism Logging**: Clear logging when fallback mechanisms are triggered.

## Usage Examples

### Frontend Usage

```javascript
// Show the fallback modal with a custom message
showFallbackModal("Network error occurred. Please check your connection.");

// Hide the fallback modal
hideFallbackModal();

// Retry the last analysis
retryAnalysis();
```

### Backend Usage

```javascript
// Server-side error logging
console.error(`[ERROR] ${new Date().toISOString()} - ${err.message}`);
console.error(err.stack);

// API route logging
console.log(`[ANALYZE-PRODUCT] Starting product analysis`);
console.warn(`[ANALYZE-PRODUCT] No image file uploaded`);
```

## Testing

A test script `scripts/test-fallback.js` is provided to verify the modal functionality:

- `testFallbackModal()` - Tests showing the modal
- `testHideFallbackModal()` - Tests hiding the modal
- `testRetryAnalysis()` - Tests the retry functionality

Run the tests with:
```bash
node scripts/test-fallback.js
```

## Customization

To customize the fallback modal:

1. **Modify the message**: Update the default message in `showFallbackModal()`
2. **Change styling**: Update the CSS classes in `styles/modal.css`
3. **Add more actions**: Add additional buttons in the HTML and corresponding event listeners in JavaScript
4. **Modify retry behavior**: Update the `retryAnalysis()` function to change how retries are handled

## Accessibility

The modal implementation follows accessibility best practices:

- Proper semantic HTML structure
- Keyboard navigation support
- Focus management
- Sufficient color contrast
- Clear error messages

## Mobile Responsiveness

The modal is designed to be responsive on mobile devices:

- Flexible width that adapts to screen size
- Stacked buttons on small screens
- Appropriate padding and spacing
- Touch-friendly button sizes