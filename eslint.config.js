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
