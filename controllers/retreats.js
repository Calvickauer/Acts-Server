// controllers/retreats.js
const axios = require('axios');
const cheerio = require('cheerio');
const Retreat = require('../models/retreat');
const express = require('express');
const router = express.Router();

router.post('/scrape', async (req, res) => {
  console.log('Scrape route hit');
  try {
    let currentPage = 1;
    let hasNextPage = true;
    const allRetreats = [];

    while (hasNextPage) {
      const response = await axios.get(`https://www.actsmissions.org/retreat-search/?pagenum=${currentPage}`);
      console.log(`Website response received for page ${currentPage}`);
      const html = response.data;
      const $ = cheerio.load(html);

      const retreatCards = $('#gv-view-226325-1 .gv-table-view tbody tr');
      console.log(`Total retreat cards found on page ${currentPage}: ${retreatCards.length}`);

      if (retreatCards.length === 0) {
        hasNextPage = false;
        break;
      }

      let pageHasValidData = false;

      retreatCards.each((index, element) => {
        const parish = $(element).find('td[data-label="PARISH"]').text().trim();
        const city = $(element).find('td[data-label="CITY"]').text().trim();
        const state = $(element).find('td[data-label="STATE"]').text().trim();
        const retreatType = $(element).find('td[data-label="Retreat Type"]').text().trim();
        const language = $(element).find('td[data-label="Language"]').text().trim();
        const date = $(element).find('td[data-label="Retreat Start Date (Thursday)"]').text().trim();

        const location = `${city}, ${state}`;
        const title = parish;

        if (title && location && retreatType && language && date) {
          allRetreats.push({ title, location, retreatType, language, date });
          pageHasValidData = true;
          console.log(`Found retreat: ${JSON.stringify({ title, location, retreatType, language, date })}`);
        } else {
          console.log(`Incomplete data for a retreat: ${JSON.stringify({ title, location, retreatType, language, date })}`);
        }
      });

      if (!pageHasValidData) {
        hasNextPage = false;
        break;
      }

      currentPage++;
    }

    if (allRetreats.length > 0) {
      await Retreat.deleteMany({}); // Clear the collection before inserting new data
      await Retreat.insertMany(allRetreats);
      console.log('All retreats saved to the database');
    }

    res.json({ message: 'Scraping and saving completed', retreats: allRetreats });
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

module.exports = router;
