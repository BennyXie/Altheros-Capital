import React from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Grid, Card, Image, Text, Badge, Group, Title, Paper, Center, Box } from '@mantine/core';
import { IconUserCircle } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '../animations/variants';

const ProviderProfilePage = () => {
    const location = useLocation();
    const { provider } = location.state || {};

    if (!provider) {
        return <Container><Text>Provider not found.</Text></Container>;
    }

    const { name, title, qualifications, acceptedInsurance, headshot, approach, interests, location: providerLocation, languages, specialties, yearsOfExperience } = provider;

    const canChat = user && user.attributes['custom:role'] === 'patient' && profileStatus.isProfileComplete;

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <Container size="xl" py="xl">
                <Grid gutter="xl">
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <motion.div variants={fadeInUp}>
                            <Card shadow="sm" p="lg" radius="md" withBorder>
                                <Grid gutter="xl">
                                    <Grid.Col span={{ base: 12, sm: 4 }}>
                                        {headshot ? (
                                            <Box h={200} w={200}>
                                                <Image
                                                    src={headshot}
                                                    radius="md"
                                                    alt={name}
                                                    fit="cover"
                                                    h="100%"
                                                    w="100%"
                                                />
                                            </Box>
                                        ) : (
                                            <Center h={200} w={200} bg="gray.1">
                                                <IconUserCircle size={80} color="gray" />
                                            </Center>
                                        )}
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, sm: 8 }}>
                                        <Title order={2}>{name}</Title>
                                        <Text size="lg" c="dimmed" mt="sm">{title}</Text>
                                        <Badge size="lg" variant="light" color="pink" mt="sm">{qualifications}</Badge>
                                        <Group mt="md">
                                            <Text size="md">Accepted Insurance:</Text>
                                            {acceptedInsurance && acceptedInsurance.map((insurance, index) => (
                                                <Badge key={index} variant="outline">
                                                    {insurance}
                                                </Badge>
                                            ))}
                                        </Group>
                                    <Group mt="md">
                                            {canChat && (
                                                <Button
                                                    component={Link}
                                                    to={`/chat/${provider.cognito_id}`}
                                                    leftSection={<IconMessageCircle size={16} />}
                                                    variant="filled"
                                                    color="teal"
                                                >
                                                    Chat with {name}
                                                </Button>
                                            )}
                                        </Group>
                                    </Grid.Col>
                                </Grid>

                                <Paper withBorder p="md" mt="xl">
                                    <Title order={4}>Approach to Therapy</Title>
                                    <Text mt="sm">{approach}</Text>
                                </Paper>

                                <Paper withBorder p="md" mt="md">
                                    <Title order={4}>About Me</Title>
                                    <Text mt="sm">
                                        <ul>
                                            <li><strong>Location:</strong> {providerLocation}</li>
                                            <li><strong>Languages:</strong> {languages && languages.join(', ')}</li>
                                            <li><strong>Specialties:</strong> {specialties && specialties.join(', ')}</li>
                                            <li><strong>Years of Experience:</strong> {yearsOfExperience}</li>
                                        </ul>
                                    </Text>
                                </Paper>

                                <Paper withBorder p="md" mt="md">
                                    <Title order={4}>Interests & Hobbies</Title>
                                    <Text mt="sm">{interests}</Text>
                                </Paper>
                            </Card>
                        </motion.div>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <motion.div variants={fadeInUp}>
                            <Paper shadow="sm" radius="md" withBorder>
                                <iframe
                                    src="https://cal.com/your-calendly-link"
                                    width="100%"
                                    height="400px"
                                    frameBorder="0"
                                    title="Cal Scheduling Widget"
                                ></iframe>
                            </Paper>
                            <Paper shadow="sm" radius="md" withBorder p="md" mt="xl">
                                <Title order={4} ta="center">Next Available Appointments</Title>
                                <Text ta="center" c="dimmed" mt="sm">Feature coming soon.</Text>
                            </Paper>
                        </motion.div>
                    </Grid.Col>
                </Grid>
            </Container>
        </motion.div>
    );
};

export default ProviderProfilePage;
