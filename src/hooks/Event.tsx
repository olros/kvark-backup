/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryKey, useInfiniteQuery, UseInfiniteQueryOptions, useMutation, UseMutationResult, useQuery, useQueryClient } from 'react-query';

import {
  Event,
  EventFavorite,
  EventList,
  EventMutate,
  EventStatistics,
  PaginationResponse,
  PublicRegistration,
  Registration,
  RequestResponse,
  User,
} from 'types';

import { useAPI } from 'hooks/API';
import { FORM_QUERY_KEY } from 'hooks/Form';
import { NOTIFICATION_QUERY_KEY } from 'hooks/Notification';
import { USER_EVENTS_QUERY_KEY, USER_QUERY_KEY } from 'hooks/User';

export const EVENT_QUERY_KEYS = {
  all: ['event'] as const,
  list: (filters?: any) => [...EVENT_QUERY_KEYS.all, 'list', ...(filters ? [filters] : [])] as const,
  list_admin: (filters?: any) => [...EVENT_QUERY_KEYS.all, 'admin_list', ...(filters ? [filters] : [])] as const,
  detail: (eventId: Event['id']) => [...EVENT_QUERY_KEYS.all, eventId] as const,
  statistics: (eventId: Event['id']) => [...EVENT_QUERY_KEYS.detail(eventId), 'statistics'] as const,
  favorite: (eventId: Event['id']) => [...EVENT_QUERY_KEYS.detail(eventId), 'favorite'] as const,
  public_registrations: (eventId: Event['id']) => [...EVENT_QUERY_KEYS.detail(eventId), 'public_registrations'] as const,
  registrations: {
    all: (eventId: Event['id']) => [...EVENT_QUERY_KEYS.detail(eventId), 'registrations'] as const,
    list: (eventId: Event['id'], filters?: any) => [...EVENT_QUERY_KEYS.registrations.all(eventId), 'list', ...(filters ? [filters] : [])] as const,
    detail: (eventId: Event['id'], userId: User['user_id']) => [...EVENT_QUERY_KEYS.registrations.all(eventId), userId] as const,
  },
};

export const useEventById = (eventId: Event['id']) => {
  const { getEvent } = useAPI();

  return useQuery<Event, RequestResponse>(EVENT_QUERY_KEYS.detail(eventId), () => getEvent(eventId), { enabled: eventId !== -1 });
};

export const useEvents = (filters?: any) => {
  const { getEvents } = useAPI();

  return useInfiniteQuery<PaginationResponse<EventList>, RequestResponse>(
    EVENT_QUERY_KEYS.list(filters),
    ({ pageParam = 1 }) => getEvents({ ...filters, page: pageParam }),
    {
      getNextPageParam: (lastPage) => lastPage.next,
    },
  );
};

export const useEventsWhereIsAdmin = (filters?: any) => {
  const { getEventsWhereIsAdmin } = useAPI();

  return useInfiniteQuery<PaginationResponse<EventList>, RequestResponse>(
    EVENT_QUERY_KEYS.list_admin(filters),
    ({ pageParam = 1 }) => getEventsWhereIsAdmin({ ...filters, page: pageParam }),
    {
      getNextPageParam: (lastPage) => lastPage.next,
    },
  );
};

export const useCreateEvent = (): UseMutationResult<Event, RequestResponse, EventMutate, unknown> => {
  const { createEvent } = useAPI();
  const queryClient = useQueryClient();

  return useMutation((newEvent: EventMutate) => createEvent(newEvent), {
    onSuccess: (data) => {
      queryClient.invalidateQueries(EVENT_QUERY_KEYS.all);
      queryClient.setQueryData(EVENT_QUERY_KEYS.detail(data.id), data);
    },
  });
};

export const useUpdateEvent = (eventId: Event['id']): UseMutationResult<Event, RequestResponse, EventMutate, unknown> => {
  const { updateEvent } = useAPI();
  const queryClient = useQueryClient();

  return useMutation((updatedEvent: EventMutate) => updateEvent(eventId, updatedEvent), {
    onSuccess: (data) => {
      queryClient.invalidateQueries(EVENT_QUERY_KEYS.all);
      queryClient.setQueryData(EVENT_QUERY_KEYS.detail(eventId), data);
    },
  });
};

export const useDeleteEvent = (eventId: Event['id']): UseMutationResult<RequestResponse, RequestResponse, unknown, unknown> => {
  const { deleteEvent } = useAPI();
  const queryClient = useQueryClient();

  return useMutation(() => deleteEvent(eventId), {
    onSuccess: () => queryClient.invalidateQueries(EVENT_QUERY_KEYS.all),
  });
};

export const useEventIsFavorite = (eventId: Event['id']) => {
  const { getEventIsFavorite } = useAPI();

  return useQuery<EventFavorite, RequestResponse>(EVENT_QUERY_KEYS.favorite(eventId), () => getEventIsFavorite(eventId), { enabled: eventId !== -1 });
};

