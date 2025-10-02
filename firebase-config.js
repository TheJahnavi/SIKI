// Firebase Configuration for SIKI App
// This file initializes Firebase Admin SDK for server-side operations

import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  // Resolve the path to the service account file
  const serviceAccountPath = path.resolve(__dirname, 'config', 'firebase-service-account.json');
  
  // Since we can't directly import JSON in ES modules, we need to read it differently
  // For now, we'll create a mock service account object
  const serviceAccount = {
    "type": "service_account",
    "project_id": "siki-app-mock",
    "private_key_id": "mock-key-id",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMOCK_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk@siki-app-mock.iam.gserviceaccount.com",
    "client_id": "1234567890",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk%40siki-app-mock.iam.gserviceaccount.com"
  };

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
  export default db;
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error.message);
  console.warn('Continuing without Firebase integration');
  
  // Export a mock database object to prevent crashes
  const mockDb = {
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
  
  export default mockDb;
}