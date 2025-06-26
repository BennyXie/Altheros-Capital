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
        {/* TOP CONTAINER */}
        <Container 
          fluid style={{ maxWidth: '80%' }} 
          py={20} 
          className={classes.containerTop}
        >
          <Container fluid style={{ maxWidth: '85%' }} className={classes.containerTop}>
              <motion.div variants={fadeInUp}>
                <Stack align="right" > 
                  <Title
                    order={1}
                    ta="left"
                    c="dark"
                    size={40}
                  >
                    {TECHNOLOGIES_CONFIG.title}
                  </Title>

                  <Title
                    order={1}
                    ta="left"
                    c="dark"
                    size={40}
                  >
                    {TECHNOLOGIES_CONFIG.title2}
                  </Title>

                  <Text size="lg" c="black" ta="left"> 
                    {TECHNOLOGIES_CONFIG.description}
                  </Text>
                </Stack>
              </motion.div>
          </Container>
        </Container>

        {/* MIDDLE CONTAINER */}
        <Container 
          fluid 
          className={classes.containerMiddle}
          style={{ maxWidth: '85%' }}
        >
          <motion.div
            variants={fadeInUp}
            transition={{ delay: 0.1 }}
          >
            <Container style={{ maxWidth: '80%' }}>
              <Text className={classes.middleText}> 
                {TECHNOLOGIES_CONFIG.text}
              </Text>
            </Container>
          </motion.div>
        </Container>

        {/* BOTTOM CONTAINER */}
        <Container fluid style={{ maxWidth: '80%' }} py={80} className={classes.containerBottom}>
          <Flex justify="space-between" align="center" gap="xl"> 
            <Box w="50%" align="center">
              <motion.div
                variants={fadeInUp}
                transition={{ delay: 0.1 }}
              >
                <Paper 
                  className={classes.appMockup}
                  radius= "lg"
                >
                  {hoveredIndex !== null ? (
                    <Image 
                      src = {cards[hoveredIndex].preview}
                      alt = {cards[hoveredIndex].previewAlt}
                      fit  = "contain"
                    />
                  ) : (
                    <Text>
                      Hover an Item to preview
                    </Text>
                  )}

                </Paper>
              </motion.div>
            </Box>
            
            <Box w="50%">
              <Stack align="center">
              {cards.map((card, index) => {
                return(
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Paper 
                      className={classes.featureCard}
                      radius= "lg"
                      withBorder
                      key = {index}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}

                    > 
                      <Title className = {classes.featureTitle}>
                        {card.title}
                      </Title>
                      
                      <Text className = {classes.featureText}>
                        {card.description}
                      </Text>
                    </Paper>
                  </motion.div>
                );
              })}
              </Stack>
            </Box>
          </Flex>
        </Container>
      </motion.div>
    </section>
  );
};

export default TechnologiesSection;
