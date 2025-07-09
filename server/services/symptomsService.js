const symptoms = require('../controllers/symptomsRepository');

async function listSymptoms() {
  return await symptoms.getSymptoms();
}

module.exports = { listSymptoms };