const axios = require('axios');
const cheerio = require('cheerio');

const fetchRetreats = async () => {
  try {
    const { data } = await axios.get('https://www.actsmissions.org/retreat-search/');
    const $ = cheerio.load(data);
    const retreats = [];

    $('.retreat-item').each((index, element) => {
      const retreat = {
        title: $(element).find('.retreat-title').text().trim(),
        location: $(element).find('.retreat-location').text().trim(),
        date: $(element).find('.retreat-date').text().trim(),
        link: $(element).find('a').attr('href')
      };
      retreats.push(retreat);
    });

    return retreats;
  } catch (error) {
    console.error('Error fetching retreats:', error);
    return [];
  }
};

module.exports = fetchRetreats;
