import { EventFormCreate, Form, FormCreate, SelectFormField, SelectFormFieldOption, TextFormField } from 'types';
import { EventFormType, FormResourceType } from 'types/Enums';
import { useEventById } from 'hooks/Event';
import { useForm } from 'react-hook-form';
import { useCreateForm, useFormTemplates, useDeleteForm } from 'hooks/Form';
import { Typography, LinearProgress, Stack, Button } from '@mui/material';

// Project
import { useSnackbar } from 'hooks/Snackbar';
import VerifyDialog from 'components/layout/VerifyDialog';
import FormView from 'components/forms/FormView';
import Expand from 'components/layout/Expand';
import FormAdmin from 'components/forms/FormAdmin';
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

const removeIdsFromForm = (form: Form): FormCreate => {
  const { id, ...restForm } = form;
  const newFields: Array<TextFormField | SelectFormField> = [];

  form.fields.forEach((field) => {
    const { id, ...restField } = field;
    const newOptions: Array<SelectFormFieldOption> = [];

    field.options.forEach((option) => {
      const { id, ...restOption } = option;
      newOptions.push(restOption as SelectFormFieldOption);
    });

    newFields.push({ ...restField, options: newOptions } as TextFormField | SelectFormField);
  });

  return { ...restForm, fields: newFields } as FormCreate;
};

const FormTemplatePreview = ({ formtemplate, eventId, formType }: FormTemplatePreviewType) => {
  const deleteForm = useDeleteForm(formtemplate.id || '-');
  const { register, formState, getValues, control } = useForm<Form['fields']>();
  const createForm = useCreateForm();
  const showSnackbar = useSnackbar();

  const onCreateFormFromTemplate = async () => {
    const updatedTemplate = removeIdsFromForm(formtemplate);
    const newForm: EventFormCreate = {
      title: String(eventId),
      type: formType,
      event: eventId,
      resource_type: FormResourceType.EVENT_FORM,
      fields: updatedTemplate.fields,
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
    <>
      <Expand flat header={formtemplate.title} sx={{ mt: 1 }}>
        <FormView control={control} disabled={true} form={formtemplate} formState={formState} getValues={getValues} register={register} />
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ p: 1 }}>
          <Button fullWidth onClick={onCreateFormFromTemplate} variant='outlined'>
            Bruk denne malen
          </Button>
          <VerifyDialog color='warning' contentText='Å slette en mal kan ikke reverseres.' onConfirm={onDeleteForm} titleText='Er du sikker?'>
            Slett malen
          </VerifyDialog>
        </Stack>
      </Expand>
    </>
  );
};

const EventFormAdmin = ({ eventId }: EventFormAdminProps) => {
  const { data: event, isLoading } = useEventById(eventId);

  if (isLoading || !event) {
    return <LinearProgress />;
  }

  type EventFormEditorProps = {
    formType: EventFormType;
  };

  const EventFormEditor = ({ formType }: EventFormEditorProps) => {
    const createForm = useCreateForm();
    const { data: formtemplates = [] } = useFormTemplates();
    const newForm: EventFormCreate = {
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
        <Expand flat header='Bruk en mal' sx={{ mt: 1 }}>
          <>
            <Typography variant='body2'>Bruk en ferdiglagd mal som utgangspunkt når du oppretter ett skjema.</Typography>
            {formtemplates.map((formtemplate) => (
              <FormTemplatePreview eventId={eventId} formtemplate={formtemplate} formType={formType} key={formtemplate.id} />
            ))}
          </>
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
