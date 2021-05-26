import { ComponentType, useMemo, useState } from 'react';
import URLS from 'URLS';
import { Link, useLocation } from 'react-router-dom';

// Material UI Components
import { makeStyles, BottomNavigation, BottomNavigationAction } from '@material-ui/core';
import EventIcon from '@material-ui/icons/EventRounded';
import MenuIcon from '@material-ui/icons/MenuRounded';
import JobPostIcon from '@material-ui/icons/WorkOutlineRounded';
import NewsIcon from '@material-ui/icons/NewReleasesRounded';

// Project components
import Paper from 'components/layout/Paper';
import Logo from 'components/miscellaneous/TihldeLogo';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: theme.zIndex.drawer + 1,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopLeftRadius: 2 * Number(theme.shape.borderRadius),
    borderTopRightRadius: 2 * Number(theme.shape.borderRadius),
    ...theme.palette.blurred,
    ...theme.palette.transparent,
    background: `${theme.palette.background.paper}aa`,
  },
  navbar: {
    height: 80,
    background: 'transparent',
    padding: theme.spacing(1, 0, 3),
  },
  action: {
    color: theme.palette.text.secondary,
    padding: 12,
    '&$selected': {
      color: theme.palette.text.primary,
    },
  },
  selected: {
    // This must be empty to override the selected style
  },
  tihldeLogo: {
    width: 'auto',
    height: 28,
    marginBottom: -2,
    marginTop: -2,
  },
}));

type Item = {
  icon: ComponentType<{ className?: string }>;
  text: string;
  to: string;
};

const MainLogo = () => {
  const classes = useStyles();
  return <Logo className={classes.tihldeLogo} darkColor='white' lightColor='black' size='small' />;
};
const MENU_TAB_KEY = 'menu';

const BottomBar = () => {
  const classes = useStyles();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const items = useMemo<Array<Item>>(
    () => [
      {
        icon: MainLogo,
        text: 'Hjem',
        to: URLS.landing,
      },
      {
        icon: EventIcon,
        text: 'Arrangementer',
        to: URLS.events,
      },
      {
        icon: NewsIcon,
        text: 'Nyheter',
        to: URLS.news,
      },
      {
        icon: JobPostIcon,
        text: 'Karriere',
        to: URLS.jobposts,
      },
    ],
    [],
  );
  const routeVal = (path: string) => {
    items.forEach((item) => {
      if (path.substring(0, item.to.length) === item.to) {
        return item.to;
      }
    });
    return path;
  };
  const [tab, setTab] = useState(routeVal(location.pathname));

  return (
    <Paper className={classes.root} noPadding>
      <BottomNavigation
        className={classes.navbar}
        onChange={(event, newValue) => (items.some((item) => item.to === newValue) ? setTab(newValue) : null)}
        showLabels
        value={tab}>
        {items.map(({ text, to, icon: Icon }, i) => (
          <BottomNavigationAction
            classes={{ root: classes.action, selected: classes.selected }}
            component={Link}
            icon={<Icon />}
            key={i}
            label={text}
            to={to}
            value={to}
          />
        ))}
        <BottomNavigationAction
          classes={{ root: classes.action, selected: classes.selected }}
          icon={<MenuIcon />}
          label='Meny'
          onClick={() => setMenuOpen(true)}
          value={MENU_TAB_KEY}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomBar;
