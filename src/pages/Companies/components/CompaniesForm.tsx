import { Divider, Stack } from '@mui/material';
import { EMAIL_REGEX } from 'constant';
import addMonths from 'date-fns/addMonths';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { CompaniesEmail } from 'types';

import { useAPI } from 'hooks/API';
import { useSnackbar } from 'hooks/Snackbar';
import { useAnalytics } from 'hooks/Utils';

import BoolArray from 'components/inputs/BoolArray';
import SubmitButton from 'components/inputs/SubmitButton';
import TextField from 'components/inputs/TextField';
import Paper from 'components/layout/Paper';

type CompaniesEmailFormValues = Omit<CompaniesEmail, 'time' | 'type'> & {
  time: Array<{ label: string }>;
  type: Array<{ label: string }>;
};

const CompaniesForm = () => {
  const { event } = useAnalytics();
  const showSnackbar = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const { register, control, handleSubmit, formState, getValues, reset, setError } = useForm<CompaniesEmailFormValues>();
  const { emailForm } = useAPI();

  const submitForm = async (data: CompaniesEmailFormValues) => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    try {
      const companyData: CompaniesEmail = {
        ...data,
        time: data.time.map((t) => t.label),
        type: data.type.map((t) => t.label),
      };
      const response = await emailForm(companyData);
      event('submit-form', 'companies', `Company: ${data.info.bedrift}`);
      showSnackbar(response.detail, 'success');
      reset({ info: { bedrift: '', kontaktperson: '', epost: '' }, comment: '', time: [], type: [] } as CompaniesEmailFormValues);
    } catch (e) {
      setError('info.bedrift', { message: e.detail || 'Noe gikk galt' });
    } finally {
      setIsLoading(false);
    }
  };

  const getSemester = (semester: number) => {
    const date = addMonths(new Date(), 1);
    let dateMonth = date.getMonth() + semester * 6;
    let dateYear = date.getFullYear();
    while (dateMonth > 11) {
      dateMonth -= 12;
      dateYear++;
    }
    const returnMonth = dateMonth > 5 ? 'Høst' : 'Vår';
    return `${returnMonth} ${dateYear}`;
  };

  const semesters = useMemo(() => [...Array(4).keys()].map(getSemester), []);
  const types = ['Bedriftspresentasjon', 'Kurs/Workshop', 'Bedriftsbesøk', 'Annonse', 'Insta-takeover', 'Bedriftsekskursjon', 'Annet'];

  return (
    <Paper>
      <form onSubmit={handleSubmit(submitForm)}>
        <TextField disabled={isLoading} formState={formState} label='Bedrift' {...register('info.bedrift', { required: 'Feltet er påkrevd' })} required />
        <TextField
          disabled={isLoading}
          formState={formState}
          label='Kontaktperson'
          {...register('info.kontaktperson', { required: 'Feltet er påkrevd' })}
          required
        />
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
        <Divider />
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ p: 2 }}>
          <BoolArray
            control={control}
            formState={formState}
            getValues={getValues}
            label='Semester'
            name='time'
            optionLabelKey='label'
            options={semesters.map((s) => ({ label: s }))}
            optionValueKey='label'
            type='checkbox'
          />
          <BoolArray
            control={control}
            formState={formState}
            getValues={getValues}
            label='Arrangementer'
            name='type'
            optionLabelKey='label'
            options={types.map((t) => ({ label: t }))}
            optionValueKey='label'
            type='checkbox'
          />
        </Stack>
        <Divider />
        <TextField disabled={isLoading} formState={formState} label='Kommentar' multiline {...register('comment')} rows={3} />
        <SubmitButton disabled={isLoading} formState={formState}>
          Send inn
        </SubmitButton>
      </form>
    </Paper>
  );
};

export default CompaniesForm;
