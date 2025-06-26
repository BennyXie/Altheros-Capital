import { Container, Title, TextInput, PasswordInput, Button, Stack, Paper, Text, Group } from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import classes from './LoginPage.module.css';

/**
 * Login Page Component
 * 
 * Simple login page with email and password fields
 */
const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // For now, just navigate to dashboard without authentication
    navigate('/dashboard');
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
                  <Title order={2} className={classes.title}>Welcome back</Title>
                  <Text className={classes.subtitle}>
                    Don't have an account?{' '}
                    <Link to="/signup" className={classes.signupLinkText}>
                      Create account
                    </Link>
                  </Text>
                </div>

                <Stack gap="md">
                  <TextInput
                    label="Email"
                    placeholder="your@email.com"
                    required
                  />
                  <PasswordInput
                    label="Password"
                    placeholder="Your password"
                    required
                  />
                </Stack>

                <Button type="submit" className={classes.submitButton} fullWidth>
                  Sign in
                </Button>

                <Group justify="center">
                  <Link to="/" style={{ textDecoration: 'none' }}>
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
