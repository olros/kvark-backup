import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@mui/material';
import { useForm } from 'react-hook-form';

import { User } from 'types';

import { useSnackbar } from 'hooks/Snackbar';
import { useDeleteUser } from 'hooks/User';
import { useAnalytics } from 'hooks/Utils';

import TextField from 'components/inputs/TextField';
import VerifyDialog from 'components/layout/VerifyDialog';

export type UserDeleteDialogProps = {
  user: User;
  isAdmin?: boolean;
};

export const UserDeleteDialog = ({ isAdmin, user }: UserDeleteDialogProps) => {
  const { event } = useAnalytics();
  const { logout } = useAuth0();
  const deleteUser = useDeleteUser();
  const showSnackbar = useSnackbar();
  const { register, formState, watch } = useForm<Pick<User, 'user_id'>>();
  const writtenUserId = watch('user_id');

  const runDeleteUser = () =>
    deleteUser.mutate(isAdmin ? user.user_id : undefined, {
      onSuccess: (data) => {
        showSnackbar(data.detail, 'success');
        event('delete-user', 'profile', 'Deleted user');
        logout();
      },
      onError: (e) => showSnackbar(e.detail, 'error'),
    });

  return (
    <VerifyDialog
      color='error'
      contentText={`Det er ikke mulig å angre denne handlingen. Bekreft ved å skrive inn${isAdmin ? '' : ' ditt'} brukernavn.`}
      dialogChildren={
        <>
          <TextField disabled={deleteUser.isLoading} formState={formState} label='Brukernavn' {...register('user_id')} />
          <Button color='error' disabled={user.user_id !== writtenUserId} fullWidth onClick={runDeleteUser} variant='outlined'>
            Slett{isAdmin ? '' : ' din'} konto
          </Button>
        </>
      }
      fullWidth
      variant='outlined'>
      Slett{isAdmin ? '' : ' din'} konto
    </VerifyDialog>
  );
};

export default UserDeleteDialog;
