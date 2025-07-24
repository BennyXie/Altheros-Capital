import React from "react";
import { motion } from "framer-motion";
import {
  Container,
  Title,
  Text,
  Stack,
  Button,
  Group,
  Accordion,
  Card,
  SimpleGrid,
  Box,
} from "@mantine/core";
import {
  IconCheck,
  IconUsers,
  IconTarget,
  IconAward,
  IconShield,
  IconHeart,
  IconHome,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import {
  staggerContainer,
  slideInLeft,
  fadeInUp,
} from "../animations/variants";
import heroImage from "../assets/hero.png";
import classes from "./AboutPage.module.css";
import { CTASection } from "../components/landing";

/**
 * About Page Component
 *
 * Comprehensive about page with hero, content, timeline, FAQ, and CTA sections
 */
const AboutPage = () => {
  const targetDemographics = [
    {
      title: "Veterans",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      icon: <IconShield size={48} color="var(--color-primary)" />,
    },
    {
      title: "First Responders",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      icon: <IconHeart size={48} color="var(--color-primary)" />,
    },
    {
      title: "Families",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      icon: <IconHome size={48} color="var(--color-primary)" />,
    },
  ];

  const faqData = [
    {
      question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    },
    {
      question: "Sed do eiusmod tempor incididunt ut labore et dolore?",
      answer:
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    },
    {
      question: "Ut enim ad minim veniam, quis nostrud exercitation?",
      answer:
        "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt.",
    },
    {
      question: "Quis nostrud exercitation ullamco laboris nisi?",
      answer:
        "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.",
    },
    {
      question: "Excepteur sint occaecat cupidatat non proident?",
      answer:
        "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.",
    },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      style={{ minHeight: "100vh" }}
    >
      {/* Hero Section */}
      <section className={classes.heroSection}>
        <div
          className={classes.background}
          style={{ backgroundImage: `url(${heroImage})` }}
        />

        <div className={classes.overlay}>
          <Container size="xl" className={classes.container}>
            <motion.div variants={slideInLeft}>
              <Stack gap="md" className={classes.content}>
                <Title order={1} className={classes.title}>
                  Premium healthcare
                  <br />
                  <span className={classes.highlightedText}>
                    shouldn't be a
                  </span>
                  <br />
                  <span className={classes.highlightedText}>luxury</span>
                </Title>
              </Stack>
            </motion.div>
          </Container>
        </div>
      </section>

      {/* Content Section */}
      <Container size="lg" py={80}>
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <Stack gap="xl" ta="center">
            <Title order={2} size="h2" fw={600} c="var(--color-primary)">
              Transforming Healthcare Access
            </Title>

            <Text
              size="lg"
              c="var(--color-text-secondary)"
              maw={800}
              mx="auto"
              lh={1.7}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </Text>

            <Text
              size="lg"
              c="var(--color-text-secondary)"
              maw={800}
              mx="auto"
              lh={1.7}
            >
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum.
            </Text>

            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt="xl">
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack align="center" ta="center">
                  <IconUsers size={40} color="var(--color-primary)" />
                  <Title order={4}>Patient-Centered</Title>
                  <Text size="sm" c="dimmed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit
                  </Text>
                </Stack>
              </Card>

              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack align="center" ta="center">
                  <IconTarget size={40} color="var(--color-primary)" />
                  <Title order={4}>Precision Care</Title>
                  <Text size="sm" c="dimmed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit
                  </Text>
                </Stack>
              </Card>

              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack align="center" ta="center">
                  <IconAward size={40} color="var(--color-primary)" />
                  <Title order={4}>Excellence</Title>
                  <Text size="sm" c="dimmed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit
                  </Text>
                </Stack>
              </Card>
            </SimpleGrid>
          </Stack>
        </motion.div>
      </Container>

      {/* Target Demographics Section */}
      <Box
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container size="lg" py={100}>
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <Stack gap="xl">
              <div style={{ textAlign: "center" }}>
                <Title order={2} size="h2" fw={700} c="white" mb="md">
                  Who We Serve
                </Title>
                <Text
                  size="xl"
                  c="rgba(255,255,255,0.9)"
                  maw={800}
                  mx="auto"
                  lh={1.6}
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua
                </Text>
              </div>

              <SimpleGrid cols={{ base: 1, md: 3 }} spacing={60} mt={60}>
                {targetDemographics.map((group, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    whileHover={{
                      scale: 1.05,
                      transition: { duration: 0.3 },
                    }}
                  >
                    <Card
                      style={{
                        backgroundColor: "white",
                        borderRadius: "50%",
                        aspectRatio: "1",
                        display: "flex",
                        flexDirection: "center",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "2rem",
                        textAlign: "center",
                        border: "none",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                        cursor: "pointer",
                        minHeight: "300px",
                        maxHeight: "400px",
                        margin: "0 auto",
                      }}
                    >
                      <Stack
                        align="center"
                        gap="md"
                        style={{ height: "100%", justifyContent: "center" }}
                      >
                        <div style={{ marginBottom: "0.5rem" }}>
                          {group.icon}
                        </div>
                        <Title
                          order={3}
                          size="h3"
                          fw={700}
                          c="var(--color-primary)"
                        >
                          {group.title}
                        </Title>
                        <Text
                          size="sm"
                          c="var(--color-text-secondary)"
                          lh={1.5}
                          style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {group.description}
                        </Text>
                      </Stack>
                    </Card>
                  </motion.div>
                ))}
              </SimpleGrid>
            </Stack>
          </motion.div>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Container size="lg" py={80}>
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <Stack gap="xl">
            <div style={{ textAlign: "center" }}>
              <Title
                order={2}
                size="h2"
                fw={600}
                c="var(--color-primary)"
                mb="md"
              >
                Frequently Asked Questions
              </Title>
              <Text
                size="lg"
                c="var(--color-text-secondary)"
                maw={600}
                mx="auto"
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt
              </Text>
            </div>

            <Accordion variant="separated" radius="md">
              {faqData.map((item, index) => (
                <Accordion.Item key={index} value={index.toString()}>
                  <Accordion.Control>
                    <Text fw={500}>{item.question}</Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Text>{item.answer}</Text>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </Stack>
        </motion.div>
      </Container>

      {/* CTA Section */}
      <CTASection />

      <Box
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
          color: "white",
        }}
      >
        <Container size="md" py={80}>
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <Stack align="center" ta="center" gap="xl">
              <div>
                <Title order={2} c="white" mb="md">
                  Ready to Experience Premium Healthcare?
                </Title>
                <Text size="xl" c="gray.1" maw={600} mx="auto">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </Text>
              </div>

              <Group justify="center" gap="lg">
                <Button
                  component={Link}
                  to="/signup"
                  size="xl"
                  variant="white"
                  color="dark"
                  leftSection={<IconCheck size={20} />}
                >
                  Start Your Journey
                </Button>
                <Button
                  component={Link}
                  to="/auth"
                  size="xl"
                  variant="outline"
                  style={{ borderColor: "white", color: "white" }}
                >
                  Sign In
                </Button>
              </Group>
            </Stack>
          </motion.div>
        </Container>
      </Box>
    </motion.div>
  );
};

export default AboutPage;
