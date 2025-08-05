const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const { CognitoIdentityProviderClient, GetUserCommand } = require("@aws-sdk/client-cognito-identity-provider");

const client = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`
});

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

function getKey(header, callback){
  client.getSigningKey(header.kid, function(err, key) {
    if (err) {
      console.error('Error getting signing key:', err);
      return callback(err);
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header is missing or invalid.' });
  }
  const token = authHeader.split(' ')[1];

  jwt.verify(token, getKey, { algorithms: ['RS256'] }, async (err, decoded) => {
    if (err) {
      console.error("JWT verification error:", err);
      return res.status(401).json({ error: "Invalid token." });
    }

    // Attach the entire decoded token to the request for downstream use
    req.user = decoded;
    console.log("Decoded token:", decoded);

    // Add name property to req.user
    if (decoded.given_name && decoded.family_name) {
      req.user.first_name = decoded.given_name || "John";
      req.user.last_name = decoded.family_name || "D";
    } else if (decoded.given_name) {
      req.user.name = decoded.given_name;
    } else if (decoded.family_name) {
      req.user.name = decoded.family_name;
    } else {
      req.user.name = decoded.email || decoded.sub; // Fallback to email or sub
    } // ← log this
    console.log("req.user after setting:", req.user); // ← log this

    // Specifically extract the username and email for convenience
    req.user.username = decoded.sub;

    // Fallback: If email is not in the decoded token (e.g., it's an Access Token),
    // fetch user attributes from Cognito using the Access Token.
    if (!decoded.email) {
      try {
        const getUserCommand = new GetUserCommand({ AccessToken: token });
        const userAttributes = await cognitoClient.send(getUserCommand);
        const emailAttribute = userAttributes.UserAttributes.find(
          (attr) => attr.Name === "email"
        );
        if (emailAttribute) {
          req.user.email = emailAttribute.Value;
        } else {
          console.warn("Email attribute not found in Cognito user attributes.");
        }
      } catch (cognitoError) {
        console.error(
          "Error fetching user attributes from Cognito:",
          cognitoError
        );
        // Optionally, handle this error more gracefully, e.g., by returning a 401
      }
    } else {
      req.user.email = decoded.email;
    }

    next();
  });
};

module.exports = verifyToken;
