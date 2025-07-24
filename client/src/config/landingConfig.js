import fullLogo from "../assets/mwh-logo.png";
import Snoopy from "../assets/previewImages/snoopy.png";
import WoodStock from "../assets/previewImages/woodstock.png";

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
  companyName: "Midwest Health",
  tagline: "Smart System Access Service System",
  description:
    "Advanced technology platform for seamless healthcare access and management.",

  // Contact and support
  supportEmail: "support@midwesthealth.com",
  salesEmail: "sales@midwesthealth.com",
  phone: "+1 (555) 123-4567",

  // Social media links
  social: {
    twitter: "https://twitter.com/midwesthealth",
    linkedin: "https://linkedin.com/company/midwesthealth",
    facebook: "https://facebook.com/midwesthealth",
  },
};

// Hero section content
export const HERO_CONFIG = {
  headline: "Redefining Access.",
  highlightedText: "Reimagining Care.",

  subHeadline: "Smart System Access Service System",
  description:
    "Advanced technology platform for seamless healthcare access and management.",
  primaryCTA: "Get started →",
  secondaryCTA: "Find a therapist →",
};

// Insurer cost estimation section
export const INSURER_CONFIG = {
  title: "Choose your insurer to estimate costs:",
  subtitle: "Select list of insurance begins",
  placeholder: "Search for your insurance provider...",
};

// Services overview section
export const SERVICES_CONFIG = {
  title: "Let's Build the Future",
  subtitle: "of Care—Together",
  description: "Our Services →",
  services: [
    {
      title: "Behavioral Health Access",
      description:
        "Telehealth, therapy, medication management, and crisis response that drive patient engagement and care outcomes.",
      category: "behavioral",
    },
    {
      title: "Primary Care Support",
      description:
        "Preventative services, chronic care management, and coordinated primary care that ensure more efficient, value-based care.",
      category: "primary",
    },
    {
      title: "Care Navigation",
      description:
        "AI-powered tools for case management, care logistics, and seamless transitions of care - together as an ecosystem.",
      category: "navigation",
    },
    {
      title: "Operational Enablement",
      description:
        "End-to-end platform including scheduling, documentation, medication management, and transparent care flows.",
      category: "operational",
    },
  ],
};

export const TECHNOLOGIES_CONFIG = {
  title: "Smart Features,",
  title2: "Seamless Experience",
  description: "Our Technologies →",
  text: "Our proprietary digital platform powers every interaction—bridging the gap between physical and virtual care through elegant, secure, and responsive technology.",
  cards: [
    {
      title: "Patient-First Mobile App",
      description:
        "with real-time scheduling, telehealth, and medication tracking",
      preview: Snoopy,
      previewAlt: "snoopy",
    },
    {
      title: "AI-Enabled",
      description: "intake workflows and smart triage logic",
      preview: WoodStock,
      previewAlt: "WoodStock",
    },
    {
      title: "Robust EMR",
      description: "interoperability for provider efficiency",
    },
    {
      title: "Administrative Dashboards",
      description: "for data insights and resource management",
    },
    {
      title: "HIPPA-Grade Security",
      description: "and compliance across every touchpoint",
    },
  ],
};

// Features section content
export const FEATURES_CONFIG = {
  title: "Let's Build the Future of Care — Together",
  badge: "Our Services",
  subtitle:
    "We offer a suite of interconnected services tailored to meet the complex and evolving needs of patients and providers.",
  features: [
    {
      icon: "IconHeart",
      title: "Behavioral Health Access",
      description:
        "Telepsychiatry, therapy, medication management, and crisis response.",
      color: "blue",
    },
    {
      icon: "IconShield",
      title: "Primary Care Support",
      description:
        "Preventative services, chronic care management, and coordinated follow-up.",
      color: "green",
    },
    {
      icon: "IconUsers",
      title: "Care Navigation",
      description:
        "AI-assisted triage, intake coordination, and family engagement tools.",
      color: "violet",
    },
    {
      icon: "IconChartBar",
      title: "Operational Enablement",
      description:
        "EMR integration, backend analytics, and clinical workflow automation",
      color: "orange",
    },
    // {
    //   icon: 'IconBolt',
    //   title: 'Feature Title 5',
    //   description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    //   color: 'yellow'
    // },
    // {
    //   icon: 'IconRocket',
    //   title: 'Feature Title 6',
    //   description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    //   color: 'red'
    // }
  ],
};

// About section content
export const ABOUT_CONFIG = {
  sectionTag: "About Section",
  title: "About Us Title Here",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  secondaryDescription:
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.",
  highlightsTitle: "Key Highlights",
  highlights: [
    "First key highlight point here",
    "Second important achievement here",
    "Third notable accomplishment here",
    "Fourth significant milestone here",
    "Fifth impressive statistic here",
  ],
};

// Testimonials section content
export const TESTIMONIALS_CONFIG = {
  title: "Testimonials Section Title",
  subtitle:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.",
  testimonials: [
    {
      id: 1,
      quote:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      name: "Customer Name",
      title: "Job Title",
      company: "Company Name",
      rating: 5,
      avatar: null,
    },
    {
      id: 2,
      quote:
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      name: "Customer Name",
      title: "Job Title",
      company: "Company Name",
      rating: 5,
      avatar: null,
    },
    {
      id: 3,
      quote:
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      name: "Customer Name",
      title: "Job Title",
      company: "Company Name",
      rating: 5,
      avatar: null,
    },
  ],
};

// CTA section content
export const CTA_CONFIG = {
  title: "Get Started with Midwest Health",
  description:
    "Smart System Access Service System helps you connect with the right care when you need it most.",
  primaryCTA: "Find Your Therapist",
  secondaryCTA: "Contact Us",
  urgency: "",
  benefits: [],
};


// Contact section content
export const CONTACT_CONFIG = {
  title: "Any questions?",
  subtitle: "Contact us!",
  placeholder: "Enter your message here...",
  buttonText: "Send Message",
  footerText: "Insert footer (extra links/legal/copyright)",
};

// Navigation and routing
export const NAVIGATION_CONFIG = {
  logo: fullLogo, // Update with actual logo path
  menuItems: [
    { label: "About", href: "/about" },
    { label: "Providers", href: "/providers" },
    { label: "Contact", href: "#contact" },
  ],
  ctaButtons: [
    {
      label: "Login",
      href: "/prelogin",
      variant: "outline",
      color: "white",
    },
    {
      label: "Get Started ",
      href: "/auth",
      variant: "filled",
      color: "green",
    },
  ],
};

// SEO and metadata
export const SEO_CONFIG = {
  title: "Website Title Here - Tagline or Description",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  keywords: "keyword1, keyword2, keyword3, relevant, search, terms",
  ogImage: "/og-image.jpg", // Update with actual OG image path
  twitterCard: "summary_large_image",
};
