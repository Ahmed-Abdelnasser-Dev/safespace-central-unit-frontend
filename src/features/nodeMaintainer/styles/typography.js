/**
 * Typography System
 * 
 * Based on standard UI design principles for readability
 * All sizes optimized for 14px body text baseline
 */

export const typography = {
  // Display/Large Headings - Page titles, modal headers
  display: {
    fontSize: '36px',
    fontWeight: 'bold',
    lineHeight: '44px',
    letterSpacing: '-0.25px',
  },

  // Heading 1 - Main section headers
  heading1: {
    fontSize: '28px',
    fontWeight: 'bold',
    lineHeight: '36px',
    letterSpacing: '-0.2px',
  },

  // Heading 2 - Subsection headers (tab sections)
  heading2: {
    fontSize: '22px',
    fontWeight: 'bold',
    lineHeight: '30px',
    letterSpacing: '0px',
  },

  // Subtitle - Section dividers with title
  subtitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    lineHeight: '26px',
    letterSpacing: '0px',
  },

  // Body - Default text, paragraphs, descriptions
  body: {
    fontSize: '16px',
    fontWeight: 'normal',
    lineHeight: '24px',
    letterSpacing: '0px',
  },

  // Body Small - Compact body text
  bodySmall: {
    fontSize: '14px',
    fontWeight: 'normal',
    lineHeight: '20px',
    letterSpacing: '0px',
  },

  // Label - Form labels, section labels, captions
  label: {
    fontSize: '13px',
    fontWeight: '500', // medium weight
    lineHeight: '18px',
    letterSpacing: '0.5px',
  },

  // Label Small - Smaller labels, badges
  labelSmall: {
    fontSize: '12px',
    fontWeight: '500',
    lineHeight: '16px',
    letterSpacing: '0.5px',
  },

  // Caption - Meta information, timestamps, helper text
  caption: {
    fontSize: '12px',
    fontWeight: 'normal',
    lineHeight: '16px',
    letterSpacing: '0px',
  },

  // Meta Value - Large metric numbers (18px for consistency with health metrics)
  metricValue: {
    fontSize: '22px',
    fontWeight: 'bold',
    lineHeight: '30px',
    letterSpacing: '0px',
  },

  // Meta Label - Label for metric values
  metricLabel: {
    fontSize: '13px',
    fontWeight: 'normal',
    lineHeight: '18px',
    letterSpacing: '0px',
  },
};

// Color system
export const colors = {
  // Text colors
  textPrimary: '#101828',      // Dark text
  textSecondary: '#6a7282',    // Gray text
  textTertiary: '#99a1af',     // Light gray text
  textInverse: '#ffffff',      // White text

  // Semantic colors
  primary: '#247cff',          // Blue
  success: '#22c55e',          // Green
  warning: '#ff9800',          // Orange
  error: '#d63e4d',            // Red
  
  // Metric colors
  metricCPU: '#3b82f6',        // Blue
  metricTemp: '#f97316',       // Orange
  metricNetwork: '#22c55e',    // Green
  metricStorage: '#a78bfa',    // Purple

  // Backgrounds
  backgroundLight: '#f9fafb',
  backgroundNeutral: '#f7f8f9',
  borderDefault: '#e5e7eb',
};

// Font family
export const fontFamily = 'Arimo, sans-serif';
