import { useAuth0 } from '@auth0/auth0-react';
import type { ReactNode } from 'react';
import { QueryKey, useInfiniteQuery, useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryOptions } from 'react-query';

import type {
  Badge,
  EventList,
  Form,
  Membership,
  MembershipHistory,
  PaginationResponse,
  RequestResponse,
  Strike,
  User,
  UserList,
  UserNotificationSetting,
  UserNotificationSettingChoice,
  UserPermissions,
} from 'types';
import type { PermissionApp } from 'types/Enums';

import API from 'api/api';

export const USER_QUERY_KEY = 'user';
export const USER_BADGES_QUERY_KEY = 'user_badges';
export const USER_EVENTS_QUERY_KEY = 'user_events';
export const USER_MEMBERSHIPS_QUERY_KEY = 'user_memberships';
export const USER_MEMBERSHIP_HISTORIES_QUERY_KEY = 'user_membership_histories';
export const USER_FORMS_QUERY_KEY = 'user_forms';
export const USER_STRIKES_QUERY_KEY = 'user_strikes';
export const USER_PERMISSIONS_QUERY_KEY = 'user_permissions';
export const USER_NOTIFICATION_SETTINGS_QUERY_KEY = 'user_notification_settings';
export const USER_NOTIFICATION_SETTING_CHOICES_QUERY_KEY = 'user_notification_setting_choices';
export const USERS_QUERY_KEY = 'users';

export const useUser = (userId?: User['user_id'], options?: UseQueryOptions<User | undefined, RequestResponse, User | undefined, QueryKey>) => {
  const { isAuthenticated, logout } = useAuth0();
  return useQuery<User | undefined, RequestResponse>([USER_QUERY_KEY, userId], () => (isAuthenticated ? API.getUserData(userId) : undefined), {
    ...options,
    onError: () => {
      if (!userId) {
        logout();
        window.location.reload();
      }
    },
  });
};

export const useUserPermissions = (options?: UseQueryOptions<UserPermissions | undefined, RequestResponse, UserPermissions | undefined, QueryKey>) => {
  const { isAuthenticated } = useAuth0();
  return useQuery<UserPermissions | undefined, RequestResponse>(
    [USER_PERMISSIONS_QUERY_KEY],
    () => (isAuthenticated ? API.getUserPermissions() : undefined),
    options,
  );
};

export const useUserBadges = (userId?: User['user_id']) =>
  useInfiniteQuery<PaginationResponse<Badge>, RequestResponse>(
    [USER_BADGES_QUERY_KEY, userId],
    ({ pageParam = 1 }) => API.getUserBadges(userId, { page: pageParam }),
    {
      getNextPageParam: (lastPage) => lastPage.next,
    },
  );

