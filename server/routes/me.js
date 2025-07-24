const express = require('express')
const router = express.Router()

const pool = require("../db/pool");
const verifyToken = require("../middleware/verifyToken");

/* 
  GET /me
    Requires auth token
    Returns user profile from DB: { id, name, email, role, profile }
    Joins with patients or providers table depending on role
*/

router.get('/me', verifyToken, async (req, res) => {

  const user = req.user.sub; // User's unique ID from Cognito
  const role = req.user['custom:role']; // User's custom role from Cognito

  try {
    let data;
    let profile = {};

    if (role === 'patient') {
      data = await pool.query(
        'SELECT first_name, last_name, email FROM patients WHERE cognito_sub = $1',
        [user]
      );
      profile.role = 'patient';
    } else if (role === 'provider') {
      data = await pool.query(
        'SELECT first_name, last_name, email FROM providers WHERE cognito_sub = $1',
        [user]
      );
      profile.role = 'provider';
    } else {
      return res.status(400).json({ error: 'Invalid user role' });
    }

    if (data.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    profile.id = user;
    profile.name = `${data.rows[0].first_name} ${data.rows[0].last_name}`;
    profile.email = data.rows[0].email;
    profile.profile = {}; // Placeholder for additional profile data if needed

    res.json(profile);

  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
  
})

module.exports = router;