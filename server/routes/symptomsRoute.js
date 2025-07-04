const express = require('express')
const app = express()

app.get('/symptoms', async (_req, res) => {
    const { rows } = await pool.query(`SELECT * FROM symptoms ORDER BY name`);
    res.json({ symptoms: rows });
});
  