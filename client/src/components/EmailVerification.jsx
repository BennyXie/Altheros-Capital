/**
 * Email Verification Component
 * 
 * Component for handling email verification after user signup.
 * Allows users to enter verification code and resend if needed.
 */

import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Stack, 
  Title, 
  Text, 
  TextInput, 
  Button, 
  Group,
  Alert 
} from '@mantine/core';
import { motion } from 'framer-motion';
import { IconCheck, IconMail, IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import { notifications } from '@mantine/notifications';

const EmailVerification = ({ email, onVerificationSuccess }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { confirmSignup, resendConfirmationCode } = useAuth();

  const handleVerification = async (e) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      notifications.show({
        title: 'Verification Required',
        message: 'Please enter the verification code',
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await confirmSignup(email, verificationCode);
      
      notifications.show({
        title: 'Email Verified!',
        message: 'Your account has been successfully verified. You can now sign in.',
        color: 'green',
        icon: <IconCheck size={16} />
      });
      
      onVerificationSuccess();
    } catch (error) {
      console.error('Verification error:', error);
      notifications.show({
        title: 'Verification Failed',
        message: error.message || 'Invalid verification code. Please try again.',
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    
    try {
      await resendConfirmationCode(email);
      
      notifications.show({
        title: 'Code Sent',
        message: 'A new verification code has been sent to your email',
        color: 'blue',
        icon: <IconMail size={16} />
      });
    } catch (error) {
      console.error('Resend error:', error);
      notifications.show({
        title: 'Resend Failed',
        message: error.message || 'Failed to resend verification code',
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
    } finally {
      setResendLoading(false);
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
              <IconMail size={48} color="var(--color-primary)" />
              <Title order={2} ta="center">
                Verify Your Email
              </Title>
              <Text ta="center" c="dimmed">
                We've sent a verification code to <strong>{email}</strong>
              </Text>
            </Stack>

            <Alert 
              icon={<IconAlertCircle size={16} />} 
              title="Check your email"
              color="blue"
            >
              Please check your email inbox (and spam folder) for the verification code.
            </Alert>

            <form onSubmit={handleVerification}>
              <Stack gap="md">
                <TextInput
                  label="Verification Code"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  size="lg"
                  required
                  maxLength={6}
                  style={{ textAlign: 'center' }}
                />

                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  style={{ background: 'var(--color-primary)' }}
                >
                  Verify Email
                </Button>
              </Stack>
            </form>

            <Group justify="center">
              <Text size="sm" c="dimmed">
                Didn't receive the code?
              </Text>
              <Button
                variant="subtle"
                size="sm"
                onClick={handleResendCode}
                loading={resendLoading}
              >
                Resend Code
              </Button>
            </Group>
          </Stack>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default EmailVerification;
