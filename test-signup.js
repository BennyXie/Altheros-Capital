const { CognitoIdentityProviderClient, SignUpCommand } = require("@aws-sdk/client-cognito-identity-provider");
const { getSecretHash } = require("./server/utils/hashUtils");

// Use the same configuration as the server
const cognito = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION || "us-east-2",
});

async function testSignup() {
  const clientId = process.env.COGNITO_CLIENT_ID || "3m9uttp82ggf8gu62lm12ea7j6";
  const clientSecret = process.env.COGNITO_CLIENT_SECRET || "5tfae3sfepk8ruath640an3tivjfpn3scsm5p72aros17ctsu7e";
  
  const username = "testuser" + Date.now() + "@example.com";
  const password = "TestPassword123!";
  
  const command = new SignUpCommand({
    ClientId: clientId,
    Username: username,
    Password: password,
    SecretHash: getSecretHash(username, clientId, clientSecret),
    UserAttributes: [
      { Name: "email", Value: username },
      { Name: "given_name", Value: "Test" },
      { Name: "family_name", Value: "User" },
    ],
  });

  try {
    const result = await cognito.send(command);
    console.log("Signup successful:", result);
  } catch (error) {
    console.error("Signup failed:", error);
  }
}

testSignup();
