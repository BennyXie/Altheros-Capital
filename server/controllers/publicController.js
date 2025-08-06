const providerService = require('../services/providerService');

async function getPublicProviders(req, res) {
  try {
    console.log('publicController: getPublicProviders called');
    console.log('publicController: req object:', !!req);
    console.log('publicController: req.query:', req?.query);
    console.log('publicController: req keys:', Object.keys(req));
    console.log('publicController: typeof req:', typeof req);
    
    // Create a clean object with just the query
    const cleanReq = {
      query: req.query || {}
    };
    
    console.log('publicController: passing cleanReq:', cleanReq);
    
    const result = await providerService.listProviders(cleanReq);
    res.json(result);
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Provider lookup failed', details: err.message });
  }
}

module.exports = {
    getPublicProviders,
};