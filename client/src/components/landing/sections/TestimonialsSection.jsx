import { Container, Title, Text, Paper, Avatar, Group, Stack, SimpleGrid, Rating } from '@mantine/core';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../../animations/variants';
import { TESTIMONIALS_CONFIG } from '../../../config/landingConfig';
import classes from './TestimonialsSection.module.css';

/**
 * Testimonials Section Component
 * 
 * Displays customer testimonials to build social proof and credibility.
 * Testimonials are stored in a data array for easy management.
 * 
 * Each testimonial includes:
 * - Customer quote
 * - Customer name and title
 * - Company name
 * - Star rating
 * - Avatar (optional)
 * 
 * @component
 * @example
 * return (
 *   <TestimonialsSection />
 * )
 */
const TestimonialsSection = () => {
  // Testimonials data from configuration
  const testimonials = TESTIMONIALS_CONFIG.testimonials;

  return (
    <section id="testimonials" className={classes.testimonials}>
      <Container size="xl" py={80}>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.div variants={fadeInUp}>
            <Stack align="center" mb={60}>
              <Title order={2} ta="center" c="accent.6" className={classes.title}>
                {TESTIMONIALS_CONFIG.title}
              </Title>
              <Text size="lg" c="accent.5" ta="center" maw={600}>
                {TESTIMONIALS_CONFIG.subtitle}
              </Text>
            </Stack>
          </motion.div>

          <SimpleGrid 
            cols={{ base: 1, sm: 2, lg: 3 }} 
            spacing="xl"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={testimonial.id}
                variants={fadeInUp}
                transition={{ delay: index * 0.2 }}
              >
                <Paper 
                  p="xl" 
                  radius="lg" 
                  className={classes.testimonialCard}
                  shadow="sm"
                >
                  <Stack gap="md">
                    <Rating value={testimonial.rating} readOnly size="sm" />
                    
                    <Text 
                      size="md" 
                      c="accent.5"
                      style={{ fontStyle: 'italic' }}
                      className={classes.quote}
                    >
                      "{testimonial.quote}"
                    </Text>
                    
                    <Group gap="sm">
                      <Avatar 
                        size={40} 
                        radius="xl"
                        src={testimonial.avatar}
                        className={classes.avatar}
                      >
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Stack gap={2}>
                        <Text size="sm" fw={600} c="accent.6" className={classes.name}>
                          {testimonial.name}
                        </Text>
                        <Text size="xs" c="accent.4" className={classes.title}>
                          {testimonial.title}, {testimonial.company}
                        </Text>
                      </Stack>
                    </Group>
                  </Stack>
                </Paper>
              </motion.div>
            ))}
          </SimpleGrid>
        </motion.div>
      </Container>
    </section>
  );
};

export default TestimonialsSection;
