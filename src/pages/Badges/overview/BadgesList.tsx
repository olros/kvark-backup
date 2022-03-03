import { Alert, Box } from '@mui/material';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useBadges } from 'hooks/Badge';

import BadgeItem, { BadgeItemLoading } from 'pages/Badges/components/BadgeItem';

import Pagination from 'components/layout/Pagination';
import Paper from 'components/layout/Paper';
import NotFoundIndicator from 'components/miscellaneous/NotFoundIndicator';

export const BadgesList = () => {
  const { categoryId } = useParams<'categoryId'>();
  const { data, error, hasNextPage, fetchNextPage, isLoading, isFetching } = useBadges({ badge_category: categoryId });
  const badges = useMemo(() => (data ? data.pages.map((page) => page.results).flat() : []), [data]);

  return (
    <>
      <Alert severity='info' sx={{ my: 1 }} variant='outlined'>
        Her vises kun offentlige badges. Det kan finnes andre badges som er mulig å få, men som ikke vises her for å hindre at det blir for lett å finne dem.
      </Alert>
      {isLoading && <BadgeItemLoading />}
      {!isLoading && !badges.length && <NotFoundIndicator header='Fant ingen offentlige badges' />}
      {error && <Paper>{error.detail}</Paper>}
      {data !== undefined && (
        <Pagination fullWidth hasNextPage={hasNextPage} isLoading={isFetching} nextPage={() => fetchNextPage()}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1, mb: 1 }}>
            {badges.map((badge) => (
              <BadgeItem badge={badge} key={badge.id} />
            ))}
          </Box>
        </Pagination>
      )}
    </>
  );
};

export default BadgesList;
