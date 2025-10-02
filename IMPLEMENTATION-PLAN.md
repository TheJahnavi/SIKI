# SIKI Implementation Plan

This document outlines the phased approach to implement the "Scan It Know It" application according to the ambitious architecture combining real-time AI (CV, LLM) with a robust, scalable backend (Firebase).

## Phase 1: Core Technology Spikes (Focus: Backend & Data Integrity)

### 1. Intelligent Recognition
- Integrate & Test Primary APIs for Cloud Vision (or similar)
- Set up accounts and API calls for:
  - Object ID (e.g., Apple, Book)
  - Barcode/OCR on product images
- Target: 90% accuracy on product identification within 2 seconds
- Target: CER (Character Error Rate) on ingredient lists below 5% for clean images

### 2. Ingredient Data Source
- Establish the Risk Database
- Define structured schema for ingredients:
  - Name
  - Harmful Tag
  - Effect on Body
  - Swap Suggestion
  - Regulatory Status
- Begin populating with first 50 common flagged ingredients
- Target: Backend must instantly return structured risk data for a given ingredient name
- Target: No null values for the 'Effect on Body' field for the initial 50 ingredients

### 3. Contextual Chatbot
- Initial Llama-2 (or similar LLM) Integration
- Set up API endpoint on Node.js server
- Create robust Prompt Template that instructs the LLM to only answer based on the JSON payload of the scanned product's ingredients and score
- Target: Chatbot must successfully answer a question based only on the provided context and refuse to answer general knowledge questions

## Phase 2: Building the MVP Core Loop (Focus: Performance & UX)

### 1. Frontend/UI (React/Vue)
- Build the Results Screen with Lazy Loading
- Implement static header and four vertical accordion tabs
- Use frontend state management system to ensure Tabs 2, 3, and 4 only trigger their API call on first open and store the result in local state
- Target: Core Load Time (Static Header + Tab 1) ≤ 3 seconds
- Target: Subsequent opens of Tabs 2, 3, and 4 must load in < 500ms (due to caching)

### 2. API Orchestration
- Build the Primary Endpoint (/api/analyze-product)
- Implement conditional logic (Barcode → OCR → Object ID)
- Single endpoint must handle entire flow and return final JSON structure for frontend
- Target: No false object IDs
- Target: 99.9% uptime for the core /api/analyze-product endpoint during load testing

### 3. Product Tags
- Define Tagging Rules
- Create logic to automatically assign tags (e.g., Organic, Vegan, High-Fat) based on scanned ingredients or nutritional data
- Target: Tags are correctly applied and displayed in static header for initial test set

## Phase 3: Differentiation & Polish (Focus: Data Analysis & Edge Cases)

### 1. Reddit Community Snapshot
- Implement NLP/Sentiment
- Set up Reddit API integration
- Use simple NLP model (or rule-based system initially) to classify extracted user comments into Pros/Cons summaries
- Target: 70% accuracy in sentiment classification of test Reddit snippets
- Target: Summary must be simple and jargon-free

### 2. Ingredient Deep Dive
- Build the Modal Flow
- Ensure tapping a flagged (Red/Yellow) ingredient dynamically renders the "Simple Harm Statement" and the "Healthier Swap" from the database
- Target: Every flagged ingredient has a corresponding, non-empty Deep Dive modal

### 3. Error Handling
- Address Image Quality
- Implement robust client-side validation for image file types and size
- On server, ensure graceful fallback if OCR fails
- Target: Image submission is blocked for files over 5MB
- Target: Successful handling of all 5 pre-defined error scenarios