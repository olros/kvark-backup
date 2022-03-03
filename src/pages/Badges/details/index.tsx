import { Box, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Stack, Typography } from '@mui/material';
import { parseISO } from 'date-fns';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import URLS from 'URLS';
import { formatDate } from 'utils';

import { useBadge, useBadgeCategory, useBadgeLeaderboard } from 'hooks/Badge';

import BadgeCategoryItem from 'pages/Badges/components/BadgeCategoryItem';

import Pagination from 'components/layout/Pagination';
import Paper from 'components/layout/Paper';
import { PrimaryTopBox } from 'components/layout/TopBox';
import Avatar from 'components/miscellaneous/Avatar';
import NotFoundIndicator from 'components/miscellaneous/NotFoundIndicator';
import Page from 'components/navigation/Page';

const BadgeDetails = () => {
  const { badgeId } = useParams<'badgeId'>();
  const { data: badge } = useBadge(badgeId || '_');
  const { data: badgeCategory } = useBadgeCategory(badge?.badge_category || '_', { enabled: Boolean(badge?.badge_category) });
  const { data, error, hasNextPage, fetchNextPage, isLoading, isFetching } = useBadgeLeaderboard(badgeId || '_');
  const leaderboardEntries = useMemo(() => (data ? data.pages.map((page) => page.results).flat() : []), [data]);

  return (
    <Page banner={<PrimaryTopBox />} options={{ title: badge?.title || 'Laster...' }}>
      <Paper sx={{ margin: '-60px auto 60px', position: 'relative' }}>
        {badge && (
          <Stack direction='row' gap={1} sx={{ mb: 1, alignItems: 'center', flex: 1 }}>
            <Box
              alt={badge?.title}
              component='img'
              loading='lazy'
              src={badge?.image || ''}
              sx={{ objectFit: 'contain', px: 1, height: { xs: 55, md: 70 }, width: { xs: 55, md: 70 } }}
            />
            <Stack>
              <Typography component='h1' variant='h2'>
                {badge.title}
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', fontStyle: 'italic', fontWeight: 'bold', mt: 0.5 }} variant='subtitle2'>
                Ervervet av{' '}
                <Box component='span' sx={{ color: (theme) => theme.palette.error.main }}>
                  {badge.total_completion_percentage.toFixed(1)}%
                </Box>
              </Typography>
            </Stack>
          </Stack>
        )}
        <Typography variant='body2'>{badge?.description}</Typography>
        {badgeCategory && (
          <>
            <Typography sx={{ mt: 1, mb: 0.5, fontWeight: 'bold' }} variant='body2'>{`Del av "${badgeCategory.name}":`}</Typography>
            <BadgeCategoryItem badgeCategory={badgeCategory} />
          </>
        )}
        <Typography sx={{ mt: 1 }} variant='h3'>
          Ervervet av:
        </Typography>
        {!isLoading && !leaderboardEntries.length && <NotFoundIndicator header='Ingen har mottatt dette badget enda' />}
        {error && <Paper>{error.detail}</Paper>}
        {data !== undefined && (
          <Pagination fullWidth hasNextPage={hasNextPage} isLoading={isFetching} nextPage={() => fetchNextPage()}>
            <Stack component={List} gap={1}>
              {leaderboardEntries.map((entry) => (
                <ListItem component={Paper} disablePadding key={entry.user.user_id} noOverflow noPadding>
                  <ListItemButton component={Link} to={`${URLS.profile}${entry.user.user_id}/`}>
                    <ListItemAvatar>
                      <Avatar user={entry.user} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${entry.user.first_name} ${entry.user.last_name}`}
                      secondary={`Mottatt: ${formatDate(parseISO(entry.created_at))}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </Stack>
          </Pagination>
        )}
      </Paper>
    </Page>
  );
};

export default BadgeDetails;
