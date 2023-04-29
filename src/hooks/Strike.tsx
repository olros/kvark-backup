import { useInfiniteQuery, useMutation, useQueryClient } from 'react-query';

import { PaginationResponse, RequestResponse, Strike, StrikeCreate, StrikeList } from 'types';

import { useAPI } from 'hooks/API';
import { useSnackbar } from 'hooks/Snackbar';
import { USER_STRIKES_QUERY_KEY } from 'hooks/User';

export const ALL_STRIKES_QUERY_KEY = 'strikes';

export const useCreateStrike = () => {
  const { createStrike } = useAPI();
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbar();
  return useMutation<Strike, RequestResponse, StrikeCreate, unknown>((item) => createStrike(item), {
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries([ALL_STRIKES_QUERY_KEY]);
      queryClient.invalidateQueries([USER_STRIKES_QUERY_KEY, variables.user_id]);
      showSnackbar('Prikken ble opprettet', 'success');
    },
    onError: (e) => {
      showSnackbar(e.detail, 'error');
    },
  });
};

export const useDeleteStrike = (userId: string) => {
  const { deleteStrike } = useAPI();
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbar();
  return useMutation<RequestResponse, RequestResponse, string, unknown>((id) => deleteStrike(id), {
    onSuccess: () => {
      queryClient.invalidateQueries([ALL_STRIKES_QUERY_KEY]);
      queryClient.invalidateQueries([USER_STRIKES_QUERY_KEY, userId]);
      showSnackbar('Prikken ble slettet', 'success');
    },
    onError: (e) => {
      showSnackbar(e.detail, 'error');
    },
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useStrikes = (filters?: any) => {
  const { getStrikes } = useAPI();
  return useInfiniteQuery<PaginationResponse<StrikeList>, RequestResponse>(
    [ALL_STRIKES_QUERY_KEY, filters],
    ({ pageParam = 1 }) => getStrikes({ ...filters, page: pageParam }),
    {
      getNextPageParam: (lastPage) => lastPage.next,
    },
  );
};
