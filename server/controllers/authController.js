const { signUpUser } = require("../services/cognitoService");

async function testCognito(req, res) {
  try {
    const response = await signUpUser({
      username: "testuing@example.com",
      password: "TestPass123!",
      givenName: "John",
      familyName: "Smith",
    });
    res.json({ message: "Signup request sent", response });
  } catch (err) {
    console.error("Cognito error:", err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { testCognito };
