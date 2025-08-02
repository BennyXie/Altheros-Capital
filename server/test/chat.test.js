// jest.mock("../middleware/verifyToken", () => {
//   return jest.fn((req, res, next) => next());
// });

jest.mock("../services/chatService", () => {
  const originalModule = jest.requireActual("../services/chatService");
  return {
    ...originalModule,
    // verifyChatMembership: jest.fn((req, res, next) => next()),
    // verifyMessageOwnership: jest.fn((req, res, next) => next()),
  };
});

const request = require("supertest");
const app = require("../index");
const { getSecretHash } = require("../utils/hashUtils");
require("dotenv").config();
const totp = require("otplib");
const { LocalStorage } = require("node-localstorage");
const verifyJwt = require("../utils/verifyJwt");

const {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  AdminRespondToAuthChallengeCommand,
  AdminDeleteUserCommand,
  AssociateSoftwareTokenCommand,
  VerifySoftwareTokenCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const username = "john.doe@example.com";
const newPassword = "Password1234!"; // new permanent password
const localStorage = new LocalStorage("./test/storage");
let authenticationResult;
const chatId = "5a36fccc-4c2a-4367-8455-682836bd9ad0";
const messageId = "7f54ffd1-8c52-4a8c-9ac1-82714d6cea4e";

async function deleteUserFromCognito() {
  const command = new AdminDeleteUserCommand({
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    Username: username,
  });
  try {
    await client.send(command);
    console.log("User deleted successfully.");
  } catch (error) {
    console.error("Error deleting user:", error);
  }
}

async function authenticateUser() {
  const authCommand = new AdminInitiateAuthCommand({
    AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    ClientId: process.env.COGNITO_CLIENT_ID,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: newPassword,
      SECRET_HASH: getSecretHash(
        username,
        process.env.COGNITO_CLIENT_ID,
        process.env.COGNITO_CLIENT_SECRET
      ),
    },
  });
  const authResponse = await client.send(authCommand);

  if (authResponse.ChallengeName === "NEW_PASSWORD_REQUIRED") {
    // Step 2: Respond to challenge
    const challengeCommand = new AdminRespondToAuthChallengeCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      ChallengeResponses: {
        USERNAME: username,
        NEW_PASSWORD: newPassword,
        SECRET_HASH: getSecretHash(
          username,
          process.env.COGNITO_CLIENT_ID,
          process.env.COGNITO_CLIENT_SECRET
        ),
      },
      Session: authResponse.Session,
    });
    await client.send(challengeCommand);
  } else {
    return authResponse;
  }
}

async function completeMFA(authResp) {
  const username = authResp.ChallengeParameters?.USER_ID_FOR_SRP;
  let final;

  if (authResp.ChallengeName === "MFA_SETUP") {
    const session = authResp.Session;

    const AssociateSoftwareTokenResp = await client.send(
      new AssociateSoftwareTokenCommand({ Session: session })
    );

    localStorage.setItem(
      "AssociateSoftwareTokenResp",
      JSON.stringify(AssociateSoftwareTokenResp)
    );

    const token = totp.authenticator.generate(
      AssociateSoftwareTokenResp.SecretCode
    );

    const verifyResp = await client.send(
      new VerifySoftwareTokenCommand({
        Session: AssociateSoftwareTokenResp.Session,
        UserCode: token,
        FriendlyDeviceName: "TestDevice",
      })
    );

    if (verifyResp.Session) {
      final = await client.send(
        new AdminRespondToAuthChallengeCommand({
          ClientId: process.env.COGNITO_CLIENT_ID,
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
          ChallengeName: "SOFTWARE_TOKEN_MFA", // not MFA_SETUP
          ChallengeResponses: {
            USERNAME: username,
            SECRET_HASH: getSecretHash(
              username,
              process.env.COGNITO_CLIENT_ID,
              process.env.COGNITO_CLIENT_SECRET
            ),
            SOFTWARE_TOKEN_MFA_CODE: token,
          },
          Session: verifyResp.Session,
        })
      );
    }
  } else if (authResp.ChallengeName === "SOFTWARE_TOKEN_MFA") {
    const session = authResp.Session;

    const token = totp.authenticator.generate(
      JSON.parse(localStorage.getItem("AssociateSoftwareTokenResp")).SecretCode
    );

    final = await client.send(
      new AdminRespondToAuthChallengeCommand({
        ClientId: process.env.COGNITO_CLIENT_ID,
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        ChallengeName: "SOFTWARE_TOKEN_MFA",
        ChallengeResponses: {
          USERNAME: username,
          SECRET_HASH: getSecretHash(
            username,
            process.env.COGNITO_CLIENT_ID,
            process.env.COGNITO_CLIENT_SECRET
          ),
          SOFTWARE_TOKEN_MFA_CODE: token,
        },
        Session: session,
      })
    );
  }

  localStorage.setItem(
    "Current valid auth result",
    JSON.stringify(final.AuthenticationResult)
  );

  return final.AuthenticationResult;
}

