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
                    console.log("Provider object from backend in ProviderLookupPage:", p);
                    console.log("p.cognito_sub in ProviderLookupPage:", p.cognito_sub);
                    let headshotUrl = p.headshot_url;
                    console.log("Original headshot_url:", headshotUrl);
                    
                    // Check if the URL is a valid image URL
                    // Allow all HTTPS URLs for now since we're having S3 permission issues
                    const isValidImageUrl = headshotUrl && (
                        headshotUrl.startsWith('https://') && (
                            headshotUrl.includes('amazonaws.com') || // AWS S3 URLs
                            headshotUrl.includes('cloudfront.net') || // CloudFront URLs
                            headshotUrl.includes('.s3.') || // S3 bucket URLs
                            headshotUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) // Image file extensions
                        )
                    );

                    console.log("Is valid image URL:", isValidImageUrl, "for URL:", headshotUrl);

                    if (!isValidImageUrl) {
                        console.log("Setting headshot to null for invalid URL:", headshotUrl);
                        headshotUrl = null;
                    } else {
                        console.log("Using headshot URL:", headshotUrl);
                    }

                    return {
                        id: p.id,
                        cognito_id: p.cognito_sub, // Use cognito_sub from the backend
                        name: `${p.first_name} ${p.last_name}`,
                        qualifications: p.education,
                        specialties: p.specialty || [],
                        yearsOfExperience: p.experience_years,
                        headshot: headshotUrl,
                        approach: p.about_me,
                        interests: p.hobbies,
                        location: p.location,
                        acceptedInsurance: p.insurance_networks || [],
                        languages: p.languages || []
                    };
                });
                setProviders(fetchedProviders);
                setFilteredProviders(fetchedProviders);

                // Extract unique values for filters
                const specialties = [...new Set(fetchedProviders.flatMap(p => p.specialties || []).filter(Boolean))];
                const experiences = [...new Set(fetchedProviders.map(p => p.yearsOfExperience).filter(Boolean))];
                const insurances = [...new Set(fetchedProviders.flatMap(p => p.acceptedInsurance || []).filter(Boolean))];

                setNeedsData([
                    { 
                        group: 'Specialty', 
                        items: specialties.map(specialty => ({ value: specialty, label: specialty }))
                    },
                    { 
                        group: 'Experience', 
                        items: experiences.map(exp => ({ value: exp.toString(), label: `${exp} years` }))
                    },
                ]);
                setInsuranceData(insurances.map(insurance => ({ value: insurance, label: insurance })));

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
                        provider.yearsOfExperience === parseInt(need)
                    )
                );
            }

            if (insurance) {
                updatedProviders = updatedProviders.filter(provider => 
                    provider.acceptedInsurance && provider.acceptedInsurance.includes(insurance)
                );
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
                                            data={needsData}
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
