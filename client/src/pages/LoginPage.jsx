import { useEffect } from 'react';
import { Container, Title, Button, Stack, Paper, Text, Group, Badge } from '@mantine/core';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconLogin, IconUserPlus, IconUser, IconStethoscope } from '@tabler/icons-react';
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
  const [searchParams] = useSearchParams();
  const { isAuthenticated, login, signup } = useAuth();

  // Get role from URL parameters
  const role = searchParams.get('role') || 'patient';
  
  // Get return URL from location state or default based on role
  const defaultPath = role === 'provider' ? '/provider-complete-profile' : '/dashboard';
  const from = location.state?.from?.pathname || defaultPath;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLogin = () => {
    login(role); // Pass role to login function
  };

  const handleSignup = () => {
    signup(role); // Pass role to signup function
  };

  // Role-specific configurations
  const roleConfig = {
    patient: {
      icon: <IconUser size={24} />,
      title: 'Patient Sign In',
      subtitle: 'Access your health dashboard and connect with providers',
      badgeColor: 'blue'
    },
    provider: {
      icon: <IconStethoscope size={24} />,
      title: 'Provider Sign In',
      subtitle: 'Manage your practice and connect with patients',
      badgeColor: 'green'
    }
  };

  const currentConfig = roleConfig[role] || roleConfig.patient;

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
                
                <Title order={2} className={classes.title}>{currentConfig.title}</Title>
                <Text className={classes.subtitle} ta="center">
                  {currentConfig.subtitle}
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

export default LoginPage;
