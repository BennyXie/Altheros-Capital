const express = require("express");
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/providers', publicController.getPublicProviders);
router.get('/provider/:cognitoId', publicController.getPublicProviderById);
router.get('/patient/:cognitoId', publicController.getPublicPatientById);

module.exports = router;