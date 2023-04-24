import DeleteIcon from '@mui/icons-material/DeleteOutlineRounded';
import NotificationSettingsIcon from '@mui/icons-material/EditNotificationsRounded';
import ExportIcon from '@mui/icons-material/FileDownloadRounded';
import UserSettingsIcon from '@mui/icons-material/MoodRounded';
import PasswordIcon from '@mui/icons-material/PasswordRounded';
import { Button, Stack, Typography } from '@mui/material';

import { User } from 'types';

import { useSnackbar } from 'hooks/Snackbar';
import { useExportUserData } from 'hooks/User';
import { useAnalytics } from 'hooks/Utils';

import UserNotificationSettings, { ConnectWithSlack } from 'pages/Profile/components/ProfileSettings/NotificationSettings';
import UserDeleteDialog from 'pages/Profile/components/ProfileSettings/UserDeleteDialog';
import UserSettings from 'pages/Profile/components/ProfileSettings/UserSettings';

import { StandaloneExpand } from 'components/layout/Expand';

export type ProfileSettingsProps = {
  user: User;
};

const ProfileSettings = ({ user }: ProfileSettingsProps) => {
  const { event } = useAnalytics();
  const showSnackbar = useSnackbar();
  const exportUserData = useExportUserData();
  const runExportUserdata = () =>
    exportUserData.mutate(undefined, {
      onSuccess: (data) => {
        event('export-data', 'profile', 'Exported user data');
        showSnackbar(data.detail, 'success');
      },
      onError: (e) => showSnackbar(e.detail, 'error'),
    });

  return (
    <Stack gap={1}>
      <ConnectWithSlack />
      <StandaloneExpand icon={<NotificationSettingsIcon />} primary='Varslingsinnstillinger' secondary='Bestem hvor du ønsker å motta ulike typer varsler'>
        <UserNotificationSettings user={user} />
      </StandaloneExpand>
      <StandaloneExpand icon={<UserSettingsIcon />} primary='Profil-innstillinger' secondary='Endre informasjon om deg selv'>
        <UserSettings user={user} />
      </StandaloneExpand>
      <StandaloneExpand icon={<PasswordIcon />} primary='Endre passord' secondary='Motta en link i din epost til side der du kan endre passord'>
        {/*<Button disabled={forgotPassword.isLoading} fullWidth onClick={resetPassword} variant='outlined'>
          Endre passord
        </Button>*/}
      </StandaloneExpand>
      <StandaloneExpand icon={<ExportIcon />} primary='Eksporter brukerdata' secondary='Få tilsendt alle data vi har lagret i tilknytning til din bruker'>
        <Button disabled={exportUserData.isLoading} fullWidth onClick={runExportUserdata} variant='outlined'>
          Eksporter brukerdata
        </Button>
      </StandaloneExpand>
      <StandaloneExpand icon={<DeleteIcon />} primary='Slett brukerkonto' secondary='Slett din bruker og alle tilhørende data vi har lagret'>
        <Typography color={(theme) => theme.palette.error.main} gutterBottom variant='h3'>
          Slett brukerkonto
        </Typography>
        <Typography gutterBottom variant='body2'>
          Slett din bruker og alle tilhørende data vi har lagret. Dine påmeldinger, medlemsskap, korte linker og badges er blant det som vil slettes for alltid.
          Det er ikke mulig å angre denne handlingen.
        </Typography>
        <UserDeleteDialog user={user} />
      </StandaloneExpand>
    </Stack>
  );
};

export default ProfileSettings;
