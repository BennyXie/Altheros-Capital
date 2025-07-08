import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Container, Title, Text, Paper, Button, Stack, Group } from '@mantine/core';
import { IconUserPlus, IconLogin } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { slideInLeft } from '../animations/variants';
import classes from './SignupPage.module.css';

/**
 * Signup Page Component
 * 
 * OAuth-integrated signup page using Cognito Hosted UI
 */
const SignupPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, signup, login } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSignup = () => {
    signup(); // This will redirect to Cognito Hosted UI via Amplify
  };

  const handleLogin = () => {
    login(); // This will redirect to Cognito Hosted UI via Amplify
  };

  return (
    <div className={classes.signupPage}>
      <Container className={classes.signupContainer}>
        <motion.div
          variants={slideInLeft}
          initial="initial"
          animate="animate"
        >
          <Title order={1} className={classes.title}>
            Get Started
          </Title>
          <Text className={classes.subtitle}>
            Create your account to begin your healthcare journey
          </Text>
        </motion.div>

        <motion.div
          variants={slideInLeft}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          <Paper className={classes.signupPaper}>
            <Stack className={classes.form}>
              <Stack gap="md">
                <Button
                  size="lg"
                  fullWidth
                  className={classes.submitButton}
                  leftSection={<IconUserPlus size={20} />}
                  onClick={handleSignup}
                >
                  Create Account
                </Button>

                <Button
                  size="lg"
                  fullWidth
                  variant="outline"
                  leftSection={<IconLogin size={20} />}
                  onClick={handleLogin}
                >
                  Already have an account? Sign In
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

export default SignupPage;
