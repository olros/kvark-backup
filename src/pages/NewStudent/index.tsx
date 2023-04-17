import { useAuth0 } from '@auth0/auth0-react';
import SignupIcon from '@mui/icons-material/ArrowForwardRounded';
import CalendarIcon from '@mui/icons-material/DateRangeRounded';
import EventIcon from '@mui/icons-material/EventRounded';
import ListIcon from '@mui/icons-material/FormatListBulletedRounded';
import FaqIcon from '@mui/icons-material/HelpOutlineRounded';
import AboutIcon from '@mui/icons-material/InfoRounded';
import OpenInNewIcon from '@mui/icons-material/OpenInNewRounded';
import SportsIcon from '@mui/icons-material/SportsSoccerRounded';
import VolunteerIcon from '@mui/icons-material/VolunteerActivismRounded';
import { Collapse, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material';
import { makeStyles } from 'makeStyles';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import URLS from 'URLS';

import { useEvents } from 'hooks/Event';
import { useAnalytics } from 'hooks/Utils';
import { useWikiPage } from 'hooks/Wiki';

import EventsCalendarView from 'pages/Landing/components/EventsCalendarView';

import Banner, { BannerButton } from 'components/layout/Banner';
import Expand from 'components/layout/Expand';
import Pagination from 'components/layout/Pagination';
import Paper from 'components/layout/Paper';
import Tabs from 'components/layout/Tabs';
import EventListItem, { EventListItemLoading } from 'components/miscellaneous/EventListItem';
import MarkdownRenderer from 'components/miscellaneous/MarkdownRenderer';
import NotFoundIndicator from 'components/miscellaneous/NotFoundIndicator';
import Page from 'components/navigation/Page';

const useStyles = makeStyles()((theme) => ({
  grid: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
  root: {
    gridTemplateColumns: '300px 1fr',
    margin: theme.spacing(1, 0, 2),
    alignItems: 'self-start',
    [theme.breakpoints.down('lg')]: {
      gridGap: theme.spacing(1),
      gridTemplateColumns: '1fr',
    },
  },
}));

const FADDERUKA_EVENT_CATEGORY = 10;

const useGithubContent = (url: string) => useQuery(['github-wiki', url], () => fetch(url).then((res) => res.text()));

type VolunteerGroupProps = {
  url: string;
  title: string;
};

const VolunteerGroup = ({ url, title }: VolunteerGroupProps) => {
  const { data } = useWikiPage(url);
  return (
    <Expand flat header={title}>
      <MarkdownRenderer value={data?.content || ''} />
    </Expand>
  );
};

const NewStudent = () => {
  const { classes, cx } = useStyles();
  const { event } = useAnalytics();
  const { isAuthenticated } = useAuth0();
  const eventsTab = { value: 'events', label: 'Fadderuka - arrangementer', icon: EventIcon };
  const faqTab = { value: 'faq', label: 'FAQ', icon: FaqIcon };
  const volunteerTab = { value: 'volunteer', label: 'Verv', icon: VolunteerIcon };
  const sportsTab = { value: 'sports', label: 'Idrett', icon: SportsIcon };
  const aboutTab = { value: 'about', label: 'Om TIHLDE.org', icon: AboutIcon };
  const tabs = [eventsTab, faqTab, volunteerTab, sportsTab, aboutTab];
  const [tab, setTab] = useState(eventsTab.value);

  useEffect(() => event('change-tab', 'new-student', `Changed tab to: ${tab}`), [tab]);

  const eventsListView = { value: 'list', label: 'Liste', icon: ListIcon };
  const eventsCalendarView = { value: 'calendar', label: 'Kalender', icon: CalendarIcon };
  const eventTabs = [eventsListView, eventsCalendarView];
  const [eventTab, setEventTab] = useState(eventsListView.value);

  const { data, error, hasNextPage, fetchNextPage, isLoading, isFetching } = useEvents({ category: FADDERUKA_EVENT_CATEGORY });
  const events = useMemo(() => (data ? data.pages.map((page) => page.results).flat() : []), [data]);
  const { data: faqPage } = useWikiPage('ny-student/');
  const { data: sportsText } = useWikiPage('tihlde/interessegrupper/tihlde-pythons/');
  const { data: aboutText = '' } = useGithubContent('https://raw.githubusercontent.com/wiki/TIHLDE/Kvark/Nettsiden-info.md');

  const fadderukaSignupAnalytics = () => event('signup-fadderuka', 'new-student', 'Clicked on link to signup for fadderuka');
  const createUserAnalytics = (page: string) => event('go-to-sign-up', 'new-student', `Go to ${page}`);

  return (
    <Page
      banner={
        <Banner
          text='Hei og velkommen til TIHLDE. Vi i TIHLDE vil gjerne ønske deg velkommen til Trondheim og vil at du skal bli kjent med både byen og dine medstudenter, derfor arrangerer vi fadderuka for dere. Her kan du finne info om fadderuka, verv og idrett i TIHLDE, samt ofte stilte spørsmål og svar.'
          title='Ny student'>
          <BannerButton
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            component='a'
            endIcon={<OpenInNewIcon />}
            href='https://s.tihlde.org/fadderuka-paamelding'
            onClick={fadderukaSignupAnalytics}
            rel='noopener noreferrer'
            target='_blank'
            variant='outlined'>
            Meld deg på fadderuka
          </BannerButton>
          {!isAuthenticated && (
            <Paper sx={{ background: 'transparent', borderColor: (theme) => theme.palette.common.white }}>
              <Typography gutterBottom sx={{ color: (theme) => theme.palette.common.white }}>
                Hei! Hvis du er ny student i TIHLDE anbefaler vi deg å opprette bruker på nettsiden ASAP! Da får du muligheten til å melde deg på arrangementer,
                få badges, se kokeboka og mer 🎉
              </Typography>
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <BannerButton component={Link} endIcon={<SignupIcon />} onClick={createUserAnalytics} to={URLS.signup} variant='outlined'>
                Opprett bruker her
              </BannerButton>
            </Paper>
          )}
        </Banner>
      }
      options={{ title: 'Ny student' }}>
      <div className={cx(classes.grid, classes.root)}>
        <Paper noOverflow noPadding sx={{ position: { lg: 'sticky' }, top: { lg: 75 } }}>
          <List disablePadding>
            {tabs.map((tabItem) => (
              <ListItemButton key={tabItem.value} onClick={() => setTab(tabItem.value)} selected={tab === tabItem.value}>
                <ListItemIcon>
                  <tabItem.icon />
                </ListItemIcon>
                <ListItemText primary={tabItem.label} />
              </ListItemButton>
            ))}
          </List>
        </Paper>
        <div>
          <Collapse in={tab === eventsTab.value}>
            <Tabs selected={eventTab} setSelected={setEventTab} sx={{ ml: 2 }} tabs={eventTabs} />
            <Collapse in={eventTab === eventsListView.value}>
              {isLoading && <EventListItemLoading />}
              {!events.length && !isLoading && (
                <NotFoundIndicator
                  header='Fant ingen arrangementer'
                  subtitle='Ingen arrangementer tilknyttet fadderuka er publisert enda. Kom tilbake senere!'
                />
              )}
              {error && <Paper>{error.detail}</Paper>}
              {data !== undefined && (
                <Pagination fullWidth hasNextPage={hasNextPage} isLoading={isFetching} nextPage={() => fetchNextPage()}>
                  <Stack gap={1}>
                    {events.map((event) => (
                      <EventListItem event={event} key={event.id} />
                    ))}
                  </Stack>
                </Pagination>
              )}
              {isFetching && <EventListItemLoading />}
            </Collapse>
            <Collapse in={eventTab === eventsCalendarView.value}>
              <EventsCalendarView category={FADDERUKA_EVENT_CATEGORY} />
            </Collapse>
          </Collapse>
          <Collapse in={tab === faqTab.value} mountOnEnter>
            <Paper sx={{ p: 2 }}>
              <MarkdownRenderer value={faqPage?.content || ''} />
            </Paper>
          </Collapse>
          <Collapse in={tab === volunteerTab.value} mountOnEnter>
            <Paper sx={{ p: 2 }}>
              <Typography gutterBottom variant='h2'>
                Bli med som frivillig i TIHLDE
              </Typography>
              <Typography gutterBottom>
                Som frivillig i TIHLDE får du være med på mye gøy og blir kjent med kule folk! Vi har 5 undergrupper og 5 komitéer som jobber for medlemmene
                våre. Her kan du lese mer om hva hver undergruppe/komité jobber med og hvordan du kan søke om å bli med i en eller flere.
              </Typography>
              <Typography gutterBottom variant='h3'>
                Undergrupper:
              </Typography>
              <div>
                <VolunteerGroup title='Index' url='tihlde/undergrupper/index/' />
                <VolunteerGroup title='Drift' url='tihlde/undergrupper/drift/' />
                <VolunteerGroup title='Næringsliv og Kurs' url='tihlde/undergrupper/nringsliv-og-kurs/' />
                <VolunteerGroup title='Promo' url='tihlde/undergrupper/promo/' />
                <VolunteerGroup title='Sosialen' url='tihlde/undergrupper/sosialen/' />
              </div>
              <Typography gutterBottom sx={{ mt: 1 }} variant='h3'>
                Komitéer:
              </Typography>
              <div>
                <VolunteerGroup title='FadderKom' url='tihlde/komiteer/fadderkom/' />
                <VolunteerGroup title='JenteKom' url='tihlde/komiteer/jentekom/' />
                <VolunteerGroup title='KontKom' url='tihlde/komiteer/kontkom/' />
                <VolunteerGroup title='Redaksjonen' url='tihlde/komiteer/redaksjonen/' />
                <VolunteerGroup title='TurTorial' url='tihlde/komiteer/turtorial/' />
              </div>
            </Paper>
          </Collapse>
          <Collapse in={tab === sportsTab.value} mountOnEnter>
            <Paper sx={{ p: 2 }}>
              <MarkdownRenderer value={sportsText?.content || ''} />
            </Paper>
          </Collapse>
          <Collapse in={tab === aboutTab.value} mountOnEnter>
            <Paper sx={{ p: 2 }}>
              <MarkdownRenderer value={aboutText} />
            </Paper>
          </Collapse>
        </div>
      </div>
    </Page>
  );
};

export default NewStudent;
