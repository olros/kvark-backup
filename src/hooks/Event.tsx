import { useMutation, useInfiniteQuery, useQuery, useQueryClient, UseMutationResult } from 'react-query';
import API from 'api/api';
import { USER_EVENTS_QUERY_KEY, USER_QUERY_KEY } from 'hooks/User';
import { FORM_QUERY_KEY } from 'hooks/Form';
import { NOTIFICATION_QUERY_KEY } from 'hooks/Notification';
import { Event, EventRequired, EventCompact, Registration, PaginationResponse, RequestResponse } from 'types';

export const EVENT_QUERY_KEY = 'event';
export const EVENT_QUERY_KEY_REGISTRATION = 'event_registration';

export const useEventById = (eventId: number) => {
  return useQuery<Event, RequestResponse>([EVENT_QUERY_KEY, eventId], () => API.getEvent(eventId), { enabled: eventId !== -1 });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useEvents = (filters?: any) => {
  return useInfiniteQuery<PaginationResponse<EventCompact>, RequestResponse>(
    [EVENT_QUERY_KEY, filters],
    ({ pageParam = 1 }) => API.getEvents({ ...filters, page: pageParam }),
    {
      getNextPageParam: (lastPage) => lastPage.next,
    },
  );
};

export const useCreateEvent = (): UseMutationResult<Event, RequestResponse, EventRequired, unknown> => {
  const queryClient = useQueryClient();
  return useMutation((newEvent: EventRequired) => API.createEvent(newEvent), {
    onSuccess: (data) => {
      queryClient.invalidateQueries(EVENT_QUERY_KEY);
      queryClient.setQueryData([EVENT_QUERY_KEY, data.id], data);
    },
  });
};

export const useUpdateEvent = (eventId: number): UseMutationResult<Event, RequestResponse, EventRequired, unknown> => {
  const queryClient = useQueryClient();
  return useMutation((updatedEvent: EventRequired) => API.updateEvent(eventId, updatedEvent), {
    onSuccess: (data) => {
      queryClient.invalidateQueries(EVENT_QUERY_KEY);
      queryClient.setQueryData([EVENT_QUERY_KEY, eventId], data);
    },
  });
};

export const useDeleteEvent = (eventId: number): UseMutationResult<RequestResponse, RequestResponse, unknown, unknown> => {
  const queryClient = useQueryClient();
  return useMutation(() => API.deleteEvent(eventId), {
    onSuccess: () => {
      queryClient.invalidateQueries(EVENT_QUERY_KEY);
    },
  });
};

export const useNotifyEventRegistrations = (
  eventId: number,
): UseMutationResult<RequestResponse, RequestResponse, { title: string; message: string }, unknown> =>
  useMutation(({ title, message }) => API.notifyEventRegistrations(eventId, title, message));

export const useEventRegistrations = (eventId: number) =>
  useQuery<Array<Registration>, RequestResponse>([EVENT_QUERY_KEY, eventId, EVENT_QUERY_KEY_REGISTRATION], () => API.getEventRegistrations(eventId));

export const useEventRegistration = (eventId: number, userId: string) =>
  useQuery<Registration, RequestResponse>([EVENT_QUERY_KEY, eventId, EVENT_QUERY_KEY_REGISTRATION, userId], () => API.getRegistration(eventId, userId), {
    enabled: userId !== '',
    retry: false,
  });

export const useCreateEventRegistration = (eventId: number): UseMutationResult<Registration, RequestResponse, Partial<Registration>, unknown> => {
  const queryClient = useQueryClient();
  return useMutation((newRegistration: Partial<Registration>) => API.createRegistration(eventId, newRegistration), {
    onSuccess: (data) => {
      const formId = queryClient.getQueryData<Event>([EVENT_QUERY_KEY, eventId])?.survey;
      if (formId) {
        queryClient.invalidateQueries([FORM_QUERY_KEY, formId]);
      }
      queryClient.invalidateQueries([EVENT_QUERY_KEY, eventId]);
      queryClient.setQueryData([EVENT_QUERY_KEY, eventId, EVENT_QUERY_KEY_REGISTRATION, data.user_info.user_id], data);
      queryClient.invalidateQueries([USER_EVENTS_QUERY_KEY]);
      queryClient.invalidateQueries([USER_QUERY_KEY]);
      queryClient.invalidateQueries([NOTIFICATION_QUERY_KEY]);
    },
  });
};

export const useUpdateEventRegistration = (
  eventId: number,
): UseMutationResult<
  Registration,
  RequestResponse,
  {
    userId: string;
    registration: Partial<Registration>;
  },
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation(({ registration, userId }) => API.updateRegistration(eventId, registration, userId), {
    onMutate: async ({ registration, userId }) => {
      const QUERY_KEY = [EVENT_QUERY_KEY, eventId, EVENT_QUERY_KEY_REGISTRATION];
      await queryClient.cancelQueries(QUERY_KEY);

      const previousRegistrations = queryClient.getQueryData<Array<Registration>>(QUERY_KEY);
      if (previousRegistrations) {
        queryClient.setQueryData<Array<Registration>>(
          QUERY_KEY,
          previousRegistrations.map((reg) => (reg.user_info.user_id === userId ? { ...reg, ...registration } : reg)),
        );
      }

      return { previousRegistrations, QUERY_KEY };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err, _, context: any) => {
      if (context?.previousRegistrations) {
        queryClient.setQueryData<Array<Registration>>(context?.QUERY_KEY, context.previousRegistrations);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries([EVENT_QUERY_KEY, eventId, EVENT_QUERY_KEY_REGISTRATION]);
      queryClient.setQueryData([EVENT_QUERY_KEY, eventId, EVENT_QUERY_KEY_REGISTRATION, data.registration_id], data);
    },
  });
};

export const useDeleteEventRegistration = (eventId: number): UseMutationResult<RequestResponse, RequestResponse, string, unknown> => {
  const queryClient = useQueryClient();
  return useMutation((userId: string) => API.deleteRegistration(eventId, userId), {
    onSuccess: () => {
      const formId = queryClient.getQueryData<Event>([EVENT_QUERY_KEY, eventId])?.survey;
      if (formId) {
        queryClient.invalidateQueries([FORM_QUERY_KEY, formId]);
      }
      queryClient.removeQueries([EVENT_QUERY_KEY, eventId, EVENT_QUERY_KEY_REGISTRATION]);
      queryClient.invalidateQueries([EVENT_QUERY_KEY, eventId]);
      queryClient.invalidateQueries([USER_EVENTS_QUERY_KEY]);
    },
  });
};
