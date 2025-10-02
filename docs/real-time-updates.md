# Real-Time Updates in SIKI Application

This document explains how real-time updates are implemented in the SIKI application using Firebase Firestore.

## Current Implementation Status

The SIKI application has the backend infrastructure for real-time updates through Firebase Firestore, but the frontend implementation is currently simulated with periodic polling. This document outlines how to enhance the implementation to use actual real-time listeners.

## Backend Support

The server.js file already includes Firebase Admin SDK integration which provides real-time capabilities. The following collections support real-time updates:

1. **productAnalysis** - For recent scans
2. **chatHistory** - For chat messages
3. **missingProducts** - For missing product notifications

## Frontend Implementation Plan

To implement real-time updates in the frontend, we need to:

1. Add Firebase client SDK to the frontend
2. Initialize Firebase in the browser
3. Replace polling with real-time listeners
4. Update UI components when data changes

## Implementation Steps

### 1. Add Firebase Client SDK

Add the following scripts to index.html:

```html
<!-- Firebase App (the core Firebase SDK) is always required and must be listed first -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>

<!-- Add Firebase products that you want to use -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
```

### 2. Initialize Firebase

Add Firebase initialization to main.js:

```javascript
// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
```

### 3. Implement Real-Time Listeners

Replace the simulated real-time listeners with actual Firestore listeners:

```javascript
// Set up real-time listener for recent scans
function setupRecentScansListener() {
  if (db) {
    unsubscribeHistory = db.collection('productAnalysis')
      .orderBy('analyzedAt', 'desc')
      .limit(10)
      .onSnapshot((snapshot) => {
        const history = [];
        snapshot.forEach((doc) => {
          history.push({ id: doc.id, ...doc.data() });
        });
        updateRecentScansUI(history);
      }, (error) => {
        console.error('Error listening to recent scans:', error);
      });
  }
}

// Set up real-time listener for chat messages
function setupChatListener(productId) {
  if (db && productId) {
    unsubscribeChat = db.collection('chatHistory')
      .where('productId', '==', productId)
      .orderBy('timestamp')
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const chatData = change.doc.data();
            addChatMessageToUI(chatData);
          }
        });
      }, (error) => {
        console.error('Error listening to chat messages:', error);
      });
  }
}
```

### 4. Update UI Functions

Create UI update functions to handle real-time data:

```javascript
// Update recent scans UI with real-time data
function updateRecentScansUI(history) {
  // Update the recent scans section in the UI
  console.log('Updating recent scans UI with:', history);
  // Implementation would depend on where recent scans are displayed
}

// Add chat message to UI in real-time
function addChatMessageToUI(chatData) {
  // Add new chat message to the chat interface
  console.log('Adding chat message to UI:', chatData);
  // Implementation would add the message to the chat bubble container
}
```

## Performance Optimization

To optimize real-time updates:

1. **Limit Data**
   - Use `.limit()` to restrict the number of documents
   - Only listen to relevant data for the current user

2. **Efficient Queries**
   - Use indexes for frequently queried fields
   - Avoid complex queries that slow down updates

3. **Unsubscribe Properly**
   - Always unsubscribe when components are destroyed
   - Prevent memory leaks and unnecessary data usage

## Error Handling

Implement proper error handling for real-time listeners:

```javascript
// Handle real-time listener errors
function handleListenerError(error) {
  console.error('Real-time listener error:', error);
  // Show user-friendly error message
  // Possibly fall back to polling
}
```

## Testing Real-Time Updates

To test real-time updates:

1. Open the app in multiple browser windows
2. Perform actions in one window
3. Observe updates in the other window
4. Check for proper error handling
5. Verify unsubscribe functionality

## Future Enhancements

1. **Presence Indicators**
   - Show when other users are viewing the same product
   - Implement typing indicators for chat

2. **Offline Support**
   - Cache data locally for offline access
   - Sync