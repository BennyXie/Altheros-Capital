import { motion } from 'framer-motion';
import { Container, Title, Text, Paper, TextInput, PasswordInput, Button, Stack, Divider } from '@mantine/core';
import { IconBrandGoogle } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { slideInLeft, staggerContainer } from '../animations/variants';

/**
 * Signup Page Component
 * 
 * Simple signup page for the "Get Started" button.
 * Uses theme.js for styling consistency.
 */
const SignupPage = () => {
  const handleSignup = (event) => {
    event.preventDefault();
    console.log('Signup attempted');
  };

  const handleGoogleSignup = () => {
    console.log('Google signup attempted');
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      style={{ 
        minHeight: '100vh',
        backgroundColor: 'var(--mantine-color-backgrounds-primary, #faf8f5)',
        paddingTop: '2rem'
      }}
    >
      <Container size="sm" py={80}>
        <motion.div
          variants={slideInLeft}
          initial="initial"
          animate="animate"
        >
          <Title order={1} ta="center" mb="lg" style={{ color: 'var(--mantine-color-brand-6)' }}>
            Get Started
          </Title>
          <Text size="lg" ta="center" c="dimmed" mb={50}>
            Create your account to begin
          </Text>
        </motion.div>

        <motion.div
          variants={slideInLeft}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          <Paper shadow="lg" p={40} radius="lg" style={{ border: '1px solid var(--mantine-color-gray-2)' }}>
            <form onSubmit={handleSignup}>
              <Stack gap="lg">
                {/* Google Sign Up Button */}
                <Button
                  variant="outline"
                  leftSection={<IconBrandGoogle size={18} />}
                  onClick={handleGoogleSignup}
                  size="md"
                  style={{ 
                    borderColor: 'var(--mantine-color-gray-2)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Sign up with Google
                </Button>

                <Divider label="Or sign up with email" labelPosition="center" />

                <TextInput
                  label="Full Name"
                  placeholder="Your full name"
                  size="md"
                  required
                />
                
                <TextInput
                  label="Email address"
                  placeholder="your@email.com"
                  type="email"
                  size="md"
                  required
                />

                <PasswordInput
                  label="Password"
                  placeholder="Create a password"
                  size="md"
                  required
                />

                <Button
                  type="submit"
                  size="lg"
                  color="brand"
                  fullWidth
                  style={{ 
                    background: 'var(--mantine-color-brand-6)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Create Account
                </Button>

                <Text ta="center" size="sm" c="dimmed">
                  Already have an account?{' '}
                  <Text component={Link} to="/login" size="sm" c="brand.6" fw={600} style={{ textDecoration: 'none' }}>
                    Sign in
                  </Text>
                </Text>
              </Stack>
            </form>
          </Paper>
        </motion.div>
      </Container>
    </motion.div>
  );
};

export default SignupPage;
