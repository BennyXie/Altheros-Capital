import { motion } from 'framer-motion';
import { staggerContainer } from '../animations/variants';
import { LoginHeroSection, LoginFormSection } from '../components/Login';

/**
 * Login Page Component
 * 
 * User authentication page with login form and social login options.
 * Follows the same modular structure as the landing page.
 * Uses theme.js for styling and loginConfig.js for content.
 * 
 * @component
 */
const LoginPage = () => {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      style={{ 
        minHeight: '100vh',
        backgroundColor: 'var(--mantine-color-backgrounds-primary, #faf8f5)'
      }}
    >
      {/* Hero Section */}
      <LoginHeroSection />
      
      {/* Form Section */}
      <LoginFormSection />
    </motion.div>
  );
};

export default LoginPage;
