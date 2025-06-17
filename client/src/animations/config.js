// Custom easing functions for Framer Motion
export const easing = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  sharp: [0.4, 0, 0.6, 1],
  spring: {
    type: "spring",
    damping: 25,
    stiffness: 120,
  },
  bounce: {
    type: "spring",
    damping: 10,
    stiffness: 100,
  },
};

// Common transition configurations
export const transitions = {
  default: {
    duration: 0.3,
    ease: easing.easeInOut,
  },
  fast: {
    duration: 0.15,
    ease: easing.easeOut,
  },
  slow: {
    duration: 0.5,
    ease: easing.easeInOut,
  },
  spring: easing.spring,
  bounce: easing.bounce,
};
