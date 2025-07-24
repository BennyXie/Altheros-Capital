const languages = require('../controllers/languagesController');

async function listLanguages() {
  return await languages.getLanguages();
} 

module.exports = { listLanguages };

