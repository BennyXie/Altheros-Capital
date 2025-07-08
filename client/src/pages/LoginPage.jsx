import { useEffect } from 'react';
import { Container, Title, Button, Stack, Paper, Text, Group } from '@mantine/core';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconLogin, IconUserPlus } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import classes from './LoginPage.module.css';

/**
 * Login Page Component
 * 
 * OAuth-integrated login page using Cognito Hosted UI
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, signup } = useAuth();

  // Get return URL from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLogin = () => {
    login(); // This will redirect to Cognito Hosted UI via Amplify
  };

  const handleSignup = () => {
    signup(); // This will redirect to Cognito Hosted UI via Amplify
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
            <Stack className={classes.form}>
              <div>
                <Title order={2} className={classes.title}>Welcome to Altheros Capital</Title>
                <Text className={classes.subtitle} ta="center">
                  Secure authentication powered by AWS Cognito
                </Text>
              </div>

              <Stack gap="md">
                <Button 
                  size="lg"
                  fullWidth
                  className={classes.submitButton}
                  leftSection={<IconLogin size={20} />}
                  onClick={handleLogin}
                >
                  Sign In
                </Button>

                <Button 
                  size="lg"
                  fullWidth
                  variant="outline"
                  leftSection={<IconUserPlus size={20} />}
                  onClick={handleSignup}
                >
                  Create Account
                </Button>
              </Stack>

              <Group justify="center">
                <Link to="/" style={{ textDecoration: 'none' }}>
                  <Text size="sm" c="dimmed">
                    ← Back to home
                  </Text>
                </Link>
              </Group>
            </Stack>
          </Paper>
        </motion.div>
      </Container>
    </div>
  );
};

export default LoginPage;