export const useUserEvents = (userId?: User['user_id']) => {
  return useInfiniteQuery<PaginationResponse<EventList>, RequestResponse>(
    [USER_EVENTS_QUERY_KEY, userId],
    ({ pageParam = 1 }) => API.getUserEvents(userId, { page: pageParam }),
    {
      getNextPageParam: (lastPage) => lastPage.next,
    },
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useUserForms = (filters?: any) =>
  useInfiniteQuery<PaginationResponse<Form>, RequestResponse>(
    [USER_FORMS_QUERY_KEY, filters],
    ({ pageParam = 1 }) => API.getUserForms({ ...filters, page: pageParam }),
    {
      getNextPageParam: (lastPage) => lastPage.next,
    },
  );

export const useUserMemberships = (userId?: User['user_id']) =>
  useInfiniteQuery<PaginationResponse<Membership>, RequestResponse>([USER_MEMBERSHIPS_QUERY_KEY, userId], () => API.getUserMemberships(userId));

export const useUserMembershipHistories = (userId?: User['user_id']) =>
  useInfiniteQuery<PaginationResponse<MembershipHistory>, RequestResponse>([USER_MEMBERSHIP_HISTORIES_QUERY_KEY, userId], () =>
    API.getUserMembershipHistories(userId),
  );

export const useUserStrikes = (userId?: string) => useQuery<Array<Strike>, RequestResponse>([USER_STRIKES_QUERY_KEY, userId], () => API.getUserStrikes(userId));

export const useUserNotificationSettings = () =>
  useQuery<Array<UserNotificationSetting>, RequestResponse>([USER_NOTIFICATION_SETTINGS_QUERY_KEY], () => API.getUserNotificationSettings());

export const useUserNotificationSettingChoices = () =>
  useQuery<Array<UserNotificationSettingChoice>, RequestResponse>([USER_NOTIFICATION_SETTING_CHOICES_QUERY_KEY], () => API.getUserNotificationSettingChoices());

export const useUpdateUserNotificationSettings = (): UseMutationResult<Array<UserNotificationSetting>, RequestResponse, UserNotificationSetting, unknown> => {
  const queryClient = useQueryClient();
  return useMutation((data) => API.updateUserNotificationSettings(data), {
    onSuccess: (data) => {
      queryClient.setQueryData([USER_NOTIFICATION_SETTINGS_QUERY_KEY], data);
    },
  });
};

export const useSlackConnect = (): UseMutationResult<RequestResponse, RequestResponse, string, unknown> => {
  const queryClient = useQueryClient();
  return useMutation((slackCode) => API.slackConnect(slackCode), {
    onSuccess: () => queryClient.invalidateQueries([USER_QUERY_KEY]),
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useUsers = (filters?: any) =>
  useInfiniteQuery<PaginationResponse<UserList>, RequestResponse>(
    [USERS_QUERY_KEY, filters],
    ({ pageParam = 1 }) => API.getUsers({ ...filters, page: pageParam }),
    {
      getNextPageParam: (lastPage) => lastPage.next,
    },
  );

export const useUpdateUser = (): UseMutationResult<User, RequestResponse, { userId: string; user: Partial<User> }, unknown> => {
  const queryClient = useQueryClient();
  return useMutation(({ userId, user }) => API.updateUserData(userId, user), {
    onSuccess: (data) => {
      queryClient.invalidateQueries([USERS_QUERY_KEY]);
      const user = queryClient.getQueryData<User | undefined>([USER_QUERY_KEY]);
      if (data.user_id === user?.user_id) {
        queryClient.setQueryData([USER_QUERY_KEY], data);
      }
    },
  });
};

export const useExportUserData = (): UseMutationResult<RequestResponse, RequestResponse, unknown, unknown> => useMutation(() => API.exportUserData());

export const useDeleteUser = (): UseMutationResult<RequestResponse, RequestResponse, string | undefined, unknown> =>
  useMutation((userId) => API.deleteUser(userId));

export const useActivateUser = (): UseMutationResult<RequestResponse, RequestResponse, string, unknown> => {
  const queryClient = useQueryClient();
  return useMutation((userId) => API.activateUser(userId), {
    onSuccess: () => {
      queryClient.invalidateQueries([USERS_QUERY_KEY]);
    },
  });
};

export const useDeclineUser = (): UseMutationResult<RequestResponse, RequestResponse, { userId: string; reason: string }, unknown> => {
  const queryClient = useQueryClient();
  return useMutation(({ userId, reason }) => API.declineUser(userId, reason), {
    onSuccess: () => {
      queryClient.invalidateQueries([USERS_QUERY_KEY]);
    },
  });
};

export const useHavePermission = (
  apps: Array<PermissionApp>,
  options?: UseQueryOptions<UserPermissions | undefined, RequestResponse, UserPermissions | undefined, QueryKey>,
) => {
  const { data, isLoading } = useUserPermissions(options);
  return { allowAccess: isLoading ? false : Boolean(apps.some((app) => data?.permissions[app].write || data?.permissions[app].write_all)), isLoading };
};

export type HavePermissionProps = {
  children: ReactNode;
  apps: Array<PermissionApp>;
};

export const HavePermission = ({ children, apps }: HavePermissionProps) => {
  const { allowAccess } = useHavePermission(apps);
  return <>{allowAccess && children}</>;
};
