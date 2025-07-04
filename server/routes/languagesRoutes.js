const express = require('express')
const app = express()

app.get('/languages', async (_req, res) => {
    const { rows } = await pool.query(`SELECT * FROM languages ORDER BY name`);
    res.json({ languages: rows });
});