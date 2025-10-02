# AI/ML Pipeline Specification

This document provides a detailed specification for the three main AI/ML components in the SIKI application: OCR, Computer Vision, and Contextual Chat.

## 1. OCR (Tesseract.js)

The OCR stage is the primary method for gathering high-detail textual information from a product image, such as ingredients, allergens, and nutritional facts. It does not use a "prompt" in the traditional sense, but rather a configuration object for optimal image processing.

### Goal
Extract all readable text from the product label image.

### Call Type
Local Library Call (`tesseract.js`)

### Input Format

#### Input Data
**`ImageData`** (A binary buffer or file path of the image).

#### Input Metadata
**`lang`**: The language model to use (e.g., `'eng'`).
**`tessedit_char_whitelist`**: Character whitelist for optimal text recognition.

### Process
The `Tesseract.recognize()` function is called. The library handles image preprocessing (e.g., binarization, resizing, rotation) internally to maximize text recognition accuracy.

### Output Format

#### Output Data
**`string`** (A large block of raw text).

#### Example Output
```
NUTRITION FACTS... Ingredients: Whole Grain Oats, Sugar, Corn Syrup, Salt, Caramel Color... Contains: Tree Nuts. MFG By: Cereal Co.
```

### Implementation Details
- Uses English language model for text recognition
- Applies character whitelist for better accuracy
- Processes images with optimal preprocessing
- Extracts structured data from raw text output

## 2. Computer Vision (TensorFlow.js + MobileNet)

The Computer Vision stage acts as a **fallback** to classify the product if the OCR stage fails to extract meaningful data. It is a simple image classification task.

### Goal
Classify the object in the image into a high-level category (e.g., "banana," "cereal box," "can of soda").

### Call Type
Local Library Call (`@tensorflow/tfjs-node` + `mobilenet`)

### Input Format

#### Input Data
**`Tensor`** (A 3D or 4D tensor representing the pre-processed image: 224x224x3 pixels).

### Process
1. Load the image buffer.
2. Resize and normalize the image to the MobileNet standard (224x224 size, values ∈ [-1, 1]).
3. The `model.classify()` function returns an array of predictions with confidence scores.

### Output Format

#### Output Data
**`Array<Object>`** (A list of the top classification results).

#### Example Output
```json
[
  {"className": "cereal_box", "probability": 0.895},
  {"className": "carton", "probability": 0.052}
]
```

### Implementation Details
- Uses MobileNet v2 model for efficient classification
- Processes images with proper resizing and normalization
- Returns top predictions with confidence scores
- Gracefully degrades to simulation when TensorFlow is unavailable

## 3. Contextual Chat (Hugging Face Inference API)

The chat stage uses a conversational AI model (e.g., an instruction-tuned LLM) to provide context-aware answers based on the product analysis data stored in Firestore.

### Goal
Generate a helpful, context-aware answer to a user's question, using the product data as the knowledge base.

### Call Type
External API Call (Hugging Face Inference)

### Input Format

#### Input Data
**`Prompt String`** (The main input, engineered using a System Message + Context + User Query).

#### Input Metadata
**`model`**: The LLM to use (e.g., `meta-llama/Llama-2-7b-chat-hf`).

### Prompt Construction for Hugging Face Chat

The prompt is constructed by the `server.js` file before the API call:

#### Prompt Section: System Message (Role)
```
You are SIKI, a friendly, helpful, and concise product analysis assistant. Your only source of truth is the JSON data provided below. Do not use outside knowledge. If the answer is not in the JSON, state that you cannot find the information.
```
**Purpose**: Sets the AI's persona, tone, and the strict **contextual constraint** (known as RAG).

#### Prompt Section: Product Context (Data)
A JSON string of the full product analysis document retrieved from Firestore, e.g.:
```json
{
  "id": "my-test-product-id",
  "name": "Crunchy Flakes",
  "ingredients": ["Whole Grain Oats", "Sugar", "Salt", "Caramel Color"],
  "allergens": ["Gluten"]
}
```
**Purpose**: Provides the **knowledge base** for the AI to query.

#### Prompt Section: User Query (Question)
The raw message from the user (e.g., `"Is this cereal safe for someone with a nut allergy?"`).
**Purpose**: The **final task** for the AI to answer using sections A and B.

#### Final Example Prompt (Sent to Hugging Face)
```
You are SIKI, a friendly, helpful, and concise product analysis assistant. Your only source of truth is the JSON data provided below. Do not use outside knowledge. If the answer is not in the JSON, state that you cannot find the information.

PRODUCT DATA:
{"id": "my-test-product-id", "name": "Crunchy Flakes", "ingredients": ["Whole Grain Oats", "Sugar", "Salt", "Caramel Color"], "allergens": ["Gluten"]}

USER QUESTION:
Is this cereal safe for someone with a nut allergy?
```

### Output Format

#### Output Data
**`string`** (The AI's generated response).

#### Example Output
```
Based on the provided product data, no tree nuts are listed in the ingredients or allergens. However, it does contain Gluten.
```

### Implementation Details
- Uses Llama-2-7b-chat-hf model for conversational AI
- Constructs context-aware prompts with system message, product data, and user query
- Implements proper parameter tuning (temperature, top_p, max_tokens)
- Gracefully degrades to simulated responses when API key is unavailable

## API Endpoints

### POST /api/analyze-product
Accepts an image file and returns product analysis data using OCR and computer vision.

**Request:**
```
POST /api/analyze-product
Content-Type: multipart/form-data

image: [file data]
```

**Response:**
```json
{
  "success": true,
  "product": {
    "id": "img_1234567890",
    "name": "Product Name",
    "score": 85,
    "category": "Food",
    "nutrition": { "calories": "100", "sugar": "10g" },
    "ingredients": ["Ingredient 1", "Ingredient 2"],
    "allergens": ["Gluten"],
    "fallback": false
  },
  "productId": "img_1234567890"
}
```

### POST /api/chat
Accepts a product ID and query, returns AI-generated response using Hugging Face API.

**Request:**
```json
POST /api/chat
Content-Type: application/json

{
  "productId": "img_1234567890",
  "query": "Is this product healthy?"
}
```

**Response:**
```json
{
  "success": true,
  "reply": "Based on the provided product data, this product has a health score of 85 which is considered good. It contains natural ingredients but has moderate sugar content."
}
```

## Error Handling

### OCR Errors
- Graceful degradation to computer vision when OCR fails
- Detailed logging of OCR processing steps
- Fallback to simulated data when both OCR and CV fail

### Computer Vision Errors
- Simulation fallback when TensorFlow is unavailable
- Error logging for model loading failures
- Confidence-based fallback decisions

### Chat API Errors
- Simulation fallback when Hugging Face API key is missing
- Error logging for API call failures
- Graceful degradation to template responses

## Configuration

### Environment Variables
```env
GOOGLE_APPLICATION_CREDENTIALS=firebase-service-account.json
HUGGINGFACE_API_KEY=your_actual_huggingface_api_key
PORT=3000
```

### Service Account Setup
1. Firebase project with Firestore database
2. Service account JSON file with proper permissions
3. Environment variable pointing to service account file

### API Key Management
1. Hugging Face account with Inference API access
2. API token with appropriate permissions
3. Secure environment variable configuration