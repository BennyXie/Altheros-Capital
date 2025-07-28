const { cvHandler, addToApplicants, deleteApplicant} = require("../services/resumeService");

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

async function newApplicant(req,res){
    const {email, publicId} = req.body;
    if (!email || !publicId) {
        return res.status(400).json({error: 'Email and publicId are required'});
    }
    try {
        await addToApplicants(email, publicId);
        res.status(201).json({message: "Applicant added successfully"});
    } catch (err) {
        res.status(500).json({ error: "Error adding applicant", details: err.message });
    }
}

async function rejectApplicant(req, res) {
    const {email} = req.body;
    if (!email) {
        return res.status(400).json({error: 'Email is required'});
    }
    try {
        await deleteApplicant(email);
        res.status(200).json({message: "Applicant deleted successfully"});
    } catch (err) {
        res.status(500).json({ error: "Error deleting applicant", details: err.message });
    }
}

module.exports = { resumeHandler, newApplicant, rejectApplicant};
