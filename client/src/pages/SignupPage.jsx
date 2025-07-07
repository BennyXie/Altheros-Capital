import { useState } from 'react';
import { motion } from 'framer-motion';
import { Container, Title, Text, Paper, TextInput, PasswordInput, Button, Stack, Divider, Alert } from '@mantine/core';
import { IconBrandGoogle, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../context/AuthContext';
import EmailVerification from '../components/EmailVerification';
import CognitoConfigNotice from '../components/CognitoConfigNotice';
import cognitoService from '../services/cognitoService';
import { slideInLeft } from '../animations/variants';
import classes from './SignupPage.module.css';

/**
 * Signup Page Component
 * 
 * Cognito-integrated signup page with email verification flow
 */
const SignupPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  
  const navigate = useNavigate();
  const { signup, error } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.password) {
      notifications.show({
        title: 'Missing Information',
        message: 'Please fill in all required fields',
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
      return;
    }

    // Basic name validation - split into first and last name
    const nameParts = formData.fullName.trim().split(' ');
    if (nameParts.length < 2) {
      notifications.show({
        title: 'Invalid Name',
        message: 'Please enter both first and last name',
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
      return;
    }

    const givenName = nameParts[0];
    const familyName = nameParts.slice(1).join(' ');

    setIsLoading(true);
    
    try {
      await signup(formData.email, formData.password, givenName, familyName);
      
      notifications.show({
        title: 'Account Created!',
        message: 'Please check your email for a verification code',
        color: 'blue',
        icon: <IconCheck size={16} />
      });
      
      setSignupEmail(formData.email);
      setShowVerification(true);
    } catch (error) {
      console.error('Signup error:', error);
      // Error is handled by the auth context and displayed below
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // TODO: Implement Google OAuth with Cognito
    notifications.show({
      title: 'Coming Soon',
      message: 'Google signup will be available soon',
      color: 'blue'
    });
  };

  const handleVerificationSuccess = () => {
    setShowVerification(false);
    navigate('/login', { 
      state: { 
        message: 'Email verified successfully! You can now sign in.' 
      } 
    });
  };

  // Show email verification component after successful signup
  if (showVerification) {
    return (
      <EmailVerification 
        email={signupEmail}
        onVerificationSuccess={handleVerificationSuccess}
      />
    );
  }

  return (
    <div className={classes.signupPage}>
      {!cognitoService.isConfigured() && <CognitoConfigNotice />}
      
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
            Create your account to begin
          </Text>
        </motion.div>

        <motion.div
          variants={slideInLeft}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          <Paper className={classes.signupPaper}>
            <form onSubmit={handleSignup}>
              <Stack className={classes.form}>
                {error && (
                  <Alert 
                    color="red" 
                    icon={<IconAlertCircle size={16} />}
                    title="Signup Failed"
                  >
                    {error}
                  </Alert>
                )}

                {/* Google Sign Up Button */}
                <Button
                  variant="outline"
                  leftSection={<IconBrandGoogle size={18} />}
                  onClick={handleGoogleSignup}
                  size="md"
                  className={classes.googleButton}
                  disabled={!cognitoService.isConfigured()}
                >
                  Sign up with Google
                </Button>

                <Divider label="Or sign up with email" labelPosition="center" className={classes.divider} />

                <TextInput
                  label="Full Name"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  size="md"
                  required
                />
                
                <TextInput
                  label="Email address"
                  placeholder="your@email.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  size="md"
                  required
                />

                <PasswordInput
                  label="Password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  size="md"
                  required
                />

                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  className={classes.submitButton}
                  loading={isLoading}
                  disabled={!cognitoService.isConfigured()}
                >
                  Create Account
                </Button>

                <Text className={classes.loginLink}>
                  Already have an account?{' '}
                  <Text component={Link} to="/login" className={classes.loginLinkText}>
                    Sign in
                  </Text>
                </Text>
              </Stack>
            </form>
          </Paper>
        </motion.div>
      </Container>
    </div>
  );
};

export default SignupPage;
