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
  .get(getMe)
  .patch(patchMe)
  .delete(deleteMe)
