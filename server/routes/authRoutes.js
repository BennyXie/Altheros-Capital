const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");

router.post("/add-to-group", verifyToken, authController.addToGroup);

router.get("/test", (req, res) => {
  res.send("Auth route test");
});

module.exports = router;