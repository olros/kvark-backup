import { useMediaQuery } from '@mui/material';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { SELECTED_THEME } from 'constant';
import { getCookie, setCookie } from 'cookie';
import { createContext, ReactNode, useCallback, useContext, useLayoutEffect, useState } from 'react';

import { getTheme, themes, ThemeTypes } from '../theme';

interface ContextProps {
  getThemeFromStorage: () => ThemeTypes;
  set: (n: ThemeTypes | undefined) => void;
}

const ThemeContext = createContext<ContextProps | undefined>(undefined);

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [selectedTheme, setSelectedTheme] = useState<ThemeTypes>('automatic');

  const getThemeType = useCallback((name: ThemeTypes | string | undefined) => {
    if (themes.includes(name as ThemeTypes)) {
      return name as ThemeTypes;
    } else {
      return undefined;
    }
  }, []);

  const updateTheme = useCallback(
    (newTheme: ThemeTypes | string | undefined) => {
      const value = getThemeType(newTheme);
      if (value !== undefined) {
        setSelectedTheme(value);
        setCookie(SELECTED_THEME, value);
      } else {
        setSelectedTheme('automatic');
        setCookie(SELECTED_THEME, 'automatic');
      }
    },
    [getThemeType],
  );

  const getThemeFromStorage = useCallback((): ThemeTypes => {
    const value = getThemeType(getCookie(SELECTED_THEME));
    if (value !== undefined) {
      return value;
    } else {
      setCookie(SELECTED_THEME, 'automatic');
      return 'automatic';
    }
  }, [getThemeType]);

  const themeStore = { getThemeFromStorage: getThemeFromStorage, set: updateTheme };

  useLayoutEffect(() => updateTheme(getThemeFromStorage()), [getThemeFromStorage, updateTheme]);

  return (
    <ThemeContext.Provider value={themeStore}>
      <MuiThemeProvider theme={getTheme(selectedTheme, prefersDarkMode)}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

const useThemeSettings = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { ThemeProvider, useThemeSettings };
