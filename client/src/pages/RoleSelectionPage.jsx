import { Container, Title, Text, Stack, Button, Group, Card, SimpleGrid } from '@mantine/core';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconUser, IconStethoscope, IconArrowRight } from '@tabler/icons-react';
import classes from './RoleSelectionPage.module.css';

/**
 * Role Selection Page Component
 * 
 * Allows users to choose between patient and provider login/signup
 */
const RoleSelectionPage = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={classes.roleSelectionPage}>
      <Container size="md" className={classes.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Stack align="center" gap="xl">
            {/* Header */}
            <div className={classes.header}>
              <Title order={1} ta="center" className={classes.title}>
                Welcome to Altheros Capital
              </Title>
              <Text size="lg" ta="center" c="dimmed" className={classes.subtitle}>
                Choose your role to get started
              </Text>
            </div>

            {/* Role Cards */}
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl" className={classes.cardsGrid}>
              {/* Patient Card */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card 
                  shadow="md" 
                  padding="xl" 
                  radius="lg" 
                  className={classes.roleCard}
                  withBorder
                >
                  <Stack align="center" gap="lg">
                    <div className={classes.iconWrapper}>
                      <IconUser size={48} color="var(--color-primary)" />
                    </div>
                    
                    <div className={classes.cardContent}>
                      <Title order={3} ta="center" className={classes.cardTitle}>
                        I'm a Patient
                      </Title>
                      <Text ta="center" c="dimmed" className={classes.cardDescription}>
                        Looking for healthcare providers, book appointments, and manage your health journey
                      </Text>
                    </div>

                    <Stack gap="sm" className={classes.buttonStack}>
                      <Button
                        size="lg"
                        fullWidth
                        component={Link}
                        to="/login?role=patient"
                        rightSection={<IconArrowRight size={16} />}
                        className={classes.primaryButton}
                      >
                        Sign In as Patient
                      </Button>
                      <Button
                        size="md"
                        fullWidth
                        variant="outline"
                        component={Link}
                        to="/signup?role=patient"
                        className={classes.secondaryButton}
                      >
                        Create Patient Account
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              </motion.div>

              {/* Provider Card */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card 
                  shadow="md" 
                  padding="xl" 
                  radius="lg" 
                  className={classes.roleCard}
                  withBorder
                >
                  <Stack align="center" gap="lg">
                    <div className={classes.iconWrapper}>
                      <IconStethoscope size={48} color="var(--color-secondary)" />
                    </div>
                    
                    <div className={classes.cardContent}>
                      <Title order={3} ta="center" className={classes.cardTitle}>
                        I'm a Provider
                      </Title>
                      <Text ta="center" c="dimmed" className={classes.cardDescription}>
                        Healthcare professional ready to connect with patients and manage your practice
                      </Text>
                    </div>

                    <Stack gap="sm" className={classes.buttonStack}>
                      <Button
                        size="lg"
                        fullWidth
                        component={Link}
                        to="/login?role=provider"
                        rightSection={<IconArrowRight size={16} />}
                        className={classes.providerButton}
                        style={{ 
                          backgroundColor: 'var(--color-secondary)',
                          color: 'white'
                        }}
                      >
                        Sign In as Provider
                      </Button>
                      <Button
                        size="md"
                        fullWidth
                        variant="outline"
                        component={Link}
                        to="/signup?role=provider"
                        className={classes.secondaryButton}
                        style={{ 
                          borderColor: 'var(--color-secondary)',
                          color: 'var(--color-secondary)'
                        }}
                      >
                        Create Provider Account
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              </motion.div>
            </SimpleGrid>

            {/* Back to Home */}
            <Group justify="center" className={classes.backLink}>
              <Link to="/" style={{ textDecoration: 'none' }}>
                <Text size="sm" c="dimmed" className={classes.linkText}>
                  ← Back to home
                </Text>
              </Link>
            </Group>
          </Stack>
        </motion.div>
      </Container>
    </div>
  );
};

export default RoleSelectionPage;
