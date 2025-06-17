/**
 * Landing Page Configuration
 * 
 * This file centralizes all the content and configuration for the landing page.
 * Team members can easily update copy, features, testimonials, and other content
 * without diving into component code.
 * 
 * Usage:
 * Import this config in your components and use the data instead of hardcoding content.
 * This makes the landing page more maintainable and allows for easy A/B testing.
 */

// Company and brand information
export const BRAND_CONFIG = {
  companyName: 'Company Name',
  tagline: 'Your Tagline Here',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  
  // Contact and support
  supportEmail: 'support@company.com',
  salesEmail: 'sales@company.com',
  phone: '+1 (555) 123-4567',
  
  // Social media links
  social: {
    twitter: 'https://twitter.com/company',
    linkedin: 'https://linkedin.com/company/company',
    facebook: 'https://facebook.com/company'
  }
};

// Hero section content
export const HERO_CONFIG = {
  headline: 'Your Main',
  highlightedText: 'Headline',
  subHeadline: 'Goes Here',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
  primaryCTA: 'Primary Button',
  secondaryCTA: 'Secondary Button'
};

// Features section content
export const FEATURES_CONFIG = {
  title: 'Features Section Title',
  subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  features: [
    {
      icon: 'IconRocket',
      title: 'Feature Title 1',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      color: 'blue'
    },
    {
      icon: 'IconShield',
      title: 'Feature Title 2',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      color: 'green'
    },
    {
      icon: 'IconUsers',
      title: 'Feature Title 3',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      color: 'violet'
    },
    {
      icon: 'IconChartBar',
      title: 'Feature Title 4',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      color: 'orange'
    },
    {
      icon: 'IconBolt',
      title: 'Feature Title 5',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      color: 'yellow'
    },
    {
      icon: 'IconHeart',
      title: 'Feature Title 6',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      color: 'red'
    }
  ]
};

// About section content
export const ABOUT_CONFIG = {
  sectionTag: 'About Section',
  title: 'About Us Title Here',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  secondaryDescription: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.',
  highlightsTitle: 'Key Highlights',
  highlights: [
    'First key highlight point here',
    'Second important achievement here',
    'Third notable accomplishment here',
    'Fourth significant milestone here',
    'Fifth impressive statistic here'
  ]
};

// Testimonials section content
export const TESTIMONIALS_CONFIG = {
  title: 'Testimonials Section Title',
  subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.',
  testimonials: [
    {
      id: 1,
      quote: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      name: 'Customer Name',
      title: 'Job Title',
      company: 'Company Name',
      rating: 5,
      avatar: null
    },
    {
      id: 2,
      quote: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      name: 'Customer Name',
      title: 'Job Title',
      company: 'Company Name',
      rating: 5,
      avatar: null
    },
    {
      id: 3,
      quote: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      name: 'Customer Name',
      title: 'Job Title',
      company: 'Company Name',
      rating: 5,
      avatar: null
    }
  ]
};

// CTA section content
export const CTA_CONFIG = {
  title: 'Call to Action Title Here',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  primaryCTA: 'Primary CTA',
  secondaryCTA: 'Secondary CTA',
  disclaimer: 'Optional disclaimer text • Additional info • More details'
};

// Navigation and routing
export const NAVIGATION_CONFIG = {
  logo: '/logo.png', // Update with actual logo path
  menuItems: [
    { label: 'Features', href: '#features' },
    { label: 'About', href: '#about' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Contact', href: '#contact' }
  ],
  ctaButton: {
    label: 'CTA Button',
    href: '/signup'
  }
};

// SEO and metadata
export const SEO_CONFIG = {
  title: 'Website Title Here - Tagline or Description',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  keywords: 'keyword1, keyword2, keyword3, relevant, search, terms',
  ogImage: '/og-image.jpg', // Update with actual OG image path
  twitterCard: 'summary_large_image'
};
