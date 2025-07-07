import { Amplify } from "aws-amplify";
import { signIn, signOut, fetchAuthSession } from "aws-amplify/auth";

Amplify.configure({
  Auth: {
    Cognito: {
      region: "us-east-2",
      userPoolId: "us-east-2_XXXXXXXXX",
      userPoolWebClientId: "XXXXXXXXXXXXXXXXXXXX",
      loginWith: { username: "true" },
    },
  },
});

export async function signInAndStoreToken(email, password) {
  await signIn({ username: email, password });
  const { tokens } = await fetchAuthSession();
  const idToken = tokens?.idToken?.toString();
  if (!idToken) throw new Error("No ID token found after sign in");
  console.log("ID Token (JWT):", idToken);

  localStorage.setItem("id_token", idToken);
  return idToken;
}

export function getIdToken() {
  return localStorage.getItem("id_token");
}

export { signIn, fetchAuthSession, signOut };
