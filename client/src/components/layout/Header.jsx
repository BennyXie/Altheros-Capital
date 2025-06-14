import { AppShell, Container, Group, Button, Burger, Drawer, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { motion } from 'framer-motion';
import { NAVIGATION_CONFIG, BRAND_CONFIG } from '../../config/landingConfig';
import classes from './Header.module.css';

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
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);

  const scrollToSection = (href) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    closeDrawer();
  };

  return (
    <>
      <header className={classes.header}>
        <Container size="xl">
          <Group justify="space-between" h={60}>
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Text size="xl" fw={700} className={classes.logo}>
                {BRAND_CONFIG.companyName}
              </Text>
            </motion.div>

            {/* Desktop Navigation */}
            <Group gap="lg" className={classes.desktopNav}>
              {NAVIGATION_CONFIG.menuItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={classes.navLink}
                  onClick={() => scrollToSection(item.href)}
                >
                  {item.label}
                </motion.button>
              ))}
              
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Button 
                  variant="filled" 
                  className={classes.ctaButton}
                  onClick={() => scrollToSection(NAVIGATION_CONFIG.ctaButton.href)}
                >
                  {NAVIGATION_CONFIG.ctaButton.label}
                </Button>
              </motion.div>
            </Group>

            {/* Mobile Menu Button */}
            <Burger 
              opened={drawerOpened} 
              onClick={toggleDrawer} 
              className={classes.burger}
              size="sm"
            />
          </Group>
        </Container>
      </header>

      {/* Mobile Drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title={BRAND_CONFIG.companyName}
        padding="md"
        size="xs"
        position="right"
      >
        <Stack gap="lg">
          {NAVIGATION_CONFIG.menuItems.map((item) => (
            <button
              key={item.label}
              className={classes.mobileNavLink}
              onClick={() => scrollToSection(item.href)}
            >
              {item.label}
            </button>
          ))}
          
          <Button 
            variant="filled" 
            fullWidth
            className={classes.ctaButton}
            onClick={() => {
              scrollToSection(NAVIGATION_CONFIG.ctaButton.href);
              closeDrawer();
            }}
          >
            {NAVIGATION_CONFIG.ctaButton.label}
          </Button>
        </Stack>
      </Drawer>
    </>
  );
};

export default Header;
