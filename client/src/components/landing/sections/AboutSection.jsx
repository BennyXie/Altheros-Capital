import { Container, Title, Text, Grid, Stack, List, ThemeIcon } from '@mantine/core';
import { motion } from 'framer-motion';
import { IconCheck } from '@tabler/icons-react';
import { slideInLeft, slideInRight } from '../../../animations/variants';
import { ABOUT_CONFIG } from '../../../config/landingConfig';
import classes from './AboutSection.module.css';

/**
 * About Section Component
 * 
 * Provides information about your company, mission, and values.
 * This section builds trust and credibility with potential customers.
 * 
 * Content includes:
 * - Company story/mission
 * - Key achievements/statistics
 * - Value propositions
 * 
 * @component
 * @example
 * return (
 *   <AboutSection />
 * )
 */
const AboutSection = () => {
  return (
    <section id="about" className={classes.about}>
      <Container size="xl" py={80}>
        <Grid align="center" gutter={60}>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <motion.div
              variants={slideInLeft}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <Stack gap="lg">
                <div>
                  <Text size="sm" tt="uppercase" fw={600} c="white" mb="xs">
                    {ABOUT_CONFIG.sectionTag}
                  </Text>
                  <Title order={2} c="white" className={classes.title}>
                    {ABOUT_CONFIG.title}
                  </Title>
                </div>
                
                <Text size="lg" c="brand.0" className={classes.description}>
                  {ABOUT_CONFIG.description}
                </Text>

                <Text size="md" c="dimmed">
                  {ABOUT_CONFIG.secondaryDescription}
                </Text>
              </Stack>
            </motion.div>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 6 }}>
            <motion.div
              variants={slideInRight}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <Stack gap="md">
                <Title order={3} className={classes.highlightsTitle}>
                  {ABOUT_CONFIG.highlightsTitle}
                </Title>
                
                <List
                  spacing="sm"
                  size="md"
                  icon={
                    <ThemeIcon color="brand" size={20} radius="xl">
                      <IconCheck size={12} />
                    </ThemeIcon>
                  }
                >
                  {ABOUT_CONFIG.highlights.map((highlight, index) => (
                    <List.Item key={index} className={classes.listItem}>
                      {highlight}
                    </List.Item>
                  ))}
                </List>
              </Stack>
            </motion.div>
          </Grid.Col>
        </Grid>
      </Container>
    </section>
  );
};

export default AboutSection;
