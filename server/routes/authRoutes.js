const express = require("express");
const router = express.Router();
const {
  addToGroup,
} = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");

router.get("/protected", verifyToken, (req, res) => {
  res.json({
    message: "Successfully accessed protected route!",
    user: req.user,
  });
});

router.post("/add-to-group", verifyToken, addToGroup);

module.exports = router;
