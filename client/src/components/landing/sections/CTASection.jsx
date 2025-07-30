import { useNavigate } from "react-router-dom";
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Paper,
} from "@mantine/core";
import { motion } from "framer-motion";
import { fadeInUp } from "../../../animations/variants";
import { CTA_CONFIG } from "../../../config/landingConfig";
import classes from "./CTASection.module.css";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section id="cta" className={classes.cta}>
      <Container size="md" py={80}>
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <Paper radius="xl" p="xl" shadow="lg" className={classes.ctaCard}>
            <Stack align="center" ta="center" gap="xl">
              <div>
                <Title order={2} c="dark" className={classes.title}>
                  {CTA_CONFIG.title}
                </Title>
                <Text
                  size="xl"
                  c="gray.7"
                  className={classes.description}
                  mt="md"
                >
                  {CTA_CONFIG.description}
                </Text>
              </div>

              <Group justify="center" className={classes.buttonGroup}>
                <Button
                  size="xl"
                  variant="filled"
                  className={classes.primaryButton}
                  onClick={() => navigate("/provider-lookup")}
                >
                  {CTA_CONFIG.primaryCTA}
                </Button>
              </Group>

              <Text size="sm" c="gray.6" className={classes.disclaimer}>
                {CTA_CONFIG.disclaimer}
              </Text>
            </Stack>
          </Paper>
        </motion.div>
      </Container>
    </section>
  );
};

export default CTASection;