import sys
import nltk
import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import SVC
from nltk.tokenize import word_tokenize

nltk.download('punkt', quiet=True)

# 🔹 File paths
MODEL_PATH = 'fraud_model.pkl'
VECTORIZER_PATH = 'vectorizer.pkl'

# 🔹 Function to train and save model
def train_and_save_model():
    data = pd.read_csv('labeled_reviews.csv')
    reviews = data['review'].tolist()
    labels = data['label'].tolist()

    vectorizer = TfidfVectorizer(tokenizer=word_tokenize)
    X = vectorizer.fit_transform(reviews)

    model = SVC(kernel='linear')
    model.fit(X, labels)

    joblib.dump(model, MODEL_PATH)
    joblib.dump(vectorizer, VECTORIZER_PATH)
    print("✅ Model and vectorizer saved.")

# 🔹 Main code block
if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Load model and vectorizer
        model = joblib.load(MODEL_PATH)
        vectorizer = joblib.load(VECTORIZER_PATH)

        review_input = sys.argv[1]
        X_new = vectorizer.transform([review_input])
        prediction = model.predict(X_new)[0]
        print(prediction)
    else:
        # Only train if no args passed
        train_and_save_model()
