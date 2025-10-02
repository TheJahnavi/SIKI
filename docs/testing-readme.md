# SIKI Application Testing Documentation

This directory contains all testing-related documentation and resources for the SIKI application.

## Contents

1. [Testing and Enhancement Guide](testing-and-enhancement-guide.md) - Comprehensive testing checklist and enhancement recommendations
2. [Bug Report Template](bug-report-template.md) - Template for reporting bugs and feature requests
3. [E2E Tests](../tests/e2e/app.test.js) - Cypress end-to-end tests
4. [Cypress Flow Tests](cypress-flow-tests.md) - Detailed flow tests for key user journeys

## Running Tests

### Unit Tests
```bash
npm test
```

### End-to-End Tests
```bash
# Run tests in headless mode
npm run test:e2e

# Open Cypress test runner
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

# Run only basic functionality tests
npx cypress run --spec "tests/e2e/flows/basic-test.test.js"
```

## Testing Checklist

Refer to the [Testing and Enhancement Guide](testing-and-enhancement-guide.md) for a comprehensive testing checklist covering all aspects of the application.

## Reporting Issues

Use the [Bug Report Template](bug-report-template.md) when reporting issues or requesting features.

## Continuous Integration

The testing suite is designed to be integrated with CI/CD pipelines to ensure code quality and application stability. The Cypress flow tests automatically run on every push to verify key user journeys.

## Cypress Flow Tests

The project includes comprehensive Cypress flow tests that cover the key user journeys:

1. **Scan Flow Tests** - Tests the complete product scanning workflow
2. **Fallback Flow Tests** - Tests fallback mechanisms when primary analysis fails
3. **Chat Response Tests** - Tests the AI chat functionality
4. **Offline Mode Tests** - Tests offline capabilities and PWA features

For detailed information about each test suite, see the [Cypress Flow Tests Documentation](cypress-flow-tests.md).