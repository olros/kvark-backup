import { Avatar, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, MenuItem, Stack, Tooltip, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { InfiniteQueryObserverResult, QueryKey, UseInfiniteQueryOptions } from 'react-query';
import { Link } from 'react-router-dom';
import URLS from 'URLS';
import { getUserClass, getUserStudyLong, USER_CLASSES, USER_STUDIES } from 'utils';

import { BadgesOverallLeaderboard, PaginationResponse, RequestResponse } from 'types';

import Select from 'components/inputs/Select';
import Pagination from 'components/layout/Pagination';
import Paper from 'components/layout/Paper';
import NotFoundIndicator from 'components/miscellaneous/NotFoundIndicator';

export type BadgesLeaderboard = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters?: any;
  options?: UseInfiniteQueryOptions<
    PaginationResponse<BadgesOverallLeaderboard>,
    RequestResponse,
    PaginationResponse<BadgesOverallLeaderboard>,
    PaginationResponse<BadgesOverallLeaderboard>,
    QueryKey
  >;
  useHook: (
    filters?: BadgesLeaderboard['filters'],
    options?: BadgesLeaderboard['options'],
  ) => InfiniteQueryObserverResult<PaginationResponse<BadgesOverallLeaderboard>, RequestResponse>;
};

type Filters = {
  user_class: number | 'all';
  user_study: number | 'all';
};

export const BadgesLeaderboard = ({ useHook, filters, options }: BadgesLeaderboard) => {
  const { formState, control, watch } = useForm<Filters>({ defaultValues: { user_class: 'all', user_study: 'all' } });
  const watchFilters = watch();
  const formFilters = useMemo(
    () => ({
      user_class: watchFilters.user_class === 'all' ? undefined : watchFilters.user_class,
      user_study: watchFilters.user_study === 'all' ? undefined : watchFilters.user_study,
    }),
    [watchFilters],
  );

  const { data, error, hasNextPage, fetchNextPage, isLoading, isFetching } = useHook({ ...formFilters, ...filters }, { ...options });
  const leaderboardEntries = useMemo(() => (data ? data.pages.map((page) => page.results).flat() : []), [data]);

  return (
    <>
      <Stack direction={{ xs: 'column', md: 'row' }} gap={{ xs: 0, md: 2 }}>
        <Select control={control} formState={formState} label='Klasser' name='user_class'>
          <MenuItem value='all'>Alle</MenuItem>
          {USER_CLASSES.map((value) => (
            <MenuItem key={value} value={value}>
              {getUserClass(value)}
            </MenuItem>
          ))}
        </Select>
        <Select control={control} formState={formState} label='Studier' name='user_study'>
          <MenuItem value='all'>Alle</MenuItem>
          {USER_STUDIES.map((value) => (
            <MenuItem key={value} value={value}>
              {getUserStudyLong(value)}
            </MenuItem>
          ))}
        </Select>
      </Stack>
      {!isLoading && !leaderboardEntries.length && <NotFoundIndicator header='Ingen har mottatt badges enda' />}
      {error && <Paper>{error.detail}</Paper>}
      {data !== undefined && (
        <Pagination fullWidth hasNextPage={hasNextPage} isLoading={isFetching} nextPage={() => fetchNextPage()}>
          <Stack component={List} gap={1}>
            {leaderboardEntries.map((entry, index) => (
              <ListItem component={Paper} disablePadding key={entry.user.user_id} noOverflow noPadding>
                <ListItemButton component={Link} to={`${URLS.profile}${entry.user.user_id}/`}>
                  <ListItemAvatar>
                    <Tooltip arrow title='Rangering basert på din filtrering'>
                      <Avatar>
                        <Typography variant='h3'>{index + 1}</Typography>
                      </Avatar>
                    </Tooltip>
                  </ListItemAvatar>
                  <ListItemText primary={`${entry.user.first_name} ${entry.user.last_name}`} />
                  <Typography sx={{ mr: 1 }} variant='h2'>
                    {entry.number_of_badges}
                  </Typography>
                </ListItemButton>
              </ListItem>
            ))}
          </Stack>
        </Pagination>
      )}
    </>
  );
};

export default BadgesLeaderboard;
