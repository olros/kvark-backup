import { QueryKey, useInfiniteQuery, UseInfiniteQueryOptions, useMutation, UseMutationResult, useQueryClient } from 'react-query';

import { PaginationResponse, RequestResponse, Toddel, ToddelMutate } from 'types';

import { useAPI } from 'hooks/API';

export const TODDEL_QUERY_KEYS = {
  all: ['toddel'],
};

export const useToddels = (
  options?: UseInfiniteQueryOptions<PaginationResponse<Toddel>, RequestResponse, PaginationResponse<Toddel>, PaginationResponse<Toddel>, QueryKey>,
) => {
  const { getToddels } = useAPI();
  return useInfiniteQuery<PaginationResponse<Toddel>, RequestResponse>(TODDEL_QUERY_KEYS.all, ({ pageParam = 1 }) => getToddels({ page: pageParam }), {
    ...options,
    getNextPageParam: (lastPage) => lastPage.next,
  });
};

export const useCreateToddel = (): UseMutationResult<Toddel, RequestResponse, ToddelMutate, unknown> => {
  const { createToddel } = useAPI();
  const queryClient = useQueryClient();
  return useMutation((data) => createToddel(data), {
    onSuccess: () => queryClient.invalidateQueries(TODDEL_QUERY_KEYS.all),
  });
};

export const useUpdateToddel = (id: Toddel['edition']): UseMutationResult<Toddel, RequestResponse, ToddelMutate, unknown> => {
  const { updateToddel } = useAPI();
  const queryClient = useQueryClient();
  return useMutation((data) => updateToddel(id, data), {
    onSuccess: () => queryClient.invalidateQueries(TODDEL_QUERY_KEYS.all),
  });
};

export const useDeleteToddel = (id: Toddel['edition']): UseMutationResult<RequestResponse, RequestResponse, unknown, unknown> => {
  const { deleteToddel } = useAPI();
  const queryClient = useQueryClient();
  return useMutation(() => deleteToddel(id), {
    onSuccess: () => queryClient.invalidateQueries(TODDEL_QUERY_KEYS.all),
  });
};
