const express = require("express");
const router = express.Router();

const {resumeHandler, newApplicant, rejectApplicant} = require("../controllers/resumeController");

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

router.post(
    "/add",
    async (req, res, next) => {
        try {
            await newApplicant(req, res);
        } catch (error) {
            next(error);
        }
    }
)

router.post(
    "/remove",
    async (req, res, next) => {
        try {
            await rejectApplicant(req, res);
        } catch (error) {
            next(error);
        }
    }
)

module.exports = router;
