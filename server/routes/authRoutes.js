const express = require("express");
const router = express.Router();
const { testCognito, signUpHelper, deleteUserAndData} = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");

router.get("/protected", verifyToken, (req, res) => {
  res.json({
    message: "Successfully accessed protected route!",
    user: req.user,
  });
});

router.post("/test-cognito", testCognito);
router.post("/signup", verifyToken, signUpHelper);
router.delete("/delete-user", deleteUserAndData);


module.exports = router;
