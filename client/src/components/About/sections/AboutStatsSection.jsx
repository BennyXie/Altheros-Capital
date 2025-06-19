import { Container, Grid, Card, Group, ThemeIcon, Text } from '@mantine/core';
import { motion } from 'framer-motion';
import { IconUsers, IconTrophy, IconTarget } from '@tabler/icons-react';
import { slideInLeft } from '../../../animations/variants';
import { ABOUT_STATS_CONFIG } from '../../../config/aboutConfig';
import classes from './AboutStatsSection.module.css';

/**
 * About Stats Section Component
 * 
 * Displays company statistics in cards.
 * Uses theme.js for styling and aboutConfig.js for content.
 */
const AboutStatsSection = () => {
  // Icon mapping
  const iconMap = {
    Users: IconUsers,
    Trophy: IconTrophy,
    Target: IconTarget
  };

  return (
    <section className={classes.stats}>
      <Container size="xl" py={80}>
        <Grid>
          {ABOUT_STATS_CONFIG.map((stat, index) => {
            const IconComponent = iconMap[stat.icon];
            return (
              <Grid.Col key={stat.label} span={{ base: 12, sm: 4 }}>
                <motion.div
                  variants={slideInLeft}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <Card shadow="sm" p="lg" radius="md" withBorder className={classes.statCard}>
                    <Group>
                      <ThemeIcon size={50} radius="md" variant="light" color="brand">
                        <IconComponent size={30} />
                      </ThemeIcon>
                      <div>
                        <Text size="xl" fw={700} c="brand.6">
                          {stat.value}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {stat.label}
                        </Text>
                      </div>
                    </Group>
                  </Card>
                </motion.div>
              </Grid.Col>
            );
          })}
        </Grid>
      </Container>
    </section>
  );
};

export default AboutStatsSection;
