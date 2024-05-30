const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const Retreat = require('../models/retreat');
const User = require('../models/user'); // Ensure this is correctly imported

// Route to scrape retreats
router.post('/scrape', async (req, res) => {
  console.log('Scrape route hit');
  try {
    const response = await axios.get('https://www.actsmissions.org/retreat-search/');
    console.log('Website response received');
    const html = response.data;
    const $ = cheerio.load(html);

    const retreats = [];
    console.log('Checking for retreat cards');
    const retreatCards = $('#gv-view-226325-1 .gv-table-view tbody tr');

    console.log(`Total retreat cards found: ${retreatCards.length}`);

    retreatCards.each((index, element) => {
      const parish = $(element).find('td[data-label="PARISH"]').text().trim();
      const city = $(element).find('td[data-label="CITY"]').text().trim();
      const state = $(element).find('td[data-label="STATE"]').text().trim();
      const retreatType = $(element).find('td[data-label="Retreat Type"]').text().trim();
      const language = $(element).find('td[data-label="Language"]').text().trim();
      const date = $(element).find('td[data-label="Retreat Start Date (Thursday)"]').text().trim();

      // Combine city and state to form location
      const location = `${city}, ${state}`;
      // Use parish name as the title
      const title = parish;

      if (title && location && retreatType && language && date) {
        retreats.push({ title, location, retreatType, language, date });
        console.log(`Found retreat: ${JSON.stringify({ title, location, retreatType, language, date })}`);
      } else {
        console.log(`Incomplete data for a retreat: ${JSON.stringify({ title, location, retreatType, language, date })}`);
      }
    });

    if (retreats.length > 0) {
      await Retreat.insertMany(retreats);
      console.log('Retreats saved to the database');
    }

    res.json({ message: 'Scraping and saving completed', retreats });
  } catch (error) {
    console.error('Error scraping retreats:', error);
    res.status(500).json({ message: 'Error scraping retreats' });
  }
});



// New route to fetch retreats
router.get('/', async (req, res) => {
  try {
    const retreats = await Retreat.find();
    res.json(retreats);
  } catch (error) {
    console.error('Error fetching retreats:', error);
    res.status(500).json({ message: 'Error fetching retreats' });
  }
});

// Route to add a retreat to the user's profile
router.post('/add-to-profile', async (req, res) => {
  const { userId, retreatId } = req.body;
  try {
    // Fetch the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if the retreat ID is already in the user's retreats array
    if (user.retreats.some(retreat => retreat._id.equals(retreatId))) {
      return res.status(400).json({ message: 'Retreat already added to profile' });
    }

    // Fetch the retreat by ID
    const retreat = await Retreat.findById(retreatId);
    if (!retreat) {
      return res.status(404).json({ message: 'Retreat not found' });
    }
    
    // Add the retreat details to the user's retreats array
    user.retreats.push({
      _id: retreat._id,
      title: retreat.title,
      date: retreat.date,
      location: retreat.location,
      retreatType: retreat.retreatType,
      language: retreat.language,
    });
    
    // Save the updated user document
    await user.save();
    
    // Respond with the updated user document
    res.json(user);
  } catch (error) {
    // Log the full error stack for debugging
    console.error('Error adding retreat to profile:', error.stack);
    res.status(500).json({ message: 'Error adding retreat to profile', error: error.message });
  }
});

module.exports = router;
