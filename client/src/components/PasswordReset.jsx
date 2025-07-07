/**
 * Password Reset Component
 * 
 * Component for handling password reset flow with Cognito
 */

import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Stack, 
  Title, 
  Text, 
  TextInput, 
  PasswordInput,
  Button, 
  Group,
  Alert,
  Stepper
} from '@mantine/core';
import { motion } from 'framer-motion';
import { IconCheck, IconAlertCircle, IconLock, IconMail } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../context/AuthContext';

const PasswordReset = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { forgotPassword, confirmForgotPassword } = useAuth();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      notifications.show({
        title: 'Email Required',
        message: 'Please enter your email address',
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await forgotPassword(email);
      
      notifications.show({
        title: 'Reset Code Sent',
        message: 'Please check your email for the password reset code',
        color: 'blue',
        icon: <IconMail size={16} />
      });
      
      setActiveStep(1);
    } catch (error) {
      console.error('Password reset request error:', error);
      notifications.show({
        title: 'Reset Failed',
        message: error.message || 'Failed to send reset code',
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    
    if (!verificationCode.trim() || !newPassword.trim()) {
      notifications.show({
        title: 'Missing Information',
        message: 'Please enter both verification code and new password',
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await confirmForgotPassword(email, verificationCode, newPassword);
      
      notifications.show({
        title: 'Password Reset Successful',
        message: 'Your password has been successfully reset. You can now sign in.',
        color: 'green',
        icon: <IconCheck size={16} />
      });
      
      setActiveStep(2);
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      notifications.show({
        title: 'Reset Failed',
        message: error.message || 'Failed to reset password',
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size="sm" py={80}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper shadow="lg" p="xl" radius="md">
          <Stack gap="lg">
            <Stack align="center" gap="sm">
              <IconLock size={48} color="var(--color-primary)" />
              <Title order={2} ta="center">
                Reset Your Password
              </Title>
              <Text ta="center" c="dimmed">
                Follow the steps below to reset your password
              </Text>
            </Stack>

            <Stepper active={activeStep} breakpoint="sm">
              <Stepper.Step 
                label="Request Reset" 
                description="Enter your email"
                icon={<IconMail size={18} />}
              >
                <Stack gap="md" mt="md">
                  <Text size="sm" c="dimmed">
                    Enter the email address associated with your account and we'll send you a password reset code.
                  </Text>
                  
                  <form onSubmit={handleRequestReset}>
                    <Stack gap="md">
                      <TextInput
                        label="Email Address"
                        placeholder="your@email.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      
                      <Button 
                        type="submit" 
                        fullWidth
                        loading={isLoading}
                        style={{ background: 'var(--color-primary)' }}
                      >
                        Send Reset Code
                      </Button>
                    </Stack>
                  </form>
                </Stack>
              </Stepper.Step>

              <Stepper.Step 
                label="Verify Code" 
                description="Enter code and new password"
                icon={<IconCheck size={18} />}
              >
                <Stack gap="md" mt="md">
                  <Alert 
                    icon={<IconMail size={16} />}
                    title="Check your email"
                    color="blue"
                  >
                    We've sent a verification code to {email}
                  </Alert>
                  
                  <form onSubmit={handleConfirmReset}>
                    <Stack gap="md">
                      <TextInput
                        label="Verification Code"
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        required
                      />
                      
                      <PasswordInput
                        label="New Password"
                        placeholder="Enter your new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      
                      <Button 
                        type="submit" 
                        fullWidth
                        loading={isLoading}
                        style={{ background: 'var(--color-primary)' }}
                      >
                        Reset Password
                      </Button>
                    </Stack>
                  </form>
                </Stack>
              </Stepper.Step>

              <Stepper.Step 
                label="Complete" 
                description="Password reset successful"
                icon={<IconCheck size={18} />}
              >
                <Stack gap="md" mt="md" align="center">
                  <IconCheck size={64} color="green" />
                  <Text ta="center" fw={500}>
                    Password Reset Successful!
                  </Text>
                  <Text ta="center" c="dimmed" size="sm">
                    Your password has been successfully reset. You can now sign in with your new password.
                  </Text>
                  
                  <Button 
                    component={Link}
                    to="/login"
                    fullWidth
                    style={{ background: 'var(--color-primary)' }}
                  >
                    Go to Sign In
                  </Button>
                </Stack>
              </Stepper.Step>
            </Stepper>

            <Group justify="center" mt="md">
              <Text size="sm" c="dimmed">
                Remember your password?{' '}
                <Text component={Link} to="/login" c="var(--color-primary)" fw={600} style={{ textDecoration: 'none' }}>
                  Sign in
                </Text>
              </Text>
            </Group>
          </Stack>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default PasswordReset;
