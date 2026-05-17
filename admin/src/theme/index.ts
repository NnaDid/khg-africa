import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const colors = {
  brand: {
    50: '#e0f7fa',
    100: '#b2ebf2',
    200: '#80deea',
    300: '#4dd0e1',
    400: '#26c6da',
    500: '#00bcd4', // Primary Cyan
    600: '#00acc1',
    700: '#0097a7',
    800: '#00838f',
    900: '#006064',
  },
  risk: {
    safe: '#2ECC71', // Green
    moderate: '#F1C40F', // Yellow
    high: '#E67E22', // Orange
    critical: '#E74C3C', // Red
  },
  health: {
    malaria: '#9B59B6',
    cholera: '#3498DB',
    heat: '#E67E22',
    flood: '#2980B9',
  },
  bg: {
    dark: '#0A0E12',
    card: '#15191E',
    sidebar: '#0D1117',
  }
};

const styles = {
  global: (props: any) => ({
    body: {
      bg: props.colorMode === 'dark' ? 'bg.dark' : 'gray.50',
      color: props.colorMode === 'dark' ? 'whiteAlpha.900' : 'gray.800',
    },
  }),
};

const components = {
  Card: {
    baseStyle: {
      container: {
        bg: 'bg.card',
        borderRadius: 'xl',
        border: '1px solid',
        borderColor: 'whiteAlpha.100',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  Button: {
    baseStyle: {
      borderRadius: 'lg',
      fontWeight: '600',
    },
  },
};

const theme = extendTheme({ 
  config, 
  colors, 
  styles, 
  components,
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
  },
});

export default theme;
