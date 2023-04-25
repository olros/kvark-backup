import { useAuth0 } from '@auth0/auth0-react';
import AdminIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import EventIcon from '@mui/icons-material/DateRangeRounded';
import BadgesIcon from '@mui/icons-material/EmojiEventsRounded';
import LogOutIcon from '@mui/icons-material/ExitToAppRounded';
import FormsIcon from '@mui/icons-material/HelpOutlineRounded';
import GroupsIcon from '@mui/icons-material/PeopleOutlineRounded';
import SettingsIcon from '@mui/icons-material/TuneRounded';
import WorkspacesIcon from '@mui/icons-material/WorkspacesRounded';
import {
  Badge,
  Box,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemButtonProps,
  ListItemIcon,
  ListItemProps,
  ListItemText,
  Skeleton,
  Stack,
  styled,
  SvgIconProps,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUserAffiliation } from 'utils';

import { User } from 'types';
import { PermissionApp } from 'types/Enums';

import { useAPI } from 'hooks/API';
import { useHavePermission } from 'hooks/User';
import { useAnalytics } from 'hooks/Utils';

import ProfileAdmin from 'pages/Profile/components/ProfileAdmin';
import ProfileBadges from 'pages/Profile/components/ProfileBadges';
import ProfileEvents from 'pages/Profile/components/ProfileEvents';
import ProfileForms from 'pages/Profile/components/ProfileForms';
import ProfileGroups from 'pages/Profile/components/ProfileGroups';
import ProfileSettings from 'pages/Profile/components/ProfileSettings';
import ProfileStrikes from 'pages/Profile/components/ProfileStrikes';

import Paper from 'components/layout/Paper';
import Avatar from 'components/miscellaneous/Avatar';
import QRButton from 'components/miscellaneous/QRButton';
import Page from 'components/navigation/Page';

const Content = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '250px 1fr',
  gridGap: theme.spacing(1),
  alignItems: 'self-start',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

