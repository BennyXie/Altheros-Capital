const express = require('express');
const router = express();
const languagesService = require('../services/languagesService');

router.get('/languages', async (req, res) => {
    try {
        const languages = await languagesService.listLanguages();
        res.json({ languages });               
    } catch (err) {
        console.log(err);                            
    }
});