// src/ThemeContext.js

import React, { createContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';

// Define the shape of the context
export const ThemeContext = createContext();

// Define light and dark theme colors
const lightTheme = {
  mode: 'light',
  background: '#FFFFFF',
  text: '#000000',
  primary: '#1DA1F2',
  secondary: '#657786',
  overlay: 'rgba(0, 0, 0, 0.5)',
  // Add more colors as needed
};

const darkTheme = {
  mode: 'dark',
  background: '#000000',
  text: '#FFFFFF',
  primary: '#1DA1F2',
  secondary: '#AAB8C2',
  overlay: 'rgba(255, 255, 255, 0.5)',
  // Add more colors as needed
};

export const ThemeProvider = ({ children }) => {
  const colorScheme = Appearance.getColorScheme();
  const [theme, setTheme] = useState(colorScheme === 'dark' ? darkTheme : lightTheme);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
    });

    return () => subscription.remove();
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme.mode === 'light' ? darkTheme : lightTheme));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};