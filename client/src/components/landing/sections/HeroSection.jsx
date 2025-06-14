import { Container, Title, Text, Button, Group, Stack, Grid, Image } from '@mantine/core';
import { motion } from 'framer-motion';
import { fadeInUp, slideInLeft, slideInRight } from '../../../animations/variants';
import classes from './HeroSection.module.css';

/**
 * Hero Section Component
 * 
 * The hero section is the first thing users see on the landing page.
 * It should contain:
 * - Compelling headline
 * - Clear value proposition
 * - Primary call-to-action
 * - Optional hero image/video
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
                  size="h1" 
                  fw={900}
                  className={classes.title}
                >
                  Title{' '}
                  <Text 
                    component="span" 
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                    inherit
                  >
                    Text
                  </Text>{' '}
                  Here
                </Title>
                
                <Text size="xl" c="dimmed" className={classes.description}>
                  Tagline/info here.
                </Text>
                
                <Group mt="xl">
                  <Button 
                    size="lg" 
                    variant="filled"
                    className={classes.primaryButton}
                  >
                    Get Started
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className={classes.secondaryButton}
                  >
                    Learn More
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
