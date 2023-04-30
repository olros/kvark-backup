/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useState } from 'react';
import { InfiniteData, QueryKey, useInfiniteQuery, UseInfiniteQueryOptions, useQueryClient } from 'react-query';

import { Notification, PaginationResponse, RequestResponse } from 'types';

import { useAPI } from 'hooks/API';
import { USER_QUERY_KEY } from 'hooks/User';

export const NOTIFICATION_QUERY_KEY = 'notification';

export const useNotifications = (
  options?: UseInfiniteQueryOptions<
    PaginationResponse<Notification>,
    RequestResponse,
    PaginationResponse<Notification>,
    PaginationResponse<Notification>,
    QueryKey
  >,
) => {
  const queryClient = useQueryClient();
  const [newQueryData, setNewQueryData] = useState<InfiniteData<PaginationResponse<Notification>> | null>(null);
  const enabled = options?.enabled || false;

  // Don't run `setQueryData` until the notifications are hidden (`options?.enabled === false`) to prevent unwanted UI-updates
  useEffect(() => {
    if (!enabled && newQueryData) {
      queryClient.setQueryData([NOTIFICATION_QUERY_KEY], () => newQueryData);
      setNewQueryData(null);
    }
  }, [enabled, newQueryData]);

  const { getNotifications, updateNotification } = useAPI();

  return useInfiniteQuery<PaginationResponse<Notification>, RequestResponse>(
    [NOTIFICATION_QUERY_KEY],
    ({ pageParam = 1 }) => getNotifications({ page: pageParam }),
    {
      ...options,
      getNextPageParam: (lastPage) => lastPage.next,
      onSuccess: async (data) => {
        // Get not read notifications
        const notifications = data.pages
          .map((page) => page.results)
          .flat()
          .filter((not) => !not.read);
        // If some not read notifications exists, mark them as read
        if (notifications.length) {
          await Promise.allSettled(notifications.map((notification) => updateNotification(notification.id, { read: true })));
          const newPagesArray = data.pages.map((page) => ({ ...page, results: page.results.map((val) => ({ ...val, read: true })) }));
          queryClient.invalidateQueries([USER_QUERY_KEY]);
          // Update the NewQueryData-variable.
          setNewQueryData({ pages: newPagesArray, pageParams: data.pageParams });
        }
      },
    },
  );
};
