import { Container, Title, TextInput, PasswordInput, Button, Stack, Paper, Text, Group } from '@mantine/core';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Login Page Component
 * 
 * Simple login page with email and password fields
 */
const LoginPage = () => {
  return (
    <Container size="sm" py={80}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper shadow="md" p={50} radius="md" withBorder>
          <Stack gap="lg">
            <div style={{ textAlign: 'center' }}>
              <Title order={2}>Welcome back</Title>
              <Text c="dimmed" size="sm" mt={5}>
                Don't have an account?{' '}
                <Link to="/signup" style={{ textDecoration: 'none' }}>
                  <Text component="span" c="blue" fw={500}>
                    Create account
                  </Text>
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

            <Button fullWidth>
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
        </Paper>
      </motion.div>
    </Container>
  );
};

export default LoginPage;
