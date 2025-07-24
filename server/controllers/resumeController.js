const { cvHandler } = require("../services/resumeService");

async function resumeHandler(req, res) {
    const {fileUrl} = req.body;
    console.log("Received fileUrl:", fileUrl);
    if (!fileUrl) {
        return res.status(400).json({error: 'File URL is required'});
    }
    try{
        const result = await cvHandler(fileUrl);
        res.json(result);
    }
    catch (err){
        res.status(500).json({ error: "Error processing the CV", details: err.message });
    }
}

module.exports = { resumeHandler };
