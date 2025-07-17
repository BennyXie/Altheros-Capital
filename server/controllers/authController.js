const pool = require("../db/pool");
const cognitoService = require('../services/cognitoService');
const db = require("../db/pool")
const bcrypt = require('bcrypt');
const saltRounds = 10;
//For password verify, we need to run const isMatch = await bcrypt.compare(plainPassword, hashedPassword).


async function cognito_signup(req, res) {
  console.log('authController: cognito_signup called');
  try {
    const { username, password, givenName, familyName } = req.body;
    console.log(`authController: Attempting to sign up user: ${username}`);
    const response = await cognitoService.signUpUser({
      username: username,
      password: password,
      givenName: givenName,
      familyName: familyName,
    });
    console.log('authController: signUpUser response:', response);
    res.json({ message: "Signup request sent", response });
  } catch (err) {
    console.error("authController: Cognito error during signup:", err);
    res.status(500).json({ error: err.message });
  }
}



async function addToGroup(req, res) {
  console.log('authController: addToGroup called');
  const { role } = req.body;
  // Ensure req.user and req.user.username are available
  if (!req.user || !req.user.username) {
    console.error("authController: Error: User information not found in request. req.user:", req.user);
    return res.status(400).json({ error: "User information not available" });
  }

  const username = req.user.username;
  const groupName = role === "patient" ? "patients" : "providers";
  console.log(`authController: Attempting to add user ${username} to group ${groupName}`);

  try {
    console.log(`authController: Listing groups for user ${username}...`);
    const userGroups = await cognitoService.listGroupsForUser(username);
    console.log(`authController: User ${username} is currently in groups:`, userGroups);

    if (userGroups.includes(groupName)) {
      console.log(`authController: User ${username} is already in group ${groupName}. Skipping add operation.`);
      return res.status(200).json({ message: `User ${username} is already in group ${groupName}` });
    }

    console.log(`authController: Adding user ${username} to group ${groupName}...`);
    await cognitoService.addUserToGroup(username, groupName);
    console.log(`authController: Successfully added user ${username} to group ${groupName}`);
    res.status(200).json({ message: `User added to group ${groupName}` });
  } catch (error) {
    console.error("authController: Error adding user to group:", error);
    // Provide more specific error message if possible, but avoid exposing sensitive details
    res.status(500).json({ error: "Internal server error during group assignment" });
  }
}

async function cognito_login(req, res) {
  console.log('authController: cognito_login called');
  try {
    const { username, password } = req.body;
    console.log(`authController: Attempting to sign in user: ${username}`);
    const response = await cognitoService.signInUser({ username, password });
    console.log('authController: signInUser response:', response);
    res.json({ message: "Login successful", token: response.AuthenticationResult.IdToken });
  } catch (err) {
    console.error("authController: Cognito error during login:", err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { cognito_signup, addToGroup, cognito_login};
