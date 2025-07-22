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

app
  .route('/me')
  .get(async (req, res) => {
    /* Auth will go here */
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
  .patch(async (req, res) => {
    //  PATCH /ME

    const userId = req.user.id;
    const role = req.user.role; // 'patient' or 'provider'
  
    // Editable fields, TODO: Change or extend
    const allowedFields = ['first_name', 'last_name', 'bio', 'address', 'dob'];
  
    // Extract only allowed updates
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
  
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
  
    // map objects with update to set clause
    const setClauses = Object.keys(updates).map(
      (key, i) => `${key} = $${i + 1}`
    ).join(', ');
  
    const values = Object.values(updates);
    values.push(userId); // last value for WHERE clause
  
    const table = role === 'patient' ? 'patients' : 'providers';
    const idField = role === 'patient' ? 'patient_id' : 'provider_id';
  
    const query = `
      UPDATE ${table}
      SET ${setClauses}
      WHERE ${idField} = $${values.length}
      RETURNING *
    `;
  
    try {
      const updated = await db.one(query, values);
      res.json({ updated });
    } catch (err) {
      console.error('Update error:', err);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  })
  .delete(async (req, res) => {
    // DELETE /ME

    const userId = req.user.id;
    const role = req.user.role;

    const table = role === 'patient' ? 'patients' : 'providers';
    const idField = role === 'patient' ? 'patient_id' : 'provider_id';

    try {
      const deleted = await db.result(
        `DELETE FROM ${table} WHERE ${idField} = $1`,
        [userId]
      );

      if (deleted.rowCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'Account deleted successfully' });
    } catch (err) {
      console.error('Delete error:', err);
      res.status(500).json({ error: 'Failed to delete account' });
    }
  })
