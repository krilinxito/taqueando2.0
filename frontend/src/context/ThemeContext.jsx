import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material';

const ThemeContext = createContext();

export const ThemeProvider2 = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const mode = darkMode ? 'dark' : 'light';

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: '#0f3d2e',
        light: '#1a5c46',
        dark: '#0a2b20',
        contrastText: '#f8f8f8',
      },
      secondary: {
        main: '#24a869',
        light: '#4fbe8a',
        dark: '#1c8251',
        contrastText: '#ffffff',
      },
      background: {
        default: darkMode ? '#0f1210' : '#f8faf9',
        paper: darkMode ? '#1a1d1b' : '#ffffff',
      },
      divider: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,61,46,0.12)',
    },
    typography: {
      fontFamily: "'Inter', sans-serif",
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      subtitle2: { fontWeight: 500 },
      button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: ({ theme: t }) => ({
            border: `1px solid ${t.palette.divider}`,
            borderRadius: 12,
          }),
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: ({ theme: t }) => ({
            border: `1px solid ${t.palette.divider}`,
            borderRadius: 12,
          }),
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 20px',
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: ({ theme: t }) => ({
            '& .MuiTableCell-head': {
              backgroundColor: t.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.04)'
                : 'rgba(15,61,46,0.04)',
              fontWeight: 600,
            },
          }),
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 16 },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            marginLeft: 8,
            marginRight: 8,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme: t }) => ({
            backgroundColor: t.palette.primary.main,
            color: t.palette.primary.contrastText,
            borderRadius: 0,
          }),
        },
      },
    },
  }), [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      return newMode;
    });
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme2 = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme2 must be used within a ThemeProvider2');
  }
  return context;
};
