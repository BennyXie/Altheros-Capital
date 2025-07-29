const express = require("express");
const router = express.Router();

const providerController = require('../controllers/providerController');
const verifyToken = require("../middleware/verifyToken");

router.get('/', verifyToken, providerController.listProviders);
router.get('/:id', verifyToken, providerController.getProvider);
router.get('/:id/headshot', verifyToken, providerController.getProviderHeadshot);
router.get('/profile', verifyToken, providerController.getAuthenticatedProviderProfile);

module.exports = router;