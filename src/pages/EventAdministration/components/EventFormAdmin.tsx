import { Button, LinearProgress, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { removeIdsFromFields } from 'utils';

import { EventFormCreate, Form, FormCreate } from 'types';
import { EventFormType, FormResourceType } from 'types/Enums';

import { useEventById } from 'hooks/Event';
import { useCreateForm, useDeleteForm, useFormById, useFormTemplates } from 'hooks/Form';
import { useSnackbar } from 'hooks/Snackbar';

import FormAdmin from 'components/forms/FormAdmin';
import FormFieldsEditor from 'components/forms/FormFieldsEditor';
import FormView from 'components/forms/FormView';
import Expand from 'components/layout/Expand';
import VerifyDialog from 'components/layout/VerifyDialog';
import { ShowMoreText } from 'components/miscellaneous/UserInformation';

export type EventFormAdminProps = {
  eventId: number;
};

export type EventFormEditorProps = {
  eventId: number;
  formId: string | null;
  formType: EventFormType;
};

type FormTemplatePreviewType = Omit<EventFormEditorProps, 'formId'> & {
  formtemplate: Form;
};

const FormTemplatePreview = ({ formtemplate, eventId, formType }: FormTemplatePreviewType) => {
  const deleteForm = useDeleteForm(formtemplate.id || '-');
  const { register, formState, getValues, control } = useForm<Form['fields']>();
  const [isEditing, setIsEditing] = useState(false);
  const createForm = useCreateForm();
  const showSnackbar = useSnackbar();

  const onCreateFormFromTemplate = async () => {
    const newForm: EventFormCreate = {
      title: String(eventId),
      type: formType,
      event: eventId,
      resource_type: FormResourceType.EVENT_FORM,
      fields: removeIdsFromFields(formtemplate.fields),
      template: false,
    };
    createForm.mutate(newForm, {
      onSuccess: (data) => {
        showSnackbar(data.title, 'success');
      },
      onError: (e) => {
        showSnackbar(e.detail, 'error');
      },
    });
  };

  const onDeleteForm = () => {
    deleteForm.mutate(undefined, {
      onSuccess: (data) => {
        showSnackbar(data.detail, 'success');
      },
      onError: (e) => {
        showSnackbar(e.detail, 'error');
      },
    });
  };
  return (
    <Expand flat header={formtemplate.title}>
      {isEditing ? (
        <FormFieldsEditor canEditTitle={true} form={formtemplate} onSave={() => setIsEditing(false)} />
      ) : (
        <>
          <FormView control={control} disabled={true} form={formtemplate} formState={formState} getValues={getValues} register={register} />
          <Stack gap={1}>
            <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
              <Button color='primary' fullWidth onClick={() => setIsEditing(true)} variant='outlined'>
                Rediger malen
              </Button>
              <VerifyDialog color='error' contentText='Å slette en mal kan ikke reverseres.' onConfirm={onDeleteForm} titleText='Er du sikker?'>
                Slett malen
              </VerifyDialog>
            </Stack>
            <Button fullWidth onClick={onCreateFormFromTemplate} variant='outlined'>
              Bruk denne malen
            </Button>
          </Stack>
        </>
      )}
    </Expand>
  );
};

const EventFormAdmin = ({ eventId }: EventFormAdminProps) => {
  const { data: event, isLoading } = useEventById(eventId);

  if (isLoading || !event) {
    return <LinearProgress />;
  }

  const FormTemplatesList = ({ formType }: Pick<EventFormEditorProps, 'formType'>) => {
    const createForm = useCreateForm();
    const showSnackbar = useSnackbar();
    const { data: formtemplates = [] } = useFormTemplates();
    const [isCreatingForm, setIsCreatingTemplate] = useState(false);
    const [formtemplateId, setFormtemplateId] = useState('-');
    const { data: form, isLoading, isError } = useFormById(formtemplateId);

    const newFormTemplateCreate: FormCreate = {
      title: 'Ny mal',
      resource_type: FormResourceType.FORM,
      fields: [],
      viewer_has_answered: false,
      template: true,
    };

    const onCreateTemplate = () => {
      createForm.mutate(newFormTemplateCreate, {
        onSuccess: (data) => {
          showSnackbar(`Malen med navn "${data.title} ble opprettet"`, 'success');
          setFormtemplateId(data.id);
          setIsCreatingTemplate(true);
        },
        onError: (e) => {
          showSnackbar(e.detail, 'error');
        },
      });
    };

    return (
      <>
        {isCreatingForm ? (
          <>{!isLoading && !isError && form && <FormFieldsEditor canEditTitle={true} form={form} onSave={() => setIsCreatingTemplate(false)} />}</>
        ) : (
          <>
            <Typography gutterBottom variant='body2'>
              Bruk en ferdiglagd mal som utgangspunkt når du oppretter ett skjema.
            </Typography>
            {formtemplates.map((formtemplate) => (
              <FormTemplatePreview eventId={eventId} formtemplate={formtemplate} formType={formType} key={formtemplate.id} />
            ))}
            <Button onClick={onCreateTemplate} sx={{ mt: 1 }} variant='contained'>
              Lag ny mal
            </Button>
          </>
        )}
      </>
    );
  };

  type EventFormEditorProps = {
    formType: EventFormType;
  };

  const EventFormEditor = ({ formType }: EventFormEditorProps) => {
    const createForm = useCreateForm();

    const newForm: FormCreate = {
      title: `${event.title} - ${formType === EventFormType.SURVEY ? 'påmeldingsskjema' : 'evalueringsskjema'}`,
      type: formType,
      event: event.id,
      resource_type: FormResourceType.EVENT_FORM,
      fields: [],
    };

    const onCreate = async () => createForm.mutate(newForm);

    return (
      <>
        <Button fullWidth onClick={onCreate} variant='outlined'>
          Opprett {formType === EventFormType.SURVEY ? 'påmeldingsskjema' : 'evalueringsskjema'}
        </Button>
        <Expand flat header='Bruk en mal' sx={{ mt: 1 }} TransitionProps={{ mountOnEnter: true }}>
          <FormTemplatesList formType={formType} />
        </Expand>
      </>
    );
  };

  return (
    <Stack gap={2}>
      <div>
        <Typography variant='h3'>Spørsmål ved påmelding</Typography>
        <ShowMoreText sx={{ mb: 1 }}>
          Deltagere som melder seg på dette arrangementet vil måtte svare på disse spørsmålene først. Deltagerne kan la være å svare på spørsmål som ikke er
          &quot;Påkrevd&quot;.
        </ShowMoreText>
        {event.survey ? <FormAdmin formId={event.survey} /> : <EventFormEditor formType={EventFormType.SURVEY} />}
      </div>
      <div>
        <Typography variant='h3'>Evalueringsspørsmål</Typography>
        <ShowMoreText sx={{ mb: 1 }}>
          Deltagerne som deltar på dette arrangementet <b>må</b> svare på disse spørsmålene før de kan melde seg på andre arrangementer. Blokkeringen av
          påmelding trer i kraft når deltageren blir markert som &quot;Ankommet&quot;, og forsvinner med en gang deltageren har svart på evalueringsskjemaet.
          Deltagerne vil motta epost med påminnelse om å svare på skjemaet kl 12.00 dagen etter arrangementet.
        </ShowMoreText>
        {event.evaluation ? <FormAdmin formId={event.evaluation} /> : <EventFormEditor formType={EventFormType.EVALUATION} />}
      </div>
    </Stack>
  );
};

export default EventFormAdmin;
