const symptoms = require('../controllers/symptomsController');

async function listSymptoms() {
  return await symptoms.getSymptoms();
}

module.exports = { listSymptoms };