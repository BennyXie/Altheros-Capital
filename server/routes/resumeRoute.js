const express = require("express");
const router = express.Router();

const {resumeHandler} = require("../controllers/resumeController");

router.post(
    "/parse",
    async (req, res, next) => {
        try {
            await resumeHandler(req, res);
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
