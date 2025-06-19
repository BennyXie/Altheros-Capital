import { 
  Container, 
  Paper, 
  TextInput, 
  PasswordInput, 
  Button, 
  Checkbox, 
  Anchor, 
  Stack, 
  Group,
  Divider,
  Text,
  Box
} from '@mantine/core';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { IconMail, IconLock, IconBrandGoogle } from '@tabler/icons-react';
import { slideInLeft } from '../../../animations/variants';
import { LOGIN_SOCIAL_CONFIG, LOGIN_FORM_CONFIG } from '../../../config/loginConfig';
import classes from './LoginFormSection.module.css';

/**
 * Login Form Section Component
 * 
 * Contains the main login form with social options.
 * Uses theme.js for styling and loginConfig.js for content.
 */
const LoginFormSection = () => {
  const handleLogin = (event) => {
    event.preventDefault();
    // Handle login logic here
    console.log('Login attempted');
  };

  const handleSocialLogin = (provider) => {
    // Handle social login
    console.log(`Login with ${provider}`);
  };

  // Icon mapping for social logins
  const iconMap = {
    BrandGoogle: IconBrandGoogle
  };

  return (
    <section className={classes.formSection}>
      <Container size="sm" py={40}>
        <motion.div
          variants={slideInLeft}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          <Paper shadow="lg" p={40} radius="lg" className={classes.loginCard}>
            <form onSubmit={handleLogin}>
              <Stack gap="lg">
                {/* Social Login Buttons */}
                <Stack gap="md">
                  {LOGIN_SOCIAL_CONFIG.map((social) => {
                    const IconComponent = iconMap[social.icon];
                    return (
                      <Button
                        key={social.provider}
                        variant="outline"
                        leftSection={<IconComponent size={18} />}
                        onClick={() => handleSocialLogin(social.provider)}
                        className={classes.socialButton}
                        size="md"
                      >
                        {social.label}
                      </Button>
                    );
                  })}
                </Stack>

                <Divider label="Or continue with email" labelPosition="center" />

                {/* Email Input */}
                <TextInput
                  label={LOGIN_FORM_CONFIG.emailLabel}
                  placeholder={LOGIN_FORM_CONFIG.emailPlaceholder}
                  leftSection={<IconMail size={18} />}
                  size="md"
                  required
                  className={classes.input}
                />

                {/* Password Input */}
                <PasswordInput
                  label={LOGIN_FORM_CONFIG.passwordLabel}
                  placeholder={LOGIN_FORM_CONFIG.passwordPlaceholder}
                  leftSection={<IconLock size={18} />}
                  size="md"
                  required
                  className={classes.input}
                />

                {/* Remember me and Forgot password */}
                <Group justify="space-between">
                  <Checkbox
                    label={LOGIN_FORM_CONFIG.rememberMeLabel}
                    size="sm"
                  />
                  <Anchor size="sm" c="brand.6">
                    {LOGIN_FORM_CONFIG.forgotPasswordText}
                  </Anchor>
                </Group>

                {/* Login Button */}
                <Button
                  type="submit"
                  size="lg"
                  className={classes.loginButton}
                  fullWidth
                >
                  {LOGIN_FORM_CONFIG.submitButtonText}
                </Button>

                {/* Sign up link */}
                <Text ta="center" size="sm" c="dimmed">
                  {LOGIN_FORM_CONFIG.signUpText}{' '}
                  <Anchor 
                    component={Link} 
                    to="/signup" 
                    size="sm" 
                    c="brand.6" 
                    fw={600}
                    style={{ textDecoration: 'none' }}
                  >
                    {LOGIN_FORM_CONFIG.signUpLinkText}
                  </Anchor>
                </Text>
              </Stack>
            </form>
          </Paper>
        </motion.div>

        {/* Additional Information */}
        <motion.div
          variants={slideInLeft}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4 }}
        >
          <Box mt={40}>
            <Text size="sm" ta="center" c="dimmed">
              {LOGIN_FORM_CONFIG.termsText}{' '}
              <Anchor size="sm" c="brand.6">
                {LOGIN_FORM_CONFIG.termsLinkText}
              </Anchor>
              {' '}and{' '}
              <Anchor size="sm" c="brand.6">
                {LOGIN_FORM_CONFIG.privacyLinkText}
              </Anchor>
            </Text>
          </Box>
        </motion.div>
      </Container>
    </section>
  );
};

export default LoginFormSection;
