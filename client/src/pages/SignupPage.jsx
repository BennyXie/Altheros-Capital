import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Container, Title, Text, Paper, Button, Stack, Group, Badge } from '@mantine/core';
import { IconUserPlus, IconLogin, IconUser, IconStethoscope } from '@tabler/icons-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const { isAuthenticated, signup, login } = useAuth();

  // Get role from URL parameters
  const role = searchParams.get('role') || 'patient';
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const defaultPath = role === 'provider' ? '/provider-complete-profile' : '/dashboard';
      navigate(defaultPath, { replace: true });
    }
  }, [isAuthenticated, navigate, role]);

  const handleSignup = () => {
    signup(role); // Pass role to signup function
  };

  const handleLogin = () => {
    login(role); // Pass role to login function
  };

  // Role-specific configurations
  const roleConfig = {
    patient: {
      icon: <IconUser size={24} />,
      title: 'Create Patient Account',
      subtitle: 'Join our healthcare platform and find the right care for you',
      badgeColor: 'blue'
    },
    provider: {
      icon: <IconStethoscope size={24} />,
      title: 'Create Provider Account',
      subtitle: 'Join our network of healthcare professionals',
      badgeColor: 'green'
    }
  };

  const currentConfig = roleConfig[role] || roleConfig.patient;

  return (
    <div className={classes.signupPage}>
      <Container className={classes.signupContainer}>
        <motion.div
          variants={slideInLeft}
          initial="initial"
          animate="animate"
        >
          <Group justify="center" mb="md">
            <Badge 
              size="lg" 
              variant="light" 
              color={currentConfig.badgeColor}
              leftSection={currentConfig.icon}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Badge>
          </Group>
          
          <Title order={1} className={classes.title}>
            {currentConfig.title}
          </Title>
          <Text className={classes.subtitle}>
            {currentConfig.subtitle}
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
                <Link to="/auth" style={{ textDecoration: 'none' }}>
                  <Text size="sm" c="dimmed">
                    ← Choose different role
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
