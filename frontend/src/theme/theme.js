import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4f46e5', // Indigo 600
      light: '#6366f1', // Indigo 500
      dark: '#3730a3', // Indigo 800
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8b5cf6', // Violet 500
      light: '#a78bfa',
      dark: '#6d28d9',
      contrastText: '#ffffff',
    },
    sidebar: {
      background: '#0f172a', // Slate 900
      active: '#1e293b',     // Slate 800
      text: '#94a3b8',       // Slate 400
      textActive: '#ffffff',
      border: '#1e293b',
    },
    background: {
      default: '#f8fafc', // Slate 50
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
    success: {
      main: '#10b981',
      light: '#d1fae5',
    },
    warning: {
      main: '#f59e0b',
      light: '#fef3c7',
    },
    error: {
      main: '#ef4444',
      light: '#fee2e2',
    },
    info: {
      main: '#0ea5e9',
      light: '#e0f2fe',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#0f172a',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: '#0f172a',
    },
    h6: {
      fontWeight: 600,
      color: '#0f172a',
    },
    subtitle1: {
      fontSize: '0.95rem',
      color: '#64748b',
    },
    subtitle2: {
      fontWeight: 600,
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 18px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          border: '1px solid #e2e8f0',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 14,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'medium',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6366f1',
            borderWidth: 2,
          },
        },
      },
    },
  },
});

export default theme;
