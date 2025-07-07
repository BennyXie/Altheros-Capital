import { useState } from 'react';
import { Container, Title, TextInput, PasswordInput, Button, Stack, Paper, Text, Group, Alert } from '@mantine/core';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../context/AuthContext';
import CognitoConfigNotice from '../components/CognitoConfigNotice';
import cognitoService from '../services/cognitoService';
import classes from './LoginPage.module.css';

/**
 * Login Page Component
 * 
 * Cognito-integrated login page with email and password authentication
 */
const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error } = useAuth();

  // Get return URL from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      notifications.show({
        title: 'Missing Information',
        message: 'Please enter both email and password',
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await login(formData.email, formData.password);
      
      notifications.show({
        title: 'Welcome back!',
        message: 'You have successfully signed in',
        color: 'green',
        icon: <IconCheck size={16} />
      });
      
      // Navigate to intended destination or dashboard
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      // Error is handled by the auth context and displayed below
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={classes.loginPage}>
      {!cognitoService.isConfigured() && <CognitoConfigNotice />}
      
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

                {error && (
                  <Alert 
                    color="red" 
                    icon={<IconAlertCircle size={16} />}
                    title="Login Failed"
                  >
                    {error}
                  </Alert>
                )}

                <Stack gap="md">
                  <TextInput
                    label="Email"
                    placeholder="your@email.com"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                  <PasswordInput
                    label="Password"
                    placeholder="Your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                  />
                </Stack>

                <Button 
                  type="submit" 
                  className={classes.submitButton} 
                  fullWidth
                  loading={isLoading}
                  disabled={!cognitoService.isConfigured()}
                >
                  Sign in
                </Button>

                <Group justify="space-between">
                  <Link to="/" style={{ textDecoration: 'none' }}>
                    <Text size="sm" c="dimmed">
                      ← Back to home
                    </Text>
                  </Link>
                  
                  <Link to="/reset-password" style={{ textDecoration: 'none' }}>
                    <Text size="sm" c="var(--color-primary)" fw={500}>
                      Forgot password?
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
