import React from 'react';
import { motion } from 'framer-motion';
import { Container, Title, Text, Stack } from '@mantine/core';
import { staggerContainer, slideInLeft } from '../animations/variants';

/**
 * About Page Component
 * 
 * Simple about page with company information.
 * Uses theme.js for styling consistency.
 */
const AboutPage = () => {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--color-bg-light) 0%, var(--mint-lighter) 100%)',
        paddingTop: '2rem',
        paddingBottom: '2rem'
      }}
    >
      <Container size="lg">
        <motion.div variants={slideInLeft}>
          <Stack gap="xl" ta="center">
            <Title 
              order={1} 
              size="h1" 
              fw={700}
              c="var(--color-primary)"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
            >
              About Altheros Capital
            </Title>
            
            <Text 
              size="lg" 
              c="var(--color-text-secondary)"
              maw={800}
              mx="auto"
              lh={1.6}
            >
              We are a forward-thinking investment firm dedicated to helping our clients 
              achieve their financial goals through innovative strategies and personalized service.
            </Text>
            
            <Text 
              size="md" 
              c="var(--color-text-secondary)"
              maw={600}
              mx="auto"
              lh={1.6}
            >
              Our team of experienced professionals combines deep market knowledge with 
              cutting-edge technology to deliver exceptional results for our clients.
            </Text>
          </Stack>
        </motion.div>
      </Container>
    </motion.div>
  );
};

export default AboutPage;
