import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ThemeProvider, useTheme } from './contexts/ThemeContext.tsx';
import React from 'react';

const Root = () => {
  const { actualTheme } = useTheme();

  React.useEffect(() => {
    document.body.className = actualTheme;
  }, [actualTheme]);

  return <App />;
};

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <ThemeProvider>
      <Root />
    </ThemeProvider>
  </AuthProvider>
);
