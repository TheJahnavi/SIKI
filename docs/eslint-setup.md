# ESLint Setup

This document explains the ESLint configuration for the SIKI application.

## Files Created

### 1. ESLint Configuration (eslint.config.js)

Location: `eslint.config.js`

This file contains the ESLint configuration for the project:

```javascript
// ESLint configuration for SIKI App

export default [
  {
    files: ["**/*.js"],
    ignores: [
      "node_modules/",
      "dist/",
      "coverage/",
      "uploads/",
      "*.min.js",
      "jest.config.cjs"
    ],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        console: "readonly",
        navigator: "readonly",
        fetch: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
        
        // Node.js globals
        process: "readonly",
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly"
      }
    },
    rules: {
      // Basic rules
      "no-console": "off",
      "no-unused-vars": "warn"
    }
  }
];
```

### 2. Updated package.json

Location: `package.json`

Updated to use ESLint instead of the placeholder lint script:

```json
{
  "scripts": {
    "lint": "eslint ."
  },
  "devDependencies": {
    "eslint": "^8.0.0"
  }
}
```

## How It Works

### ESLint Configuration
The configuration uses the new flat config format introduced in ESLint v9:
- Targets all JavaScript files in the project
- Ignores common directories that don't need linting
- Defines globals for both browser and Node.js environments
- Uses minimal rules to avoid being overly restrictive

### Rules Applied
1. `no-console`: Turned off to allow console logging
2. `no-unused-vars`: Set to warn level to identify unused variables without breaking the build

## Running ESLint

### Manual Execution
```bash
npm run lint
```

### In CI/CD
The lint script is automatically run as part of the CI/CD pipeline in `.github/workflows/ci.yml`:

```yaml
- run: npm run lint
```

## Fixing Issues

### Automatic Fixing
Many ESLint issues can be automatically fixed:

```bash
npx eslint . --fix
```

### Manual Fixes
For issues that can't be automatically fixed:
1. Review the ESLint output
2. Make the necessary code changes
3. Run `npm run lint` to verify the fixes

## Customizing the Configuration

### Adding Rules
To add more rules, modify the `rules` section in `eslint.config.js`:

```javascript
rules: {
  "no-console": "off",
  "no-unused-vars": "warn",
  "semi": ["error", "always"],  // Example: require semicolons
  "quotes": ["error", "single"] // Example: require single quotes
}
```

### Ignoring Files
To ignore additional files or directories, add them to the `ignores` array:

```javascript
ignores: [
  "node_modules/",
  "dist/",
  "coverage/",
  "uploads/",
  "*.min.js",
  "jest.config.cjs",
  "docs/" // Example: ignore docs directory
]
```

## Benefits

✅ **Modern**: Uses the latest ESLint configuration format
✅ **Minimal**: Only applies essential rules to avoid noise
✅ **Flexible**: Easy to customize for project-specific needs
✅ **Integrated**: Works seamlessly with the existing CI/CD pipeline
✅ **Free**: No additional costs for linting

## Troubleshooting

### If ESLint Fails to Run
1. Ensure ESLint is installed: `npm install eslint --save-dev`
2. Check that `eslint.config.js` exists in the project root
3. Verify the package.json script is correctly configured

### If Too Many Warnings Appear
1. Review the warnings to see if they indicate real issues
2. Adjust the rule severity levels (error, warn, off)
3. Add specific files to the ignores list if needed

### If Performance is Slow
1. Add more specific ignore patterns for large directories
2. Consider using more targeted file patterns in the `files` array
3. Run ESLint on specific directories rather than the entire project