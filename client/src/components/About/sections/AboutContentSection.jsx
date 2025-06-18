import { Container, Title, Text, Grid, Stack, List, ThemeIcon } from '@mantine/core';
import { motion } from 'framer-motion';
import { IconCheck } from '@tabler/icons-react';
import { slideInLeft, slideInRight } from '../../../animations/variants';
import { ABOUT_STORY_CONFIG, ABOUT_VALUES_CONFIG } from '../../../config/aboutConfig';
import classes from './AboutContentSection.module.css';

/**
 * About Content Section Component
 * 
 * Contains company story and values side by side.
 * Uses theme.js for styling and aboutConfig.js for content.
 */
const AboutContentSection = () => {
  return (
    <section className={classes.content}>
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
                  <Text size="sm" tt="uppercase" fw={600} c="brand.6" mb="xs">
                    {ABOUT_STORY_CONFIG.sectionTag}
                  </Text>
                  <Title order={2} className={classes.title}>
                    {ABOUT_STORY_CONFIG.title}
                  </Title>
                </div>
                
                <Text size="lg" c="dimmed" className={classes.description}>
                  {ABOUT_STORY_CONFIG.description}
                </Text>

                <Text size="md" c="dimmed">
                  {ABOUT_STORY_CONFIG.additionalText}
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
              <Stack gap="lg">
                <div>
                  <Text size="sm" tt="uppercase" fw={600} c="brand.6" mb="xs">
                    {ABOUT_VALUES_CONFIG.sectionTag}
                  </Text>
                  <Title order={3} className={classes.subtitle}>
                    {ABOUT_VALUES_CONFIG.title}
                  </Title>
                </div>

                <List 
                  spacing="sm" 
                  size="md"
                  icon={
                    <ThemeIcon color="brand.6" size={20} radius="xl">
                      <IconCheck size={12} />
                    </ThemeIcon>
                  }
                >
                  {ABOUT_VALUES_CONFIG.values.map((value, index) => (
                    <List.Item key={index}>
                      <Text c="dimmed">{value}</Text>
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

export default AboutContentSection;
