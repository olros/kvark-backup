import { QueryKey, useInfiniteQuery, UseInfiniteQueryOptions, useMutation, UseMutationResult, useQuery, useQueryClient } from 'react-query';

import { Event, EventCompact, EventRequired, EventStatistics, PaginationResponse, PublicRegistration, Registration, RequestResponse, User } from 'types';

import API from 'api/api';

import { FORM_QUERY_KEY } from 'hooks/Form';
import { NOTIFICATION_QUERY_KEY } from 'hooks/Notification';
import { USER_EVENTS_QUERY_KEY, USER_QUERY_KEY } from 'hooks/User';

export const EVENT_QUERY_KEY = 'event';
export const EVENT_QUERY_KEY_REGISTRATION = 'event_registration';
export const EVENT_QUERY_KEY_PUBLIC_REGISTRATIONS = 'event_public_registrations';
export const EVENT_QUERY_KEY_STATISTICS = 'event_statistics';

export const useEventById = (eventId: Event['id']) =>
  useQuery<Event, RequestResponse>([EVENT_QUERY_KEY, eventId], () => API.getEvent(eventId), { enabled: eventId !== -1 });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useEvents = (filters?: any) =>
  useInfiniteQuery<PaginationResponse<EventCompact>, RequestResponse>(
    [EVENT_QUERY_KEY, filters],
    ({ pageParam = 1 }) => API.getEvents({ ...filters, page: pageParam }),
    {
      getNextPageParam: (lastPage) => lastPage.next,
    },
  );

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useEventsWhereIsAdmin = (filters?: any) =>
  useInfiniteQuery<PaginationResponse<EventCompact>, RequestResponse>(
    [EVENT_QUERY_KEY, filters],
    ({ pageParam = 1 }) => API.getEventsWhereIsAdmin({ ...filters, page: pageParam }),
    {
      getNextPageParam: (lastPage) => lastPage.next,
    },
  );

export const useCreateEvent = (): UseMutationResult<Event, RequestResponse, EventRequired, unknown> => {
  const queryClient = useQueryClient();
  return useMutation((newEvent: EventRequired) => API.createEvent(newEvent), {
    onSuccess: (data) => {
      queryClient.invalidateQueries(EVENT_QUERY_KEY);
      queryClient.setQueryData([EVENT_QUERY_KEY, data.id], data);
    },
  });
};

export const useUpdateEvent = (eventId: Event['id']): UseMutationResult<Event, RequestResponse, EventRequired, unknown> => {
  const queryClient = useQueryClient();
  return useMutation((updatedEvent: EventRequired) => API.updateEvent(eventId, updatedEvent), {
    onSuccess: (data) => {
      queryClient.invalidateQueries(EVENT_QUERY_KEY);
      queryClient.setQueryData([EVENT_QUERY_KEY, eventId], data);
    },
  });
};

export const useDeleteEvent = (eventId: Event['id']): UseMutationResult<RequestResponse, RequestResponse, unknown, unknown> => {
  const queryClient = useQueryClient();
  return useMutation(() => API.deleteEvent(eventId), {
    onSuccess: () => {
      queryClient.invalidateQueries(EVENT_QUERY_KEY);
    },
  });
};

export const useSendGiftCardsToAttendees = (eventId: number): UseMutationResult<RequestResponse, RequestResponse, { files: File | File[] | Blob }, unknown> =>
  useMutation(({ files }) => API.sendGiftCardsToAttendees(eventId, files));

export const useNotifyEventRegistrations = (
  eventId: Event['id'],
): UseMutationResult<RequestResponse, RequestResponse, { title: string; message: string }, unknown> =>
  useMutation(({ title, message }) => API.notifyEventRegistrations(eventId, title, message));

export const useEventStatistics = (eventId: Event['id']) =>
  useQuery<EventStatistics, RequestResponse>([EVENT_QUERY_KEY_STATISTICS, eventId], () => API.getEventStatistics(eventId));

export const useEventRegistrations = (
  eventId: Event['id'],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters?: any,
  options?: UseInfiniteQueryOptions<
    PaginationResponse<Registration>,
    RequestResponse,
    PaginationResponse<Registration>,
    PaginationResponse<Registration>,
    QueryKey
  >,
) =>
  useInfiniteQuery<PaginationResponse<Registration>, RequestResponse>(
    [EVENT_QUERY_KEY, eventId, EVENT_QUERY_KEY_REGISTRATION, filters],
    ({ pageParam = 1 }) => API.getEventRegistrations(eventId, { ...filters, page: pageParam }),
    {
      ...options,
      getNextPageParam: (lastPage) => lastPage.next,
    },
  );

/**
 * Get "public" event registrations, registrations which all members is allowed to see. Users can anonymize themself through their profile-settings
 * @param eventId The event-id
 * @param options UseInfiniteQueryOptions
 */
export const usePublicEventRegistrations = (
  eventId: Event['id'],
  options?: UseInfiniteQueryOptions<
    PaginationResponse<PublicRegistration>,
    RequestResponse,
    PaginationResponse<PublicRegistration>,
    PaginationResponse<PublicRegistration>,
    QueryKey
  >,
) =>
  useInfiniteQuery<PaginationResponse<PublicRegistration>, RequestResponse>(
    [EVENT_QUERY_KEY, eventId, EVENT_QUERY_KEY_PUBLIC_REGISTRATIONS],
    ({ pageParam = 1 }) => API.getPublicEventRegistrations(eventId, { page: pageParam }),
    {
      ...options,
      getNextPageParam: (lastPage) => lastPage.next,
    },
  );

export const useEventRegistration = (eventId: Event['id'], userId: User['user_id']) =>
  useQuery<Registration, RequestResponse>([EVENT_QUERY_KEY, eventId, EVENT_QUERY_KEY_REGISTRATION, userId], () => API.getRegistration(eventId, userId), {
    enabled: userId !== '',
    retry: false,
  });

export const useCreateEventRegistration = (eventId: Event['id']): UseMutationResult<Registration, RequestResponse, Partial<Registration>, unknown> => {
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
  eventId: Event['id'],
): UseMutationResult<
  Registration,
  RequestResponse,
  {
    userId: User['user_id'];
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
      queryClient.invalidateQueries([EVENT_QUERY_KEY, eventId]);
      queryClient.invalidateQueries([USER_EVENTS_QUERY_KEY]);
      queryClient.setQueryData([EVENT_QUERY_KEY, eventId, EVENT_QUERY_KEY_REGISTRATION, data.registration_id], data);
    },
  });
};

export const useDeleteEventRegistration = (eventId: Event['id']): UseMutationResult<RequestResponse, RequestResponse, User['user_id'], unknown> => {
  const queryClient = useQueryClient();
  return useMutation((userId) => API.deleteRegistration(eventId, userId), {
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
