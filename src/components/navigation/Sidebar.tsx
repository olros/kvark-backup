import { useAuth0 } from '@auth0/auth0-react';
import CloseIcon from '@mui/icons-material/Close';
import ExpandIcon from '@mui/icons-material/ExpandMoreRounded';
import OpenInNewIcon from '@mui/icons-material/OpenInNewRounded';
import { IconButton, useTheme } from '@mui/material';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import { makeStyles } from 'makeStyles';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import URLS from 'URLS';

import TihldeLogo from 'components/miscellaneous/TihldeLogo';
import { NavigationItem } from 'components/navigation/Navigation';

const useStyles = makeStyles()((theme) => ({
  sidebar: {
    backgroundColor: theme.palette.colors.gradient.main.top,
    width: '100vw',
    overflow: 'auto',
    height: '100%',
  },
  root: {
    padding: theme.spacing(2, 3),
    display: 'flex',
    flexDirection: 'column',
  },
  dropdownButton: {
    textTransform: 'none',
    textAlign: 'left',
    justifyContent: 'flex-start',
    width: 'fit-content',
    padding: 0,
    paddingRight: theme.spacing(1),
  },
  dropdown: {
    display: 'flex',
    flexDirection: 'column',
  },
  text: {
    color: theme.palette.getContrastText(theme.palette.colors.gradient.main.top),
    padding: theme.spacing(1),
    textDecoration: 'none',
    width: 'fit-content',
  },
  itemText: {
    marginLeft: theme.spacing(2),
  },
  dropdownIcon: {
    transition: 'transform 0.5s',
    color: theme.palette.getContrastText(theme.palette.colors.gradient.main.top),
    fontSize: '40px !important',
    marginBottom: theme.spacing(-0.5),
  },
  expanded: {
    transform: 'rotate(180deg)',
  },
  topWrapper: {
    height: '32',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(2),
  },
  logo: {
    height: 32,
    width: 'auto',
    display: 'inline-block',
    margin: '',
  },
  closeSidebar: {
    height: '32',
    aspectRatio: '1',
    display: 'inline-flex',
    verticalAlign: 'top',
    alignItems: 'center',
  },
}));

export type SidebarItemProps = NavigationItem & {
  onClose: SidebarProps['onClose'];
};

const SidebarItem = ({ onClose, ...props }: SidebarItemProps) => {
  const { classes, cx } = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  if (props.type === 'link') {
    return props.external ? (
      <Typography className={classes.text} component='a' href={props.to} target='_blank' variant='h2'>
        {props.text} <OpenInNewIcon fontSize='inherit' sx={{ mb: '-2px' }} />
      </Typography>
    ) : (
      <Typography
        className={classes.text}
        component={Link}
        onClick={props.to === window.location.pathname ? () => window.location.reload() : onClose}
        to={props.to}
        variant='h2'>
        {props.text}
      </Typography>
    );
  }
  return (
    <>
      <Button
        className={classes.dropdownButton}
        endIcon={<ExpandIcon className={cx(classes.dropdownIcon, isOpen && classes.expanded)} />}
        onClick={() => setIsOpen((prev) => !prev)}>
        <Typography className={classes.text} variant='h2'>
          {props.text}
        </Typography>
      </Button>
      <Collapse classes={{ wrapperInner: classes.dropdown }} in={isOpen}>
        {props.items.map((item, i) =>
          item.external ? (
            <Typography className={cx(classes.text, classes.itemText)} component='a' href={item.to} key={i} variant='h3'>
              - {item.text} <OpenInNewIcon fontSize='inherit' sx={{ mb: '-4px' }} />
            </Typography>
          ) : (
            <Typography
              className={cx(classes.text, classes.itemText)}
              component={Link}
              key={i}
              onClick={item.to === window.location.pathname ? () => window.location.reload() : onClose}
              to={item.to}
              variant='h3'>
              - {item.text}
            </Typography>
          ),
        )}
      </Collapse>
    </>
  );
};

export type SidebarProps = {
  items: Array<NavigationItem>;
  onClose: () => void;
  open: boolean;
};

const Sidebar = ({ items, onClose, open }: SidebarProps) => {
  const { classes } = useStyles();
  const { isAuthenticated } = useAuth0();
  const theme = useTheme();
  return (
    <Drawer anchor='bottom' classes={{ paper: classes.sidebar }} onClose={onClose} open={open} style={{ zIndex: theme.zIndex.drawer }}>
      <div className={classes.topWrapper}>
        <TihldeLogo className={classes.logo} darkColor='white' lightColor='white' size='large' sx={{ flexShrink: 1 }} />
        <IconButton className={classes.closeSidebar} onClick={() => onClose()}>
          <CloseIcon />
        </IconButton>
      </div>
      <div className={classes.root}>
        {items.map((item, i) => (
          <SidebarItem key={i} {...item} onClose={onClose} />
        ))}
        {isAuthenticated ? (
          <SidebarItem onClose={onClose} text='Min profil' to={URLS.profile} type='link' />
        ) : (
          <SidebarItem onClose={onClose} text='Logg inn' to={URLS.login} type='link' />
        )}
      </div>
    </Drawer>
  );
};

export default Sidebar;
