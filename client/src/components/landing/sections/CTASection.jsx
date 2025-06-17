import { Container, Title, Text, Button, Group, Stack } from '@mantine/core';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../../animations/variants';
import { CTA_CONFIG } from '../../../config/landingConfig';
import classes from './CTASection.module.css';

/**
 * Call-to-Action Section Component
 * 
 * Final conversion section that encourages users to take action.
 * Should be compelling and create urgency without being pushy.
 * 
 * Typically includes:
 * - Compelling headline
 * - Brief value reminder
 * - Primary and secondary CTAs
 * - Optional urgency element
 * 
 * @component
 * @example
 * return (
 *   <CTASection />
 * )
 */
const CTASection = () => {
  return (
    <section id="cta" className={classes.cta}>
      <Container size="md" py={80}>
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <Stack align="center" ta="center" gap="xl">
            <div>
              <Title order={2} c="white" className={classes.title}>
                {CTA_CONFIG.title}
              </Title>
              <Text size="xl" c="gray.1" className={classes.description} mt="md">
                {CTA_CONFIG.description}
              </Text>
            </div>

            <Group justify="center" gap="lg" className={classes.buttonGroup}>
              <Button 
                size="xl" 
                variant="action"
                className={classes.primaryButton}
              >
                {CTA_CONFIG.primaryCTA}
              </Button>
              <Button 
                size="xl" 
                variant="outline"
                c="white"
                style={{ borderColor: 'white' }}
                className={classes.secondaryButton}
              >
                {CTA_CONFIG.secondaryCTA}
              </Button>
            </Group>

            <Text size="sm" c="gray.2" className={classes.disclaimer}>
              {CTA_CONFIG.disclaimer}
            </Text>
          </Stack>
        </motion.div>
      </Container>
    </section>
  );
};

export default CTASection;
