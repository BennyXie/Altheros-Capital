import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Container, 
  Title, 
  Text, 
  Stack, 
  Button, 
  Group, 
  Card,
  SimpleGrid,
  Box,
  List,
  ThemeIcon
} from '@mantine/core';
import { 
  IconCheck, 
  IconStethoscope, 
  IconCalendar,
  IconUserCheck,
  IconMedicalCross,
  IconShieldCheck,
  IconClipboardList
} from '@tabler/icons-react';
import { staggerContainer, slideInLeft, fadeInUp } from '../animations/variants';
import classes from './ProviderAccessPage.module.css';

/**
 * Provider Access Page Component
 * 
 * Page for healthcare providers to learn about joining the network
 */
const ProviderAccessPage = () => {
  const providerBenefits = [
    {
      title: "Streamlined Operations",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      icon: <IconClipboardList size={40} color="var(--color-primary)" />
    },
    {
      title: "Quality Patient Base",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      icon: <IconUserCheck size={40} color="var(--color-primary)" />
    },
    {
      title: "Flexible Scheduling",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      icon: <IconCalendar size={40} color="var(--color-primary)" />
    }
  ];

  const requirements = [
    "Lorem ipsum dolor sit amet",
    "Consectetur adipiscing elit",
    "Sed do eiusmod tempor incididunt",
    "Ut labore et dolore magna aliqua",
    "Ut enim ad minim veniam",
    "Quis nostrud exercitation ullamco"
  ];

  const applicationSteps = [
    {
      step: "1",
      title: "Lorem Ipsum",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt."
    },
    {
      step: "2", 
      title: "Dolor Sit Amet",
      description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea."
    },
    {
      step: "3",
      title: "Consectetur Adipiscing",
      description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat."
    },
    {
      step: "4",
      title: "Sed Do Eiusmod",
      description: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit."
    }
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={classes.providerPage}
    >
      {/* Hero Section */}
      <section className={classes.heroSection}>
        <Container size="xl" className={classes.heroContainer}>
          <motion.div variants={slideInLeft}>
            <Stack gap="md" className={classes.heroContent}>
              <Title order={1} className={classes.heroTitle}>
                Join Our{' '}
                <span className={classes.heroHighlight}>
                  Provider Network
                </span>
              </Title>
            </Stack>
          </motion.div>
        </Container>
      </section>

      {/* Content Section */}
      <Container size="lg" py={80}>
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <Stack gap="xl" ta="center">
            <Title order={2} size="h2" fw={600} c="var(--color-primary)">
              Partner with Excellence
            </Title>
            
            <Text 
              size="lg" 
              c="var(--color-text-secondary)"
              maw={800}
              mx="auto"
              lh={1.7}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </Text>
            
            <Text 
              size="lg" 
              c="var(--color-text-secondary)"
              maw={800}
              mx="auto"
              lh={1.7}
            >
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </Text>

            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt="xl">
              {providerBenefits.map((benefit, index) => (
                <Card key={index} shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack align="center" ta="center">
                    {benefit.icon}
                    <Title order={4}>{benefit.title}</Title>
                    <Text size="sm" c="dimmed">
                      {benefit.description}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        </motion.div>
      </Container>

      {/* Requirements Section */}
      <Box style={{ backgroundColor: 'var(--color-bg-light)' }}>
        <Container size="lg" py={80}>
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <Stack gap="xl">
              <div style={{ textAlign: 'center' }}>
                <Title order={2} size="h2" fw={600} c="var(--color-primary)" mb="md">
                  Provider Requirements
                </Title>
                <Text size="lg" c="var(--color-text-secondary)" maw={600} mx="auto">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit
                </Text>
              </div>
              
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
                <Card shadow="sm" padding="xl" radius="md" withBorder>
                  <Stack>
                    <Group>
                      <ThemeIcon size="lg" variant="light" color="green">
                        <IconMedicalCross size={24} />
                      </ThemeIcon>
                      <Title order={3}>Lorem Ipsum</Title>
                    </Group>
                    <List
                      spacing="sm"
                      icon={
                        <ThemeIcon color="green" size={20} radius="xl">
                          <IconCheck size={12} />
                        </ThemeIcon>
                      }
                    >
                      {requirements.slice(0, 3).map((req, index) => (
                        <List.Item key={index}>{req}</List.Item>
                      ))}
                    </List>
                  </Stack>
                </Card>
                
                <Card shadow="sm" padding="xl" radius="md" withBorder>
                  <Stack>
                    <Group>
                      <ThemeIcon size="lg" variant="light" color="green">
                        <IconShieldCheck size={24} />
                      </ThemeIcon>
                      <Title order={3}>Dolor Sit Amet</Title>
                    </Group>
                    <List
                      spacing="sm"
                      icon={
                        <ThemeIcon color="green" size={20} radius="xl">
                          <IconCheck size={12} />
                        </ThemeIcon>
                      }
                    >
                      {requirements.slice(3).map((req, index) => (
                        <List.Item key={index}>{req}</List.Item>
                      ))}
                    </List>
                  </Stack>
                </Card>
              </SimpleGrid>
            </Stack>
          </motion.div>
        </Container>
      </Box>

      {/* Application Process Section */}
      <Container size="lg" py={80}>
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <Stack gap="xl">
            <div style={{ textAlign: 'center' }}>
              <Title order={2} size="h2" fw={600} c="var(--color-primary)" mb="md">
                Application Process
              </Title>
              <Text size="lg" c="var(--color-text-secondary)" maw={600} mx="auto">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit
              </Text>
            </div>
            
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" mt="xl">
              {applicationSteps.map((step, index) => (
                <Card key={index} shadow="sm" padding="xl" radius="md" withBorder>
                  <Stack>
                    <Group>
                      <ThemeIcon size="xl" variant="filled" color="green">
                        <Text fw={700} c="white">{step.step}</Text>
                      </ThemeIcon>
                      <Title order={4}>{step.title}</Title>
                    </Group>
                    <Text c="dimmed">{step.description}</Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        </motion.div>
      </Container>

      {/* CTA Section */}
      <Box
        style={{
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
          color: 'white'
        }}
      >
        <Container size="md" py={80}>
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <Stack align="center" ta="center" gap="xl">
              <div>
                <Title order={2} c="white" mb="md">
                  Ready to Join Our Network?
                </Title>
                <Text size="xl" c="gray.1" maw={600} mx="auto">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </Text>
              </div>

              <Group justify="center" gap="lg">
                <Button 
                  size="xl" 
                  variant="white"
                  color="dark"
                  leftSection={<IconStethoscope size={20} />}
                  component={Link}
                  to="/provider-complete-profile"
                >
                  Complete Provider Profile
                </Button>
                <Button 
                  size="xl" 
                  variant="outline"
                  style={{ borderColor: 'white', color: 'white' }}
                >
                  Learn More
                </Button>
              </Group>
            </Stack>
          </motion.div>
        </Container>
      </Box>
    </motion.div>
  );
};

export default ProviderAccessPage;
