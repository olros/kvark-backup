import { ImageList, ImageListItem, Skeleton, Theme, useMediaQuery } from '@mui/material';
import { useMemo, useState } from 'react';

import { Gallery, Picture } from 'types';

import { useGalleryPictures } from 'hooks/Gallery';

import PictureDialog from 'pages/GalleryDetails/components/PictureDialog';

import Pagination from 'components/layout/Pagination';

export const GalleryRendererLoading = () => {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));

  return (
    <ImageList cols={mdDown ? 1 : lgUp ? 3 : 2} gap={8} variant='masonry'>
      {Array.from(Array(6)).map((_, i) => (
        <ImageListItem key={i} sx={{ border: 'none', width: '100%' }}>
          <Skeleton height={150} sx={{ borderRadius: (theme) => `${theme.shape.borderRadius}px` }} variant='rectangular' width='100%' />
        </ImageListItem>
      ))}
    </ImageList>
  );
};

export type GalleryRendererProps = {
  id: Gallery['id'];
};

const GalleryRenderer = ({ id }: GalleryRendererProps) => {
  const { data, hasNextPage, fetchNextPage, isFetching } = useGalleryPictures(id);
  const pictures = useMemo(() => (data ? data.pages.map((page) => page.results).flat() : []), [data]);
  const [selectedImgId, setSelectedImgId] = useState<Picture['id'] | null>(null);
  const selectedImg = useMemo(() => pictures.find((picture) => picture.id === selectedImgId), [selectedImgId, pictures]);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));

  return (
    <>
      <Pagination fullWidth hasNextPage={hasNextPage} isLoading={isFetching} nextPage={() => fetchNextPage()}>
        <ImageList cols={mdDown ? 1 : lgUp ? 3 : 2} gap={8} variant='masonry'>
          {pictures.map((image) => (
            <ImageListItem
              component='button'
              key={image.id}
              onClick={() => setSelectedImgId(image.id)}
              sx={{ cursor: 'pointer', borderRadius: '10px', border: 'none', overflow: 'hidden' }}>
              <img alt={image.image_alt} loading='lazy' src={image.image} />
            </ImageListItem>
          ))}
        </ImageList>
      </Pagination>
      {selectedImg && <PictureDialog galleryId={id} onClose={() => setSelectedImgId(null)} picture={selectedImg} />}
    </>
  );
};

export default GalleryRenderer;
