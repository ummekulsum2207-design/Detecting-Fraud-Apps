const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const gplay = require('google-play-scraper');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/fraud-detection', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schema
const appSchema = new mongoose.Schema({
  name: String,
  type: String,
  description: String,
  developer: String,
  isFraud: { type: Boolean, default: false },
});

const feedbackSchema = new mongoose.Schema({
  appName: String,
  feedback: String,
  fraudPrediction: String,
});

const App = mongoose.model('App', appSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);

// Dummy auth middleware
function authenticate(req, res, next) {
  next();
}

// Add app with fraud heuristic
app.post('/api/apps', authenticate, async (req, res) => {
  try {
    const { name, type, description, developer } = req.body;

    let isFraud = false;
    if (/free|cash|lottery|diamond|booster|profit|hack/i.test(name) ||
        /free|cash|lottery|diamond|booster|profit|hack/i.test(description || '')) {
      isFraud = true;
    }

    const newApp = new App({ name, type, description, developer, isFraud });
    await newApp.save();
    res.json({ message: 'App added successfully', app: newApp });
  } catch (err) {
    res.status(500).json({ message: 'Error adding app', error: err.message });
  }
});

// Get apps
app.get('/api/apps', authenticate, async (req, res) => {
  try {
    const apps = await App.find();
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching apps', error: err.message });
  }
});

// Delete app
app.delete('/api/apps/:id', authenticate, async (req, res) => {
  try {
    await App.findByIdAndDelete(req.params.id);
    res.json({ message: 'App deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting app', error: err.message });
  }
});

// Check fraud status
app.get('/api/check-fraud/:name', authenticate, async (req, res) => {
  try {
    const appName = req.params.name;
    const app = await App.findOne({ name: new RegExp(`^${appName}$`, 'i') });
    if (!app) {
      return res.status(404).json({ message: `App "${appName}" not found in database` });
    }
    res.json({ appName: app.name, isFraud: app.isFraud });
  } catch (err) {
    res.status(500).json({ message: 'Error checking fraud', error: err.message });
  }
});

// Submit feedback
app.post('/api/apps/feedback', authenticate, async (req, res) => {
  try {
    const { appName, feedback } = req.body;

    let fraudPrediction = 'Genuine';
    if (/fraud|scam|fake/i.test(feedback)) {
      fraudPrediction = 'Fraudulent';
      await App.updateOne(
        { name: new RegExp(`^${appName}$`, 'i') },
        { $set: { isFraud: true } }
      );
    }

    const newFeedback = new Feedback({ appName, feedback, fraudPrediction });
    await newFeedback.save();

    res.json({ message: 'Feedback saved successfully', fraudPrediction });
  } catch (err) {
    res.status(500).json({ message: 'Error saving feedback', error: err.message });
  }
});

// SCRAPE REVIEWS - Updated with relevancy, lang, country, stars
app.post('/api/scrape', authenticate, async (req, res) => {
  try {
    const { appId, appName, lang = 'en', country = 'us' } = req.body;

    if (!appId || !appName) {
      return res.status(400).json({ message: 'App ID and App Name are required' });
    }

    let reviewsData;
    try {
      reviewsData = await gplay.reviews({
        appId,
        sort: gplay.sort.RELEVANCY,
        num: 50,
        lang,
        country
      });
    } catch (err) {
      console.log("Relevancy sort failed, trying NEWEST...");
      reviewsData = await gplay.reviews({
        appId,
        sort: gplay.sort.NEWEST,
        num: 20,
        lang,
        country
      });
    }

    const reviews = reviewsData.data.map(r => ({
      text: r.text || r.reviewText || '(No text)',
      score: r.score || 0,
      date: r.date ? new Date(r.date).toLocaleDateString() : 'Unknown'
    }));

    if (reviews.length === 0) {
      return res.json({ 
        message: 'No reviews found. Check App ID or try again.', 
        appName, 
        reviews: [] 
      });
    }

    res.json({ 
      message: 'Reviews scraped successfully', 
      appName, 
      reviews 
    });

  } catch (err) {
    console.error('Scrape error:', err);
    res.status(500).json({ 
      message: 'Scraping failed. Try again later.', 
      error: err.message 
    });
  }
});

// Start server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});