import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const defaultThemeConfig = {
  primaryColor: '#e23744',
  secondaryColor: '#cb202d',
  fontFamily: 'Inter',
  darkModeEnabled: false
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  });
  const [themeConfig, setThemeConfig] = useState(defaultThemeConfig);

  useEffect(() => {
    const loadThemeConfig = async () => {
      try {
        const response = await fetch('/api/cms/config');
        const config = await response.json();
        if (config?.theme) {
          setThemeConfig((prev) => ({ ...prev, ...config.theme }));
          if (!localStorage.getItem('theme') && config.theme.darkModeEnabled) {
            setTheme('dark');
          }
        }
      } catch (error) {
        console.error('Unable to load theme settings:', error.message);
      }
    };
    loadThemeConfig();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.setProperty('--primary-color', themeConfig.primaryColor || defaultThemeConfig.primaryColor);
    root.style.setProperty('--secondary-color', themeConfig.secondaryColor || defaultThemeConfig.secondaryColor);
    root.style.setProperty('--font-family', themeConfig.fontFamily || defaultThemeConfig.fontFamily);
    localStorage.setItem('theme', theme);
  }, [theme, themeConfig]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeConfig, setThemeConfig }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
