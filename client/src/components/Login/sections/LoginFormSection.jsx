import { motion } from 'framer-motion';
import { Container, Paper, TextInput, PasswordInput, Button, Stack, Text, Divider } from '@mantine/core';
import { IconBrandGoogle } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { slideInRight } from '../../../animations/variants';
import classes from './LoginFormSection.module.css';

/**
 * Login Form Section Component
 * 
 * Login form with email/password fields and social login options.
 */
const LoginFormSection = () => {
  const handleLogin = (event) => {
    event.preventDefault();
    console.log('Login attempted');
  };

  const handleGoogleLogin = () => {
    console.log('Google login attempted');
  };

  return (
    <section className={classes.formSection}>
      <Container size="sm">
        <motion.div variants={slideInRight}>
          <Paper shadow="md" p="xl" radius="md" className={classes.formContainer}>
            <form onSubmit={handleLogin}>
              <Stack gap="md">
                <TextInput
                  label="Email"
                  placeholder="your@email.com"
                  required
                  size="md"
                />
                
                <PasswordInput
                  label="Password"
                  placeholder="Your password"
                  required
                  size="md"
                />

                <Button 
                  type="submit" 
                  size="md" 
                  fullWidth
                  style={{
                    background: 'var(--color-primary)',
                    color: 'white'
                  }}
                >
                  Sign In
                </Button>

                <Divider label="Or continue with" labelPosition="center" />

                <Button
                  variant="outline"
                  leftSection={<IconBrandGoogle size={16} />}
                  onClick={handleGoogleLogin}
                  size="md"
                  fullWidth
                >
                  Google
                </Button>

                <Text ta="center" size="sm" c="dimmed">
                  Don't have an account?{' '}
                  <Text component={Link} to="/signup" size="sm" c="var(--color-primary)" fw={600} style={{ textDecoration: 'none' }}>
                    Sign up
                  </Text>
                </Text>
              </Stack>
            </form>
          </Paper>
        </motion.div>
      </Container>
    </section>
  );
};

export default LoginFormSection;