const Profile = () => {
  const { userId } = useParams();
  const { event } = useAnalytics();
  const { logout } = useAuth0();
  const { getUserData } = useAPI();

  const [user, setUser] = useState<User | undefined>();

  useEffect(() => {
    getUserData().then((u) => setUser(u));
  }, []);

  const { allowAccess: isAdmin } = useHavePermission([
    PermissionApp.EVENT,
    PermissionApp.JOBPOST,
    PermissionApp.NEWS,
    PermissionApp.USER,
    PermissionApp.STRIKE,
    PermissionApp.GROUP,
  ]);

  const eventTab: NavListItem = { label: 'Arrangementer', icon: EventIcon };
  const badgesTab: NavListItem = { label: 'Badges', icon: BadgesIcon };
  const groupsTab: NavListItem = { label: 'Medlemskap', icon: GroupsIcon };
  const formsTab: NavListItem = { label: 'Spørreskjemaer', icon: FormsIcon, badge: user?.unanswered_evaluations_count };
  const settingsTab: NavListItem = { label: 'Innstillinger', icon: SettingsIcon };
  const adminTab: NavListItem = { label: 'Admin', icon: AdminIcon };
  const strikesTab: NavListItem = { label: 'Prikker', icon: WorkspacesIcon };
  const logoutTab: NavListItem = {
    label: 'Logg ut',
    icon: LogOutIcon,
    onClick: () => logout(),
    iconProps: { sx: { color: (theme) => theme.palette.error.main } },
  };
  const tabs: Array<NavListItem> = userId
    ? [badgesTab, groupsTab]
    : [eventTab, badgesTab, groupsTab, strikesTab, formsTab, settingsTab, ...(isAdmin ? [adminTab] : [])];

  const [tab, setTab] = useState(userId ? badgesTab.label : eventTab.label);

  useEffect(() => setTab(userId ? badgesTab.label : eventTab.label), [userId]);
  useEffect(() => event('change-tab', 'profile', `Changed tab to: ${tab}`), [tab]);

  type NavListItem = ListItemProps &
    Pick<ListItemButtonProps, 'onClick'> & {
      label: string;
      icon: React.ComponentType<SvgIconProps>;
      badge?: string | number;
      iconProps?: SvgIconProps;
    };

  const NavListItem = ({ label, icon: Icon, onClick, badge, iconProps, ...props }: NavListItem) => (
    <ListItem disableGutters disablePadding {...props}>
      <ListItemButton
        onClick={onClick ? onClick : () => setTab(label)}
        selected={tab === label}
        sx={{ borderRadius: ({ shape }) => `${shape.borderRadius}px` }}>
        <ListItemIcon sx={{ minWidth: { xs: 32, sm: 40 } }}>
          <Badge badgeContent={badge} color='error'>
            <Icon color={tab === label ? 'primary' : 'inherit'} {...iconProps} />
          </Badge>
        </ListItemIcon>
        <ListItemText primary={label} />
      </ListItemButton>
    </ListItem>
  );

  return (
    <Page options={{ title: 'Profil', gutterTop: true, lightColor: 'blue' }}>
      <Stack component={Paper} direction={{ xs: 'column', md: 'row' }} gap={1} sx={{ p: 2, mt: 1 }}>
        <Stack direction='row' gap={1} sx={{ flex: 1 }}>
          <Avatar sx={{ width: { xs: 70, md: 140 }, height: { xs: 70, md: 140 }, fontSize: { xs: '1.8rem', md: '3rem' } }} user={user} />
          {user && user.first_name ? (
            <Stack sx={{ m: 'auto', mx: 1, flex: 1 }}>
              <Typography
                sx={{ wordBreak: 'break-word', fontSize: { xs: '1.6rem', md: '3rem' } }}
                variant='h1'>{`${user.first_name} ${user.last_name}`}</Typography>
              <Typography sx={{ wordBreak: 'break-word' }} variant='subtitle1'>
                {user.user_id} | <a href={`mailto:${user.email}`}>{user.email}</a>
              </Typography>
              <Typography sx={{ wordBreak: 'break-word' }} variant='subtitle1'>
                {getUserAffiliation(user)}
              </Typography>
            </Stack>
          ) : (
            <Stack sx={{ m: 'auto', mx: 1, flex: 1 }}>
              <Skeleton sx={{ fontSize: { xs: '1.8rem', md: '3rem' } }} variant='text' width={230} />
              <Skeleton variant='text' width={170} />
            </Stack>
          )}
        </Stack>
        {!userId && user && (
          <QRButton qrValue={user.user_id} subtitle={`${user.first_name} ${user.last_name}`} sx={{ mb: 'auto' }}>
            Medlemsbevis
          </QRButton>
        )}
      </Stack>
      <Content>
        <Stack spacing={1}>
          <Paper noOverflow noPadding>
            <List aria-label='Profil innholdsliste' disablePadding sx={{ display: 'grid', gridTemplateColumns: { xs: '50% 50%', md: '1fr' } }}>
              {tabs.map((tab) => (
                <NavListItem {...tab} key={tab.label} />
              ))}
            </List>
          </Paper>
          {!userId && (
            <Paper noOverflow noPadding>
              <List aria-label='Logg ut' disablePadding>
                <NavListItem {...logoutTab} />
              </List>
            </Paper>
          )}
        </Stack>
        <Box sx={{ overflowX: 'auto' }}>
          <Collapse in={tab === eventTab.label}>
            <ProfileEvents />
          </Collapse>
          <Collapse in={tab === badgesTab.label} mountOnEnter>
            <ProfileBadges />
          </Collapse>
          <Collapse in={tab === groupsTab.label} mountOnEnter>
            <ProfileGroups />
          </Collapse>
          <Collapse in={tab === formsTab.label} mountOnEnter>
            <ProfileForms />
          </Collapse>
          <Collapse in={tab === strikesTab.label} mountOnEnter>
            <ProfileStrikes />
          </Collapse>
          <Collapse in={tab === settingsTab.label} mountOnEnter>
            {user && <ProfileSettings user={user} />}
          </Collapse>
          <Collapse in={tab === adminTab.label} mountOnEnter>
            <ProfileAdmin />
          </Collapse>
        </Box>
      </Content>
    </Page>
  );
};

export default Profile;
