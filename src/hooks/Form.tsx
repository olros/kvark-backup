import { useMutation, UseMutationResult, useQuery, useQueryClient } from 'react-query';

import { Form, FormCreate, FormStatistics, FormUpdate, PaginationResponse, RequestResponse, SelectFieldSubmission, Submission, UserSubmission } from 'types';
import { FormFieldType, FormResourceType } from 'types/Enums';

import { useAPI } from 'hooks/API';
import { EVENT_QUERY_KEYS } from 'hooks/Event';
import { GROUPS_QUERY_KEYS } from 'hooks/Group';
import { useSnackbar } from 'hooks/Snackbar';
import { USER_FORMS_QUERY_KEY, USER_QUERY_KEY } from 'hooks/User';

export const FORM_QUERY_KEY = 'form';
export const SUBMISSIONS_QUERY_KEY = 'submission';
export const STATISTICS_QUERY_KEY = 'statistics';
export const TEMPLATE_QUERY_KEY = 'templates';

export const useFormById = (formId: string) => {
  const { getForm } = useAPI();

  return useQuery<Form, RequestResponse>([FORM_QUERY_KEY, formId], () => getForm(formId), { enabled: formId !== '-' });
};

export const useFormStatisticsById = (formId: string) => {
  const { getFormStatistics } = useAPI();

  return useQuery<FormStatistics, RequestResponse>([FORM_QUERY_KEY, formId, STATISTICS_QUERY_KEY], () => getFormStatistics(formId), {
    enabled: formId !== '-',
  });
};

export const useFormTemplates = () => {
  const { getFormTemplates } = useAPI();

  return useQuery<Array<Form>, RequestResponse>([FORM_QUERY_KEY, TEMPLATE_QUERY_KEY], () => getFormTemplates(), {});
};

export const useCreateForm = (): UseMutationResult<Form, RequestResponse, FormCreate, unknown> => {
  const { createForm } = useAPI();
  const queryClient = useQueryClient();

  return useMutation((newForm) => createForm(newForm), {
    onSuccess: (data) => {
      if (data.resource_type === FormResourceType.FORM) {
        queryClient.invalidateQueries([FORM_QUERY_KEY]);
      }
      if (data.resource_type === FormResourceType.EVENT_FORM) {
        queryClient.invalidateQueries(EVENT_QUERY_KEYS.detail(data.event.id));
      }
      if (data.resource_type === FormResourceType.GROUP_FORM) {
        queryClient.invalidateQueries(GROUPS_QUERY_KEYS.forms.all(data.group.slug));
      }
      queryClient.setQueryData([FORM_QUERY_KEY, data.id], data);
    },
  });
};

export const useUpdateForm = (formId: string): UseMutationResult<Form, RequestResponse, FormUpdate, unknown> => {
  const { updateForm } = useAPI();
  const queryClient = useQueryClient();

  return useMutation((updatedForm: FormUpdate) => updateForm(formId, updatedForm), {
    onSuccess: (data) => {
      if (data.resource_type === FormResourceType.EVENT_FORM) {
        queryClient.invalidateQueries(EVENT_QUERY_KEYS.detail(data.event.id));
      }
      if (data.resource_type === FormResourceType.GROUP_FORM) {
        queryClient.invalidateQueries(GROUPS_QUERY_KEYS.forms.all(data.group.slug));
      }
      queryClient.invalidateQueries([FORM_QUERY_KEY, TEMPLATE_QUERY_KEY]);
      queryClient.invalidateQueries([FORM_QUERY_KEY, formId]);
      queryClient.setQueryData([FORM_QUERY_KEY, formId], data);
    },
  });
};

export const useDeleteForm = (formId: string): UseMutationResult<RequestResponse, RequestResponse, undefined, unknown> => {
  const { deleteForm } = useAPI();
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbar();

  return useMutation(() => deleteForm(formId), {
    onSuccess: (response) => {
      showSnackbar(response.detail, 'success');
      const data = queryClient.getQueryData<Form>([FORM_QUERY_KEY, formId]);
      if (data?.resource_type === FormResourceType.EVENT_FORM) {
        queryClient.invalidateQueries(EVENT_QUERY_KEYS.detail(data.event.id));
      }
      if (data?.resource_type === FormResourceType.GROUP_FORM) {
        queryClient.invalidateQueries(GROUPS_QUERY_KEYS.forms.all(data.group.slug));
      }
      queryClient.invalidateQueries([FORM_QUERY_KEY, TEMPLATE_QUERY_KEY]);
      queryClient.removeQueries([FORM_QUERY_KEY, formId]);
    },
    onError: (e) => {
      showSnackbar(e.detail, 'error');
    },
  });
};

export const useFormSubmissions = (formId: string, page: number) => {
  const { getSubmissions } = useAPI();

  return useQuery<PaginationResponse<UserSubmission>, RequestResponse>(
    [FORM_QUERY_KEY, formId, SUBMISSIONS_QUERY_KEY, { page }],
    () => getSubmissions(formId, { page }),
    {
      enabled: formId !== '-',
      keepPreviousData: true,
    },
  );
};

export const useCreateSubmission = (formId: string): UseMutationResult<Submission, RequestResponse, Submission, unknown> => {
  const { createSubmission } = useAPI();
  const queryClient = useQueryClient();

  return useMutation((submission) => createSubmission(formId, submission), {
    onSuccess: () => {
      const data = queryClient.getQueryData<Form>([FORM_QUERY_KEY, formId]);
      if (data?.resource_type === FormResourceType.EVENT_FORM) {
        queryClient.invalidateQueries(EVENT_QUERY_KEYS.detail(data.event.id));
        queryClient.invalidateQueries([USER_FORMS_QUERY_KEY]);
        queryClient.invalidateQueries([USER_QUERY_KEY]);
      }
      if (data?.resource_type === FormResourceType.GROUP_FORM) {
        queryClient.invalidateQueries(GROUPS_QUERY_KEYS.forms.all(data.group.slug));
      }
      queryClient.invalidateQueries([FORM_QUERY_KEY, formId]);
    },
  });
};

export const validateSubmissionInput = (submission: Submission, form: Form) => {
  submission.answers?.forEach((answer, index) => {
    const field = form.fields.find((field) => field.id === answer.field.id);
    if (field && field.type === FormFieldType.MULTIPLE_SELECT && field.required) {
      const ans = answer as SelectFieldSubmission;
      if (!ans.selected_options || !ans.selected_options.length) {
        throw new Error(`answers.${index}.selected_options`);
      }
    }
  });
};
