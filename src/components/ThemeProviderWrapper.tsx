'use client';

import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import React from 'react';

export default function ThemeProviderWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
}
