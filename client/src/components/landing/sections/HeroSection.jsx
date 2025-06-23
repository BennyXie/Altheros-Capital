import { Container, Title, Button, Group, Stack } from "@mantine/core";
import { motion } from "framer-motion";
import { slideInLeft } from "../../../animations/variants";
import { HERO_CONFIG } from "../../../config/landingConfig";
import classes from "./HeroSection.module.css";
import heroImage from "../../../assets/hero.png";

/**
 * 🚀 Hero Section Component
 * =========================
 *
 * The hero section is the first thing users see on the landing page.
 *
 * 🎨 STYLING APPROACH:
 * - Colors controlled by colors.css variables
 * - Uses CSS variables for consistency
 * - Responsive design with Mantine breakpoints
 * - Green gradient overlay and highlighted text
 *
 * 📝 CONTENT:
 * - All text content comes from landingConfig.js
 * - Easy to update without touching component code
 * - Supports A/B testing different headlines
 *
 * @component
 * @example
 * return (
 *   <HeroSection />
 * )
 */
const HeroSection = () => {
  return (
    <section className={classes.hero}>
      <div
        className={classes.background}
        style={{ backgroundImage: `url(${heroImage})` }}
      />

      <div className={classes.overlay}>
        <Container
          size="xl"
          className={classes.container}
          // style={{ marginLeft: 150 }}
        >
          <motion.div variants={slideInLeft}>
            <Stack gap="md" className={classes.content}>
              <Title order={1} className={classes.title}>
                {HERO_CONFIG.headline}
                <br />
                <span className={classes.highlightedText}>
                  {HERO_CONFIG.highlightedText}
                </span>
              </Title>

              <Group mt="xl" className={classes.buttons}>
                <Button
                  size="xl"
                  radius="xl"
                  variant="action"
                  className={classes.primaryButton}
                >
                  {HERO_CONFIG.primaryCTA}
                </Button>
                <Button
                  size="xl"
                  radius="xl"
                  variant="outline"
                  className={classes.secondaryButton}
                >
                  {HERO_CONFIG.secondaryCTA}
                </Button>
              </Group>
            </Stack>
          </motion.div>
        </Container>
      </div>
    </section>
  );
};

export default HeroSection;