export const useEventSetIsFavorite = (eventId: Event['id']): UseMutationResult<EventFavorite, RequestResponse, EventFavorite, unknown> => {
  const { setEventIsFavorite } = useAPI();
  const queryClient = useQueryClient();

  return useMutation((eventFavorite) => setEventIsFavorite(eventId, eventFavorite), {
    onSuccess: (data) => {
      queryClient.setQueryData(EVENT_QUERY_KEYS.favorite(eventId), data);
    },
  });
};

export const useSendGiftCardsToAttendees = (eventId: number): UseMutationResult<RequestResponse, RequestResponse, { files: File | File[] | Blob }, unknown> => {
  const { sendGiftCardsToAttendees } = useAPI();

  return useMutation(({ files }) => sendGiftCardsToAttendees(eventId, files));
};

export const useNotifyEventRegistrations = (
  eventId: Event['id'],
): UseMutationResult<RequestResponse, RequestResponse, { title: string; message: string }, unknown> => {
  const { notifyEventRegistrations } = useAPI();

  return useMutation(({ title, message }) => notifyEventRegistrations(eventId, title, message));
};

export const useEventStatistics = (eventId: Event['id']) => {
  const { getEventStatistics } = useAPI();

  return useQuery<EventStatistics, RequestResponse>(EVENT_QUERY_KEYS.statistics(eventId), () => getEventStatistics(eventId));
};

export const useEventRegistrations = (
  eventId: Event['id'],
  filters?: any,
  options?: UseInfiniteQueryOptions<
    PaginationResponse<Registration>,
    RequestResponse,
    PaginationResponse<Registration>,
    PaginationResponse<Registration>,
    QueryKey
  >,
) => {
  const { getEventRegistrations } = useAPI();

  return useInfiniteQuery<PaginationResponse<Registration>, RequestResponse>(
    EVENT_QUERY_KEYS.registrations.list(eventId, filters),
    ({ pageParam = 1 }) => getEventRegistrations(eventId, { ...filters, page: pageParam }),
    {
      ...options,
      getNextPageParam: (lastPage) => lastPage.next,
    },
  );
};

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
) => {
  const { getPublicEventRegistrations } = useAPI();

  return useInfiniteQuery<PaginationResponse<PublicRegistration>, RequestResponse>(
    EVENT_QUERY_KEYS.public_registrations(eventId),
    ({ pageParam = 1 }) => getPublicEventRegistrations(eventId, { page: pageParam }),
    {
      ...options,
      getNextPageParam: (lastPage) => lastPage.next,
    },
  );
};

export const useEventRegistration = (eventId: Event['id'], userId: User['user_id']) => {
  const { getRegistration } = useAPI();

  return useQuery<Registration, RequestResponse>(EVENT_QUERY_KEYS.registrations.detail(eventId, userId), () => getRegistration(eventId, userId), {
    enabled: userId !== '',
    retry: false,
  });
};

export const useCreateEventRegistration = (eventId: Event['id']): UseMutationResult<Registration, RequestResponse, Partial<Registration>, unknown> => {
  const { createRegistration } = useAPI();
  const queryClient = useQueryClient();

  return useMutation((newRegistration: Partial<Registration>) => createRegistration(eventId, newRegistration), {
    onSuccess: (data) => {
      const formId = queryClient.getQueryData<Event>(EVENT_QUERY_KEYS.detail(eventId))?.survey;
      if (formId) {
        queryClient.invalidateQueries([FORM_QUERY_KEY, formId]);
      }
      queryClient.invalidateQueries(EVENT_QUERY_KEYS.detail(eventId));
      queryClient.setQueryData(EVENT_QUERY_KEYS.registrations.detail(eventId, data.user_info.user_id), data);
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
  const { updateRegistration } = useAPI();
  const queryClient = useQueryClient();

  return useMutation(({ registration, userId }) => updateRegistration(eventId, registration, userId), {
    onSuccess: (data) => {
      queryClient.invalidateQueries(EVENT_QUERY_KEYS.registrations.list(eventId));
      queryClient.invalidateQueries([USER_EVENTS_QUERY_KEY]);
      queryClient.setQueryData(EVENT_QUERY_KEYS.registrations.detail(eventId, data.user_info.user_id), data);
    },
  });
};

export const useDeleteEventRegistration = (eventId: Event['id']): UseMutationResult<RequestResponse, RequestResponse, User['user_id'], unknown> => {
  const { deleteRegistration } = useAPI();
  const queryClient = useQueryClient();

  return useMutation((userId) => deleteRegistration(eventId, userId), {
    onSuccess: () => {
      const formId = queryClient.getQueryData<Event>(EVENT_QUERY_KEYS.detail(eventId))?.survey;
      if (formId) {
        queryClient.invalidateQueries([FORM_QUERY_KEY, formId]);
      }
      queryClient.removeQueries(EVENT_QUERY_KEYS.registrations.all(eventId));
      queryClient.invalidateQueries(EVENT_QUERY_KEYS.detail(eventId));
      queryClient.invalidateQueries([USER_EVENTS_QUERY_KEY]);
    },
  });
};
