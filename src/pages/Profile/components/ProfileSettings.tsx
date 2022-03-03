import { Button, Divider, MenuItem, Stack, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { getUserClass, getUserStudyLong } from 'utils';

import { User } from 'types';

import { useSnackbar } from 'hooks/Snackbar';
import { useUser } from 'hooks/User';
import { useDeleteUser, useExportUserData, useLogout, useUpdateUser } from 'hooks/User';
import { useAnalytics } from 'hooks/Utils';

import Bool from 'components/inputs/Bool';
import Select from 'components/inputs/Select';
import SubmitButton from 'components/inputs/SubmitButton';
import TextField from 'components/inputs/TextField';
import { ImageUpload } from 'components/inputs/Upload';
import VerifyDialog from 'components/layout/VerifyDialog';
import { ShowMoreTooltip } from 'components/miscellaneous/UserInformation';

const DeleteUserDialog = ({ isAdmin, user }: ProfileSettingsProps) => {
  const { event } = useAnalytics();
  const deleteUser = useDeleteUser();
  const logOut = useLogout();
  const showSnackbar = useSnackbar();
  const { register, formState, watch } = useForm<Pick<User, 'user_id'>>();
  const writtenUserId = watch('user_id');

  const runDeleteUser = () =>
    deleteUser.mutate(isAdmin ? user.user_id : undefined, {
      onSuccess: (data) => {
        showSnackbar(data.detail, 'success');
        event('delete-user', 'profile', 'Deleted user');
        logOut();
      },
      onError: (e) => showSnackbar(e.detail, 'error'),
    });

  return (
    <VerifyDialog
      color='error'
      contentText='Det er ikke mulig å angre denne handlingen. Bekreft ved å skrive inn ditt brukernavn.'
      dialogChildren={
        <>
          <TextField disabled={deleteUser.isLoading} formState={formState} label='Brukernavn' {...register('user_id')} />
          <Button color='error' disabled={user.user_id !== writtenUserId} fullWidth onClick={runDeleteUser} variant='outlined'>
            Slett din konto
          </Button>
        </>
      }
      fullWidth
      variant='outlined'>
      Slett din konto
    </VerifyDialog>
  );
};

export type ProfileSettingsProps = {
  user: User;
  isAdmin?: boolean;
};

type FormData = Pick<
  User,
  'first_name' | 'last_name' | 'email' | 'image' | 'gender' | 'allergy' | 'tool' | 'user_class' | 'user_study' | 'public_event_registrations'
>;

const ProfileSettings = ({ isAdmin, user }: ProfileSettingsProps) => {
  const { event } = useAnalytics();
  const showSnackbar = useSnackbar();
  const updateUser = useUpdateUser();
  const exportUserData = useExportUserData();
  const showFlag = user.image; //user.image !== "" || user.image === undefined ;
  const { register, handleSubmit, formState, control, setValue, watch } = useForm<FormData>({ defaultValues: { ...user } });
  const updateData = (data: FormData) => {
    if (updateUser.isLoading) {
      return;
    }
    updateUser.mutate(
      { userId: user.user_id, user: { ...user, ...data } },
      {
        onSuccess: () => {
          showSnackbar('Bruker oppdatert', 'success');
          event('update-settings', 'profile', 'Update');
        },
        onError: (e) => {
          showSnackbar(e.detail, 'error');
        },
      },
    );
  };

  const runExportUserdata = () =>
    exportUserData.mutate(undefined, {
      onSuccess: (data) => {
        event('export-data', 'profile', 'Exported user data');
        showSnackbar(data.detail, 'success');
      },
      onError: (e) => showSnackbar(e.detail, 'error'),
    });

  if (!user) {
    return null;
  }

  return (
    <>
      <form onSubmit={handleSubmit(updateData)}>
        {isAdmin && (
          <Stack direction={['column', 'row']} gap={[0, 1]}>
            <TextField disabled={updateUser.isLoading} formState={formState} label='Fornavn' {...register('first_name')} />
            <TextField disabled={updateUser.isLoading} formState={formState} label='Etternavn' {...register('last_name')} />
            <TextField disabled={updateUser.isLoading} formState={formState} label='Epost' {...register('email')} />
          </Stack>
        )}
        <Bool
          control={control}
          disabled={updateUser.isLoading}
          formState={formState}
          label={
            <>
              Offentlige arrangementspåmeldinger.
              <ShowMoreTooltip>
                Bestemmer:
                <br />
                1. Om du skal stå oppført med navnet ditt eller være anonym i deltagerlister på arrangementer.
                <br />
                2. Om arrangement-kalenderen din skal være aktivert og mulig å abonnere på.
              </ShowMoreTooltip>
            </>
          }
          name='public_event_registrations'
          type='switch'
        />
        <ImageUpload
          formState={formState}
          label='Velg profilbilde'
          ratio='1:1'
          register={register('image')}
          setValue={setValue}
          showFlag={showFlag}
          watch={watch}
        />
        <Stack direction={['column', 'row']} gap={[0, 1]}>
          <Select control={control} disabled={!isAdmin} formState={formState} label='Studie' name='user_study'>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <MenuItem key={i} value={i}>
                {getUserStudyLong(i)}
              </MenuItem>
            ))}
          </Select>
          <Select control={control} disabled={!isAdmin} formState={formState} label='Klasse' name='user_class'>
            {[1, 2, 3, 4, 5, -1].map((i) => (
              <MenuItem key={i} value={i}>
                {getUserClass(i)}
              </MenuItem>
            ))}
          </Select>
          <Select control={control} disabled={updateUser.isLoading} formState={formState} label='Kjønn' name='gender'>
            <MenuItem value={1}>Mann</MenuItem>
            <MenuItem value={2}>Kvinne</MenuItem>
            <MenuItem value={3}>Annet</MenuItem>
          </Select>
        </Stack>
        <TextField disabled={updateUser.isLoading} formState={formState} label='Kjøkkenredskap' {...register('tool')} />
        <TextField
          disabled={updateUser.isLoading}
          formState={formState}
          helperText='Dine allergier vises til arrangører ved arrangementer'
          label='Dine allergier'
          multiline
          {...register('allergy')}
          minRows={3}
        />
        <SubmitButton disabled={updateUser.isLoading} formState={formState}>
          Lagre
        </SubmitButton>
        {!isAdmin && (
          <Typography sx={{ mt: 1 }} variant='body2'>
            {`Er navn, epost, klasse eller studie er feil? Ta kontakt med oss på `}
            <a href='https://m.me/tihlde' rel='noopener noreferrer' target='_blank'>
              Messenger
            </a>
            {` eller Slack.`}
          </Typography>
        )}
      </form>
      {!isAdmin && (
        <>
          <Divider sx={{ mt: 1, mb: 2 }} />
          <Typography gutterBottom variant='h3'>
            Eksporter brukerdata
          </Typography>
          <Typography gutterBottom variant='body2'>
            Få tilsendt alle data vi har lagret i tilknytning til din bruker
          </Typography>
          <Button disabled={exportUserData.isLoading} fullWidth onClick={runExportUserdata} variant='outlined'>
            Eksporter brukerdata
          </Button>
        </>
      )}
      <Divider sx={{ mt: 1, mb: 2 }} />
      <Typography color={(theme) => theme.palette.error.main} gutterBottom variant='h3'>
        Slett brukerkonto
      </Typography>
      <Typography gutterBottom variant='body2'>
        Slett din bruker og alle tilhørende data vi har lagret. Dine påmeldinger, medlemsskap, korte linker og badges er blant det som vil slettes for alltid.
        Det er ikke mulig å angre denne handlingen.
      </Typography>
      <DeleteUserDialog isAdmin={isAdmin} user={user} />
    </>
  );
};

export default ProfileSettings;
