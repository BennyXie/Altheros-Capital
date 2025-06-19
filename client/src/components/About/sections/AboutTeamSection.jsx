import { Container, Title, Grid, Card, Stack, Avatar, Text } from '@mantine/core';
import { motion } from 'framer-motion';
import { slideInLeft } from '../../../animations/variants';
import { ABOUT_TEAM_CONFIG } from '../../../config/aboutConfig';
import classes from './AboutTeamSection.module.css';

/**
 * About Team Section Component
 * 
 * Displays team members in cards.
 * Uses theme.js for styling and aboutConfig.js for content.
 */
const AboutTeamSection = () => {
  return (
    <section className={classes.team}>
      <Container size="xl" py={80}>
        <motion.div
          variants={slideInLeft}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <Title order={2} ta="center" mb={60} className={classes.sectionTitle}>
            {ABOUT_TEAM_CONFIG.title}
          </Title>
        </motion.div>

        <Grid>
          {ABOUT_TEAM_CONFIG.members.map((member, index) => (
            <Grid.Col key={member.name} span={{ base: 12, sm: 6, md: 4 }}>
              <motion.div
                variants={slideInLeft}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <Card shadow="sm" p="lg" radius="md" withBorder className={classes.teamCard}>
                  <Stack align="center" gap="md">
                    <Avatar 
                      src={member.avatar} 
                      size={100} 
                      radius={50}
                      alt={member.name}
                    />
                    <div style={{ textAlign: 'center' }}>
                      <Text fw={600} size="lg">
                        {member.name}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {member.role}
                      </Text>
                    </div>
                  </Stack>
                </Card>
              </motion.div>
            </Grid.Col>
          ))}
        </Grid>
      </Container>
    </section>
  );
};

export default AboutTeamSection;
