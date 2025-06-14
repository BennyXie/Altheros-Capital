import { Container, Title, Text, Paper, Avatar, Group, Stack, SimpleGrid, Rating } from '@mantine/core';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../../animations/variants';
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
  // Testimonials data - easy to update and manage
  const testimonials = [
    {
      id: 1,
      quote: "This platform has completely transformed how we operate. The efficiency gains have been remarkable, and the support team is outstanding.",
      name: "Sarah Johnson",
      title: "CTO",
      company: "TechCorp Inc.",
      rating: 5,
      avatar: null // You can add avatar URLs here
    },
    {
      id: 2,
      quote: "We've seen a 300% increase in productivity since implementing this solution. It's intuitive, powerful, and scales perfectly with our growth.",
      name: "Michael Chen",
      title: "Operations Director",
      company: "Growth Dynamics",
      rating: 5,
      avatar: null
    },
    {
      id: 3,
      quote: "The best investment we've made for our business. The ROI was apparent within the first month, and it just keeps getting better.",
      name: "Emily Rodriguez",
      title: "Founder & CEO",
      company: "StartupSuccess",
      rating: 5,
      avatar: null
    }
  ];

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
              <Title order={2} ta="center" className={classes.title}>
                What Our Customers Say
              </Title>
              <Text size="lg" c="dimmed" ta="center" maw={600}>
                Don't just take our word for it. Here's what business leaders 
                are saying about their experience with our platform.
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
                        <Text size="sm" fw={600} className={classes.name}>
                          {testimonial.name}
                        </Text>
                        <Text size="xs" c="dimmed" className={classes.title}>
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
