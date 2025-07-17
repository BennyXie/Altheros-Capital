import { Container, Group, Text, Stack, SimpleGrid, TextInput, Textarea, Button } from '@mantine/core';
import { IconBrandTwitter, IconBrandLinkedin, IconBrandFacebook, IconMail } from '@tabler/icons-react';
import { useState } from 'react';
import { BRAND_CONFIG } from '../../config/landingConfig';
import classes from './Footer.module.css';

/**
 * Footer Component
 * 
 * Site footer with quick links on the left and contact form on the right.
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
  const [formData, setFormData] = useState({
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({ email: '', message: '' });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <footer id="contact" className={classes.footer}>
      <Container size="xl" py={60} className={classes.footerContainer}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" className={classes.footerGrid}>
          {/* Left Side - Quick Links and Company Info */}
          <Stack gap="xl">
            {/* Company Info */}
            <Stack gap="md">
              <Text size="lg" fw={700} className={classes.logo}>
                {BRAND_CONFIG.companyName}
              </Text>
              <Text size="sm" c="dimmed" className={classes.description}>
                Building the future of accessible healthcare through innovative technology and compassionate care delivery.
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

            {/* Quick Links */}
            <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md">
              <Stack gap="sm">
                <Text size="sm" fw={600} className={classes.sectionTitle}>
                  Quick Links
                </Text>
                <Text size="xs" component="a" href="#features" className={classes.footerLink}>
                  Features
                </Text>
                <Text size="xs" component="a" href="/about" className={classes.footerLink}>
                  About Us
                </Text>
                <Text size="xs" component="a" href="#testimonials" className={classes.footerLink}>
                  Testimonials
                </Text>
              </Stack>

              <Stack gap="sm">
                <Text size="sm" fw={600} className={classes.sectionTitle}>
                  Services
                </Text>
                <Text size="xs" component="a" href="/auth" className={classes.footerLink}>
                  Get Started
                </Text>
                <Text size="xs" component="a" href="/auth" className={classes.footerLink}>
                  Login
                </Text>
                <Text size="xs" component="a" href="/providers" className={classes.footerLink}>
                  Providers
                </Text>
              </Stack>

              <Stack gap="sm">
                <Text size="sm" fw={600} className={classes.sectionTitle}>
                  Legal
                </Text>
                <Text size="xs" component="a" href="#" className={classes.footerLink}>
                  Privacy Policy
                </Text>
                <Text size="xs" component="a" href="#" className={classes.footerLink}>
                  Terms of Service
                </Text>
                <Text size="xs" component="a" href="#" className={classes.footerLink}>
                  HIPAA Compliance
                </Text>
              </Stack>
            </SimpleGrid>
          </Stack>

          {/* Right Side - Contact Form */}
          <Stack gap="md">
            <Text size="lg" fw={600} className={classes.formTitle}>
              Get In Touch
            </Text>
            <Text size="sm" c="dimmed">
              Have questions or need support? Send us a message and we'll get back to you.
            </Text>
            
            <form onSubmit={handleSubmit} className={classes.contactForm}>
              <Stack gap="md">
                <TextInput
                  label="Email Address"
                  placeholder="your.email@example.com"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  leftSection={<IconMail size={16} />}
                />
                <Textarea
                  label="Message"
                  placeholder="Tell us how we can help you..."
                  required
                  minRows={4}
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                />
                <Button type="submit" variant="filled" color="blue" className={classes.submitButton}>
                  Send Message
                </Button>
              </Stack>
            </form>
          </Stack>
        </SimpleGrid>

        {/* Footer Bottom */}
        <Group justify="space-between" mt="xl" pt="md" className={classes.bottomBar}>
          <Text size="xs" c="dimmed">
            © {currentYear} {BRAND_CONFIG.companyName}. All rights reserved.
          </Text>
        </Group>
      </Container>
    </footer>
  );
};

export default Footer;
