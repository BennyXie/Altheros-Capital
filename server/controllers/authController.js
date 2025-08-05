const cognitoService = require('../services/cognitoService');

async function addToGroup(req, res) {
  const { role } = req.body;
  const { username, email } = req.user;

  console.log(`authController: addToGroup called with role: "${role}"`);
  console.log(`authController: role type: ${typeof role}`);
  console.log(`authController: user sub: ${username}, user email: ${email}`);

  // Map the client-side role to the Cognito group name
  let groupName;
  if (role === "patient") {
    groupName = "patients";
  } else if (role === "provider") {
    groupName = "providers";
  } else {
    console.error(`authController: Invalid role received: "${role}". Must be "patient" or "provider"`);
    return res.status(400).json({ error: `Invalid role: ${role}. Must be "patient" or "provider"` });
  }

  // Use email as username since Cognito is configured with EMAIL as username attribute
  const cognitoUsername = email || username;
  console.log(`authController: Attempting to add user ${cognitoUsername} to group ${groupName}`);

  try {
    // Use email as the username for Cognito operations
    await cognitoService.addUserToGroup(cognitoUsername, groupName);
    console.log(`authController: Successfully added user ${cognitoUsername} to group ${groupName}`);
    res.status(200).json({ message: `User added to group ${groupName}` });
  } catch (error) {
    console.error('authController: Error adding user to group:', error);
    res.status(500).json({ error: 'Failed to add user to group' });
  }
}

module.exports = { addToGroup };