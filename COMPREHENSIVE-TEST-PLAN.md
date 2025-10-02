# 🧪 SIKI Application Comprehensive Test Plan

This document outlines a detailed test plan for the SIKI application to identify and resolve issues preventing proper functionality.

## Current Status

✅ Server is running on http://localhost:3000
✅ Backend API endpoints are accessible
⚠️ TensorFlow.js module not available (using simulation)
⚠️ Firebase integration failed (continuing without)

## Test Environment

- **URL**: http://localhost:3000
- **Browser**: Latest Chrome/Firefox/Safari
- **Device**: Desktop and mobile simulation
- **Network**: Local development environment

## 🧪 Section 1: Image Upload & Product Analysis

### TC-001: User uploads image of a labeled product
| Field | Details |
|-------|---------|
| **Test Case ID** | TC-001 |
| **Scenario** | User uploads image of a labeled product |
| **Test Steps** | 1. Open app<br>2. Tap "Scan Now"<br>3. Upload image of cereal box |
| **Input** | Image of cereal box with barcode and ingredients |
| **Expected Output** | OCR detects label<br>Product name, score, ingredients shown |
| **Pass Criteria** | Product analysis page loads with correct data |

### TC-002: User scans product with no label (e.g., apple)
| Field | Details |
|-------|---------|
| **Test Case ID** | TC-002 |
| **Scenario** | User scans product with no label (e.g., apple) |
| **Test Steps** | 1. Tap "Scan Now"<br>2. Upload image of apple |
| **Input** | Image of red apple |
| **Expected Output** | CV identifies object<br>Fallback logic triggers<br>Score: 95<br>Nutrition facts shown |
| **Pass Criteria** | Fallback result page loads with apple info |

### TC-003: User scans non-food item (e.g., pencil)
| Field | Details |
|-------|---------|
| **Test Case ID** | TC-003 |
| **Scenario** | User scans non-food item (e.g., pencil) |
| **Test Steps** | 1. Tap "Scan Now"<br>2. Upload image of pencil |
| **Input** | Image of wooden pencil |
| **Expected Output** | CV identifies object<br>Score: N/A<br>Safety message shown |
| **Pass Criteria** | Fallback result page loads with pencil info |

### TC-004: User scans a restaurant menu
| Field | Details |
|-------|---------|
| **Test Case ID** | TC-004 |
| **Scenario** | User scans a restaurant menu |
| **Test Steps** | 1. Tap "Scan Now"<br>2. Upload image of menu |
| **Input** | Image of printed menu |
| **Expected Output** | OCR extracts text<br>NLP identifies dishes<br>Risky ingredients flagged |
| **Pass Criteria** | Menu analysis page loads with flagged items |

## 🧪 Section 2: AI Chat Functionality

### TC-005: User asks "Is this keto-friendly?"
| Field | Details |
|-------|---------|
| **Test Case ID** | TC-005 |
| **Scenario** | User asks "Is this keto-friendly?" |
| **Test Steps** | 1. View product<br>2. Open AI Chat tab<br>3. Type question |
| **Input** | Product: Almond Butter<br>Query: "Is this keto-friendly?" |
| **Expected Output** | AI responds: "Yes, this product is low in carbs and suitable for keto." |
| **Pass Criteria** | Response is relevant and accurate |

### TC-006: User asks about allergens
| Field | Details |
|-------|---------|
| **Test Case ID** | TC-006 |
| **Scenario** | User asks about allergens |
| **Test Steps** | 1. View product<br>2. Open AI Chat tab<br>3. Type question |
| **Input** | Product: Peanut Butter<br>Query: "Does this contain allergens?" |
| **Expected Output** | AI responds: "Yes, contains peanuts. Avoid if allergic." |
| **Pass Criteria** | Response includes allergen warning |

### TC-007: User asks question with no product context
| Field | Details |
|-------|---------|
| **Test Case ID** | TC-007 |
| **Scenario** | User asks question with no product context |
| **Test Steps** | 1. Open AI Chat tab<br>2. Type question |
| **Input** | Query: "Is sugar bad for health?" |
| **Expected Output** | AI responds with general info: "Excess sugar can increase risk of diabetes." |
| **Pass Criteria** | Response is informative and not product-specific |

## 🧪 Section 3: Firebase Integration

### TC-008: Store product analysis in Firestore
| Field | Details |
|-------|---------|
| **Test Case ID** | TC-008 |
| **Scenario** | Store product analysis in Firestore |
| **Test Steps** | 1. Scan product<br>2. View result<br>3. Check Firestore |
| **Input** | Product: Granola Bar |
| **Expected Output** | Firestore entry created in `productAnalysis` |
| **Pass Criteria** | Document exists with correct fields |

