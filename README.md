# SIKI - Scan It Know It

A mobile-first web application for scanning product images and getting instant health assessments, inspired by Yuka and BobbyApproved.

## 📁 Project Structure

```
SIKI/
├── index.html              # Landing page
├── styles/
│   └── main.css            # Core styles with light/dark mode
├── scripts/
│   └── main.js             # Camera, upload, and analysis logic
├── components/
│   └── product-card.html   # Modular product analysis UI
├── sample-response.json    # Sample API response for testing
```

## 🎨 UI Features

- **Minimalist layout** with clear visual hierarchy
- **Light/Dark mode** with system preference detection
- **Color-coded health indicators** (green = healthy, yellow = moderate, red = caution)
- **Rounded cards** for product information
- **Responsive design** for all device sizes
- **Smooth transitions** and hover effects

## 🧠 Core Functionality

1. **Camera Access**: Users can scan products using their device camera
2. **Image Upload**: Users can upload product images from their device
3. **Product Analysis**: Backend OCR and AI analysis of product ingredients
4. **Health Assessment**: Visual health score and dietary compatibility indicators
5. **AI Chat**: Ask questions about the product analysis

## 🌗 Theme System

The application supports both light and dark modes:

- Auto-detects system preference
- User can toggle between modes
- Theme preference is saved in localStorage
- CSS variables for easy theme customization

## 🛠️ Development

### Prerequisites

- Modern web browser with camera access support
- Local server for testing (camera requires HTTPS or localhost)

### Running Locally

1. Serve the files using a local server:
   ```bash
   npx live-server
   ```

2. Open your browser at `http://localhost:8080`

### API Integration

The application expects a backend endpoint at `/api/analyze-product` that returns JSON in the following format:

```json
{
  "name": "Product Name",
  "brand": "Brand Name",
  "imageUrl": "https://example.com/image.jpg",
  "healthScore": 85,
  "healthLabel": "Excellent",
  "ingredients": ["Ingredient 1", "Ingredient 2"],
  "tags": ["Vegan", "Gluten-Free"]
}
```

## 🧪 Testing

- Test light/dark mode toggle across devices
- Test accessibility with screen readers
- Test product analysis card with various data inputs
- Test fallback modal when analysis fails
- Test AI chat integration with product context

## 📱 Mobile-First Design

- Tap targets sized for mobile devices
- Responsive layout for all screen sizes
- Touch-friendly controls
- Optimized performance for mobile devices

## 🚀 Next Steps

1. Integrate with Firebase for real-time data
2. Connect to Hugging Face API for AI analysis
3. Add product history and favorites
4. Implement barcode scanning
5. Add social sharing features
