// File: theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7877C6',
      light: '#9E9DDB',
      dark: '#5A59A1',
    },
    secondary: {
      main: '#FF6B95',
      light: '#FF9AB8',
      dark: '#E04A7A',
    },
    background: {
      default: '#0F0C29',
      paper: 'rgba(15, 12, 41, 0.8)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.75rem',
    },
    h3: {
      fontWeight: 700,
      fontSize: '2.25rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
        },
        contained: {
          boxShadow: '0 8px 24px rgba(120, 119, 198, 0.3)',
          '&:hover': {
            boxShadow: '0 12px 32px rgba(120, 119, 198, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;