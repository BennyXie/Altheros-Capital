const express = require('express')
const app = express()

const pgp = require('pg-promise')(/* options */)
const db = pgp({
  host: 'midwest-health-db.cle2oqga6j1x.us-east-2.rds.amazonaws.com',
  port: 5432,
  database: 'postgres',
  user: 'mwh_admin',
  password: 'your_password_here',
  ssl: { rejectUnauthorized: false },
});

/* 
  GET /me
    Requires auth token
    Returns user profile from DB: { id, name, email, role, profile }
    Joins with patients or providers table depending on role
*/

app.get('/me', async (req, res) => {

  /* Auth will go here, unclear what that is for now */
  let user; // user id
  let role; // was gonna do 0 = provider, 1 = role

  let dict = {};
  dict[id] = user;
  try {
    let data;
    let profile = {}

    if (role === 1) { // patient
      data = await db.one(
        'SELECT first_name, last_name, email FROM patients WHERE patient_id = $1',
        [user]
      );
      profile.role = 'patient';
    } else { // provider
      data = await db.one(
        'SELECT first_name, last_name, email FROM providers WHERE provider_id = $1',
        [user]
      );
      profile.role = 'provider';
    }

    profile.id = user;
    profile.name = `${data.first_name} ${data.last_name}`;
    profile.email = data.email;
    profile.profile = {}; // idk what this is

    res.json(profile);

  } catch (err) {
    console.error('DB error:', err);
    res.status(404).json({ error: 'User not found' });
  }
  
})
