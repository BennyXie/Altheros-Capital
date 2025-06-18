/**
 * Login Page Configuration
 * 
 * This file centralizes all the content for the Login page.
 * Following the same pattern as landingConfig.js for consistency.
 */

// Login Page Hero Section
export const LOGIN_HERO_CONFIG = {
  headline: 'Welcome Back',
  description: 'Sign in to your account to continue',
  sectionTag: 'Authentication'
};

// Social Login Options
export const LOGIN_SOCIAL_CONFIG = [
  { provider: 'google', label: 'Continue with Google', icon: 'BrandGoogle' }
];

// Form Configuration
export const LOGIN_FORM_CONFIG = {
  emailLabel: 'Email address',
  emailPlaceholder: 'your@email.com',
  passwordLabel: 'Password',
  passwordPlaceholder: 'Your password',
  rememberMeLabel: 'Remember me',
  forgotPasswordText: 'Forgot password?',
  submitButtonText: 'Sign In',
  signUpText: 'Don\'t have an account?',
  signUpLinkText: 'Sign up',
  termsText: 'By signing in, you agree to our',
  termsLinkText: 'Terms of Service',
  privacyLinkText: 'Privacy Policy'
};
