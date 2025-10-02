# SIKI Application Testing Documentation

This directory contains all testing-related documentation and resources for the SIKI application.

## Contents

1. [Testing and Enhancement Guide](testing-and-enhancement-guide.md) - Comprehensive testing checklist and enhancement recommendations
2. [Bug Report Template](bug-report-template.md) - Template for reporting bugs and feature requests
3. [E2E Tests](../tests/e2e/app.test.js) - Cypress end-to-end tests

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

## Testing Checklist

Refer to the [Testing and Enhancement Guide](testing-and-enhancement-guide.md) for a comprehensive testing checklist covering all aspects of the application.

## Reporting Issues

Use the [Bug Report Template](bug-report-template.md) when reporting issues or requesting features.

## Continuous Integration

The testing suite is designed to be integrated with CI/CD pipelines to ensure code quality and application stability.