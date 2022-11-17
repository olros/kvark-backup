import { styled, TextField } from '@mui/material';
import { useMemo } from 'react';

import { PermissionApp } from 'types/Enums';

import { useGalleries } from 'hooks/Gallery';
import { HavePermission } from 'hooks/User';

import CreateGalleryDialog from 'pages/Gallery/components/CreateGallery';

import Banner from 'components/layout/Banner';
import Pagination from 'components/layout/Pagination';
import Paper from 'components/layout/Paper';
import GalleryListItem, { GalleryListItemLoading } from 'components/miscellaneous/GalleryListItem';
import NotFoundIndicator from 'components/miscellaneous/NotFoundIndicator';
import Page from 'components/navigation/Page';

const GalleryGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gridGap: theme.spacing(1),
  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: '1fr 1fr',
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

const Galleries = () => {
  const { data, error, hasNextPage, fetchNextPage, isLoading, isFetching } = useGalleries();
  const galleries = useMemo(() => (data ? data.pages.map((page) => page.results).flat() : []), [data]);
  //const [input, setSearch] = useState('');
  return (
    <Page
      banner={
        <Banner title='Galleri'>
          <HavePermission apps={[PermissionApp.GALLERY]}>
            <CreateGalleryDialog />
          </HavePermission>
        </Banner>
      }
      options={{ title: 'Galleri' }}>
      <Paper sx={{ mb: 2 }}>
        <TextField id='outlined-basic' label='Søk etter galleri' variant='outlined'></TextField>
      </Paper>
      <GalleryGrid>
        {isLoading && <GalleryListItemLoading />}
        {!isLoading && !galleries.length && <NotFoundIndicator header='Fant ingen galleri' />}
        {error && <Paper>{error.detail}</Paper>}
        {data !== undefined && (
          <Pagination fullWidth hasNextPage={hasNextPage} isLoading={isFetching} nextPage={() => fetchNextPage()}>
            {galleries.map((galleryItem) => (
              <GalleryListItem gallery={galleryItem} key={galleryItem.id} />
            ))}
          </Pagination>
        )}
        {isFetching && <GalleryListItemLoading />}
      </GalleryGrid>
    </Page>
  );
};

export default Galleries;
