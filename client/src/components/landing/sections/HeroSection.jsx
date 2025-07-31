import { Container, Title, Button, Group, Stack } from "@mantine/core";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { slideInLeft } from "../../../animations/variants";
import { HERO_CONFIG } from "../../../config/landingConfig";
import classes from "./HeroSection.module.css";
import heroImage from "../../../assets/hero.png";

const HeroSection = () => {
  const navigate = useNavigate();

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
              <Title order={1}>
                <span className={classes.title}>{HERO_CONFIG.headline}</span>
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
                  onClick={() => navigate("/provider-lookup")}
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