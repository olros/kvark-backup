import { useInfiniteQuery, useMutation, UseMutationResult, useQuery, useQueryClient } from 'react-query';

import { News, NewsRequired, PaginationResponse, RequestResponse } from 'types';

import { useAPI } from 'hooks/API';

export const EXPORT_QUERY_KEY = 'news';

export const useNewsById = (id: number) => {
  const { getNewsItem } = useAPI();
  return useQuery<News, RequestResponse>([EXPORT_QUERY_KEY, id], () => getNewsItem(id), { enabled: id !== -1 });
};

export const useNews = () => {
  const { getNewsItems } = useAPI();
  return useInfiniteQuery<PaginationResponse<News>, RequestResponse>([EXPORT_QUERY_KEY], ({ pageParam = 1 }) => getNewsItems({ page: pageParam }), {
    getNextPageParam: (lastPage) => lastPage.next,
  });
};

export const useCreateNews = (): UseMutationResult<News, RequestResponse, NewsRequired, unknown> => {
  const { createNewsItem } = useAPI();
  const queryClient = useQueryClient();
  return useMutation((newNewsItem: NewsRequired) => createNewsItem(newNewsItem), {
    onSuccess: (data) => {
      queryClient.invalidateQueries(EXPORT_QUERY_KEY);
      queryClient.setQueryData([EXPORT_QUERY_KEY, data.id], data);
    },
  });
};

export const useUpdateNews = (id: number): UseMutationResult<News, RequestResponse, NewsRequired, unknown> => {
  const { putNewsItem } = useAPI();
  const queryClient = useQueryClient();
  return useMutation((updatedNewsItem: NewsRequired) => putNewsItem(id, updatedNewsItem), {
    onSuccess: (data) => {
      queryClient.invalidateQueries(EXPORT_QUERY_KEY);
      queryClient.setQueryData([EXPORT_QUERY_KEY, id], data);
    },
  });
};

export const useDeleteNews = (id: number): UseMutationResult<RequestResponse, RequestResponse, unknown, unknown> => {
  const { deleteNewsItem } = useAPI();
  const queryClient = useQueryClient();
  return useMutation(() => deleteNewsItem(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(EXPORT_QUERY_KEY);
    },
  });
};
