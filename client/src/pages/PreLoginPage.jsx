import { motion } from "framer-motion";
import {
    Container,
    SimpleGrid,
    Card,
    Text,
    Box,
    Stack,
    ActionIcon,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { LOGIN_SELECTION_CONFIG } from "../config/preLoginConfig";

const MotionCard = motion(Card);
const MotionActionIcon = motion(ActionIcon);
const MotionLine = motion.div; // the growing shaft

/* how far the shaft should grow (px) */
const arrowVariants = {
    rest: { width: 28 },
    hover: { width: 40, transition: { type: "spring", stiffness: 300 } },
};

export default function PreLoginPage() {
    const { cards, iconSize } = LOGIN_SELECTION_CONFIG;

    return (
        <Container fluid my="xl" px="6rem" py="3rem">
            <SimpleGrid
                cols={2}
                spacing="xl"
                breakpoints={[{ maxWidth: "md", cols: 1 }]}
                style={{ gridAutoRows: "minmax(65vh, auto)" }}
            >
                {cards.map(({ text, subtext, icon: Icon, bg, href }, idx) => (
                    <MotionCard
                        key={idx}
                        component="a"
                        href={href}
                        withBorder
                        radius="md"
                        p="xl"
                        bg={bg}
                        initial="rest"
                        whileHover="hover"
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
                            <Icon size={iconSize} />
                            <Box ta="center">
                                <Text fw={600} fz="2.5rem">
                                    {text}
                                </Text>
                                <Text fz="sm" mt="xs">
                                    {subtext}
                                </Text>
                            </Box>
                        </Stack>

                        {/* ▸ arrow composed of a growing line + fixed head */}
                        <MotionActionIcon
                            variant="transparent"
                            size="lg"
                            ml="auto"
                            overflow="visible"
                            style={{
                                position: "relative",
                                display: "flex",
                                alignItems: "center",
                                color: "inherit",
                            }}
                            variants={arrowVariants} // inherits rest/hover widths
                        >
                            {/* shaft */}
                            <MotionLine
                                variants={arrowVariants}
                                soze
                                style={{
                                    height: 2,
                                    background: "currentColor",
                                    borderRadius: 1,
                                }}
                            />

                            {/* arrow‑head stays the same size */}
                            <IconArrowRight
                                size={24}
                                stroke={2.5}
                                style={{
                                    position: "absolute",
                                    right: -4, // touches (and overlaps) the shaft
                                    top: "49.76%",
                                    transform: "translateY(-48%)", // vertical centering
                                    pointerEvents: "none",
                                }}
                            />
                        </MotionActionIcon>
                    </MotionCard>
                ))}
            </SimpleGrid>
        </Container>
    );
}
