import { Container, Group, Text, Stack, Grid, TextInput, Textarea, Button } from '@mantine/core';
import { IconMail, IconSend } from '@tabler/icons-react';
import { useState } from 'react';
import { BRAND_CONFIG } from '../../config/landingConfig';
import classes from './Footer.module.css';

/**
 * Footer Component
 * 
 * Contact-focused footer with contact form.
 * Left side: Contact message, Right side: Email form
 * 
 * @component
 * @example
 * return (
 *   <Footer />
 * )
 */
const Footer = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const currentYear = new Date().getFullYear();

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission
    console.log('Contact form submitted:', { email, message });
    // Reset form
    setEmail('');
    setMessage('');
  };

  return (
    <footer id="contact" className={classes.footer}>
      <Container size="xl" py={60}>
        <Grid align="center" gutter={60}>
          {/* Left Side - Contact Message */}
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Stack gap="lg">
              <Text size="xl" fw={700} className={classes.contactTitle}>
                Questions? Contact Us!
              </Text>
              <Text size="md" c="dimmed" className={classes.contactDescription}>
                We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </Text>
              <Stack gap="xs">
                <Text size="sm" className={classes.contactInfo}>
                  📧 {BRAND_CONFIG.supportEmail}
                </Text>
                <Text size="sm" className={classes.contactInfo}>
                  📞 {BRAND_CONFIG.phone}
                </Text>
              </Stack>
            </Stack>
          </Grid.Col>

          {/* Right Side - Contact Form */}
          <Grid.Col span={{ base: 12, md: 7 }}>
            <form onSubmit={handleSubmit} className={classes.contactForm}>
              <Stack gap="md">
                <TextInput
                  label="Your Email"
                  placeholder="Enter your email address"
                  leftSection={<IconMail size={16} />}
                  size="md"
                  value={email}
                  onChange={(event) => setEmail(event.currentTarget.value)}
                  required
                  className={classes.formInput}
                />
                
                <Textarea
                  label="Your Message"
                  placeholder="Tell us how we can help you..."
                  minRows={4}
                  size="md"
                  value={message}
                  onChange={(event) => setMessage(event.currentTarget.value)}
                  required
                  className={classes.formInput}
                />
                
                <Button
                  type="submit"
                  size="lg"
                  color="brand"
                  leftSection={<IconSend size={18} />}
                  className={classes.submitButton}
                >
                  Send Message
                </Button>
              </Stack>
            </form>
          </Grid.Col>
        </Grid>

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
