import { motion } from 'framer-motion';
import { Container, Title, Text, Stack } from '@mantine/core';
import { slideInLeft } from '../../../animations/variants';
import classes from './LoginHeroSection.module.css';

/**
 * Login Hero Section Component
 * 
 * Hero section for the login page with title and description.
 */
const LoginHeroSection = () => {
  return (
    <section className={classes.hero}>
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
              Welcome Back
            </Title>
            
            <Text 
              size="lg" 
              c="var(--color-text-secondary)"
              maw={600}
              mx="auto"
              lh={1.6}
            >
              Sign in to your account to access your dashboard and manage your investments.
            </Text>
          </Stack>
        </motion.div>
      </Container>
    </section>
  );
};

export default LoginHeroSection;
