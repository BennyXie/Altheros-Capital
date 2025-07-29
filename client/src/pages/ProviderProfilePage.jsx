import React from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Grid, Card, Image, Text, Badge, Group, Title, Paper, Center } from '@mantine/core';
import { IconUserCircle } from '@tabler/icons-react';

const ProviderProfilePage = () => {
    const location = useLocation();
    const { provider } = location.state || {};

    if (!provider) {
        return <Container><Text>Provider not found.</Text></Container>;
    }

    const { name, qualifications, specialties, experience, communicationStyle, headshot, approach, interests, location: providerLocation } = provider;

    return (
        <Container size="xl" py="xl">
            <Grid gutter="xl">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Card shadow="sm" p="lg" radius="md" withBorder>
                        <Grid gutter="xl">
                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                {headshot ? (
                                    <Image
                                        src={headshot}
                                        radius="md"
                                        alt={name}
                                        fit="cover"
                                        h={200}
                                        w="100%"
                                    />
                                ) : (
                                    <Center h={200} bg="gray.1">
                                        <IconUserCircle size={80} color="gray" />
                                    </Center>
                                )}
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 8 }}>
                                <Group justify="space-between">
                                    <Title order={2}>{name}</Title>
                                    <Badge size="lg" variant="light" color="pink">{qualifications}</Badge>
                                </Group>
                                <Text size="lg" c="dimmed" mt="sm">{providerLocation}</Text>
                                <Group mt="md">
                                    {specialties.map((specialty, index) => (
                                        <Badge key={index} variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 90 }}>
                                            {specialty}
                                        </Badge>
                                    ))}
                                </Group>
                            </Grid.Col>
                        </Grid>

                        <Paper withBorder p="md" mt="xl">
                            <Title order={4}>Approach to Therapy</Title>
                            <Text mt="sm">{approach}</Text>
                        </Paper>

                        <Paper withBorder p="md" mt="md">
                            <Title order={4}>Interests & Hobbies</Title>
                            <Text mt="sm">{interests}</Text>
                        </Paper>

                        <Paper withBorder p="md" mt="md">
                            <Title order={4}>Accepted Insurance</Title>
                            <Text mt="sm">Blue Cross Blue Shield, Aetna, Cigna</Text>
                        </Paper>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Paper shadow="sm" radius="md" withBorder>
                        <iframe
                            src="https://cal.com/your-calendly-link"
                            width="100%"
                            height="400px"
                            frameBorder="0"
                        ></iframe>
                    </Paper>
                    <Paper shadow="sm" radius="md" withBorder p="md" mt="xl">
                        <Title order={4} ta="center">Next Available Appointments</Title>
                        <Text ta="center" c="dimmed" mt="sm">Feature coming soon.</Text>
                    </Paper>
                </Grid.Col>
            </Grid>
        </Container>
    );
};

export default ProviderProfilePage;
