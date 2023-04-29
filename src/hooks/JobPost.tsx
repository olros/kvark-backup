import { useInfiniteQuery, useMutation, UseMutationResult, useQuery, useQueryClient } from 'react-query';

import { JobPost, JobPostRequired, PaginationResponse, RequestResponse } from 'types';

import { useAPI } from 'hooks/API';

export const JOBPOST_QUERY_KEY = 'jobpost';

export const useJobPostById = (id: number) => {
  const { getJobPost } = useAPI();
  return useQuery<JobPost, RequestResponse>([JOBPOST_QUERY_KEY, id], () => getJobPost(id), { enabled: id !== -1 });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useJobPosts = (filters?: any) => {
  const { getJobPosts } = useAPI();
  return useInfiniteQuery<PaginationResponse<JobPost>, RequestResponse>(
    [JOBPOST_QUERY_KEY, filters],
    ({ pageParam = 1 }) => getJobPosts({ ...filters, page: pageParam }),
    {
      getNextPageParam: (lastPage) => lastPage.next,
    },
  );
};

export const useCreateJobPost = (): UseMutationResult<JobPost, RequestResponse, JobPostRequired, unknown> => {
  const { createJobPost } = useAPI();
  const queryClient = useQueryClient();
  return useMutation((newJobPost: JobPostRequired) => createJobPost(newJobPost), {
    onSuccess: (data) => {
      queryClient.invalidateQueries(JOBPOST_QUERY_KEY);
      queryClient.setQueryData([JOBPOST_QUERY_KEY, data.id], data);
    },
  });
};

export const useUpdateJobPost = (id: number): UseMutationResult<JobPost, RequestResponse, JobPostRequired, unknown> => {
  const { putJobPost } = useAPI();
  const queryClient = useQueryClient();
  return useMutation((updatedJobPost: JobPostRequired) => putJobPost(id, updatedJobPost), {
    onSuccess: (data) => {
      queryClient.invalidateQueries(JOBPOST_QUERY_KEY);
      queryClient.setQueryData([JOBPOST_QUERY_KEY, id], data);
    },
  });
};

export const useDeleteJobPost = (id: number): UseMutationResult<RequestResponse, RequestResponse, unknown, unknown> => {
  const { deleteJobPost } = useAPI();
  const queryClient = useQueryClient();
  return useMutation(() => deleteJobPost(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(JOBPOST_QUERY_KEY);
    },
  });
};
