import { Container, Title, Text } from '@mantine/core';
import { motion } from 'framer-motion';
import { slideInLeft } from '../../../animations/variants';
import { ABOUT_HERO_CONFIG } from '../../../config/aboutConfig';
import classes from './AboutHeroSection.module.css';

/**
 * About Hero Section Component
 * 
 * Following the same pattern as landing page sections.
 * Uses theme.js for styling and aboutConfig.js for content.
 */
const AboutHeroSection = () => {
  return (
    <section id="about-hero" className={classes.hero}>
      <Container size="xl" py={120}>
        <motion.div
          variants={slideInLeft}
          initial="initial"
          animate="animate"
        >
          <Title order={1} ta="center" mb="lg" c="white" className={classes.title}>
            {ABOUT_HERO_CONFIG.headline}
          </Title>
          <Text size="xl" ta="center" c="gray.1" maw={800} mx="auto" className={classes.description}>
            {ABOUT_HERO_CONFIG.description}
          </Text>
        </motion.div>
      </Container>
    </section>
  );
};

export default AboutHeroSection;
