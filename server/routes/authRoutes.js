const express = require("express");
const router = express.Router();
const { testCognito } = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");

router.get("/protected", verifyToken, (req, res) => {
  res.json({
    message: "Successfully accessed protected route!",
    user: req.user,
  });
});

router.get("/test-cognito", testCognito);

module.exports = router;