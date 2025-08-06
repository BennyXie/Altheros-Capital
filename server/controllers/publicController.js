const providerService = require('../services/providerService');
const db = require('../db/pool');

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

async function getPublicProviderById(req, res) {
  try {
    const { cognitoId } = req.params;
    
    const result = await db.query(
      `SELECT first_name, last_name, headshot_url, specialty, location 
       FROM providers 
       WHERE cognito_sub = $1`,
      [cognitoId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching provider:', err);
    res.status(500).json({ error: 'Failed to fetch provider', details: err.message });
  }
}

async function getPublicPatientById(req, res) {
  try {
    const { cognitoId } = req.params;
    
    const result = await db.query(
      `SELECT first_name, last_name 
       FROM patients 
       WHERE cognito_sub = $1`,
      [cognitoId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching patient:', err);
    res.status(500).json({ error: 'Failed to fetch patient', details: err.message });
  }
}

module.exports = {
    getPublicProviders,
    getPublicProviderById,
    getPublicPatientById,
};