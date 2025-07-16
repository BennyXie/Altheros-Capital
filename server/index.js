// imports
// define where to load environment variables
require('dotenv').config({ path: './server/.env' }); //
const express = require("express"); //
const cors = require("cors"); //
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const fetch = require('node-fetch'); // Required to fetch JWKS

// AWS SDK for Cognito (install if not already present: npm install aws-sdk)
const AWS = require('aws-sdk');

// using express
const app = express(); //

// define port, stored in server/.env
const PORT = process.env.PORT || 5000; //

// Initializing the app
app.use(cors()); //
app.use(express.json()); //

// Configure AWS SDK
AWS.config.update({
  region: process.env.COGNITO_REGION,
  // You might set credentials here if not using IAM roles or environment variables
  // accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  // secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

// Cognito User Pool details
const COGNITO_REGION = process.env.COGNITO_REGION;
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

let pems; // To store public keys for JWT verification

// Function to fetch and cache Cognito's JWKS
const setUp = async () => {
    try {
        const URL = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}/.well-known/jwks.json`;
        console.log(`Fetching JWKS from: ${URL}`);
        const response = await fetch(URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        pems = {};
        for (let i = 0; i < data.keys.length; i++) {
            const keyId = data.keys[i].kid;
            const modulus = data.keys[i].n;
            const exponent = data.keys[i].e;
            const keyType = data.keys[i].kty;
            const jwk = { kty: keyType, n: modulus, e: exponent, kid: keyId };
            const pem = jwkToPem(jwk);
            pems[keyId] = pem;
        }
        console.log('Cognito JWKS fetched and cached successfully.');
    } catch (error) {
        console.error('Failed to fetch Cognito JWKS:', error);
        // In production, consider graceful degradation or a retry mechanism
        process.exit(1); // Exit if critical setup fails
    }
};

// Middleware to validate JWT token and attach user to req
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expects 'Bearer TOKEN'

    if (token == null) {
      console.warn('Authentication: No token provided');
      return res.status(401).send('Unauthorized: No token provided'); // No token
    }

    const decodedJwt = jwt.decode(token, { complete: true });

    if (!decodedJwt) {
        console.error('Authentication: Not a valid JWT token format');
        return res.status(403).send('Unauthorized: Invalid Token Format');
    }

    const kid = decodedJwt.header.kid;
    const pem = pems[kid];

    if (!pem) {
        console.error('Authentication: Invalid kid - public key not found');
        return res.status(403).send('Unauthorized: Invalid Token KID');
    }

    jwt.verify(token, pem, { algorithms: ['RS256'] }, (err, payload) => {
        if (err) {
            console.error('Authentication: JWT verification failed:', err);
            return res.status(403).send('Unauthorized: Token verification failed');
        }

        // Verify issuer to ensure token is from your Cognito User Pool
        const issuer = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`;
        if (payload.iss !== issuer) {
          console.error('Authentication: Token issuer mismatch');
          return res.status(403).send('Unauthorized: Token issuer mismatch');
        }

        req.user = payload; // Attach user payload (claims) to request
        next();
    });
};

// --- Backend Routes ---

// Public route
app.get("/helloWorld", (req, res) => { //
    res.json({ message: "Hello from Benny!"});
});

// Protected route example
app.get("/api/protected-hello", authenticateToken, (req, res) => {
    const userSub = req.user.sub; // User's unique ID
    const username = req.user['cognito:username']; // User's username
    const userRole = req.user['custom:role']; // Access custom role from the token claims

    res.json({
        message: `Hello ${username}! You accessed a protected route.`,
        yourSub: userSub,
        yourRole: userRole || 'No role assigned yet'
    });
});

// New route to add user to a Cognito group
app.post("/api/auth/add-to-group", authenticateToken, async (req, res) => {
    const { role } = req.body;
    const username = req.user['cognito:username']; // Username from JWT payload

    if (!role || (role !== 'patient' && role !== 'provider')) {
        return res.status(400).json({ message: 'Invalid role provided.' });
    }

    if (!username) {
        return res.status(400).json({ message: 'Username missing from token claims.' });
    }

    const params = {
        GroupName: role === 'patient' ? 'Patients' : 'Providers', // Your Cognito Group Names
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: username
    };

    try {
        // First, remove user from any other roles they might already have
        // This is important if a user can only have one role at a time
        const existingGroups = await cognitoidentityserviceprovider.adminListGroupsForUser({
            UserPoolId: COGNITO_USER_POOL_ID,
            Username: username
        }).promise();

        for (const group of existingGroups.Groups) {
            if (group.GroupName === 'Patients' || group.GroupName === 'Providers') {
                await cognitoidentityserviceprovider.adminRemoveUserFromGroup({
                    GroupName: group.GroupName,
                    UserPoolId: COGNITO_USER_POOL_ID,
                    Username: username
                }).promise();
                console.log(`Removed user ${username} from group ${group.GroupName}`);
            }
        }

        // Then, add the user to the new specified group
        await cognitoidentityserviceprovider.adminAddUserToGroup(params).promise();

        console.log(`User ${username} added to group ${params.GroupName}`);

        // Optionally, update the custom:role attribute in Cognito User Pool
        // This makes it easier for frontend to directly read the role from user attributes
        const updateUserAttributesParams = {
            UserAttributes: [
                {
                    Name: 'custom:role', // Your custom attribute name
                    Value: role
                },
            ],
            UserPoolId: COGNITO_USER_POOL_ID,
            Username: username
        };
        await cognitoidentityserviceprovider.adminUpdateUserAttributes(updateUserAttributesParams).promise();
        console.log(`User ${username} custom:role attribute updated to ${role}`);

        res.status(200).json({ message: `User ${username} successfully assigned to ${params.GroupName} group and role attribute updated.` });
    } catch (error) {
        console.error('Error adding user to group or updating attributes:', error);
        res.status(500).json({ message: 'Failed to assign user to group.', error: error.message });
    }
});


// Start server after fetching JWKS
setUp().then(() => {
    app.listen(PORT, () => { //
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error("Server startup failed:", err);
    process.exit(1);
});