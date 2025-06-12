import { useEffect, useState } from "react";
import { MantineProvider, Container, Title, Text, Paper, Group, Button } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { theme } from './styles/theme';
import { fadeInUp, staggerContainer } from './animations/variants';

// Import Mantine core styles
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

// main UI component
function App() {
  const [message, setMessage] = useState("");

  // fetch from backend
  useEffect(() => {
    fetch("http://localhost:5000/helloWorld") // we don't need to specify the full URL since the proxy is set in package.json
    .then(res => res.json())
    .then(data => setMessage(data.message));
  }, []);

  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <Container size="md" py="xl">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <Paper shadow="md" p="xl" radius="md">
            <motion.div variants={fadeInUp}>
              <Title order={1} ta="center" mb="md">
                Altheros Capital
              </Title>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <Text size="lg" ta="center" c="dimmed" mb="xl">
                Frontend powered by Mantine & Framer Motion
              </Text>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Paper bg="gray.1" p="md" radius="sm" mb="md">
                <Text fw={500} mb="xs">Message from backend:</Text>
                <Text>{message || "Loading..."}</Text>
              </Paper>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Group justify="center">
                <Button variant="filled" size="md">
                  Get Started
                </Button>
                <Button variant="outline" size="md">
                  Learn More
                </Button>
              </Group>
            </motion.div>
          </Paper>
        </motion.div>
      </Container>
    </MantineProvider>
  )
}

export default App;
