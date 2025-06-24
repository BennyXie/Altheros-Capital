import { Container, Title, Text, Grid, Stack, List, ThemeIcon } from '@mantine/core';
import { motion } from 'framer-motion';
import { IconCheck } from '@tabler/icons-react';
import classes from './AboutSection.module.css';

/**
 * About Section Component
 * 
 * Simple about section with company information
 */
const AboutSection = () => {
  return (
    <section id="about" className={classes.about}>
      <Container size="xl" py={80}>
        <Grid align="center" gutter={60}>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Stack gap="lg">
                <div>
                  <Text size="sm" tt="uppercase" fw={600} c="blue" mb="xs">
                    About Us
                  </Text>
                  <Title order={2} size="h1" fw={900} className={classes.title}>
                    Redefining Healthcare Access
                  </Title>
                </div>
                
                <Text size="lg" c="dimmed" className={classes.description}>
                  We're building the future of accessible healthcare through innovative technology 
                  and compassionate care delivery.
                </Text>

                <Text size="md" c="dimmed">
                  Our platform connects patients with providers seamlessly, making quality 
                  healthcare accessible to everyone, everywhere.
                </Text>
              </Stack>
            </motion.div>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 6 }}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Stack gap="md">
                <Title order={3} className={classes.highlightsTitle}>
                  Why Choose Us
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
                  <List.Item className={classes.listItem}>
                    24/7 provider availability
                  </List.Item>
                  <List.Item className={classes.listItem}>
                    Secure, HIPAA-compliant platform
                  </List.Item>
                  <List.Item className={classes.listItem}>
                    Integrated care coordination
                  </List.Item>
                  <List.Item className={classes.listItem}>
                    Affordable, transparent pricing
                  </List.Item>
                  <List.Item className={classes.listItem}>
                    Evidence-based treatment approaches
                  </List.Item>
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
