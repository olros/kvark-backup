import { useAuth0 } from '@auth0/auth0-react';
import { Button, styled, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import URLS from 'URLS';

import Page from 'components/navigation/Page';

import http404img from 'assets/img/http404.gif';
import http404ropeImg from 'assets/img/http404rope.gif';

const Buttons = styled('div')(({ theme }) => ({
  margin: theme.spacing(2, 'auto'),
  display: 'grid',
  gridGap: theme.spacing(1),
  maxWidth: 200,
}));

const Img = styled('img')({
  width: '100%',
  maxHeight: '70vh',
  objectFit: 'contain',
});

export type Http404Props = {
  title?: string;
};

const Http404 = ({ title = 'Kunne ikke finne siden' }: Http404Props) => {
  const { isAuthenticated } = useAuth0();

  return (
    <Page options={{ filledTopbar: true, title: '404', lightColor: 'blue', gutterTop: true }}>
      {isAuthenticated ? (
        <Img alt='404' loading='lazy' src={http404ropeImg} />
      ) : (
        <Img alt='404' loading='lazy' src={http404img} sx={{ paddingTop: (theme) => theme.spacing(3) }} />
      )}
      <Typography align='center' variant='h1'>
        {title}
      </Typography>
      <Buttons>
        <Button component={Link} to={URLS.landing} variant='contained'>
          Til forsiden
        </Button>
        <Button component={Link} to={URLS.aboutIndex} variant='outlined'>
          Rapporter til Index
        </Button>
      </Buttons>
    </Page>
  );
};

export default Http404;
