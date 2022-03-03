import { Button, Divider, Stack, Typography } from '@mui/material';
import { parseISO } from 'date-fns';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import URLS from 'URLS';
import { formatDate } from 'utils';

import { Submission } from 'types';
import { EventFormType, FormResourceType } from 'types/Enums';

import { useConfetti } from 'hooks/Confetti';
import { useCreateSubmission, useFormById, validateSubmissionInput } from 'hooks/Form';
import { useSnackbar } from 'hooks/Snackbar';
import { useAnalytics } from 'hooks/Utils';

import Http404 from 'pages/Http404';

import FormView from 'components/forms/FormView';
import SubmitButton from 'components/inputs/SubmitButton';
import Paper from 'components/layout/Paper';
import { PrimaryTopBox } from 'components/layout/TopBox';
import Page from 'components/navigation/Page';

const FormPage = () => {
  const { run } = useConfetti();
  const { event: GAEvent } = useAnalytics();
  const { id } = useParams<'id'>();
  const { data: form, isError } = useFormById(id || '-');
  const createSubmission = useCreateSubmission(id || '-');
  const showSnackbar = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const title = useMemo(
    () => (form ? (form.resource_type === FormResourceType.EVENT_FORM && form.type === EventFormType.EVALUATION ? 'Evaluering' : form.title) : ''),
    [form],
  );
  const subtitle = useMemo(
    () => (
      <>
        {form?.resource_type === FormResourceType.EVENT_FORM && (
          <>
            {`Arrangøren av `}
            <Link to={`${URLS.events}${form.event.id}/`}>{`"${form.event.title}"`}</Link>
            {`, som ble holdt ${formatDate(parseISO(form.event.start_date)).toLowerCase()} på ${
              form.event.location
            },  ønsker at du svarer på følgende spørsmål:`}
          </>
        )}
      </>
    ),
    [form],
  );

  const { register, handleSubmit, formState, setError, getValues, control } = useForm<Submission>();

  const submitDisabled = isLoading || createSubmission.isLoading || !form;

  const submit = async (data: Submission) => {
    if (submitDisabled || !form) {
      return;
    }
    setIsLoading(true);
    data.answers = data.answers || [];
    try {
      validateSubmissionInput(data, form);
    } catch (e) {
      setError(e.message, { message: 'Du må velge ett eller flere alternativ' });
      setIsLoading(false);
      return;
    }
    createSubmission.mutate(data, {
      onSuccess: () => {
        run();
        showSnackbar('Innsendingen var vellykket', 'success');
        GAEvent('submitted', 'forms', `Submitted submission for form: ${form.title}`);
      },
      onError: (e) => {
        showSnackbar(e.detail, 'error');
      },
      onSettled: () => {
        setIsLoading(false);
      },
    });
  };

  const isEventFormButNotEvaluation = Boolean(form && form.resource_type === FormResourceType.EVENT_FORM && form.type !== EventFormType.EVALUATION);

  if (isError || isEventFormButNotEvaluation) {
    return <Http404 />;
  }

  const canAnswerForm = Boolean(form && (!form.viewer_has_answered || (form.resource_type === FormResourceType.GROUP_FORM && form.can_submit_multiple)));

  return (
    <Page banner={<PrimaryTopBox />} options={{ title: `${form?.title || 'Laster spørreskjema...'} - Spørreskjema` }}>
      <Paper
        sx={{
          maxWidth: (theme) => theme.breakpoints.values.md,
          margin: 'auto',
          position: 'relative',
          left: 0,
          right: 0,
          top: -60,
        }}>
        {form ? (
          <>
            <Typography align='center' variant='h2'>
              {title}
            </Typography>
            <Typography align='center' variant='subtitle2'>
              {subtitle}
            </Typography>
            <Divider sx={{ my: 2 }} />
            {canAnswerForm ? (
              <form onSubmit={handleSubmit(submit)}>
                {form && (
                  <FormView
                    alignText='center'
                    control={control}
                    disabled={submitDisabled}
                    form={form}
                    formState={formState}
                    getValues={getValues}
                    register={register}
                  />
                )}
                <SubmitButton disabled={submitDisabled} formState={formState} sx={{ mt: 2 }}>
                  Send inn svar
                </SubmitButton>
              </form>
            ) : (
              <>
                <Typography align='center' variant='body2'>
                  Du har allerede svart på dette spørreskjemaet, takk!
                </Typography>
                <Stack direction={{ xs: 'column', md: 'row' }} gap={1} sx={{ mt: 2 }}>
                  <Button component={Link} fullWidth to={URLS.landing} variant='outlined'>
                    Gå til forsiden
                  </Button>
                  <Button component={Link} fullWidth to={URLS.profile} variant='outlined'>
                    Gå til profilen
                  </Button>
                </Stack>
              </>
            )}
          </>
        ) : (
          <Typography align='center' variant='h2'>
            Laster spørreskjema...
          </Typography>
        )}
      </Paper>
    </Page>
  );
};

export default FormPage;
