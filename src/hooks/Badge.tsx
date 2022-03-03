/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryKey, useInfiniteQuery, UseInfiniteQueryOptions, useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryOptions } from 'react-query';

import { Badge, BadgeCategory, BadgeLeaderboard, BadgesOverallLeaderboard, PaginationResponse, RequestResponse } from 'types';

import API from 'api/api';

import { USER_BADGES_QUERY_KEY } from 'hooks/User';

export const BADGES_QUERY_KEYS = {
  self: ['badges'] as const,
  list: (filters?: any) => [...BADGES_QUERY_KEYS.self, 'list', filters] as const,
  categories: {
    list: (filters?: any) => [...BADGES_QUERY_KEYS.self, 'categories', filters] as const,
    detail: (badgeCategoryId: BadgeCategory['id']) => [...BADGES_QUERY_KEYS.categories.list(), badgeCategoryId] as const,
  },
  overallLeaderboard: (filters?: any) => [...BADGES_QUERY_KEYS.self, 'overall_leaderboard', filters] as const,
  badge: {
    detail: (badgeId: Badge['id']) => [...BADGES_QUERY_KEYS.self, badgeId] as const,
    leaderboard: (badgeId: Badge['id'], filters?: any) => [...BADGES_QUERY_KEYS.badge.detail(badgeId), 'leaderboard', filters] as const,
  },
};

export const useBadge = (badgeId: Badge['id'], options?: UseQueryOptions<Badge, RequestResponse, Badge, QueryKey>) =>
  useQuery<Badge, RequestResponse>(BADGES_QUERY_KEYS.badge.detail(badgeId), () => API.getBadge(badgeId), options);

export const useBadges = (
  filters?: any,
  options?: UseInfiniteQueryOptions<PaginationResponse<Badge>, RequestResponse, PaginationResponse<Badge>, PaginationResponse<Badge>, QueryKey>,
) =>
  useInfiniteQuery<PaginationResponse<Badge>, RequestResponse>(
    BADGES_QUERY_KEYS.list(filters),
    ({ pageParam = 1 }) => API.getBadges({ ...filters, page: pageParam }),
    {
      ...options,
      getNextPageParam: (lastPage) => lastPage.next,
    },
  );

export const useCreateBadge = (): UseMutationResult<RequestResponse, RequestResponse, string, unknown> => {
  const queryClient = useQueryClient();
  return useMutation((flag) => API.createUserBadge({ flag }), {
    onSuccess: () => {
      queryClient.invalidateQueries([USER_BADGES_QUERY_KEY]);
    },
  });
};

export const useBadgeCategories = (
  filters?: any,
  options?: UseInfiniteQueryOptions<
    PaginationResponse<BadgeCategory>,
    RequestResponse,
    PaginationResponse<BadgeCategory>,
    PaginationResponse<BadgeCategory>,
    QueryKey
  >,
) =>
  useInfiniteQuery<PaginationResponse<BadgeCategory>, RequestResponse>(
    BADGES_QUERY_KEYS.categories.list(filters),
    ({ pageParam = 1 }) => API.getBadgeCategories({ ...filters, page: pageParam }),
    {
      ...options,
      getNextPageParam: (lastPage) => lastPage.next,
    },
  );

export const useBadgeLeaderboard = (
  badgeId: Badge['id'],
  filters?: any,
  options?: UseInfiniteQueryOptions<
    PaginationResponse<BadgeLeaderboard>,
    RequestResponse,
    PaginationResponse<BadgeLeaderboard>,
    PaginationResponse<BadgeLeaderboard>,
    QueryKey
  >,
) =>
  useInfiniteQuery<PaginationResponse<BadgeLeaderboard>, RequestResponse>(
    BADGES_QUERY_KEYS.badge.leaderboard(badgeId, filters),
    ({ pageParam = 1 }) => API.getBadgeLeaderboard(badgeId, { ...filters, page: pageParam }),
    {
      ...options,
      getNextPageParam: (lastPage) => lastPage.next,
    },
  );

export const useBadgesOverallLeaderboard = (
  filters?: any,
  options?: UseInfiniteQueryOptions<
    PaginationResponse<BadgesOverallLeaderboard>,
    RequestResponse,
    PaginationResponse<BadgesOverallLeaderboard>,
    PaginationResponse<BadgesOverallLeaderboard>,
    QueryKey
  >,
) =>
  useInfiniteQuery<PaginationResponse<BadgesOverallLeaderboard>, RequestResponse>(
    BADGES_QUERY_KEYS.overallLeaderboard(filters),
    ({ pageParam = 1 }) => API.getOverallBadgesLeaderboard({ ...filters, page: pageParam }),
    {
      ...options,
      getNextPageParam: (lastPage) => lastPage.next,
    },
  );

export const useBadgeCategory = (badgeCategoryId: BadgeCategory['id'], options?: UseQueryOptions<BadgeCategory, RequestResponse, BadgeCategory, QueryKey>) =>
  useQuery<BadgeCategory, RequestResponse>(BADGES_QUERY_KEYS.categories.detail(badgeCategoryId), () => API.getBadgeCategory(badgeCategoryId), options);
