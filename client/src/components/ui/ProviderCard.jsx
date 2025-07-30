import { Card, Image, Text, Button, Group, Badge, Center, Grid, Box } from '@mantine/core';
import { motion } from 'framer-motion';
import { IconUserCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { fadeInUp } from '../../animations/variants';

const ProviderCard = ({ provider }) => {
    const { name, qualifications, specialties, experience, headshot } = provider;
    const navigate = useNavigate();

    const handleViewProfile = () => {
        navigate(`/provider-profile/${name}`, { state: { provider } });
    };

    return (
        <motion.div variants={fadeInUp}>
            <Card shadow="sm" p="lg" radius="md" withBorder>
                <Grid>
                    <Grid.Col span={4}>
                        {headshot ? (
                            <Box h={120} w={120}>
                                <Image
                                    src={headshot}
                                    height="100%"
                                    width="100%"
                                    radius="md"
                                    alt={name}
                                    fit="cover"
                                />
                            </Box>
                        ) : (
                            <Center h={120} w={120} bg="gray.1" style={{ borderRadius: '7px' }}>
                                <IconUserCircle size={60} color="gray" />
                            </Center>
                        )}
                    </Grid.Col>
                    <Grid.Col span={8}>
                        <Group justify="space-between">
                            <Text fw={500}>{name}</Text>
                            <Badge color="pink" variant="light">
                                {qualifications}
                            </Badge>
                        </Group>
                        <Text size="sm" c="dimmed">
                            <strong>Experience:</strong> {experience}
                        </Text>
                        <Group gap="xs" mt="xs">
                            {specialties.map((specialty, index) => (
                                <Badge key={index} variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 90 }}>
                                    {specialty}
                                </Badge>
                            ))}
                        </Group>
                    </Grid.Col>
                </Grid>
                <Group justify="space-between" mt="md">
                    <div>
                        <Text size="sm" c="dimmed">Next Available:</Text>
                        <Text fw={500}> </Text>
                    </div>
                    <Button variant="light" color="blue" mt="md" radius="md" onClick={handleViewProfile}>
                        View Profile
                    </Button>
                </Group>
            </Card>
        </motion.div>
    );
};

export default ProviderCard;