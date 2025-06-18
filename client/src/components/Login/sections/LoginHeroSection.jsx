import { Container, Title, Text } from '@mantine/core';
import { motion } from 'framer-motion';
import { slideInLeft } from '../../../animations/variants';
import { LOGIN_HERO_CONFIG } from '../../../config/loginConfig';
import classes from './LoginHeroSection.module.css';

/**
 * Login Hero Section Component
 * 
 * Following the same pattern as other hero sections.
 * Uses theme.js for styling and loginConfig.js for content.
 */
const LoginHeroSection = () => {
  return (
    <section className={classes.hero}>
      <Container size="sm" py={60}>
        <motion.div
          variants={slideInLeft}
          initial="initial"
          animate="animate"
        >
          <Title order={1} ta="center" mb="lg" c="white" className={classes.title}>
            {LOGIN_HERO_CONFIG.headline}
          </Title>
          <Text size="lg" ta="center" c="gray.1" mb={50}>
            {LOGIN_HERO_CONFIG.description}
          </Text>
        </motion.div>
      </Container>
    </section>
  );
};

export default LoginHeroSection;
