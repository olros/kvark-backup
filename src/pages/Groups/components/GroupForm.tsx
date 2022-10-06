import { EMAIL_REGEX } from 'constant';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { CompaniesEmail } from 'types';

import API from 'api/api';

import { useSnackbar } from 'hooks/Snackbar';

import SubmitButton from 'components/inputs/SubmitButton';
import TextField from 'components/inputs/TextField';
import Paper from 'components/layout/Paper';

type GroupForm = {
  name: string;
  email: string;
  comment: string;
};

const GroupForm = () => {
  const showSnackbar = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState, reset, setError } = useForm<GroupForm>();

  const submitForm = async (data: GroupForm) => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    try {
      const companyData: CompaniesEmail = {
        ...data,
        info: {
          bedrift: '',
          kontaktperson: '',
          epost: '',
        },
        time: [],
        type: [],
      };
      const response = await API.emailForm(companyData);
      showSnackbar(response.detail, 'success');
      reset({ info: { bedrift: '', epost: '' }, comment: '' } as CompaniesEmailFormValues);
    } catch (e) {
      setError('info.bedrift', { message: e.detail || 'Noe gikk galt' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper>
      <form onSubmit={handleSubmit(submitForm)}>
        <TextField disabled={isLoading} formState={formState} label='Gruppenavn' {...register('info.bedrift', { required: 'Feltet er påkrevd' })} required />
        <TextField
          disabled={isLoading}
          formState={formState}
          label='Epost'
          {...register('info.epost', {
            required: 'Feltet er påkrevd',
            pattern: {
              value: EMAIL_REGEX,
              message: 'Ugyldig e-post',
            },
          })}
          required
          type='email'
        />
        <TextField
          disabled={isLoading}
          formState={formState}
          label='Beskrivelse'
          multiline
          {...(register('comment'), { required: 'Feltet er påkrevd' })}
          rows={3}
        />
        <SubmitButton disabled={isLoading} formState={formState}>
          Send inn
        </SubmitButton>
      </form>
    </Paper>
  );
};

export default GroupForm;
