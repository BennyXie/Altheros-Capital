import React, { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { Container, Grid, Card, Image, Text, Badge, Group, Title, Paper, Center, Box, Button, Loader } from '@mantine/core';
import { IconUserCircle, IconMessageCircle } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '../animations/variants';
import { useAuth } from '../context/AuthContext';

const ProviderProfilePage = () => {
    const location = useLocation();
    const { provider } = location.state || {};
    const { user, loading, profileStatus } = useAuth(); // Destructure profileStatus from useAuth()
    const navigate = useNavigate();

    const handleChatButtonClick = useCallback(() => {
        console.log('Chat button clicked!');
        console.log('User:', user);
        console.log('Profile Status:', JSON.stringify(profileStatus));
        console.log('Provider object in handleChatButtonClick:', provider);
        console.log('Provider Cognito ID in handleChatButtonClick:', provider?.cognito_id);

        if (!user) {
            notifications.show({
                title: 'Sign In Required',
                message: 'Please sign in to start a chat.',
                color: 'blue',
            });
            // Optionally redirect to login page
            // navigate('/prelogin');
        } else if (user.attributes && user.attributes['custom:role'] !== 'patient') {
            notifications.show({
                title: 'Access Denied',
                message: 'Only patients can initiate chats with providers.',
                color: 'red',
            });
        } else if (!profileStatus.isProfileComplete) {
            notifications.show({
                title: 'Profile Incomplete',
                message: 'Please complete your patient profile to start a chat.',
                color: 'orange',
            });
            navigate('/complete-profile');
        } else {
            if (provider && provider.cognito_id) {
                navigate(`/chat/${provider.cognito_id}`);
            } else {
                console.error("Error: Provider Cognito ID is missing. Cannot navigate to chat.", provider);
                notifications.show({
                    title: 'Chat Error',
                    message: 'Provider ID is missing. Cannot start chat.',
                    color: 'red',
                });
            }
        }
    }, [user, profileStatus, navigate, provider]);

    // Display loading state for auth
    if (loading) {
        return (
            <Container size="xl" py={40} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <Loader size="xl" />
            </Container>
        );
    }

    // Handle case where provider data is not found
    if (!provider) {
        return <Container><Text>Provider not found.</Text></Container>;
    }

    const { name, title, qualifications, acceptedInsurance, headshot, approach, interests, location: providerLocation, languages, specialties, yearsOfExperience } = provider;

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
                                            <Button
                                                leftSection={<IconMessageCircle size={16} />}
                                                variant="filled"
                                                color="teal"
                                                onClick={handleChatButtonClick}
                                            >
                                                Chat with {name}
                                            </Button>
                                        </Group>
                                    </Grid.Col>
                                </Grid>

                                <Paper withBorder p="md" mt="xl">
                                    <Title order={4}>Approach to Therapy</Title>
                                    <Text mt="sm">{approach}</Text>
                                </Paper>

                                <Paper withBorder p="md" mt="md">
                                    <Title order={4}>About Me</Title>
                                    <div mt="sm">
                                        <ul>
                                            <li><strong>Location:</strong> {providerLocation}</li>
                                            <li><strong>Languages:</strong> {languages && languages.join(', ')}</li>
                                            <li><strong>Specialties:</strong> {specialties && specialties.join(', ')}</li>
                                            <li><strong>Years of Experience:</strong> {yearsOfExperience}</li>
                                        </ul>
                                    </div>
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