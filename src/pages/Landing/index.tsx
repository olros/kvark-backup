import ArrowIcon from '@mui/icons-material/ArrowForwardRounded';
import { IconButton, styled, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import URLS from 'URLS';

import { useAnalytics } from 'hooks/Utils';

import EventsView from 'pages/Landing/components/EventsView';
import NewsListView from 'pages/Landing/components/NewsListView';
import NewStudentBox from 'pages/Landing/components/NewStudentBox';
import StoriesView from 'pages/Landing/components/StoriesView';
import Wave from 'pages/Landing/components/Wave';

import Container from 'components/layout/Container';
import BadgeInput from 'components/miscellaneous/BadgeInput';
import Page from 'components/navigation/Page';

const Section = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  [theme.breakpoints.down('lg')]: {
    paddingTop: theme.spacing(1.5),
  },
}));

const Smoke = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.smoke,
}));

const Landing = () => {
  const { event } = useAnalytics();
  const openEventsAnalytics = () => event('go-to-all-events', 'events-list-view', `Go to all events`);
  const openNewsAnalytics = () => event('go-to-all-news', 'news-list-view', `Go to all news`);

  return (
    <Page banner={<Wave />} maxWidth={false} options={{ title: 'Forsiden' }}>
      <Smoke>
        <Section maxWidth='lg' sx={{ px: { xs: 0, lg: 2 } }}>
          <NewStudentBox />
          <BadgeInput allBadgesFound={false} flagCount={8} title='TIHLDE 30 ÅR - CTF' />
          <StoriesView />
        </Section>
      </Smoke>
      <Section maxWidth='lg'>
        <Typography align='center' gutterBottom variant='h2'>
          Arrangementer
          <IconButton component={Link} onClick={openEventsAnalytics} sx={{ ml: 1 }} to={URLS.events}>
            <ArrowIcon />
          </IconButton>
        </Typography>
        <EventsView />
      </Section>
      <Smoke>
        <Section maxWidth='lg'>
          <Typography align='center' gutterBottom variant='h2'>
            Nyheter
            <IconButton component={Link} onClick={openNewsAnalytics} sx={{ ml: 1 }} to={URLS.news}>
              <ArrowIcon />
            </IconButton>
          </Typography>
          <NewsListView />
        </Section>
      </Smoke>
    </Page>
  );
};

export default Landing;
