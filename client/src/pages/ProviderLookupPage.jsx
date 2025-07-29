import React, { useState, useEffect } from 'react';
import { Container, Title, Text, MultiSelect, Select, Grid, Paper, Stack } from '@mantine/core';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '../animations/variants';
import ProviderCard from '../components/ui/ProviderCard';
import classes from './ProviderLookupPage.module.css';
import apiClient from '../utils/apiClient';

const ProviderLookupPage = () => {
    const [providers, setProviders] = useState([]);
    const [filteredProviders, setFilteredProviders] = useState([]);
    const [myNeeds, setMyNeeds] = useState([]);
    const [insurance, setInsurance] = useState(null);

    const [needsData, setNeedsData] = useState([]);
    const [insuranceData, setInsuranceData] = useState([]);

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const response = await apiClient.get('/public/providers', {}, false);
                const fetchedProviders = response.providers.map(p => {
                    let headshotUrl = p.headshot_url;
                    // Check if the URL is an S3 URL. If not, set to null to trigger fallback.
                    // Using a more generic S3 pattern check
                    const isS3Url = headshotUrl && (
                        headshotUrl.includes('s3.amazonaws.com') || 
                        headshotUrl.includes('s3-') || // Covers s3-region.amazonaws.com
                        (process.env.REACT_APP_S3_BUCKET_NAME && headshotUrl.includes(process.env.REACT_APP_S3_BUCKET_NAME))
                    );

                    if (!isS3Url) {
                        headshotUrl = null;
                    }

                    return {
                        id: p.id,
                        name: `${p.first_name} ${p.last_name}`,
                        qualifications: p.education,
                        specialties: p.specialty || [],
                        experience: `${p.experience_years} years`,
                        communicationStyle: p.communication_style || 'N/A',
                        headshot: headshotUrl,
                        approach: p.about_me,
                        interests: p.hobbies,
                        location: p.location,
                        insurance: p.insurance_networks || []
                    };
                });
                setProviders(fetchedProviders);
                setFilteredProviders(fetchedProviders);

                // Extract unique values for filters
                const specialties = [...new Set(fetchedProviders.flatMap(p => p.specialties))];
                const experiences = [...new Set(fetchedProviders.map(p => p.experience))];
                const communicationStyles = [...new Set(fetchedProviders.map(p => p.communicationStyle))];
                const insurances = [...new Set(fetchedProviders.flatMap(p => p.insurance))];

                setNeedsData([
                    { group: 'Specialty', items: specialties },
                    { group: 'Experience', items: experiences },
                    { group: 'Communication Style', items: communicationStyles },
                ]);
                setInsuranceData(insurances);

            } catch (error) {
                console.error("Failed to fetch providers:", error);
            }
        };

        fetchProviders();
    }, []);

    useEffect(() => {
        const filterProviders = () => {
            let updatedProviders = providers;

            if (myNeeds.length > 0) {
                updatedProviders = updatedProviders.filter(provider => 
                    myNeeds.every(need => 
                        (provider.specialties && provider.specialties.includes(need)) || 
                        provider.experience === need || 
                        provider.communicationStyle === need
                    )
                );
            }

            if (insurance) {
                updatedProviders = updatedProviders.filter(provider => provider.insurance && provider.insurance.includes(insurance));
            }

            setFilteredProviders(updatedProviders);
        };

        filterProviders();
    }, [myNeeds, insurance, providers]);

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
                                            data={insuranceData}
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
