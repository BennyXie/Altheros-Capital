import { Container, Title, Text, Button, Group, Stack } from '@mantine/core';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../../animations/variants';
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
              <Title order={2} className={classes.title}>
                Ready to Transform Your Business?
              </Title>
              <Text size="xl" className={classes.description} mt="md">
                Join thousands of companies already using our platform to 
                drive growth, improve efficiency, and achieve their goals.
              </Text>
            </div>

            <Group justify="center" gap="lg" className={classes.buttonGroup}>
              <Button 
                size="xl" 
                variant="filled"
                className={classes.primaryButton}
              >
                Start Free Trial
              </Button>
              <Button 
                size="xl" 
                variant="outline"
                className={classes.secondaryButton}
              >
                Schedule Demo
              </Button>
            </Group>

            <Text size="sm" c="dimmed" className={classes.disclaimer}>
              No credit card required • 14-day free trial • Cancel anytime
            </Text>
          </Stack>
        </motion.div>
      </Container>
    </section>
  );
};

export default CTASection;
