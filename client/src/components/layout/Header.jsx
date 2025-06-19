import { Container, Group, Button, Burger, Menu, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
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
 * - React Router navigation between pages
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
  const location = useLocation();

  const handleNavigation = (href) => {
    // Handle contact link - scroll to footer on any page
    if (href === '#contact') {
      const element = document.querySelector('#contact');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    // If it's a section link on the home page, scroll to section
    else if (href.startsWith('#') && location.pathname === '/') {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
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
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Group gap="xs" align="center">
                <img 
                  src="/favicon.ico" 
                  alt="Logo" 
                  style={{ width: 24, height: 24 }}
                />
                <Text size="xl" fw={700} className={classes.logo}>
                  {BRAND_CONFIG.companyName}
                </Text>
              </Group>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <Group gap="lg" className={classes.desktopNav}>
            {NAVIGATION_CONFIG.menuItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {item.href.startsWith('#') ? (
                  <button
                    className={classes.navLink}
                    onClick={() => handleNavigation(item.href)}
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link 
                    to={item.href} 
                    className={classes.navLink}
                    style={{ textDecoration: 'none' }}
                  >
                    {item.label}
                  </Link>
                )}
              </motion.div>
            ))}
            
            {/* CTA Buttons */}
            {NAVIGATION_CONFIG.ctaButtons.map((button, index) => (
              <motion.div
                key={button.label}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
              >
                <Link to={button.href} style={{ textDecoration: 'none' }}>
                  <Button 
                    variant={button.variant}
                    color={button.color}
                    className={classes.ctaButton}
                  >
                    {button.label}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </Group>

          {/* Mobile Menu */}
          <Menu
            shadow="md"
            width={200}
            opened={opened}
            onChange={toggle}
            position="bottom-end"
          >
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
                  onClick={() => handleNavigation(item.href)}
                  className={classes.mobileMenuItem}
                  component={item.href.startsWith('#') ? 'button' : Link}
                  to={!item.href.startsWith('#') ? item.href : undefined}
                >
                  {item.label}
                </Menu.Item>
              ))}

              <Menu.Divider />
              
              {NAVIGATION_CONFIG.ctaButtons.map((button) => (
                <Menu.Item
                  key={button.label}
                  onClick={close}
                  className={classes.mobileCTAItem}
                  component={Link}
                  to={button.href}
                >
                  {button.label}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Container>
    </header>
  );
};

export default Header;
