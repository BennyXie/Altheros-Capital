import { motion } from 'framer-motion';
import { staggerContainer } from '../animations/variants';
import { 
  AboutHeroSection, 
  AboutStatsSection, 
  AboutContentSection
} from '../components/About';

/**
 * About Page Component
 * 
 * Dedicated page for company information, mission, team, and values.
 * Follows the same modular structure as the landing page.
 * Uses theme.js for styling and aboutConfig.js for content.
 * 
 * @component
 */
const AboutPage = () => {
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
      <AboutHeroSection />
      
      {/* Stats Section */}
      <AboutStatsSection />
      
      {/* Content Section - Story and Values */}
      <AboutContentSection />
    </motion.div>
  );
};

export default AboutPage;
