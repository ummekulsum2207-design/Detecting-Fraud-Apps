const gplay = require('google-play-scraper');

async function scrapeReviews(appId) {
  try {
    console.log(`Attempting to scrape reviews for appId: ${appId} at ${new Date().toISOString()}`);
    const reviews = await gplay.reviews({
      appId,
      sort: gplay.sort.NEWEST,
      num: 100,
      lang: 'en',
      country: 'us'
    });
    console.log(`Fetched ${reviews.data.length} reviews for ${appId}`);
    return reviews.data.map(r => r.reviewText || r.text || '');
  } catch (err) {
    console.error(`Scraping failed for ${appId} at ${new Date().toISOString()}:`, err.message);
    return [];
  }
}

module.exports = { scrapeReviews };