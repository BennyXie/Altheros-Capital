const {
  CognitoIdentityProviderClient,
  SignUpCommand,
  AdminAddUserToGroupCommand,
  AdminListGroupsForUserCommand
} = require("@aws-sdk/client-cognito-identity-provider");
const { getSecretHash } = require("../utils/hashUtils");

const cognito = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION,
});

async function signUpUser({ username, password, givenName, familyName }) {
  const clientId = process.env.COGNITO_CLIENT_ID;
  const clientSecret = process.env.COGNITO_CLIENT_SECRET;

  const command = new SignUpCommand({
    ClientId: clientId,
    Username: username,
    Password: password,
    SecretHash: getSecretHash(username, clientId, clientSecret),
    UserAttributes: [
      { Name: "email", Value: username },
      { Name: "given_name", Value: givenName },
      { Name: "family_name", Value: familyName },
    ],
  });

  return await cognito.send(command);
}

async function addUserToGroup(username, groupName) {
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  
  // Retry logic for timing issues with newly created users
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const command = new AdminAddUserToGroupCommand({
        UserPoolId: userPoolId,
        Username: username,
        GroupName: groupName,
      });
      
      console.log(`cognitoService: Attempt ${attempt}/${maxRetries} to add user ${username} to group ${groupName}`);
      const result = await cognito.send(command);
      console.log(`cognitoService: Successfully added user ${username} to group ${groupName} on attempt ${attempt}`);
      return result;
      
    } catch (error) {
      console.log(`cognitoService: Attempt ${attempt}/${maxRetries} failed:`, error.name);
      
      if (error.name === 'UserNotFoundException' && attempt < maxRetries) {
        console.log(`cognitoService: User not found, waiting ${retryDelay}ms before retry ${attempt + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      
      // If it's the last attempt or a different error, throw it
      throw error;
    }
  }
}

async function listGroupsForUser(username) {
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const command = new AdminListGroupsForUserCommand({
    UserPoolId: userPoolId,
    Username: username,
  });
  const response = await cognito.send(command);
  return response.Groups.map(group => group.GroupName);
}

module.exports = { signUpUser, addUserToGroup, listGroupsForUser};