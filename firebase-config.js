// Firebase Configuration for SIKI App
// This file initializes Firebase Admin SDK for server-side operations

const admin = require('firebase-admin');
const path = require('path');

try {
  // Resolve the path to the service account file
  const serviceAccountPath = path.resolve(__dirname, 'config', 'firebase-service-account.json');
  const serviceAccount = require(serviceAccountPath);

  // Initialize Firebase Admin SDK
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
  });

  // Initialize Firestore
  const db = admin.firestore();
  
  console.log('Firebase Admin SDK initialized successfully');
  console.log(`Connected to Firestore project: ${serviceAccount.project_id}`);

  // Export the database instance
  module.exports = db;
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error.message);
  console.warn('Continuing without Firebase integration');
  
  // Export a mock database object to prevent crashes
  module.exports = {
    collection: () => ({
      add: () => Promise.resolve({ id: 'mock-id' }),
      doc: () => ({
        get: () => Promise.resolve({ exists: false }),
        set: () => Promise.resolve(),
        update: () => Promise.resolve()
      }),
      get: () => Promise.resolve({ docs: [] }),
      orderBy: () => ({
        limit: () => ({
          get: () => Promise.resolve({ docs: [] })
        })
      }),
      where: () => ({
        orderBy: () => ({
          get: () => Promise.resolve({ docs: [] })
        })
      })
    })
  };
}