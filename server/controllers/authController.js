const pool = require("../db/pool");
const cognitoService = require('../services/cognitoService');
const db = require("../db/pool")

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
    try {
      await cognitoService.addUserToGroup(username, groupName);
      console.log(`authController: Successfully added user ${username} to group ${groupName}`);
      res.status(200).json({ message: `User added to group ${groupName}` });
    } catch (addUserError) {
      console.error("authController: Error adding user to group in Cognito:", addUserError);
      return res.status(500).json({ error: "Failed to add user to group in Cognito", details: addUserError.message });
    }
  } catch (error) {
    console.error("authController: General error in addToGroup:", error);
    res.status(500).json({ error: "Internal server error during group assignment", details: error.message });
  }
}

module.exports = { addToGroup };