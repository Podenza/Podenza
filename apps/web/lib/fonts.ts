/**
 * @description Podenza brand fonts configuration
 * Heading font: Circular Std for titles, logos, and headings
 * Body font: Sofia Pro for body text, navigation, and descriptions
 */

/**
 * @sans (Sofia Pro)
 * @description Body font for text content, navigation, descriptions, buttons
 */
const sans = {
  variable: '--font-sans',
  style: {
    fontFamily: "'Sofia Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
};

/**
 * @heading (Circular Std)
 * @description Heading font for titles, logos, numbers, and emphasis
 */
const heading = {
  variable: '--font-heading',
  style: {
    fontFamily: "'Circular Std', 'Circular', -apple-system, BlinkMacSystemFont, sans-serif",
  },
};

// we export these fonts into the root layout
export { sans, heading };
