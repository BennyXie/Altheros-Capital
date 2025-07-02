import { Container, Title, Text, TextInput, Paper, Stack } from "@mantine/core";
import { motion } from "framer-motion";
import { IconSearch } from "@tabler/icons-react";
import { fadeInUp } from "../../../animations/variants";
import { INSURER_CONFIG } from "../../../config/landingConfig";
import classes from "./InsurerSection.module.css";

/**
 * Insurer Cost Estimation Section Component
 * 
 * Allows users to search for their insurance provider to estimate costs.
 * This section appears after the hero section in the design.
 */
const InsurerSection = () => {
  return (
    <section className={classes.insurer}>
      <Container size="lg" py={60}>
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <Paper className={classes.paper} p="xl" radius="md">
            <Stack gap="md" align="center">
              <Title order={3} className={classes.title}>
                {INSURER_CONFIG.title}
              </Title>
              
              <Text className={classes.subtitle}>
                {INSURER_CONFIG.subtitle}
              </Text>
              
              <TextInput
                placeholder={INSURER_CONFIG.placeholder}
                size="lg"
                leftSection={<IconSearch size={20} />}
                className={classes.searchInput}
                styles={{
                  input: {
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }
                }}
              />
            </Stack>
          </Paper>
        </motion.div>
      </Container>
    </section>
  );
};

export default InsurerSection;
