const pool = require("../db/pool");
const { signUpUser, addUserToGroup} = require("../services/cognitoService");
const db = require("../db/pool")
const bcrypt = require('bcrypt');
const saltRounds = 10;
//For password verify, we need to run const isMatch = await bcrypt.compare(plainPassword, hashedPassword).


async function cognito_signup(req, res) {
  try {
    const { username, password, givenName, familyName } = req.body;
    const response = await signUpUser({
      username: username,
      password: password,
      givenName: givenName,
      familyName: familyName,
    });
    res.json({ message: "Signup request sent", response });
  } catch (err) {
    console.error("Cognito error:", err);
    res.status(500).json({ error: err.message });
  }
}



async function addToGroup(req, res) {
  const { role } = req.body;
  const username = req.user["cognito:username"];
  const groupName = role === "patient" ? "patients" : "providers";
  try {
    await addUserToGroup(username, groupName);
    res.status(200).json({ message: `User added to group ${groupName}` });
  } catch (error) {
    console.error("Error adding user to group:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { cognito_signup, signUpHelper, addToGroup};
