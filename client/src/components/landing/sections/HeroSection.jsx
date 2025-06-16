import { Container, Title, Text, Button, Group, Stack, Grid } from '@mantine/core';
import { motion } from 'framer-motion';
import { slideInLeft, slideInRight } from '../../../animations/variants';
import { HERO_CONFIG } from '../../../config/landingConfig';
import classes from './HeroSection.module.css';

/**
 * 🚀 Hero Section Component
 * =========================
 * 
 * The hero section is the first thing users see on the landing page.
 * 
 * 🎨 STYLING APPROACH:
 * - Colors controlled by theme.js
 * - Uses CSS variables for consistency
 * - Responsive design with Mantine breakpoints
 * - Custom gradients defined in theme
 * 
 * 📝 CONTENT:
 * - All text content comes from landingConfig.js
 * - Easy to update without touching component code
 * - Supports A/B testing different headlines
 * 
 * @component
 * @example
 * return (
 *   <HeroSection />
 * )
 */
const HeroSection = () => {
  return (
    <section id="hero" className={classes.hero}>
      <Container size="xl" py={120}>
        <Grid align="center" gutter={50}>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <motion.div variants={slideInLeft}>
              <Stack gap="md">
                <Title 
                  order={1} 
                  c="white"
                  className={classes.title}
                >
                  {HERO_CONFIG.headline}{' '}
                  <Text 
                    component="span" 
                    variant="gradient"
                    gradient={{ from: 'accent.4', to: 'accent.6', deg: 90 }}
                    inherit
                  >
                    {HERO_CONFIG.highlightedText}
                  </Text>{' '}
                  {HERO_CONFIG.subHeadline}
                </Title>
                
                <Text 
                  size="xl" 
                  c="gray.1"
                  className={classes.description}
                >
                  {HERO_CONFIG.description}
                </Text>
                
                <Group mt="xl">
                  <Button 
                    size="lg" 
                    variant="action"
                    className={classes.primaryButton}
                  >
                    {HERO_CONFIG.primaryCTA}
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    c="white"
                    style={{ borderColor: 'white' }}
                    className={classes.secondaryButton}
                  >
                    {HERO_CONFIG.secondaryCTA}
                  </Button>
                </Group>
              </Stack>
            </motion.div>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 6 }}>
            <motion.div variants={slideInRight}>
              <div className={classes.imageWrapper}>
                {/* Replace with actual hero image */}
                <div className={classes.placeholderImage}>
                  <Text size="lg" c="dimmed" ta="center">
                    Hero Image Placeholder
                  </Text>
                </div>
              </div>
            </motion.div>
          </Grid.Col>
        </Grid>
      </Container>
    </section>
  );
};

export default HeroSection;
