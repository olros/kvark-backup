/* eslint-disable no-console */
import 'assets/css/index.css';
import 'delayed-scroll-restoration-polyfill';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { CssBaseline } from '@mui/material';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import AppRoutes from 'AppRoutes';
import { SHOW_NEW_STUDENT_INFO, TIHLDE_API_URL } from 'constant';
import { ReactNode, useEffect } from 'react';
import { render } from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { broadcastQueryClient } from 'react-query/broadcastQueryClient-experimental';
import { ReactQueryDevtools } from 'react-query/devtools';
import { BrowserRouter } from 'react-router-dom';

import API from 'api/api';

import { MiscProvider } from 'hooks/Misc';
import { SnackbarProvider } from 'hooks/Snackbar';
import { ThemeProvider } from 'hooks/Theme';

import MessageGDPR from 'components/miscellaneous/MessageGDPR';
import Navigation from 'components/navigation/Navigation';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

if (SENTRY_DSN && import.meta.env.PROD) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 0.5,
  });
}

export const muiCache = createCache({ key: 'mui', prepend: true });

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
  );
};

const ErrorBoundary = ({ children }: { children: ReactNode }) =>
  import.meta.env.PROD ? (
    <Sentry.ErrorBoundary
      dialogOptions={{
        title: 'Det ser ut som vi har problemer',
        subtitle: 'Index har blitt varslet.',
        subtitle2: 'Hvis du vil hjelpe oss kan du fortelle oss hva som skjedde nedenfor.',
        labelName: 'Navn',
        labelEmail: 'Epost',
        labelComments: 'Hva skjedde?',
        labelClose: 'Lukk',
        labelSubmit: 'Send',
        errorGeneric: 'Det oppstod en ukjent feil under innsending av rapporten. Vennligst prøv igjen.',
        errorFormEntry: 'Noen felt var ugyldige. Rett opp feilene og prøv igjen.',
        successMessage: 'Din tilbakemelding er sendt. Tusen takk!',
      }}
      fallback={<a href='/'>Gå til forsiden</a>}
      showDialog>
      {children}
    </Sentry.ErrorBoundary>
  ) : (
    <>{children}</>
  );

export const Application = () => (
  <ErrorBoundary>
    <Providers>
      <BrowserRouter>
        <Navigation>
          <AppRoutes />
          <MessageGDPR />
        </Navigation>
      </BrowserRouter>
    </Providers>
  </ErrorBoundary>
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
  const RICKROLLED_BADGE_ID = '372e3278-3d8f-4c0e-a83a-f693804f8cbb';
  window.gtag('event', 'rickrolled', {
    event_category: 'easter-egg',
    event_label: 'Rickrolled in the console',
  });
  window.alert('flag{e2bff1db-883a-4bd4-8615-d5edc465ef7a}');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).badge = rickroll;

fetch(
  new Request(TIHLDE_API_URL + 'gdpr', {
    method: 'GET',
  }),
);

render(<Application />, document.getElementById('root'));
