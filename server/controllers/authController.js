const cognitoService = require('../services/cognitoService');

async function addToGroup(req, res) {
  const { role } = req.body;
  const { username } = req.user;

  // Map the client-side role to the Cognito group name
  const groupName = role === "patient" ? "patients" : "providers";

  console.log(`Attempting to add user ${username} to group ${groupName}`);

  try {
    // Use the correct groupName variable
    await cognitoService.addUserToGroup(username, groupName);
    res.status(200).json({ message: `User added to group ${groupName}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add user to group' });
  }
}

module.exports = { addToGroup };