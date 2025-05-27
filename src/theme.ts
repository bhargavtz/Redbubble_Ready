'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    // Define your Material Design 3 color palette here
    // Example (using a primary color):
    primary: {
      main: '#007bff',
    },
    // You can add secondary, error, warning, info, success, and background colors
  },
  typography: {
    // Define your Material Design 3 typography here
    // Example:
    fontFamily: 'Roboto, sans-serif',
    // You can define variants like h1, h2, body1, etc.
  },
  components: {
    // Customize components here based on Material Design 3
    // Example (changing button style):
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
  },
});

export default theme;
