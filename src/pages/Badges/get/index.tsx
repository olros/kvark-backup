import { Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';

import { useCreateBadge } from 'hooks/Badge';
import { useSnackbar } from 'hooks/Snackbar';

const BadgesGet = () => {
  const [flag, setFlag] = useState<string>('');
  const createUserBadge = useCreateBadge();
  const showSnackbar = useSnackbar();
  const submit = () => {
    const formatedId = flag.replace(/flag{/gi, '').replace(/}/gi, '');
    createUserBadge.mutate(formatedId, {
      onSuccess: (data) => {
        showSnackbar(data.detail, 'success');
        setFlag('');
      },
      onError: (e) => showSnackbar(e.detail, 'error'),
    });
  };

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} gap={2} sx={{ mt: 1 }}>
      <TextField
        fullWidth
        helperText='flag{xxx-xxx-xxx-xxx-xxx}'
        id='ctf-flag-input'
        label='Send inn flagg'
        onChange={(event) => setFlag(event.target.value)}
        value={flag}
        variant='outlined'
      />
      <Button onClick={submit} sx={{ height: { md: 56 }, minWidth: 120 }} variant='contained'>
        Send inn
      </Button>
    </Stack>
  );
};

export default BadgesGet;
