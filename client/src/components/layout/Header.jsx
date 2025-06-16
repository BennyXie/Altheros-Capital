import { Container, Group, Button, Burger, Menu, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown } from '@tabler/icons-react';
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
  const [opened, { toggle, close }] = useDisclosure(false);

  const scrollToSection = (href) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    close(); // Close dropdown after clicking
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

          {/* Mobile Menu */}
          <Menu shadow="md" width={200} opened={opened} onChange={toggle} position="bottom-end">
            <Menu.Target>
              <Button 
                variant="subtle" 
                className={classes.mobileMenuButton}
                rightSection={<IconChevronDown size={16} />}
              >
                Menu
              </Button>
            </Menu.Target>

            <Menu.Dropdown className={classes.mobileDropdown}>
              {NAVIGATION_CONFIG.menuItems.map((item) => (
                <Menu.Item
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  className={classes.mobileMenuItem}
                >
                  {item.label}
                </Menu.Item>
              ))}
              
              <Menu.Divider />
              
              <Menu.Item
                onClick={() => scrollToSection(NAVIGATION_CONFIG.ctaButton.href)}
                className={classes.mobileCTAItem}
              >
                {NAVIGATION_CONFIG.ctaButton.label}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Container>
    </header>
  );
};

export default Header;
