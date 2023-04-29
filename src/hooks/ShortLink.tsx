import { useMutation, UseMutationResult, useQuery, useQueryClient } from 'react-query';

import { RequestResponse, ShortLink } from 'types';

import { useAPI } from 'hooks/API';

export const SHORT_LINK_QUERY_KEY = 'short-link';

export const useShortLinks = () => {
  const { getShortLinks } = useAPI();
  return useQuery<Array<ShortLink>, RequestResponse>([SHORT_LINK_QUERY_KEY], () => getShortLinks());
};

export const useCreateShortLink = (): UseMutationResult<ShortLink, RequestResponse, ShortLink, unknown> => {
  const { createShortLink } = useAPI();
  const queryClient = useQueryClient();
  return useMutation((item) => createShortLink(item), {
    onSuccess: () => {
      queryClient.invalidateQueries(SHORT_LINK_QUERY_KEY);
    },
  });
};

export const useDeleteShortLink = (): UseMutationResult<RequestResponse, RequestResponse, string, unknown> => {
  const { deleteShortLink } = useAPI();
  const queryClient = useQueryClient();
  return useMutation((slug) => deleteShortLink(slug), {
    onSuccess: () => {
      queryClient.invalidateQueries(SHORT_LINK_QUERY_KEY);
    },
  });
};