### TC-009: Retrieve recent scans
| Field | Details |
|-------|---------|
| **Test Case ID** | TC-009 |
| **Scenario** | Retrieve recent scans |
| **Test Steps** | 1. Open Home Page<br>2. View recent scans section |
| **Input** | User history |
| **Expected Output** | List of last 5 scanned products |
| **Pass Criteria** | Cards display correct product names |

### TC-010: Store chat log
| Field | Details |
|-------|---------|
| **Test Case ID** | TC-010 |
| **Scenario** | Store chat log |
| **Test Steps** | 1. Ask AI question<br>2. View response<br>3. Check Firestore |
| **Input** | Query: "Is this vegan?" |
| **Expected Output** | Firestore entry created in `chatHistory` |
| **Pass Criteria** | Document includes query and response |

## 🧪 Section 4: Error Handling & Edge Cases

### TC-011: Upload corrupted image
| Field | Details |
|-------|---------|
| **Test Case ID** | TC-011 |
| **Scenario** | Upload corrupted image |
| **Test Steps** | 1. Tap "Scan Now"<br>2. Upload broken image file |
| **Input** | Invalid image |
| **Expected Output** | Error message: "Unable to process image." |
| **Pass Criteria** | App does not crash; error is shown |

### TC-012: No product found
| Field | Details |
|-------|---------|
| **Test Case ID** | TC-012 |
| **Scenario** | No product found |
| **Test Steps** | 1. Upload obscure product<br>2. Wait for result |
| **Input** | Image of rare item |
| **Expected Output** | Message: "Product not found. Try manual search." |
| **Pass Criteria** | Fallback message and options shown |

### TC-013: Hugging Face API unavailable
| Field | Details |
|-------|---------|
| **Test Case ID** | TC-013 |
| **Scenario** | Hugging Face API unavailable |
| **Test Steps** | 1. Ask AI question<br>2. Simulate API failure |
| **Input** | Query: "Is this healthy?" |
| **Expected Output** | Template-based fallback response |
| **Pass Criteria** | App responds gracefully without crashing |

## 🧪 Section 5: Product Analysis Page Detailed Tests

Using sample product: **"ChocoFit Protein Bar"**

### TC-014: Product Header Loads Correctly
| Field | Expected Value |
|-------|----------------|
| **Test Case ID** | TC-014 |
| **Scenario** | Product Header Loads Correctly |
| **Test Steps** | 1. Scan product<br>2. View result page |
| **Input** | Product: ChocoFit Protein Bar |
| **Expected Output** | Product Image: Displayed from `imageUrl`<br>Product Name: "ChocoFit Protein Bar"<br>Know It Score: Circular badge with score `72` (Yellow)<br>Summary: "Moderate, due to sugar and saturated fat." |
| **Pass Criteria** | All header elements are visible, styled per Material Design, and match expected values |

### TC-015: Ingredients & Risk Tab
| Field | Details |
|-------|---------|
| **Test Case ID** | TC-015 |
| **Scenario** | Ingredients & Risk Tab |
| **Test Steps** | 1. Navigate to Ingredients tab |
| **Input** | Product ingredients list |
| **Expected Output** | Whey Protein Isolate: ✅ Safe ("Good source of protein")<br>Sugar: ⚠️ Moderate ("May contribute to blood sugar spikes")<br>Palm Oil: ⚠️ Moderate ("Linked to cardiovascular risk")<br>Soy Lecithin: ⚠️ Allergen ("Contains soy — common allergen")<br>Artificial Flavor: ⚠️ Caution ("Synthetic additive — limited data") |
| **Pass Criteria** | Ingredients are listed with correct color highlights<br>Tapping an ingredient opens a modal with the correct tooltip<br>Allergens are flagged based on user preferences |

### TC-016: Nutrition Breakdown Tab
| Field | Details |
|-------|---------|
| **Test Case ID** | TC-016 |
| **Scenario** | Nutrition Breakdown Tab |
| **Test Steps** | 1. Navigate to Nutrition tab |
| **Input** | Product nutrition data |
| **Expected Output** | Calories: 210 kcal (Neutral pill)<br>Sugar: 12g (Yellow pill - above recommended)<br>Sodium: 180mg (Yellow pill - borderline)<br>Saturated Fat: 4g (Yellow pill - moderate risk) |
| **Pass Criteria** | Nutrients are displayed in a clean table<br>Visual indicators reflect risk levels<br>Units and values are accurate and readable on mobile |

