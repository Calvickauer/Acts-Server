// scraper.js
const axios = require('axios');
const cheerio = require('cheerio');

const baseUrl = 'https://www.actsmissions.org/retreat-search/';

const scrapeRetreats = async () => {
  let currentPage = 1;
  let hasNextPage = true;
  const allRetreats = [];

  while (hasNextPage) {
    const url = `${baseUrl}?pagenum=${currentPage}`;
    console.log(`Scraping page: ${currentPage}`);
    
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      const retreatCards = $('.et_pb_text_inner'); // Adjust this selector to match the retreat card selector

      if (retreatCards.length === 0) {
        hasNextPage = false;
      } else {
        retreatCards.each((index, element) => {
          const title = $(element).find('h4').text().trim();
          const date = $(element).find('p').text().trim().split('\n')[0];
          const location = $(element).find('p').text().trim().split('\n')[1];

          if (title && date && location) {
            allRetreats.push({
              title,
              date,
              location
            });
          }
        });
        currentPage++;
      }
    } catch (error) {
      console.error(`Error scraping page ${currentPage}:`, error);
      hasNextPage = false;
    }
  }

  return allRetreats;
};

module.exports = scrapeRetreats;
