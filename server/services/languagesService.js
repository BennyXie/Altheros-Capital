const languages = require('../controlles/languagesController');

async function listLanguages() {
  return await languages.getLanguages();
} 

module.exports = { listLanguages };

