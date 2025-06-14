import { Container, Title, Text, SimpleGrid, Paper, ThemeIcon, Stack } from '@mantine/core';
import { motion } from 'framer-motion';
import { IconRocket, IconShield, IconUsers, IconChartBar, IconBolt, IconHeart } from '@tabler/icons-react';
import { fadeInUp, staggerContainer } from '../../../animations/variants';
import classes from './FeaturesSection.module.css';

/**
 * Features Section Component
 * 
 * Showcases the key features and benefits of your product/service.
 * Features are defined in a data array for easy maintenance and updates.
 * Each feature should have:
 * - Icon (from Tabler Icons)
 * - Title
 * - Description
 * 
 * @component
 * @example
 * return (
 *   <FeaturesSection />
 * )
 */
const FeaturesSection = () => {
  // Feature data - easy to modify and extend
  const features = [
    {
      icon: IconRocket,
      title: 'Lightning Fast',
      description: 'Optimized performance that delivers results in milliseconds, not minutes.',
      color: 'blue'
    },
    {
      icon: IconShield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime guarantee.',
      color: 'green'
    },
    {
      icon: IconUsers,
      title: 'Team Collaboration',
      description: 'Seamless collaboration tools that bring your team together.',
      color: 'violet'
    },
    {
      icon: IconChartBar,
      title: 'Advanced Analytics',
      description: 'Comprehensive insights and reporting to drive data-driven decisions.',
      color: 'orange'
    },
    {
      icon: IconBolt,
      title: 'Automated Workflows',
      description: 'Streamline processes with intelligent automation capabilities.',
      color: 'yellow'
    },
    {
      icon: IconHeart,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to help you succeed.',
      color: 'red'
    }
  ];

  return (
    <section id="features" className={classes.features}>
      <Container size="xl" py={80}>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.div variants={fadeInUp}>
            <Stack align="center" mb={60}>
              <Title order={2} ta="center" className={classes.title}>
                Why Choose Our Platform?
              </Title>
              <Text size="lg" c="dimmed" ta="center" maw={600}>
                Discover the features that make us the preferred choice for 
                businesses looking to scale and succeed in today's digital landscape.
              </Text>
            </Stack>
          </motion.div>

          <SimpleGrid 
            cols={{ base: 1, sm: 2, lg: 3 }} 
            spacing="xl"
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
              >
                <Paper 
                  p="xl" 
                  radius="md" 
                  className={classes.featureCard}
                  shadow="sm"
                >
                  <ThemeIcon
                    size={60}
                    radius="md"
                    variant="light"
                    color={feature.color}
                    className={classes.featureIcon}
                  >
                    <feature.icon size={30} />
                  </ThemeIcon>
                  
                  <Title order={3} mt="md" mb="xs" className={classes.featureTitle}>
                    {feature.title}
                  </Title>
                  
                  <Text c="dimmed" className={classes.featureDescription}>
                    {feature.description}
                  </Text>
                </Paper>
              </motion.div>
            ))}
          </SimpleGrid>
        </motion.div>
      </Container>
    </section>
  );
};

export default FeaturesSection;
