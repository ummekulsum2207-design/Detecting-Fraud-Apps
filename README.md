# Detecting Fraud Apps using Sentiment Analysis

## Project Overview
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
2. Run:
   npm install
3. Start the server:
   node server.js
4. Open in browser:
   http://localhost:3000

## Project Structure
- server.js – Backend server
- ml_model.py – ML model logic
- fraud_model.pkl – Trained model
- vectorizer.pkl – Text vectorizer
- index.html – Frontend
- styles.css – Styling
