import React from "react";
import {
    Container,
    SimpleGrid,
    Card,
    Text,
    Title,
    Box,
    TextInput,
    Textarea,
    Button,
    ActionIcon,
} from "@mantine/core";
import { IconUser, IconStethoscope, IconArrowRight } from "@tabler/icons-react";
// import Footer from './../components/layout/Footer';
// import Header from './../components/layout/Header';

const PreLoginPage = () => {
    return (
        <>
            {/* <Header /> */}

            {/* Hero “I’m a Patient / I’m a Provider” cards */}
            <Container my="xl">
                <SimpleGrid
                    cols={2}
                    spacing="xl"
                    breakpoints={[{ maxWidth: "sm", cols: 1 }]}
                >
                    {/* Patient Card */}
                    <Card
                        component="a"
                        // href="/patient"
                        href="/login"
                        withBorder
                        radius="md"
                        p="xl"
                        sx={(theme) => ({
                            backgroundColor: theme.colors.green[1],
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "space-between",
                            height: 300,
                            textDecoration: "none",
                            color: "inherit",
                        })}
                    >
                        <IconUser size={64} />
                        <Box>
                            <Text align="center" weight={700} size="xl">
                                I’m a Patient
                            </Text>
                            <Text align="center" size="sm" mt="xs">
                                Book appointments & manage care
                            </Text>
                        </Box>
                        <ActionIcon
                            variant="transparent"
                            size="lg"
                            sx={{ marginLeft: "auto" }}
                        >
                            <IconArrowRight size={24} />
                        </ActionIcon>
                    </Card>

                    {/* Provider Card */}
                    <Card
                        component="a"
                        // href="/provider"
                        href="login"
                        withBorder
                        radius="md"
                        p="xl"
                        sx={(theme) => ({
                            backgroundColor: theme.colors.teal[2],
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "space-between",
                            height: 300,
                            textDecoration: "none",
                            color: "inherit",
                        })}
                    >
                        <IconStethoscope size={64} />
                        <Box>
                            <Text align="center" weight={700} size="xl">
                                I’m a Provider
                            </Text>
                            <Text align="center" size="sm" mt="xs">
                                Access provider portal & manage patients
                            </Text>
                        </Box>
                        <ActionIcon
                            variant="transparent"
                            size="lg"
                            sx={{ marginLeft: "auto" }}
                        >
                            <IconArrowRight size={24} />
                        </ActionIcon>
                    </Card>
                </SimpleGrid>
            </Container>

            {/* <Footer /> */}
        </>
    );
};

export default PreLoginPage;
