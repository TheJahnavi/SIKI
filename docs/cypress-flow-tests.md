# Cypress Flow Tests Documentation

This document describes the Cypress end-to-end tests implemented for the SIKI application, covering the key user flows identified for comprehensive testing.

## Test Structure

The Cypress tests are organized in the following structure:
```
tests/
└── e2e/
    ├── app.test.js          # Main E2E tests
    └── flows/               # Specific flow tests
        ├── scan-flow.test.js       # Product scanning flow
        ├── fallback-flow.test.js   # Fallback mechanisms
        ├── chat-response.test.js   # AI chat functionality
        └── offline-mode.test.js    # Offline capabilities
```

## Scan Flow Tests

Located in [tests/e2e/flows/scan-flow.test.js](../tests/e2e/flows/scan-flow.test.js)

### Test Cases:
1. **Successfully scans a product and displays results**
   - Verifies the home page loads correctly
   - Tests image upload functionality
   - Mocks API response for successful analysis
   - Validates redirection to results page
   - Confirms product data display

2. **Handles scan failure gracefully**
   - Mocks API failure response
   - Verifies error message display
   - Ensures user is informed of failure

### Key Features Tested:
- Home page functionality
- Image upload and analysis
- API integration
- Error handling
- UI navigation

## Fallback Flow Tests

Located in [tests/e2e/flows/fallback-flow.test.js](../tests/e2e/flows/fallback-flow.test.js)

### Test Cases:
1. **Shows fallback message when OCR fails**
   - Simulates OCR API failure
   - Verifies fallback message display
   - Tests user guidance for manual input

2. **Shows fallback when AI analysis fails but OCR succeeds**
   - Mocks successful OCR with failed AI analysis
   - Validates appropriate fallback messaging
   - Ensures partial functionality

3. **Allows manual input when automatic analysis fails**
   - Tests manual input form
   - Validates form submission
   - Confirms results page with manual data

### Key Features Tested:
- OCR failure handling
- AI analysis fallback
- Manual input functionality
- User experience in error scenarios

## Chat Response Flow Tests

Located in [tests/e2e/flows/chat-response.test.js](../tests/e2e/flows/chat-response.test.js)

### Test Cases:
1. **Successfully sends a message and receives a response**
   - Tests chat input functionality
   - Mocks AI response
   - Validates response display

2. **Handles chat API failure gracefully**
   - Simulates chat API failure
   - Verifies error message display
   - Ensures continued usability

3. **Maintains chat history across sessions**
   - Tests message persistence
   - Validates history after page refresh
   - Confirms data retention

### Key Features Tested:
- Chat UI functionality
- AI integration
- Error handling
- Data persistence
- User experience

## Offline Mode Tests

Located in [tests/e2e/flows/offline-mode.test.js](../tests/e2e/flows/offline-mode.test.js)

### Test Cases:
1. **Shows offline notification when network is unavailable**
   - Simulates offline event
   - Verifies notification display
   - Tests user awareness

2. **Allows scanning in offline mode using cached data**
   - Tests cached data usage
   - Validates offline scanning
   - Confirms appropriate messaging

3. **Queues actions for sync when back online**
   - Tests action queuing
   - Simulates reconnection
   - Validates synchronization

4. **Works with PWA features in offline mode**
   - Tests PWA functionality
   - Validates install prompt
   - Confirms basic features work offline

### Key Features Tested:
- Network state detection
- Offline notifications
- Cached data usage
- Action queuing
- PWA functionality
- User experience

## Running the Tests

### Prerequisites
Ensure you have all dependencies installed:
```bash
npm install
```

### Running All E2E Tests
```bash
npm run test:e2e
```

### Running Tests in Interactive Mode
```bash
npm run test:e2e:open
```

### Running Specific Flow Tests
```bash
# Run only scan flow tests
npx cypress run --spec "tests/e2e/flows/scan-flow.test.js"

# Run only fallback flow tests
npx cypress run --spec "tests/e2e/flows/fallback-flow.test.js"

# Run only chat response tests
npx cypress run --spec "tests/e2e/flows/chat-response.test.js"

# Run only offline mode tests
npx cypress run --spec "tests/e2e/flows/offline-mode.test.js"
```

## Test Configuration

The Cypress configuration is defined in [cypress.config.js](../cypress.config.js):

```javascript
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'tests/e2e/**/*.test.js',
    supportFile: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
})
```

## Continuous Integration

These tests are integrated into the CI/CD pipeline and will run automatically on every push to the repository. The tests help ensure that:

1. All key user flows continue to work as expected
2. Error handling is properly implemented
3. Fallback mechanisms function correctly
4. Offline capabilities are maintained
5. New changes don't break existing functionality

## Best Practices

1. **Mock External APIs**: All tests use mocked API responses to ensure consistency and speed
2. **Test Both Success and Failure Cases**: Each flow tests both successful operations and error conditions
3. **Validate User Experience**: Tests verify not just functionality but also proper user feedback
4. **Maintain Test Data Isolation**: Each test runs independently with its own mock data
5. **Use Descriptive Test Names**: Test cases clearly describe what is being tested
6. **Validate UI State Changes**: Tests confirm that UI updates correctly in response to user actions and API responses

## Future Enhancements

Planned improvements for the Cypress test suite:
1. Add more comprehensive error scenario testing
2. Implement visual regression testing
3. Add accessibility testing
4. Expand test coverage for edge cases
5. Integrate with CI/CD for automated reporting