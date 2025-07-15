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
    Stack,
} from "@mantine/core";
import { IconUser, IconStethoscope, IconArrowRight } from "@tabler/icons-react";
import { LOGIN_SELECTION_CONFIG } from "./../config/preLoginConfig";

const PreLoginPage = () => {
    return (
        <>
            {/* <Header /> */}

            {/* Hero “I’m a Patient / I’m a Provider” cards */}
            <Container fluid my="xl" px="6rem" py="3vh">
                <SimpleGrid
                    cols={2}
                    spacing="xl"
                    breakpoints={[{ maxWidth: "md", cols: 1 }]}
                    style={{ gridAutoRows: "minmax(75vh, auto)" }}
                >
                    {LOGIN_SELECTION_CONFIG.cards.map(({ text, subtext, icon: Icon, bg, href }, idx) => (
                        <Card
                            key={idx}
                            component="a"
                            href={href}
                            withBorder
                            radius="md"
                            p="xl"
                            bg={bg}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "space-between",
                                height: "100%",
                                textDecoration: "none",
                                color: "inherit",
                            }}
                        >
                            <Stack
                                align="center"
                                justify="center"
                                gap="xl"
                                style={{ flex: 1 }}
                            >
                                <Icon size={LOGIN_SELECTION_CONFIG.iconSize} />
                                <Box>
                                    <Text align="center" fw={600} fz="2.5rem">
                                        {text}
                                    </Text>
                                    <Text align="center" fz="sm" mt="xs">
                                        {subtext}
                                    </Text>
                                </Box>
                            </Stack>

                            <ActionIcon
                                variant="transparent"
                                size="lg"
                                style={{ marginLeft: "auto", color:"inherit"}}
                            >
                                <IconArrowRight size={40} />
                            </ActionIcon>
                        </Card>
                    ))}
                </SimpleGrid>
            </Container>

            {/* <Footer /> */}
        </>
    );
};

export default PreLoginPage;
