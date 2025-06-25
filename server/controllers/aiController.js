const {getResearchAnswer} = require('../services/aiService');

async function postAI(req, res) {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        } 

        const result = await getResearchAnswer(prompt); 
        res.json({ result });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'AI request failed' });
    }

}