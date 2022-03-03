import { Box } from '@mui/material';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useUserBadges } from 'hooks/User';

import BadgeItem, { BadgeItemLoading } from 'pages/Badges/components/BadgeItem';

import Pagination from 'components/layout/Pagination';
import NotFoundIndicator from 'components/miscellaneous/NotFoundIndicator';

const ProfileBadges = () => {
  const { userId } = useParams();
  const { data, hasNextPage, fetchNextPage, isLoading, isFetching } = useUserBadges(userId);
  const badges = useMemo(() => (data !== undefined ? data.pages.map((page) => page.results).flat(1) : []), [data]);

  return (
    <Pagination fullWidth hasNextPage={hasNextPage} isLoading={isFetching} label='Last flere badges' nextPage={() => fetchNextPage()}>
      {!isLoading && !badges && <NotFoundIndicator header='Fant ingen badges' subtitle={`${userId ? 'Brukeren' : 'Du'} har ingen badges enda`} />}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 1, mb: 1 }}>
        {isLoading && (
          <>
            <BadgeItemLoading />
            <BadgeItemLoading />
          </>
        )}
        {badges.map((badge) => (
          <BadgeItem badge={badge} key={badge.id} />
        ))}
      </Box>
    </Pagination>
  );
};

export default ProfileBadges;