async function isTokenExpired(token) {
  const currentTime = Math.floor(Date.now() / 1000); // Unix time in seconds
  return (await verifyJwt(token)).exp < currentTime;
}

beforeAll(async () => {
  //   await deleteUser();
  const authRes = await authenticateUser();
  //   if (
  //     localStorage.getItem("Current valid auth result") &&
  //     !(await isTokenExpired(
  //       JSON.parse(localStorage.getItem("Current valid auth result")).IdToken
  //     ))
  //   ) {
  //     authenticationResult = JSON.parse(
  //       localStorage.getItem("Current valid auth result")
  //     );
  //     return;
  //   }
  authenticationResult = await completeMFA(authRes);
});

describe("POST", () => {
  const expectedStatus = 201;

  test("create chat", async () => {
    const response = await request(app)
      .post("/chat/")
      .set("Authorization", `Bearer ${authenticationResult.IdToken}`)
      .send({ participants: ["4e288b22-76c3-46fc-a6e2-b2dc1d095bf7"] });
    expect(response.statusCode).toBe(expectedStatus);
  });

    test("create message", async () => {
      const response = await request(app)
        .post(`/chat/${chatId}/message`)
        .set("Authorization", `Bearer ${authenticationResult.IdToken}`)
        .attach(
          `file`,
          "./test/images/960px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.webp"
        )
        .field({
          chatId: chatId,
          sentAt: new Date().toISOString(),
        });
      expect(response.statusCode).toBe(expectedStatus);
    });

  test("create message", async () => {
    const response = await request(app)
      .post(`/chat/${chatId}/message`)
      .set("Authorization", `Bearer ${authenticationResult.IdToken}`)
      .field({
        message: "hi",
        sentAt: new Date().toISOString(),
      });
    expect(response.statusCode).toBe(expectedStatus);
  });
});

describe("GET", () => {
  const expectedStatus = 200;

  test("get chat messages", async () => {
    const response = await request(app)
      .get(`/chat/${chatId}/messages`)
      .set("Authorization", `Bearer ${authenticationResult.IdToken}`);
    expect(response.statusCode).toBe(expectedStatus);
  });

  test("get chats", async () => {
    const response = await request(app)
      .get(`/chat`)
      .set("Authorization", `Bearer ${authenticationResult.IdToken}`);
    expect(response.statusCode).toBe(expectedStatus);
  });
});

/* describe("DELETE", () => {
  const expectedStatus = 204;

  test("delete chat message", async () => {
    const response = await request(app)
      .delete(`/chat/${chatId}/message/${messageId}`)
      .set("Authorization", `Bearer ${authenticationResult.IdToken}`)
      .send({
        deletedAt: new Date().toISOString(),
      });
    expect(response.statusCode).toBe(expectedStatus);
  });

    test("delete chats", async () => {
      const response = await request(app)
        .delete(`/chat`)
        .set("Authorization", `Bearer ${authenticationResult.IdToken}`)
        .send({
          sentAt: new Date().toISOString(),
        });
      expect(response.statusCode).toBe(expectedStatus);
    });
});
 */

describe("PATCH", () => {
  const expectedStatus = 204;

  test("soft delete chat message", async () => {
    const response = await request(app)
      .patch(`/chat/${chatId}/message/${messageId}`)
      .set("Authorization", `Bearer ${authenticationResult.IdToken}`)
      .send({
        deletedAt: new Date().toISOString(),
      });
    expect(response.statusCode).toBe(expectedStatus);
  });

    test("leave chat", async () => {
      const response = await request(app)
        .patch(`/chat/${chatId}/participants/me`)
        .set("Authorization", `Bearer ${authenticationResult.IdToken}`)
        .send({
          leftAt: new Date().toISOString(),
        });
      expect(response.statusCode).toBe(expectedStatus);
    });
});
