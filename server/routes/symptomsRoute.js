const express = require('express')
const router = express.Router()
const symptomsService = require('../services/symptomsService');

router.get('/symptoms', async (req, res) => {
    try {
        const symptoms = await symptomsService.listSymptoms();
        res.json({ symptoms });         
      } catch (err) {
        console.log(err);                      
      }
});

module.exports = router;