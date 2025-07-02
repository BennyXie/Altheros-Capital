import {
  Container,
  Title,
  Paper,
  Text,
  Flex,
  Stack,
  Image,
  Box,
} from "@mantine/core";
import { useState } from "react";
import { motion } from "framer-motion";

import { fadeInUp, staggerContainer } from "../../../animations/variants";
import { TECHNOLOGIES_CONFIG } from "../../../config/landingConfig";
import classes from "./TechnologiesSection.module.css";

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


const TechnologiesSection = () => {
  // Feature data from configuration
  const cards = TECHNOLOGIES_CONFIG.cards;

  const[hoveredIndex, setHoveredIndex] = useState(null);
  return (
    <section id="technologies" className={classes.technologies}>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        {/* MAIN CONTAINER - Header and Cards */}
        <Container 
          size="xl"
          className={classes.mainContainer}
          py={80}
        >
          {/* Header */}
          <motion.div variants={fadeInUp}>
            <Stack align="center" mb={40}> 
              <Title
                order={1}
                ta="center"
                c="white"
                size={48}
                style={{ marginBottom: '8px' }}
              >
                {TECHNOLOGIES_CONFIG.title}
              </Title>

              <Title
                order={1}
                ta="center"
                c="white"
                size={48}
                style={{ marginBottom: '20px' }}
              >
                {TECHNOLOGIES_CONFIG.title2}
              </Title>

              <Text size="lg" c="white" ta="center" style={{ opacity: 0.9 }}> 
                {TECHNOLOGIES_CONFIG.description}
              </Text>
            </Stack>
          </motion.div>

          {/* Middle Text Card - Non-animated Overlay */}
          <Container size="lg" mb={60}>
            <Paper 
              className={classes.middleCard}
              radius="lg"
              p="xl"
              shadow="md"
            >
              <Text className={classes.middleText}> 
                {TECHNOLOGIES_CONFIG.text}
              </Text>
            </Paper>
          </Container>

          {/* Interactive Cards Section */}
          <Flex justify="space-between" align="center" gap="xl"> 
            <Box w="50%" style={{ display: 'flex', justifyContent: 'center' }}>
              <motion.div
                variants={fadeInUp}
                transition={{ delay: 0.1 }}
              >
                <Paper 
                  className={classes.appMockup}
                  radius="lg"
                >
                  {hoveredIndex !== null ? (
                    <Image 
                      src={cards[hoveredIndex].preview}
                      alt={cards[hoveredIndex].previewAlt}
                      fit="contain"
                    />
                  ) : (
                    <Text c="white" ta="center">
                      Hover an Item to preview
                    </Text>
                  )}
                </Paper>
              </motion.div>
            </Box>
            
            <Box w="50%">
              <Stack align="center">
                {cards.map((card, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Paper 
                      className={classes.featureCard}
                      radius="lg"
                      withBorder
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    > 
                      <Title className={classes.featureTitle}>
                        {card.title}
                      </Title>
                      
                      <Text className={classes.featureText}>
                        {card.description}
                      </Text>
                    </Paper>
                  </motion.div>
                ))}
              </Stack>
            </Box>
          </Flex>
        </Container>
      </motion.div>
    </section>
  );
};

export default TechnologiesSection;
