import { useAuth0 } from '@auth0/auth0-react';
import PersonOutlineIcon from '@mui/icons-material/PersonRounded';
import LightIcon from '@mui/icons-material/WbSunnyRounded';
import { Button, IconButton, Theme, useTheme } from '@mui/material';
import { makeStyles } from 'makeStyles';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import URLS from 'URLS';

import { useUser } from 'hooks/User';
import { useAnalytics } from 'hooks/Utils';

import Avatar from 'components/miscellaneous/Avatar';
import ThemeSettings from 'components/miscellaneous/ThemeSettings';
import { NavigationOptions } from 'components/navigation/Navigation';
import TopbarNotifications from 'components/navigation/TopbarNotifications';

const useStyles = makeStyles<ProfileTopbarButtonProps>()((theme, props) => ({
  themeButton: {
    color: getColor(props, theme),
  },
  themeSettingsIcon: {
    fontSize: 26,
  },
  menuButton: {
    color: getColor(props, theme),
    margin: 'auto 0',
  },
}));

export const getColor = ({ darkColor, lightColor }: ProfileTopbarButtonProps, theme: Theme) => {
  const type = theme.palette.mode === 'light' ? lightColor : darkColor;
  return type === 'white' ? theme.palette.common.white : type === 'blue' ? theme.palette.colors.tihlde : theme.palette.common.black;
};

export type ProfileTopbarButtonProps = Pick<NavigationOptions, 'darkColor' | 'lightColor'>;

const ProfileTopbarButton = (props: ProfileTopbarButtonProps) => {
  const { event } = useAnalytics();
  const { classes } = useStyles(props);
  const { data: user } = useUser();
  const theme = useTheme();
  const { loginWithRedirect } = useAuth0();
  const [showThemeSettings, setShowThemeSettings] = useState(false);

  const analytics = (page: string) => event(`go-to-${page}`, 'topbar-profile-button', `Go to ${page}`);

  return (
    <div>
      {Boolean(user) && <TopbarNotifications color={getColor(props, theme)} />}
      <ThemeSettings onClose={() => setShowThemeSettings(false)} open={showThemeSettings} />
      <IconButton aria-label='Endre tema' className={classes.themeButton} onClick={() => setShowThemeSettings(true)}>
        <LightIcon className={classes.themeSettingsIcon} />
      </IconButton>
      {user ? (
        <Button
          aria-label='Til profilen'
          component={Link}
          onClick={URLS.profile === location.pathname ? () => location.reload() : () => analytics('profile')}
          to={URLS.profile}>
          <Avatar user={user} />
        </Button>
      ) : (
        <IconButton
          aria-label='Logg inn'
          className={classes.menuButton}
          onClick={() => {
            loginWithRedirect();
            analytics('log-in');
          }}>
          <PersonOutlineIcon />
        </IconButton>
      )}
    </div>
  );
};

export default ProfileTopbarButton;
