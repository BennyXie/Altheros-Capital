import { motion } from 'framer-motion';
import { staggerContainer } from '../../animations/variants';
import HeroSection from './sections/HeroSection';
import FeaturesSection from './sections/FeaturesSection';
import AboutSection from './sections/AboutSection';
import TestimonialsSection from './sections/TestimonialsSection';
import TechnologiesSection from './sections/TechnologiesSection';
import CTASection from './sections/CTASection';

/**
 * Main Landing Page Component
 * 
 * This component serves as the main container for all landing page sections.
 * It's designed to be modular and scalable - sections can be easily added,
 * removed, or reordered without affecting other parts of the application.
 * 
 * @component
 * @example
 * return (
 *   <LandingPage />
 * )
 */
const LandingPage = () => {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      style={{ 
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary, #faf8f5)'
      }}
    >
      {/* Hero Section - Primary call-to-action and value proposition */}
      <HeroSection />
      
      {/* Features Section - Highlight key features and benefits */}
      <FeaturesSection />
      
      {/* About Section - Company/product information */}
      <AboutSection />
      
      {/* Testimonials Section - Social proof and customer feedback */}
      <TestimonialsSection />

      <TechnologiesSection />
      
      {/* CTA Section - Final conversion opportunity */}
      <CTASection />
    </motion.div>
  );
};

export default LandingPage;
