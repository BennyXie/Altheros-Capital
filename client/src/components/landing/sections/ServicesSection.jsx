import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Paper,
  Stack,
} from "@mantine/core";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../../animations/variants";
import { SERVICES_CONFIG } from "../../../config/landingConfig";
import classes from "./ServicesSection.module.css";

/**
 * Services Overview Section Component
 *
 * Showcases the four main service categories with visual diagram layout
 * as shown in the design: Behavioral Health, Primary Care, Care Navigation, and Operational Enablement
 */
const ServicesSection = () => {
  return (
    <section className={classes.services}>
      <Container size="xl" py={80}>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {/* Header */}
          <motion.div variants={fadeInUp}>
            <Stack align="center" mb={60}>
              <Title order={1} className={classes.title}>
                {SERVICES_CONFIG.title}
              </Title>
              <Title order={1} className={classes.subtitle}>
                {SERVICES_CONFIG.subtitle}
              </Title>
              <Text className={classes.description}>
                {SERVICES_CONFIG.description}
              </Text>
            </Stack>
          </motion.div>

          {/* Services Grid */}
          <motion.div variants={fadeInUp} transition={{ delay: 0.2 }}>
            <SimpleGrid
              cols={{ base: 1, md: 2 }}
              spacing="xl"
              className={classes.grid}
            >
              {SERVICES_CONFIG.services.map((service, index) => (
                <motion.div
                  key={service.title}
                  variants={fadeInUp}
                  transition={{ delay: 0.1 * (index + 1) }}
                >
                  <Paper
                    className={`${classes.serviceCard} ${
                      classes[service.category]
                    }`}
                    p="xl"
                    radius="lg"
                  >
                    <Stack gap="md">
                      <Title order={3} className={classes.serviceTitle}>
                        {service.title}
                      </Title>
                      <Text className={classes.serviceDescription}>
                        {service.description}
                      </Text>
                    </Stack>
                  </Paper>
                </motion.div>
              ))}
            </SimpleGrid>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};

export default ServicesSection;
