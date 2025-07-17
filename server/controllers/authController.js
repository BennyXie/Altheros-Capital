const pool = require("../db/pool");
const { signUpUser, addUserToGroup, listGroupsForUser} = require("../services/cognitoService");
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
  // Ensure req.user and req.user["cognito:username"] are available
  if (!req.user || !req.user.username) {
    console.error("Error: User information not found in request. req.user:", req.user);
    return res.status(400).json({ error: "User information not available" });
  }

  const username = req.user.username;
  const groupName = role === "patient" ? "patients" : "providers";
  console.log(`Attempting to add user ${username} to group ${groupName}`);

  try {
    const userGroups = await listGroupsForUser(username);
    console.log(`User ${username} is currently in groups:`, userGroups);

    if (userGroups.includes(groupName)) {
      console.log(`User ${username} is already in group ${groupName}. Skipping add operation.`);
      return res.status(200).json({ message: `User ${username} is already in group ${groupName}` });
    }

    await addUserToGroup(username, groupName);
    console.log(`Successfully added user ${username} to group ${groupName}`);
    res.status(200).json({ message: `User added to group ${groupName}` });
  } catch (error) {
    console.error("Error adding user to group:", error);
    // Provide more specific error message if possible, but avoid exposing sensitive details
    res.status(500).json({ error: "Internal server error during group assignment" });
  }
}

module.exports = { cognito_signup, addToGroup};
