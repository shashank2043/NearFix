import { createTheme } from '@mui/material/styles';

export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: '#0B192C', // Deep Navy
            light: '#1E2A38',
            dark: '#050B14',
            contrastText: '#FFFFFF',
          },
          secondary: {
            main: '#00B4D8', // Teal Accent
            light: '#48CAE4',
            dark: '#0077B6',
            contrastText: '#FFFFFF',
          },
          background: {
            default: '#F8FAFC',
            paper: '#FFFFFF',
          },
          text: {
            primary: '#0B192C',
            secondary: '#64748B',
          },
          divider: '#E2E8F0',
        }
      : {
          primary: {
            main: '#00F5D4', // Vibrant Teal
            light: '#33FFDE',
            dark: '#00C2A8',
            contrastText: '#0B192C',
          },
          secondary: {
            main: '#00B4D8', // Cyan Accent
            light: '#48CAE4',
            dark: '#0077B6',
            contrastText: '#FFFFFF',
          },
          background: {
            default: '#070D19', // Midnight Navy
            paper: '#0F1A30', // Deep Card Navy
          },
          text: {
            primary: '#F8FAFC',
            secondary: '#94A3B8',
          },
          divider: '#1E293B',
        }),
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "sans-serif"',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      letterSpacing: '0.01em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          },
        },
        containedPrimary: ({ theme }) => ({
          '&:hover': {
            backgroundColor: theme.palette.mode === 'light' ? '#1E2A38' : '#33FFDE',
          },
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 16,
          backgroundImage: 'none',
          boxShadow:
            theme.palette.mode === 'light'
              ? '0px 8px 24px rgba(11, 25, 44, 0.04)'
              : '0px 8px 24px rgba(0, 0, 0, 0.3)',
          border: `1px solid ${theme.palette.mode === 'light' ? '#F1F5F9' : '#1E293B'}`,
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.mode === 'light' ? '#FFFFFF' : '#0F1A30',
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.mode === 'light' ? '#E2E8F0' : '#1E293B'}`,
          boxShadow: 'none',
        }),
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
  },
});
