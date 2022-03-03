import { TextField as MuiTextField, Stack } from '@mui/material';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { removeIdsFromFields } from 'utils';

import { EventForm, Form, FormCreate, GroupForm, GroupFormUpdate, TemplateForm } from 'types';
import { FormResourceType } from 'types/Enums';

import { useCreateForm, useDeleteForm, useUpdateForm } from 'hooks/Form';
import { useSnackbar } from 'hooks/Snackbar';

import Bool from 'components/inputs/Bool';
import SubmitButton from 'components/inputs/SubmitButton';
import TextField from 'components/inputs/TextField';
import VerifyDialog from 'components/layout/VerifyDialog';
import { ShowMoreTooltip } from 'components/miscellaneous/UserInformation';

export type FormDetailsEditorProps = {
  form: Form;
};

const DeleteFormButton = ({ form }: FormDetailsEditorProps) => {
  const deleteForm = useDeleteForm(form.id);

  return (
    <VerifyDialog
      color='error'
      contentText='Sletting av skjema kan ikke reverseres.'
      disabled={deleteForm.isLoading}
      onConfirm={() => deleteForm.mutate(undefined)}>
      Slett spørreskjema
    </VerifyDialog>
  );
};

type GroupFormDetailsEditorProps = {
  form: GroupForm;
};

type GroupFormUpdateValues = Pick<
  GroupFormUpdate,
  'can_submit_multiple' | 'is_open_for_submissions' | 'only_for_group_members' | 'title' | 'email_receiver_on_submit'
>;

const GroupFormDetailsEditor = ({ form }: GroupFormDetailsEditorProps) => {
  const updateForm = useUpdateForm(form.id || '-');
  const showSnackbar = useSnackbar();
  const { handleSubmit, register, formState, control } = useForm<GroupFormUpdateValues>({
    defaultValues: {
      can_submit_multiple: form.can_submit_multiple,
      is_open_for_submissions: form.is_open_for_submissions,
      only_for_group_members: form.only_for_group_members,
      title: form.title,
    },
  });

  const save: SubmitHandler<GroupFormUpdateValues> = (data) => {
    updateForm.mutate(
      { resource_type: form.resource_type, ...data },
      {
        onSuccess: () => {
          showSnackbar('Spørsmålene ble oppdatert', 'success');
        },
        onError: (e) => {
          showSnackbar(e.detail, 'error');
        },
      },
    );
  };

  return (
    <>
      <Stack component='form' onSubmit={handleSubmit(save)}>
        <TextField disabled={updateForm.isLoading} formState={formState} label='Tittel' {...register('title', { required: 'Feltet er påkrevd' })} required />
        <TextField
          disabled={updateForm.isLoading}
          formState={formState}
          helperText='Legg inn en epost-adresse for å bli varslet via epost når spørreskjemaet mottar nye svar'
          label='Epost-mottager ved svar'
          type='email'
          {...register('email_receiver_on_submit')}
        />
        <Bool
          control={control}
          formState={formState}
          label={
            <>
              Tillat flere innsendinger
              <ShowMoreTooltip>Bestemmer om brukere kan svare på dette spørreskjemaet flere ganger.</ShowMoreTooltip>
            </>
          }
          name='can_submit_multiple'
          type='checkbox'
        />
        <Bool
          control={control}
          formState={formState}
          label={
            <>
              Åpent for innsending
              <ShowMoreTooltip>
                Bestemmer om spørreskjemaet er åpent for innsending og brukere dermed kan svare på det. Hvis bryteren er avslått så kan ingen svare på skjemaet,
                og ingen kan heller se/finne det.
              </ShowMoreTooltip>
            </>
          }
          name='is_open_for_submissions'
          type='checkbox'
        />
        <Bool
          control={control}
          formState={formState}
          label={
            <>
              Kun for medlemmer av gruppen
              <ShowMoreTooltip>
                Bestemmer hvem som kan svare på dette spørreskjemaet. Hvis bryteren er påslått så vil kun medlemmer av gruppen kunne svare på spørreskjemaet, og
                personer som ikke er medlem vil ikke kunne se/finne spørreskjemaet.
              </ShowMoreTooltip>
            </>
          }
          name='only_for_group_members'
          type='checkbox'
        />
        <SubmitButton disabled={updateForm.isLoading} formState={formState} sx={{ mb: 1 }}>
          Lagre
        </SubmitButton>
        <DeleteFormButton form={form} />
      </Stack>
    </>
  );
};

type EventFormDetailsEditorProps = {
  form: EventForm | TemplateForm;
};

const EventFormDetailsEditor = ({ form }: EventFormDetailsEditorProps) => {
  const createForm = useCreateForm();
  const [formtemplateName, setFormtemplateName] = useState('');
  const showSnackbar = useSnackbar();

  const saveAsTemplate = () => {
    const formTemplate: FormCreate = {
      title: formtemplateName,
      fields: removeIdsFromFields(form.fields),
      resource_type: FormResourceType.FORM,
      viewer_has_answered: false,
      template: true,
    };
    createForm.mutate(formTemplate, {
      onSuccess: (data) => {
        showSnackbar(`Lagret mal med navn "${data.title}"`, 'success');
      },
      onError: (e) => {
        showSnackbar(e.detail, 'error');
      },
    });
  };
  return (
    <Stack gap={1}>
      <VerifyDialog
        contentText='Når du lager en mal så kan du enkelt bruke feltene i dette skjemaet i andre skjemaer senere. Gi malen en passende tittel.'
        dialogChildren={
          <MuiTextField
            disabled={false}
            fullWidth
            label='Tittel'
            margin='normal'
            onChange={(e) => setFormtemplateName(e.target.value)}
            value={formtemplateName}
          />
        }
        onConfirm={saveAsTemplate}
        title='Lagre som mal'>
        Lagre som mal
      </VerifyDialog>
      <DeleteFormButton form={form} />
    </Stack>
  );
};

const FormDetailsEditor = ({ form }: FormDetailsEditorProps) =>
  form.resource_type === FormResourceType.GROUP_FORM ? (
    <GroupFormDetailsEditor form={form} />
  ) : form.resource_type === FormResourceType.EVENT_FORM ? (
    <EventFormDetailsEditor form={form} />
  ) : (
    <DeleteFormButton form={form} />
  );

export default FormDetailsEditor;
