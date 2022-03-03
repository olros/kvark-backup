import { keyframes } from '@emotion/react';
import SignupIcon from '@mui/icons-material/AddRounded';
import LoginIcon from '@mui/icons-material/LoginRounded';
import ProfileIcon from '@mui/icons-material/PersonOutlineRounded';
import { Button, Typography } from '@mui/material';
import { makeStyles } from 'makeStyles';
import { Link } from 'react-router-dom';
import URLS from 'URLS';
import { isAfterDateOfYear, isBeforeDateOfYear } from 'utils';

import { useIsAuthenticated } from 'hooks/User';
import { useAnalytics } from 'hooks/Utils';

import TihldeLogo from 'components/miscellaneous/TihldeLogo';

import { ReactComponent as WaveBottom } from 'assets/img/waves/wave-bottom.svg';
import { ReactComponent as WaveMid } from 'assets/img/waves/wave-mid.svg';
import { ReactComponent as WaveTop } from 'assets/img/waves/wave-top.svg';

const moveWave = keyframes`
  0% {
    transform: translateX(0) translateZ(0) scaleY(1);
  }

  50% {
    transform: translateX(-25%) translateZ(0) scaleY(0.55);
  }

  100% {
    transform: translateX(-50%) translateZ(0) scaleY(1);
  }
`;

const useStyles = makeStyles()((theme) => ({
  root: {
    padding: 0,
    margin: 'unset',
    width: '100%',
    maxWidth: 'none',
    height: 500,
  },
  container: {
    overflow: 'hidden',
    margin: 'auto',
    position: 'absolute',
    width: '100%',
    height: 500,
    background: `linear-gradient(20deg, ${theme.palette.colors.gradient.main.bottom} 20%, ${theme.palette.colors.gradient.main.top} 80%)`,
  },
  content: {
    margin: 'auto',
    maxWidth: 920,
    padding: '150px 15px 100px',
    position: 'relative',
    zIndex: 20,
  },
  contentText: {
    color: theme.palette.getContrastText(theme.palette.colors.gradient.main.top),
    margin: `${theme.spacing(1)} auto`,
    fontSize: '1.2rem',
    [theme.breakpoints.down('lg')]: {
      fontSize: '1.05rem',
    },
  },
  logo: {
    width: '70vw',
    height: 'auto',
    maxWidth: 450,
    minWidth: 250,
    maxHeight: 90,
  },
  contentButtons: {
    margin: theme.spacing(2, 'auto', 0),
    display: 'flex',
    justifyContent: 'center',
  },
  contentButtonPrimary: {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    '&:hover': {
      backgroundColor: `${theme.palette.background.paper}bb`,
    },
    margin: theme.spacing('auto', 1),
  },
  contentButtonSecondary: {
    color: theme.palette.getContrastText(theme.palette.colors.gradient.main.top),
    '&:hover': {
      color: `${theme.palette.getContrastText(theme.palette.colors.gradient.main.top)}bb`,
    },
    textDecoration: 'none',
    margin: theme.spacing('auto', 1),
  },
  waveWrapperInner: {
    position: 'absolute',
    left: 0,
    right: 0,
    width: '100%',
    overflow: 'hidden',
    height: 130,
    bottom: 0,
    zIndex: 15,
    background: `linear-gradient(to bottom, transparent 80%, ${theme.palette.background.smoke})`,
  },
  wave: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '200%',
    height: '100%',
    fill: theme.palette.background.smoke,
    display: 'flex',
  },
  waveTop: {
    zIndex: 18,
    opacity: 0.5,
    animation: `${moveWave} 60s linear alternate infinite`,
    transformOrigin: 'bottom center',
  },
  waveMiddle: {
    zIndex: 17,
    opacity: 0.6,
    animation: `${moveWave} 20s linear alternate infinite`,
    transformOrigin: 'bottom left',
  },
  waveBottom: {
    zIndex: 16,
    opacity: 0.7,
    width: '280%',
    animation: `${moveWave} 25s linear alternate infinite`,
    transformOrigin: 'bottom right',
  },
  svg: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 120,
    [theme.breakpoints.down('md')]: {
      height: 90,
    },
  },
}));

const Wave = () => {
  const { classes, cx } = useStyles();
  const { event } = useAnalytics();
  const isAuthenticated = useIsAuthenticated();

  const analytics = (page: string) => event('go-to-page', 'wave', `Go to ${page}`);

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <div className={classes.content}>
          <TihldeLogo className={classes.logo} darkColor='white' lightColor='white' size='large' />
          <Typography align='center' className={classes.contentText} variant='body1'>
            Linjeforeningen for Dataingeniør, Digital infrastruktur og cybersikkerhet, Digital forretningsutvikling, Digital samhandling og
            Informasjonsbehandling ved NTNU
          </Typography>
          <div className={classes.contentButtons}>
            {isAuthenticated ? (
              <Button
                className={classes.contentButtonPrimary}
                color='inherit'
                component={Link}
                endIcon={<ProfileIcon />}
                onClick={() => analytics('profile')}
                to={URLS.profile}
                variant='contained'>
                Min profil
              </Button>
            ) : (
              <>
                <Button
                  className={classes.contentButtonPrimary}
                  color='inherit'
                  component={Link}
                  endIcon={<LoginIcon />}
                  onClick={() => analytics('log-in')}
                  to={URLS.login}
                  variant='contained'>
                  Logg inn
                </Button>
                <Button
                  className={classes.contentButtonSecondary}
                  color='inherit'
                  component={Link}
                  endIcon={<SignupIcon />}
                  onClick={() => analytics('sign-up')}
                  to={URLS.signup}>
                  Opprett bruker
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Show snow if between November 15th and February 1st */}
        {(isAfterDateOfYear(10, 15) || isBeforeDateOfYear(1, 1)) && (
          <>
            <div className='rain rain--far' />
            <div className='rain rain--mid' />
            <div className='rain rain--near' />
          </>
        )}

        <div className={classes.waveWrapperInner}>
          <div className={cx(classes.wave, classes.waveTop)}>
            <WaveTop className={classes.svg} />
            <WaveTop className={classes.svg} />
          </div>
          <div className={cx(classes.wave, classes.waveMiddle)}>
            <WaveMid className={classes.svg} />
            <WaveMid className={classes.svg} />
          </div>
          <div className={cx(classes.wave, classes.waveBottom)}>
            <WaveBottom className={classes.svg} />
            <WaveBottom className={classes.svg} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wave;
