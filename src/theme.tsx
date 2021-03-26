import { createMuiTheme } from '@material-ui/core/styles';
import { IS_EASTER } from 'constant';

// Icons
import DarkIcon from '@material-ui/icons/Brightness2Outlined';
import AutomaticIcon from '@material-ui/icons/DevicesOutlined';
import LightIcon from '@material-ui/icons/WbSunnyOutlined';

declare module '@material-ui/core/styles/createPalette' {
  interface TypeBackground {
    smoke: React.CSSProperties['backgroundColor'];
  }

  interface Palette {
    borderWidth: string;
    colors: {
      footer: string;
      tihlde: string;
      gradient: {
        main: {
          top: string;
          bottom: string;
        };
        secondary: {
          top: string;
          bottom: string;
        };
        profile: {
          top: string;
          bottom: string;
        };
      };
    };
  }

  interface PaletteOptions {
    borderWidth: string;
    colors: {
      footer: string;
      tihlde: string;
      gradient: {
        main: {
          top: string;
          bottom: string;
        };
        secondary: {
          top: string;
          bottom: string;
        };
        profile: {
          top: string;
          bottom: string;
        };
      };
    };
  }
}

export const themesDetails = [
  { key: 'light', name: 'Lyst', icon: LightIcon },
  { key: 'automatic', name: 'Automatisk', icon: AutomaticIcon },
  { key: 'dark', name: 'Mørkt', icon: DarkIcon },
] as const;
export const themes = themesDetails.map((theme) => theme.key);
export type ThemeTypes = typeof themes[number];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getTheme = (theme: ThemeTypes, prefersDarkMode: boolean) => {
  // eslint-disable-next-line comma-spacing
  const get = <T,>({ light, dark, easter }: { light: T; dark: T; easter?: T }): T => {
    switch (theme) {
      case 'automatic':
        return IS_EASTER ? easter || light : prefersDarkMode ? dark : light;
      case 'dark':
        return dark;
      default:
        return light;
    }
  };

  return createMuiTheme({
    breakpoints: {
      values: {
        xs: 0,
        sm: 400,
        md: 600,
        lg: 900,
        xl: 1200,
      },
    },
    overrides: {
      MuiAvatar: {
        colorDefault: {
          backgroundColor: '#b4345e',
          color: 'white',
          fontWeight: 'bold',
        },
      },
      MuiCssBaseline: {
        '@global': {
          html: {
            WebkitFontSmoothing: 'auto',
          },
          a: {
            color: get<string>({ light: '#1D448C', dark: '#9ec0ff' }),
          },
        },
      },
    },
    palette: {
      common: {
        black: '#000000',
        white: '#ffffff',
      },
      type: get<'light' | 'dark'>({ light: 'light', dark: 'dark' }),
      primary: {
        main: get<string>({ light: '#1D448C', dark: '#9ec0ff', easter: '#F47A97' }),
      },
      secondary: {
        main: get<string>({ light: '#748674', dark: '#daffda', easter: '#E9C05F' }),
      },
      error: {
        main: get<string>({ light: '#b20101', dark: '#ff6060' }),
      },
      divider: get<string>({ light: '#cccccc', dark: '#333333', easter: '#ffffff' }),
      text: {
        secondary: get<string>({ light: '#333333', dark: '#cccccc' }),
      },
      borderWidth: '1px',
      background: {
        default: get<string>({ light: '#f8f8fa', dark: '#121519', easter: '#367D83' }),
        paper: get<string>({ light: '#ffffff', dark: '#131924', easter: '#BADBD2' }),
        smoke: get<string>({ light: '#fefefe', dark: '#13171E', easter: '#2d747a' }),
      },
      colors: {
        footer: '#1b1b2d',
        tihlde: '#1c458a',
        gradient: {
          main: {
            top: get<string>({ light: '#16356e', dark: '#1c2230', easter: '#E9C05F' }),
            bottom: get<string>({ light: '#814a93', dark: '#581d6c', easter: '#ECDA51' }),
          },
          secondary: {
            top: get<string>({ light: '#C6426E', dark: '#640d2a', easter: '#E9C05F' }),
            bottom: get<string>({ light: '#642B73', dark: '#321a38', easter: '#ECDA51' }),
          },
          profile: {
            top: get<string>({ light: '#F0C27B', dark: '#9b702e', easter: '#E9C05F' }),
            bottom: get<string>({ light: '#4B1248', dark: '#280126', easter: '#ECDA51' }),
          },
        },
      },
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      h1: {
        fontSize: '3.1rem',
        fontFamily: 'Oswald, Roboto, sans-serif',
        fontWeight: 900,
      },
      h2: {
        fontSize: '2.2rem',
        fontFamily: 'Oswald, Roboto, sans-serif',
        fontWeight: 700,
      },
      h3: {
        fontSize: '1.5rem',
      },
      h4: {
        fontSize: '2.2rem',
        fontFamily: 'Oswald, Roboto, sans-serif',
        fontWeight: 700,
      },
    },
  });
};
