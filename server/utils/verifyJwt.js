require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

const region = process.env.COGNITO_REGION;
const userPoolId = process.env.COGNITO_USER_POOL_ID;

const client = jwksClient({
  jwksUri: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`,
});

// Get the public key for the given JWT header
function getSigningKey(kid) {
  return new Promise((resolve, reject) => {
    client.getSigningKey(kid, (err, key) => {
      if (err) return reject(err);
      resolve(key.getPublicKey());
    });
  });
}

// Verify and decode the JWT
async function verifyJwt(token) {
  const decodedHeader = jwt.decode(token, { complete: true });
  if (!decodedHeader) throw new Error("Invalid JWT format");

  const kid = decodedHeader.header.kid;
  const key = await getSigningKey(kid);

  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      key,
      {
        algorithms: ["RS256"],
        issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
      },
      (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      }
    );
  });
}

module.exports = verifyJwt;
