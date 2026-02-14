# Detecting Fraud Apps using Sentiment Analysis

This project uses Machine Learning and NLP techniques to detect fraudulent mobile applications based on user reviews.

## Technologies Used
- Python
- NLP (Natural Language Processing)
- Scikit-learn
- Pandas
- Node.js

## Features
- Text preprocessing (cleaning, tokenization, stopword removal)
- Sentiment analysis on user reviews
- ML classification model for fraud detection
- Web interface for prediction

## How It Works
1. User reviews are collected.
2. Text is cleaned and transformed using a vectorizer.
3. The trained ML model predicts whether the app is fraudulent or genuine.

## How to Run the Project
1. Clone the repository
   ```bash
   git clone <your-repo-url>
   cd fraud-app-detection
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the server
   ```bash
   node server.js
   ```

4. Open in browser
   ```
   http://localhost:3000
   ```

## Project Structure
- `server.js`               → Backend server (Node.js + Express)
- `ml_model.py`             → Python script for ML model training/prediction
- `fraud_model.pkl`         → Trained ML classification model
- `vectorizer.pkl`          → Fitted TF-IDF vectorizer for text
- `index.html`              → Main frontend page
- `styles.css`              → Styling for the web interface
