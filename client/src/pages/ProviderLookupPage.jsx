import React, { useState } from 'react';
import { Container, Title, Text, MultiSelect, Select, Grid, Paper, Stack } from '@mantine/core';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '../animations/variants';
import ProviderCard from '../components/ui/ProviderCard';
import classes from './ProviderLookupPage.module.css';

const ProviderLookupPage = () => {
    const [myNeeds, setMyNeeds] = useState([]);
    const [insurance, setInsurance] = useState(null);

    // Dummy data for now
    const providers = [
        {
            name: 'Dr. John Doe',
            qualifications: 'MD, PhD',
            specialties: ['Anxiety', 'Depression'],
            experience: '10+ years',
            communicationStyle: 'Direct',
            insurance: ['Blue Cross Blue Shield', 'Aetna'],
            headshot: 'https://via.placeholder.com/150',
            approach: 'Cognitive Behavioral Therapy (CBT)',
            interests: 'Hiking, reading, and playing the piano.',
            location: 'Chicago, IL'
        },
        {
            name: 'Dr. Jane Smith',
            qualifications: 'MD',
            specialties: ['Trauma', 'PTSD'],
            experience: '5-10 years',
            communicationStyle: 'Empathetic',
            insurance: ['Cigna', 'United Healthcare'],
            headshot: 'https://via.placeholder.com/150',
            approach: 'Eye Movement Desensitization and Reprocessing (EMDR)',
            interests: 'Yoga, cooking, and traveling.',
            location: 'New York, NY'
        },
        {
            name: 'Dr. Sam Jones',
            qualifications: 'PsyD',
            specialties: ['Anxiety', 'Trauma'],
            experience: '1-5 years',
            communicationStyle: 'Direct',
            insurance: ['Aetna', 'Cigna'],
            headshot: '',
            approach: 'Acceptance and Commitment Therapy (ACT)',
            interests: 'Running, photography, and spending time with family.',
            location: 'Los Angeles, CA'
        }
    ];

    const needsData = [
        { group: 'Specialty', items: ['Anxiety', 'Depression', 'Trauma', 'PTSD'] },
        { group: 'Experience', items: ['1-5 years', '5-10 years', '10+ years'] },
        { group: 'Communication Style', items: ['Direct', 'Empathetic'] },
    ];

    const filteredProviders = providers.filter(provider => {
        const needsMatch = myNeeds.length === 0 || myNeeds.every(need => 
            provider.specialties.includes(need) || 
            provider.experience === need || 
            provider.communicationStyle === need
        );
        const insuranceMatch = !insurance || provider.insurance.includes(insurance);
        return needsMatch && insuranceMatch;
    });

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <Paper className={classes.hero} radius={0}>
                <Container size="xl">
                    <motion.div variants={fadeInUp}>
                        <Title order={1} className={classes.title}>
                            Find the Right Therapist for You
                        </Title>
                        <Text className={classes.description}>
                            Our platform connects you with a diverse network of licensed professionals. 
                            Use the filters to find a therapist who matches your specific needs and preferences.
                        </Text>
                        <div className={classes.filters}>
                            <Grid>
                                <Grid.Col span={{ base: 12, md: 6 }}>
                                    <Stack>
                                        <MultiSelect
                                            label="My Needs"
                                            placeholder="Select all that apply"
                                            data={needsData.map(group => ({ group: group.group, items: group.items }))}
                                            value={myNeeds}
                                            onChange={setMyNeeds}
                                            searchable
                                            clearable
                                        />
                                        <Select
                                            label="Insurance"
                                            placeholder="Select your insurance"
                                            data={['Blue Cross Blue Shield', 'Aetna', 'Cigna', 'United Healthcare']}
                                            value={insurance}
                                            onChange={setInsurance}
                                            clearable
                                        />
                                    </Stack>
                                </Grid.Col>
                            </Grid>
                        </div>
                    </motion.div>
                </Container>
            </Paper>

            <Container size="xl" py="xl">
                <Grid mt="xl">
                    {filteredProviders.map((provider, index) => (
                        <Grid.Col key={index} span={{ base: 12, md: 6, lg: 4 }}>
                            <ProviderCard provider={provider} />
                        </Grid.Col>
                    ))}
                </Grid>
            </Container>
        </motion.div>
    );
};

export default ProviderLookupPage;
