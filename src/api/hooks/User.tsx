import { ReactNode } from 'react';
import { useMutation, useInfiniteQuery, useQuery, useQueryClient, UseMutationResult } from 'react-query';
import API from 'api/api';
import { User, UserCreate, LoginRequestResponse, PaginationResponse, RequestResponse } from 'types/Types';
import { PermissionApp } from 'types/Enums';
import { getCookie, setCookie, removeCookie } from 'api/cookie';
import { ACCESS_TOKEN } from 'constant';

export const USER_QUERY_KEY = 'user';
export const USERS_QUERY_KEY = 'users';

export const useUser = () => {
  const isAuthenticated = useIsAuthenticated();
  return useQuery<User | undefined, RequestResponse>(USER_QUERY_KEY, () => (isAuthenticated ? API.getUserData() : undefined));
};

export const useRefreshUser = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries(USER_QUERY_KEY);
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useUsers = (filters?: any) => {
  return useInfiniteQuery<PaginationResponse<User>, RequestResponse>(
    [USERS_QUERY_KEY, filters],
    ({ pageParam = 1 }) => API.getUsers({ ...filters, page: pageParam }),
    {
      getNextPageParam: (lastPage) => lastPage.next,
    },
  );
};

export const useLogin = (): UseMutationResult<LoginRequestResponse, RequestResponse, { username: string; password: string }, unknown> => {
  const queryClient = useQueryClient();
  return useMutation(({ username, password }) => API.authenticate(username, password), {
    onSuccess: (data) => {
      setCookie(ACCESS_TOKEN, data.token);
      queryClient.removeQueries(USER_QUERY_KEY);
      queryClient.prefetchQuery(USER_QUERY_KEY, () => API.getUserData());
    },
  });
};

export const useForgotPassword = (): UseMutationResult<RequestResponse, RequestResponse, string, unknown> => {
  return useMutation((email) => API.forgotPassword(email));
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return () => {
    removeCookie(ACCESS_TOKEN);
    queryClient.removeQueries(USER_QUERY_KEY);
  };
};

export const useIsAuthenticated = () => {
  return typeof getCookie(ACCESS_TOKEN) !== 'undefined';
};

export const useCreateUser = (): UseMutationResult<RequestResponse, RequestResponse, UserCreate, unknown> => {
  return useMutation((user) => API.createUser(user));
};

export const useUpdateUser = (): UseMutationResult<User, RequestResponse, { userId: string; user: Partial<User> }, unknown> => {
  const queryClient = useQueryClient();
  return useMutation(({ userId, user }) => API.updateUserData(userId, user), {
    onSuccess: (data) => {
      queryClient.invalidateQueries(USERS_QUERY_KEY);
      const user = queryClient.getQueryData<User | undefined>(USER_QUERY_KEY);
      if (data.user_id === user?.user_id) {
        queryClient.setQueryData(USER_QUERY_KEY, data);
      }
    },
  });
};

export const useActivateUser = (): UseMutationResult<RequestResponse, RequestResponse, string, unknown> => {
  const queryClient = useQueryClient();
  return useMutation((userId) => API.activateUser(userId), {
    onSuccess: () => {
      queryClient.invalidateQueries(USERS_QUERY_KEY);
    },
  });
};

export const useHavePermission = (apps: Array<PermissionApp>) => {
  const { data: user, isLoading } = useUser();
  return { allowAccess: isLoading ? false : Boolean(apps.some((app) => user?.permissions[app].write)), isLoading };
};

export type HavePermissionProps = {
  children: ReactNode;
  apps: Array<PermissionApp>;
};

export const HavePermission = ({ children, apps }: HavePermissionProps) => {
  const { allowAccess } = useHavePermission(apps);
  return <>{allowAccess && children}</>;
};
