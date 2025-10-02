# User Preferences Feature

This document explains the implementation of the user preferences feature in the SIKI application, which allows users to personalize their AI responses based on dietary restrictions, allergies, and health goals.

## Feature Overview

The user preferences feature enables users to:
- Set dietary restrictions (vegan, vegetarian, gluten-free, etc.)
- Specify allergies (nuts, dairy, eggs, etc.)
- Define health goals (low sugar, high protein, etc.)
- Receive personalized AI responses based on their preferences

## Implementation Details

### Frontend Implementation

#### UI Components
1. **Preferences Modal** - Accessible from the home screen via the settings icon
2. **Preference Chips** - Interactive chips for selecting preferences
3. **Save/Cancel Buttons** - To confirm or discard changes

#### JavaScript Functionality
1. **Preference Selection** - Toggle chips to select/deselect preferences
2. **Save Preferences** - Send selected preferences to the backend
3. **Load Preferences** - Retrieve saved preferences on app load
4. **UI Updates** - Reflect saved preferences in the UI

### Backend Implementation

#### API Endpoints
1. **POST /api/user-preferences** - Save user preferences
2. **GET /api/user-preferences/:userId** - Retrieve user preferences

#### Data Structure
```javascript
{
  dietaryRestrictions: ['vegan', 'gluten-free'],
  allergies: ['nuts', 'dairy'],
  healthGoals: ['low-sugar', 'heart-healthy']
}
```

#### Integration with AI Chat
User preferences are sent to the AI chat endpoint and included in the prompt to provide personalized responses.

### Database Integration

#### Firestore Collections
1. **userPreferences** - Stores user preferences with userId as document ID
2. **Automatic Updates** - Preferences are updated when users save changes

## Usage Instructions

### Setting Preferences
1. Open the SIKI application
2. Click the settings icon in the top right corner of the home screen
3. Select desired preferences from the dietary restrictions, allergies, and health goals sections
4. Click "Save Preferences" to confirm changes

### Viewing Saved Preferences
Preferences are automatically loaded when the application starts and are reflected in the preferences modal.

### Personalized AI Responses
When asking questions in the AI chat, the system will consider your preferences to provide personalized responses.

## Technical Implementation

### Frontend Files
- `index.html` - Added preferences modal HTML structure
- `styles/preferences.css` - Styling for the preferences modal
- `scripts/main.js` - JavaScript functionality for preferences

### Backend Files
- `server.js` - API endpoints for user preferences

### Data Flow
1. User selects preferences in the UI
2. Preferences are sent to the backend via POST request
3. Backend saves preferences to Firestore
4. When user asks AI questions, preferences are retrieved and included in the prompt
5. AI generates personalized responses based on product data and user preferences

## Security Considerations

- User preferences are stored with userId association
- No sensitive personal information is stored
- Preferences are only used to enhance AI responses
- Data is stored securely in Firestore

## Future Enhancements

1. **User Authentication** - Integrate with authentication system for secure user preference storage
2. **Preference Categories** - Add more detailed preference categories
3. **Smart Recommendations** - Use preferences to suggest products
4. **Preference Sharing** - Allow users to share preferences with family members
5. **Analytics** - Track preference trends to improve product recommendations

## API Documentation

### POST /api/user-preferences
Save user preferences to the database.

**Request:**
```json
POST /api/user-preferences
Content-Type: application/json

{
  "userId": "user-1234567890",
  "preferences": {
    "dietaryRestrictions": ["vegan", "gluten-free"],
    "allergies": ["nuts"],
    "healthGoals": ["low-sugar"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Preferences saved successfully"
}
```

### GET /api/user-preferences/:userId
Retrieve user preferences from the database.

**Request:**
```json
GET /api/user-preferences/user-1234567890
```

**Response:**
```json
{
  "success": true,
  "preferences": {
    "dietaryRestrictions": ["vegan", "gluten-free"],
    "allergies": ["nuts"],
    "healthGoals": ["low-sugar"]
  }
}
```

## Testing

### Manual Testing
1. Open the preferences modal
2. Select various preferences
3. Save preferences
4. Reload the page
5. Verify preferences are loaded correctly
6. Ask AI questions and verify personalized responses

### Automated Testing
- Test API endpoints with Jest
- Verify data is correctly stored and retrieved from Firestore
- Ensure UI updates properly when preferences change

## Troubleshooting

### Common Issues
1. **Preferences not saving** - Check network connection and Firestore configuration
2. **Preferences not loading** - Verify userId is correct and Firestore rules allow read access
3. **AI not using preferences** - Ensure preferences are being sent to the chat endpoint

### Debugging Tips
- Check browser console for JavaScript errors
- Verify API responses in network tab
- Check Firestore data in Firebase Console