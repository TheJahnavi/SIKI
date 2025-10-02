// Test script to verify Firestore integration

require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testFirestore() {
  try {
    console.log('Testing Firestore integration...');
    
    // Add a test document
    const docRef = await db.collection('test').add({
      message: 'Hello from SIKI app!',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Document written with ID: ', docRef.id);
    
    // Read the document back
    const doc = await db.collection('test').doc(docRef.id).get();
    if (doc.exists) {
      console.log('Document data:', doc.data());
    } else {
      console.log('No such document!');
    }
    
    // Clean up - delete the test document
    await db.collection('test').doc(docRef.id).delete();
    console.log('Test document cleaned up successfully');
    
  } catch (error) {
    console.error('Error testing Firestore:', error.message);
  }
}

// Run the test
testFirestore();