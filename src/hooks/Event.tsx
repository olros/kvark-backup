/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryKey, useInfiniteQuery, UseInfiniteQueryOptions, useMutation, UseMutationResult, useQuery, useQueryClient } from 'react-query';

import {
  Event,
  EventCompact,
  EventInterested,
  EventRequired,
  EventStatistics,
  PaginationResponse,
  PublicRegistration,
  Registration,
  RequestResponse,
  User,
} from 'types';

import API from 'api/api';

import { FORM_QUERY_KEY } from 'hooks/Form';
import { NOTIFICATION_QUERY_KEY } from 'hooks/Notification';
import { USER_EVENTS_QUERY_KEY, USER_QUERY_KEY } from 'hooks/User';

export const EVENT_QUERY_KEYS = {
  all: ['event'] as const,
  list: (filters?: any) => [...EVENT_QUERY_KEYS.all, 'list', ...(filters ? [filters] : [])] as const,
  list_admin: (filters?: any) => [...EVENT_QUERY_KEYS.all, 'admin_list', ...(filters ? [filters] : [])] as const,
  detail: (eventId: Event['id']) => [...EVENT_QUERY_KEYS.all, eventId] as const,
  statistics: (eventId: Event['id']) => [...EVENT_QUERY_KEYS.detail(eventId), 'statistics'] as const,
  interested: (eventId: Event['id']) => [...EVENT_QUERY_KEYS.detail(eventId), 'interested'] as const,
  public_registrations: (eventId: Event['id']) => [...EVENT_QUERY_KEYS.detail(eventId), 'public_registrations'] as const,
  registrations: {
    all: (eventId: Event['id']) => [...EVENT_QUERY_KEYS.detail(eventId), 'registrations'] as const,
    list: (eventId: Event['id'], filters?: any) => [...EVENT_QUERY_KEYS.registrations.all(eventId), 'list', ...(filters ? [filters] : [])] as const,
    detail: (eventId: Event['id'], userId: User['user_id']) => [...EVENT_QUERY_KEYS.registrations.all(eventId), userId] as const,
  },
};

export const useEventById = (eventId: Event['id']) =>
  useQuery<Event, RequestResponse>(EVENT_QUERY_KEYS.detail(eventId), () => API.getEvent(eventId), { enabled: eventId !== -1 });

export const useEvents = (filters?: any) =>
  useInfiniteQuery<PaginationResponse<EventCompact>, RequestResponse>(
    EVENT_QUERY_KEYS.list(filters),
    ({ pageParam = 1 }) => API.getEvents({ ...filters, page: pageParam }),
    {
      getNextPageParam: (lastPage) => lastPage.next,
    },
  );

export const useEventsWhereIsAdmin = (filters?: any) =>
  useInfiniteQuery<PaginationResponse<EventCompact>, RequestResponse>(
    EVENT_QUERY_KEYS.list_admin(filters),
    ({ pageParam = 1 }) => API.getEventsWhereIsAdmin({ ...filters, page: pageParam }),
    {
      getNextPageParam: (lastPage) => lastPage.next,
    },
  );

export const useCreateEvent = (): UseMutationResult<Event, RequestResponse, EventRequired, unknown> => {
  const queryClient = useQueryClient();
  return useMutation((newEvent: EventRequired) => API.createEvent(newEvent), {
    onSuccess: (data) => {
      queryClient.invalidateQueries(EVENT_QUERY_KEYS.all);
      queryClient.setQueryData(EVENT_QUERY_KEYS.detail(data.id), data);
    },
  });
};

export const useUpdateEvent = (eventId: Event['id']): UseMutationResult<Event, RequestResponse, EventRequired, unknown> => {
  const queryClient = useQueryClient();
  return useMutation((updatedEvent: EventRequired) => API.updateEvent(eventId, updatedEvent), {
    onSuccess: (data) => {
      queryClient.invalidateQueries(EVENT_QUERY_KEYS.all);
      queryClient.setQueryData(EVENT_QUERY_KEYS.detail(eventId), data);
    },
  });
};

export const useDeleteEvent = (eventId: Event['id']): UseMutationResult<RequestResponse, RequestResponse, unknown, unknown> => {
  const queryClient = useQueryClient();
  return useMutation(() => API.deleteEvent(eventId), {
    onSuccess: () => queryClient.invalidateQueries(EVENT_QUERY_KEYS.all),
  });
};

export const useEventIsInterested = (eventId: Event['id']) =>
  useQuery<EventInterested, RequestResponse>(EVENT_QUERY_KEYS.interested(eventId), () => API.getEventIsInterested(eventId), { enabled: eventId !== -1 });

export const useEventSetIsInterested = (eventId: Event['id']): UseMutationResult<EventInterested, RequestResponse, EventInterested, unknown> => {
  const queryClient = useQueryClient();
  return useMutation((eventInterest) => API.setEventIsInterested(eventId, eventInterest), {
    onSuccess: (data) => {
      queryClient.setQueryData(EVENT_QUERY_KEYS.interested(eventId), data);
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
  useQuery<EventStatistics, RequestResponse>(EVENT_QUERY_KEYS.statistics(eventId), () => API.getEventStatistics(eventId));

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
) =>
  useInfiniteQuery<PaginationResponse<Registration>, RequestResponse>(
    EVENT_QUERY_KEYS.registrations.list(eventId, filters),
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
    EVENT_QUERY_KEYS.public_registrations(eventId),
    ({ pageParam = 1 }) => API.getPublicEventRegistrations(eventId, { page: pageParam }),
    {
      ...options,
      getNextPageParam: (lastPage) => lastPage.next,
    },
  );

export const useEventRegistration = (eventId: Event['id'], userId: User['user_id']) =>
  useQuery<Registration, RequestResponse>(EVENT_QUERY_KEYS.registrations.detail(eventId, userId), () => API.getRegistration(eventId, userId), {
    enabled: userId !== '',
    retry: false,
  });

export const useCreateEventRegistration = (eventId: Event['id']): UseMutationResult<Registration, RequestResponse, Partial<Registration>, unknown> => {
  const queryClient = useQueryClient();
  return useMutation((newRegistration: Partial<Registration>) => API.createRegistration(eventId, newRegistration), {
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
  const queryClient = useQueryClient();
  return useMutation(({ registration, userId }) => API.updateRegistration(eventId, registration, userId), {
    onSuccess: (data) => {
      queryClient.invalidateQueries(EVENT_QUERY_KEYS.registrations.list(eventId));
      queryClient.invalidateQueries([USER_EVENTS_QUERY_KEY]);
      queryClient.setQueryData(EVENT_QUERY_KEYS.registrations.detail(eventId, data.user_info.user_id), data);
    },
  });
};

export const useDeleteEventRegistration = (eventId: Event['id']): UseMutationResult<RequestResponse, RequestResponse, User['user_id'], unknown> => {
  const queryClient = useQueryClient();
  return useMutation((userId) => API.deleteRegistration(eventId, userId), {
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
