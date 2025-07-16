import styles from "./PreLoginPage.module.css";

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

/* how far the arrow line should grow (px) */
const arrowVariants = {
    rest: { width: 28 },
    hover: { width: 40, transition: { type: "spring", stiffness: 300 } },
};

const gridVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.15 }, // 0.15 s between cards
    },
};

export default function PreLoginPage() {
    const { cards, iconSize } = LOGIN_SELECTION_CONFIG;

    return (
        <Container
            fluid
            my="xl"
            px="6rem"
            py="3rem"
            className={styles.container}
        >
            <motion.div
                variants={gridVariants}
                initial="hidden"
                animate="visible"
            >
                <SimpleGrid
                    className={styles.grid}
                    cols={2}
                    spacing="xl"
                    breakpoints={[
                        { maxWidth: 900, cols: 1 }, // tablets & phones
                        { maxWidth: 1200, cols: 2 }, // small laptops
                    ]}
                    // style={{ gridAutoRows: "minmax(65vh, auto)" }}
                >
                    {cards.map(
                        (
                            { text, subtext, icon: Icon, bg, hoverbg, href },
                            idx
                        ) => {
                            const cardVariants = {
                                hidden: { opacity: 0, x: -60 },
                                transition: {
                                    duration: 1,
                                    ease: "easeIn",
                                },
                                rest: {
                                    opacity: 1,
                                    x: 0,
                                    backgroundColor: bg,
                                    boxShadow: "rgba(0,0,0,0) 0px 0px 0px 0px",
                                },
                                hover: {
                                    backgroundColor: hoverbg,
                                    boxShadow:
                                        "rgba(0,0,0,0.2) 0px 6px 16px 0px",
                                    transition: {
                                        duration: 0.4,
                                        ease: "easeOut",
                                    },
                                },
                            };

                            return (
                                <MotionCard
                                    key={idx}
                                    component="a"
                                    href={href}
                                    withBorder
                                    radius="md"
                                    p="xl"
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="rest"
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
                                    className={styles.cardRoot}
                                >
                                    {/*  card body  */}
                                    <Stack
                                        align="center"
                                        justify="center"
                                        gap="xl"
                                        style={{ flex: 1 }}
                                    >
                                        <Icon
                                            size={iconSize}
                                            className={styles.cardIcon}
                                        />
                                        <Box ta="center">
                                            <Text
                                                fw={600}
                                                fz="2.5rem"
                                                className={styles.cardTitle}
                                            >
                                                {text}
                                            </Text>
                                            <Text
                                                fz="md"
                                                mt="xs"
                                                className={styles.cardSub}
                                            >
                                                {subtext}
                                            </Text>
                                        </Box>
                                    </Stack>

                                    {/* arrow (unchanged) */}
                                    <MotionActionIcon
                                        variant="transparent"
                                        size="lg"
                                        ml="auto"
                                        overflow="visible"
                                        variants={arrowVariants}
                                        style={{
                                            position: "relative",
                                            display: "flex",
                                            alignItems: "center",
                                            width: 48,
                                            height: 24,
                                            color: "inherit",
                                            overflow: "visible",
                                        }}
                                    >
                                        <MotionLine
                                            className={styles.arrowShaft}
                                            variants={arrowVariants}
                                            style={{
                                                height: 2.5,
                                                background: "currentColor",
                                                borderRadius: 1,
                                            }}
                                        />
                                        <IconArrowRight
                                            className={styles.arrowHead}
                                            size={24}
                                            stroke={2.5}
                                            style={{
                                                position: "absolute",
                                                right: -5,
                                                top: "49%",
                                                transform: "translateY(-48%)",
                                                pointerEvents: "none",
                                            }}
                                        />
                                    </MotionActionIcon>
                                </MotionCard>
                            );
                        }
                    )}
                </SimpleGrid>
            </motion.div>
        </Container>
    );
}
