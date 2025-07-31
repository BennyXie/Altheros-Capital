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
  const command = new AdminAddUserToGroupCommand({
    UserPoolId: userPoolId,
    Username: username,
    GroupName: groupName,
  });
  return await cognito.send(command);
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