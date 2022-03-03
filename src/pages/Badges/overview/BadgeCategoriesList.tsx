import { List, Stack } from '@mui/material';
import { useMemo } from 'react';

import { useBadgeCategories } from 'hooks/Badge';

import BadgeCategoryItem from 'pages/Badges/components/BadgeCategoryItem';

import Pagination from 'components/layout/Pagination';
import Paper from 'components/layout/Paper';
import NotFoundIndicator from 'components/miscellaneous/NotFoundIndicator';

export const BadgeCategoriesList = () => {
  const { data, error, hasNextPage, fetchNextPage, isLoading, isFetching } = useBadgeCategories();
  const badgeCategories = useMemo(() => (data ? data.pages.map((page) => page.results).flat() : []), [data]);

  return (
    <>
      {!isLoading && !badgeCategories && <NotFoundIndicator header='Fant ingen badge kategorier' />}
      {error && <Paper>{error.detail}</Paper>}
      {data !== undefined && (
        <Pagination fullWidth hasNextPage={hasNextPage} isLoading={isFetching} nextPage={() => fetchNextPage()}>
          <Stack component={List} gap={1}>
            {badgeCategories.map((badgeCategory) => (
              <BadgeCategoryItem badgeCategory={badgeCategory} key={badgeCategory.id} />
            ))}
          </Stack>
        </Pagination>
      )}
    </>
  );
};

export default BadgeCategoriesList;
