import {
    Drawer,
    Image,
    Container,
    Group,
    UnstyledButton,
    Button,
    ScrollArea,
    Menu,
    Avatar,
    Text,
} from "@mantine/core";
import { useMediaQuery, useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { IconMenu2, IconUser, IconLogout, IconDashboard } from "@tabler/icons-react";
import { NAVIGATION_CONFIG, BRAND_CONFIG } from "../../config/landingConfig";
import { useAuth } from "../../context/AuthContext";
import classes from "./Header.module.css";

/**
 * Header Component
 *
 * Responsive navigation header with mobile menu support.
 * Configured through landingConfig.js for easy content management.
 *
 * Features:
 * - Responsive design
 * - Mobile hamburger menu
 * - Smooth scrolling to sections
 * - CTA button
 *
 * @component
 * @example
 * return (
 *   <Header />
 * )
 */
const Header = () => {
    const [opened, { toggle, close }] = useDisclosure(false);
    const [isLoaded, setLoaded] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px");
    const location = useLocation();
    const { isAuthenticated, user, logout, getUserAttributes } = useAuth();

    useEffect(() => {
        if (opened && isDesktop) {
            close();
        }
    }, [opened, isDesktop, close]);

    // Get user attributes for display
    const userAttributes = getUserAttributes();
    const displayName = userAttributes?.given_name || 
                       userAttributes?.name || 
                       userAttributes?.email?.split('@')[0] || 
                       'User';

    const handleNavigation = (href) => {
        // Handle contact link - scroll to footer on any page
        if (href === "#contact") {
            const element = document.querySelector("#contact");
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        }
        // If it's a section link on the home page, scroll to section
        else if (href.startsWith("#") && location.pathname === "/") {
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        }
        close(); // Close dropdown after clicking
    };

    const handleLogout = () => {
        logout();
        close();
    };

    return (
        <header className={classes.header}>
            <Container size="xl">
                <Group justify="space-between" h={60}>
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Link to="/" style={{ textDecoration: "none" }}>
                            <Group gap="xs" align="center">
                                <motion.div whileHover={{ scale: 1.02 }}>
                                    <Image
                                        w={140} // Mantine shorthand → width: 120px
                                        // maw={160}            // max-width: 140px (optional safety cap)
                                        fit="contain"
                                        src={NAVIGATION_CONFIG.logo}
                                        fallbackSrc={BRAND_CONFIG.companyName}
                                    />
                                </motion.div>
                            </Group>
                        </Link>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <Group gap="lg" className={classes.desktopNav}>
                        {NAVIGATION_CONFIG.menuItems.map((item, index) => (
                            <motion.div
                                key={item.label}
                                // initial={{ opacity: 0, y: -20 }}
                                // animate={{ opacity: 1, y: 0 }}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                // exit={{ x: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 100,
                                    ease: "circIn",
                                    duration: isLoaded ? 0.02 : 0.5,
                                    delay: isLoaded ? 0 : index * 0.1,
                                }}
                                onAnimationComplete={() => setLoaded(true)}
                                whileHover={{ scale: 1.03 }}
                            >
                                {item.href.startsWith("#") ? (
                                    <button
                                        className={classes.navLink}
                                        onClick={() =>
                                            handleNavigation(item.href)
                                        }
                                    >
                                        {item.label}
                                    </button>
                                ) : (
                                    <Link
                                        to={item.href}
                                        className={classes.navLink}
                                        style={{ textDecoration: "none" }}
                                    >
                                        {item.label}
                                    </Link>
                                )}
                            </motion.div>
                        ))}

                        {/* CTA Buttons */}
                        {isAuthenticated ? (
                            // Authenticated user menu
                            <Menu shadow="md" width={200}>
                                <Menu.Target>
                                    <Button
                                        variant="subtle"
                                        leftSection={<Avatar size="sm" radius="xl"><IconUser size={16} /></Avatar>}
                                        style={{ color: 'var(--color-text-primary)' }}
                                    >
                                        {displayName}
                                    </Button>
                                </Menu.Target>

                                <Menu.Dropdown>
                                    <Menu.Item
                                        component={Link}
                                        to="/dashboard"
                                        leftSection={<IconDashboard size={16} />}
                                    >
                                        Dashboard
                                    </Menu.Item>
                                    <Menu.Divider />
                                    <Menu.Item
                                        leftSection={<IconLogout size={16} />}
                                        onClick={handleLogout}
                                        color="red"
                                    >
                                        Logout
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        ) : (
                            // Non-authenticated CTA buttons
                            NAVIGATION_CONFIG.ctaButtons.map((button, index) => (
                                <motion.div
                                    key={button.label}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 100,
                                        ease: "circIn",
                                        duration: isLoaded ? 0.02 : 0.5,
                                        delay: isLoaded ? 0 : index * 0.1,
                                    }}
                                >
                                    <Link
                                        to={button.href}
                                        style={{ textDecoration: "none" }}
                                    >
                                        <Button
                                            variant={button.variant}
                                            color={button.color}
                                            className={`${classes.ctaButton} ${
                                                classes[button.color]
                                            }`} // ensures correct button colors are applied
                                            radius={15}
                                        >
                                            {button.label}
                                        </Button>
                                    </Link>
                                </motion.div>
                            ))
                        )}
                    </Group>

                    {/* Mobile Menu */}
                    <UnstyledButton
                        // variant="subtle"
                        size="lg"
                        className={classes.mobileMenuButton}
                        visibleFrom="base"
                        hiddenFrom="md"
                        onClick={toggle}
                    >
                        <IconMenu2 size={24} />
                    </UnstyledButton>

                    <Drawer
                        opened={opened}
                        onClose={close}
                        position="right"
                        size="80%" // 80 % width on mobile
                        padding="md"
                        title={
                            <Link to="/" onClick={close} style={{ textDecoration: "none" }}>
                                <Image
                                    w={120}
                                    fit="contain"
                                    src={NAVIGATION_CONFIG.logo}
                                    fallbackSrc={BRAND_CONFIG.companyName}
                                />
                            </Link>
                        }
                        transitionProps={{
                            transition: "slide-left",
                            duration: 350,
                        }}
                    >
                        <ScrollArea h="100%">
                            {NAVIGATION_CONFIG.menuItems.map((item) =>
                                item.href.startsWith("#") ? (
                                    <UnstyledButton
                                        key={item.label}
                                        fullWidthUnstyledButton
                                        size="lg"
                                        justify="flex-start"
                                        onClick={() =>
                                            handleNavigation(item.href)
                                        }
                                        className={classes.mobileNavLink}
                                    >
                                        {item.label}
                                    </UnstyledButton>
                                ) : (
                                    <UnstyledButton
                                        key={item.label}
                                        className={classes.mobileNavLink}
                                        component={Link}
                                        to={item.href}
                                        fullWidth
                                        onClick={close}
                                    >
                                        {item.label}
                                    </UnstyledButton>
                                )
                                // </motion.div>
                            )}

                            {NAVIGATION_CONFIG.ctaButtons.map((btn, i) => (
                                <Link
                                    key={btn.label}
                                    to={btn.href}
                                    style={{ textDecoration: "none" }}
                                >
                                    <Button
                                        fullWidth
                                        mt={
                                            i === 0 ? "md" : 8
                                        } /* space between the two */
                                        radius="xl"
                                        variant={
                                            btn.variant
                                        } /* same as desktop  */
                                        color={btn.color} /* same as desktop  */
                                        className={`${classes.ctaButton} ${
                                            classes[btn.color]
                                        }`}
                                        onClick={
                                            close
                                        } /* close drawer on tap */
                                    >
                                        {btn.label}
                                    </Button>
                                </Link>
                            ))}
                        </ScrollArea>
                    </Drawer>
                </Group>
            </Container>
        </header>
    );
};

export default Header;
