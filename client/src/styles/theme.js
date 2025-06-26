import { createTheme } from '@mantine/core';

/**
 * 🎨 MINIMAL MANTINE THEME
 * =========================
 * 
 * Minimal theme that doesn't interfere with our global CSS color system.
 * All colors are handled by colors.css.
 */

export const theme = createTheme({
  primaryColor: 'blue', // Use Mantine's default, our CSS variables override this
  defaultColorScheme: 'light',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
});
