import { QueryClient, useInfiniteQuery, useMutation, UseMutationResult, useQuery, useQueryClient } from 'react-query';

import { PaginationResponse, RequestResponse, WikiChildren, WikiPage, WikiRequired, WikiTree } from 'types';

import { useAPI } from './API';

export const WIKI_QUERY_KEY = 'wiki';
export const WIKI_QUERY_KEY_TREE = `${WIKI_QUERY_KEY}/tree`;

export const useWikiTree = () => {
  const { getWikiTree } = useAPI();
  return useQuery<WikiTree, RequestResponse>(WIKI_QUERY_KEY_TREE, () => getWikiTree());
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useWikiSearch = (filters: Record<string, any>) => {
  const { getWikiSearch } = useAPI();

  return useInfiniteQuery<PaginationResponse<WikiChildren>, RequestResponse>(
    [WIKI_QUERY_KEY, filters],
    ({ pageParam = 1 }) => getWikiSearch({ ...filters, page: pageParam }),
    {
      getNextPageParam: (lastPage) => lastPage.next,
      enabled: Boolean(Object.keys(filters).length),
    },
  );
};

export const useWikiPage = (path: string) => {
  const { getWikiPage } = useAPI();
  return useQuery<WikiPage, RequestResponse>([WIKI_QUERY_KEY, path], () => getWikiPage(path));
};

export const useCreateWikiPage = (): UseMutationResult<WikiPage, RequestResponse, WikiRequired, unknown> => {
  const { createWikiPage } = useAPI();
  const queryClient = useQueryClient();
  return useMutation((newPage: WikiRequired) => createWikiPage(newPage), {
    onSuccess: (data) => {
      invalidate(queryClient);
      queryClient.setQueryData([WIKI_QUERY_KEY, data.path], data);
    },
  });
};

export const useUpdateWikiPage = (path: string): UseMutationResult<WikiPage, RequestResponse, WikiRequired, unknown> => {
  const { updateWikiPage } = useAPI();
  const queryClient = useQueryClient();
  return useMutation((updatedPage: WikiRequired) => updateWikiPage(path, updatedPage), {
    onSuccess: (data) => {
      invalidate(queryClient);
      queryClient.setQueryData([WIKI_QUERY_KEY, data.path], data);
    },
  });
};

export const useDeleteWikiPage = (path: string): UseMutationResult<RequestResponse, RequestResponse, unknown, unknown> => {
  const { deleteWikiPage } = useAPI();
  const queryClient = useQueryClient();
  return useMutation(() => deleteWikiPage(path), {
    onSuccess: () => {
      invalidate(queryClient);
    },
  });
};

const invalidate = (queryClient: QueryClient) => {
  queryClient.invalidateQueries(WIKI_QUERY_KEY);
  queryClient.invalidateQueries(WIKI_QUERY_KEY_TREE);
};