### TC-017: Reddit Sentiment Tab
| Field | Details |
|-------|---------|
| **Test Case ID** | TC-017 |
| **Scenario** | Reddit Sentiment Tab |
| **Test Steps** | 1. Navigate to Reddit tab |
| **Input** | Product sentiment data |
| **Expected Output** | Vibe Score: 78% (Smiling face icon)<br>Summary Points: "Tastes great but a bit sweet"<br>"Good for post-workout"<br>"Some concern about palm oil" |
| **Pass Criteria** | Vibe score is displayed with correct icon<br>Summary points are concise and match expected sentiment<br>No broken links or missing data |

### TC-018: AI Chatbot Tab
| Field | Details |
|-------|---------|
| **Test Case ID** | TC-018 |
| **Scenario** | AI Chatbot Tab |
| **Test Steps** | 1. Navigate to Chat tab<br>2. Ask questions |
| **Input** | Various queries about the product |
| **Expected Output** | "Is this keto-friendly?": "No, this product contains 12g of sugar and is not suitable for a keto diet."<br>"Is this vegan?": "No, contains whey protein isolate (dairy) and soy lecithin."<br>"Any allergens?": "Yes, contains soy and dairy — avoid if allergic." |
| **Pass Criteria** | Chat interface loads with prompt bubbles<br>Responses are accurate, contextual, and match product data<br>Fallback response is shown if AI API is unavailable |

## 🧪 Section 6: Frontend UI/UX Tests

### TC-019: Responsive Design
| Field | Details |
|-------|---------|
| **Test Case ID** | TC-019 |
| **Scenario** | Responsive Design |
| **Test Steps** | 1. Open app on different screen sizes |
| **Input** | Various viewport sizes |
| **Expected Output** | Layout adapts to mobile, tablet, and desktop |
| **Pass Criteria** | UI elements resize and reposition appropriately |

### TC-020: Theme Switching
| Field | Details |
|-------|---------|
| **Test Case ID** | TC-020 |
| **Scenario** | Theme Switching |
| **Test Steps** | 1. Click theme toggle button |
| **Input** | User action to switch themes |
| **Expected Output** | Theme changes from light to dark and vice versa |
| **Pass Criteria** | All UI elements update to new theme colors |

### TC-021: Camera Functionality
| Field | Details |
|-------|---------|
| **Test Case ID** | TC-021 |
| **Scenario** | Camera Functionality |
| **Test Steps** | 1. Click camera button<br>2. Allow camera access<br>3. Capture image |
| **Input** | Camera access permission |
| **Expected Output** | Camera feed displays<br>Image captured successfully |
| **Pass Criteria** | Camera initializes properly<br>Image capture works<br>Preview shows captured image |

## 🧪 Section 7: Performance Tests

### TC-022: Page Load Time
| Field | Details |
|-------|---------|
| **Test Case ID** | TC-022 |
| **Scenario** | Page Load Time |
| **Test Steps** | 1. Measure time to load main page |
| **Input** | Page navigation |
| **Expected Output** | Page loads within 3 seconds |
| **Pass Criteria** | Load time meets performance requirements |

### TC-023: API Response Time
| Field | Details |
|-------|---------|
| **Test Case ID** | TC-023 |
| **Scenario** | API Response Time |
| **Test Steps** | 1. Measure API response times |
| **Input** | API calls |
| **Expected Output** | API responses within 2 seconds |
| **Pass Criteria** | API performance meets requirements |

## Test Execution Plan

1. **Manual Testing**: Execute all test cases manually on different browsers and devices
2. **Automated Testing**: Implement automated tests using Jest for backend and Cypress for frontend
3. **Performance Testing**: Use tools like Lighthouse to measure performance metrics
4. **Security Testing**: Verify secure handling of user data and camera permissions
5. **Cross-browser Testing**: Test on Chrome, Firefox, Safari, and Edge

## Test Deliverables

1. **Test Execution Report**: Document results of all test cases
2. **Bug Report**: List of identified issues with severity levels
3. **Performance Report**: Metrics on load times and API response times
4. **Accessibility Report**: Evaluation of accessibility compliance
5. **Security Report**: Assessment of security measures

## Next Steps

1. Execute manual test cases to identify current issues
2. Implement automated test scripts
3. Fix identified bugs
4. Retest to verify fixes
5. Optimize performance based on test results