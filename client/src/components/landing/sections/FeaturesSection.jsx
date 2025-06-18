import {
  Container,
  Title,
  Badge,
  Text,
  SimpleGrid,
  Paper,
  ThemeIcon,
  Stack,
} from "@mantine/core";
import { motion } from "framer-motion";
import {
  IconRocket,
  IconShield,
  IconUsers,
  IconChartBar,
  IconBolt,
  IconHeart,
} from "@tabler/icons-react";
import { fadeInUp, staggerContainer } from "../../../animations/variants";
import { FEATURES_CONFIG } from "../../../config/landingConfig";
import classes from "./FeaturesSection.module.css";

// Icon mapping to convert string names to actual icon components
const iconMap = {
  IconRocket,
  IconShield,
  IconUsers,
  IconChartBar,
  IconBolt,
  IconHeart,
};

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
  // Feature data from configuration
  const features = FEATURES_CONFIG.features;

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
              <Title
                order={1}
                ta="center"
                c="accent.6"
                className={classes.title}
                size={48}
              >
                {FEATURES_CONFIG.title}
              </Title>

              <Badge variant="dot" size="xl">
                {FEATURES_CONFIG.badge}
              </Badge>

              <Text size="lg" c="accent.5" ta="center" maw={600}>
                {FEATURES_CONFIG.subtitle}
              </Text>
            </Stack>
          </motion.div>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 2 }} spacing="xl">
            {features.map((feature, index) => {
              const IconComponent = iconMap[feature.icon] || IconRocket; // Fallback to IconRocket if icon not found

              return (
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
                      <IconComponent size={30} />
                    </ThemeIcon>

                    <Title
                      order={3}
                      mt="md"
                      mb="xs"
                      c="accent.6"
                      className={classes.featureTitle}
                    >
                      {feature.title}
                    </Title>

                    <Text c="accent.5" className={classes.featureDescription}>
                      {feature.description}
                    </Text>
                  </Paper>
                </motion.div>
              );
            })}
          </SimpleGrid>
        </motion.div>
      </Container>
    </section>
  );
};

export default FeaturesSection;
