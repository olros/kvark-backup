/* eslint-disable no-console */
import 'assets/css/index.css';
import 'delayed-scroll-restoration-polyfill';
import { Auth0Provider } from '@auth0/auth0-react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { CssBaseline } from '@mui/material';
import { inject } from '@vercel/analytics';
import { Analytics } from '@vercel/analytics/react';
import AppRoutes from 'AppRoutes';
import { AUTH0_AUDIENCE, AUTH0_CLIENT_ID, AUTH0_DOMAIN, SHOW_NEW_STUDENT_INFO } from 'constant';
import { ReactNode } from 'react';
import { render } from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { broadcastQueryClient } from 'react-query/broadcastQueryClient-experimental';
import { ReactQueryDevtools } from 'react-query/devtools';
import { BrowserRouter } from 'react-router-dom';

import { useAPI } from 'hooks/API';
import { MiscProvider } from 'hooks/Misc';
import { SnackbarProvider } from 'hooks/Snackbar';
import { ThemeProvider } from 'hooks/Theme';

import Navigation from 'components/navigation/Navigation';

export const muiCache = createCache({ key: 'mui', prepend: true });

inject(); // inject analytics Vercel

export const Providers = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // Don't refetch data before 5 min has passed
        refetchOnWindowFocus: false,
        cacheTime: 1000 * 60 * 60 * 24, // 24 hours
      },
    },
  });

  /**
   * Experimental React Query plugin, can break when updating React Query
   * Broadcasts changes to the state between tabs in the browser to ensure that the data is equal
   * https://react-query.tanstack.com/plugins/broadcastQueryClient
   */
  broadcastQueryClient({ queryClient, broadcastChannel: 'TIHLDE' });

  return (
    <Auth0Provider
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: AUTH0_AUDIENCE,
      }}
      clientId={AUTH0_CLIENT_ID}
      domain={AUTH0_DOMAIN}>
      <CacheProvider value={muiCache}>
        <ThemeProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <CssBaseline enableColorScheme />
            <QueryClientProvider client={queryClient}>
              <MiscProvider>
                <SnackbarProvider>{children}</SnackbarProvider>
              </MiscProvider>
              <ReactQueryDevtools />
            </QueryClientProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </CacheProvider>
    </Auth0Provider>
  );
};

export const Application = () => (
  <Providers>
    <BrowserRouter>
      <Navigation>
        <AppRoutes />
        <Analytics />
      </Navigation>
    </BrowserRouter>
  </Providers>
);

console.log(
  `%c
          ██╗███╗   ██╗██████╗ ███████╗██╗  ██╗
          ██║████╗  ██║██╔══██╗██╔════╝╚██╗██╔╝
Laget av  ██║██╔██╗ ██║██║  ██║█████╗   ╚███╔╝
          ██║██║╚██╗██║██║  ██║██╔══╝   ██╔██╗
          ██║██║ ╚████║██████╔╝███████╗██╔╝ ██╗
          ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝  ╚═╝`,
  'font-size: 1rem; color: #ff9400;',
);
console.log(
  `%cSnoker du rundt? Det liker vi. Vi i Index ser alltid etter nye medlemmer. ${
    SHOW_NEW_STUDENT_INFO ? 'Søk om å bli med da vel! https://s.tihlde.org/bli-med-i-index' : ''
  }`,
  'font-weight: bold; font-size: 1rem;color: #ff9400;',
);
console.log(
  'Lyst på en ny badge? Skriv %cbadge();%c i konsollen da vel!',
  'background-color: #121212;font-family: "Monaco", monospace;padding: 2px; color: white;',
  '',
);

const rickroll = () => {
  // TODO: This got broken when transitioning to auth0 hooks
  // const RICKROLLED_BADGE_ID = '372e3278-3d8f-4c0e-a83a-f693804f8cbb';
  // createUserBadge({ flag: RICKROLLED_BADGE_ID });
  window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).badge = rickroll;

render(<Application />, document.getElementById('root'));
