import { Container, Title, Text, Grid, Stack, List, ThemeIcon } from '@mantine/core';
import { motion } from 'framer-motion';
import { IconCheck } from '@tabler/icons-react';
import { fadeInUp, slideInLeft, slideInRight } from '../../../animations/variants';
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
  // Company highlights - easy to update
  const highlights = [
    'Over 10,000 satisfied customers worldwide',
    '99.9% uptime with enterprise-grade infrastructure',
    'Award-winning customer support team',
    'SOC 2 Type II certified for security compliance',
    'Trusted by Fortune 500 companies'
  ];

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
                  <Text size="sm" tt="uppercase" fw={600} c="blue" mb="xs">
                    About Our Company
                  </Text>
                  <Title order={2} className={classes.title}>
                    Building the Future of Digital Innovation
                  </Title>
                </div>
                
                <Text size="lg" c="dimmed" className={classes.description}>
                  Since our founding, we've been dedicated to creating solutions that 
                  empower businesses to thrive in an ever-evolving digital landscape. 
                  Our team of experts combines cutting-edge technology with deep industry 
                  knowledge to deliver exceptional results.
                </Text>

                <Text size="md" c="dimmed">
                  We believe that technology should be accessible, reliable, and 
                  transformative. That's why we've built our platform from the ground 
                  up with scalability, security, and user experience at its core.
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
                  Why Businesses Choose Us
                </Title>
                
                <List
                  spacing="sm"
                  size="md"
                  icon={
                    <ThemeIcon color="blue" size={20} radius="xl">
                      <IconCheck size={12} />
                    </ThemeIcon>
                  }
                >
                  {highlights.map((highlight, index) => (
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
