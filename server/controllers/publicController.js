const providerService = require('../services/providerService');

async function getPublicProviders(req, res) {
  try {
    const result = await providerService.listProviders(req.query);
    res.json({
      providers: result.providers,
      ...result.pagination_details
    });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Provider lookup failed', details: err.message });
  }
}

module.exports = {
    getPublicProviders,
};