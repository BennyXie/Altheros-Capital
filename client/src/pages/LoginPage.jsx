import {
  Container,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Paper,
  Text,
  Group,
} from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import classes from "./LoginPage.module.css";
import { useState } from "react";
import { signIn, fetchAuthSession } from "../amplifyAuthConfig";

/**
 * Login Page Component
 *
 * Simple login page with email and password fields
 */
const LoginPage = () => {
  const navigate = useNavigate();

  // const handleLogin = (e) => {
  //   e.preventDefault();
  //   // For now, just navigate to dashboard without authentication
  //   navigate("/dashboard");
  // };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Amplify modular sign in
      await signIn({ username: email, password });

      // Get tokens from session
      const { tokens } = await fetchAuthSession();
      const idToken = tokens?.idToken?.toString();

      if (!idToken) throw new Error("No ID token returned");

      // Store token locally
      localStorage.setItem("id_token", idToken);

      // Redirect on success
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.loginPage}>
      <Container className={classes.loginContainer}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper className={classes.loginPaper}>
            <form onSubmit={handleLogin}>
              <Stack className={classes.form}>
                <div>
                  <Title order={2} className={classes.title}>
                    Welcome back
                  </Title>
                  <Text className={classes.subtitle}>
                    Don't have an account?{" "}
                    <Link to="/signup" className={classes.signupLinkText}>
                      Create account
                    </Link>
                  </Text>
                </div>

                {error && (
                  <Text c="red" size="sm">
                    {error}
                  </Text>
                )}

                <Stack gap="md">
                  <TextInput
                    label="Email"
                    placeholder="your@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <PasswordInput
                    label="Password"
                    placeholder="Your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Stack>

                <Button
                  type="submit"
                  className={classes.submitButton}
                  fullWidth
                  loading={loading}
                >
                  Sign in
                </Button>

                <Group justify="center">
                  <Link to="/" style={{ textDecoration: "none" }}>
                    <Text size="sm" c="dimmed">
                      ← Back to home
                    </Text>
                  </Link>
                </Group>
              </Stack>
            </form>
          </Paper>
        </motion.div>
      </Container>
    </div>
  );
};

export default LoginPage;
