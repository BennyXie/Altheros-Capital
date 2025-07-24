const express = require('express')
const app = express()

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
