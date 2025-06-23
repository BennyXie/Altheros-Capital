import { Container, Group, Text, Stack, SimpleGrid } from '@mantine/core';
import { IconBrandTwitter, IconBrandLinkedin, IconBrandFacebook } from '@tabler/icons-react';
import { BRAND_CONFIG } from '../../config/landingConfig';
import classes from './Footer.module.css';

/**
 * Footer Component
 * 
 * Site footer with company information, social links, and legal pages.
 * Configured through landingConfig.js for easy content management.
 * 
 * @component
 * @example
 * return (
 *   <Footer />
 * )
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={classes.footer}>
      <Container size="xl" py={40}>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
          {/* Company Info */}
          <Stack gap="md">
            <Text size="lg" fw={700} className={classes.logo}>
              {BRAND_CONFIG.companyName}
            </Text>
            <Text size="sm" c="dimmed" className={classes.description}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </Text>
            <Group gap="sm">
              <a href={BRAND_CONFIG.social.twitter} className={classes.socialLink}>
                <IconBrandTwitter size={20} />
              </a>
              <a href={BRAND_CONFIG.social.linkedin} className={classes.socialLink}>
                <IconBrandLinkedin size={20} />
              </a>
              <a href={BRAND_CONFIG.social.facebook} className={classes.socialLink}>
                <IconBrandFacebook size={20} />
              </a>
            </Group>
          </Stack>

          {/* Product Links */}
          <Stack gap="md">
            <Text size="sm" fw={600} className={classes.sectionTitle}>
              Product
            </Text>
            <Stack gap="xs">
              <a href="#features" className={classes.footerLink}>Features</a>
              <a href="#pricing" className={classes.footerLink}>Pricing</a>
              <a href="#integrations" className={classes.footerLink}>Integrations</a>
              <a href="#api" className={classes.footerLink}>API</a>
            </Stack>
          </Stack>

          {/* Company Links */}
          <Stack gap="md">
            <Text size="sm" fw={600} className={classes.sectionTitle}>
              Company
            </Text>
            <Stack gap="xs">
              <a href="#about" className={classes.footerLink}>About</a>
              <a href="#careers" className={classes.footerLink}>Careers</a>
              <a href="#blog" className={classes.footerLink}>Blog</a>
              <a href="#contact" className={classes.footerLink}>Contact</a>
            </Stack>
          </Stack>

          {/* Support Links */}
          <Stack gap="md">
            <Text size="sm" fw={600} className={classes.sectionTitle}>
              Support
            </Text>
            <Stack gap="xs">
              <a href="#help" className={classes.footerLink}>Help Center</a>
              <a href="#documentation" className={classes.footerLink}>Documentation</a>
              <a href="#status" className={classes.footerLink}>Status</a>
              <a href={`mailto:${BRAND_CONFIG.supportEmail}`} className={classes.footerLink}>
                Contact Support
              </a>
            </Stack>
          </Stack>
        </SimpleGrid>

        {/* Bottom Bar */}
        <div className={classes.bottomBar}>
          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              © {currentYear} {BRAND_CONFIG.companyName}. All rights reserved.
            </Text>
            <Group gap="lg">
              <a href="#privacy" className={classes.legalLink}>Privacy Policy</a>
              <a href="#terms" className={classes.legalLink}>Terms of Service</a>
            </Group>
          </Group>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
