import { motion } from 'framer-motion';
import { Container, Title, Text, Paper, TextInput, PasswordInput, Button, Stack, Divider } from '@mantine/core';
import { IconBrandGoogle } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { slideInLeft } from '../animations/variants';
import classes from './SignupPage.module.css';

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
    <div className={classes.signupPage}>
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
                {/* Google Sign Up Button */}
                <Button
                  variant="outline"
                  leftSection={<IconBrandGoogle size={18} />}
                  onClick={handleGoogleSignup}
                  size="md"
                  className={classes.googleButton}
                >
                  Sign up with Google
                </Button>

                <Divider label="Or sign up with email" labelPosition="center" className={classes.divider} />

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
                  fullWidth
                  className={classes.submitButton}
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
