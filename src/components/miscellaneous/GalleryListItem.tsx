import { Link } from 'react-router-dom';
import URLS from 'URLS';
import { Gallery } from 'types';

// Material UI Components
import { Box, Typography, BoxProps, Skeleton, touchRippleClasses, ButtonBase } from '@mui/material';

// Project components
import AspectRatioImg, { AspectRatioLoading } from 'components/miscellaneous/AspectRatioImg';
import Paper from 'components/layout/Paper';

export type NewsListItemProps = {
  album: Gallery;
  sx?: BoxProps['sx'];
};

const GalleryListItem = ({ album, sx }: NewsListItemProps) => (
  <Box sx={{ height: 'fit-content', overflow: 'hidden', ...sx }}>
    <ButtonBase
      component={Link}
      focusRipple
      // TODO: fjern display: block når flere nettlesere støtter aspect-ratio i css - https://caniuse.com/mdn-css_properties_aspect-ratio
      sx={{ borderRadius: (theme) => `${theme.shape.borderRadius}px`, display: 'block' }}
      tabIndex={-1}
      to={`${URLS.gallery}${album.slug}/`}>
      <AspectRatioImg alt={album.image_alt || album.title} borderRadius className={touchRippleClasses.root} src={album.image} />
    </ButtonBase>
    <ButtonBase
      component={Link}
      focusRipple
      sx={{ borderRadius: (theme) => `${theme.shape.borderRadius}px`, width: '80%', margin: '-40px auto 0', position: 'relative', display: 'block' }}
      to={`${URLS.gallery}${album.slug}/`}>
      <Paper elevation={0} sx={{ textAlign: 'center', p: 1, width: '100%' }}>
        <Typography
          sx={{ fontSize: { xs: '1.4rem', md: '1.5rem' }, textTransform: 'none', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}
          variant='h2'>
          {album.title}
        </Typography>
        <Typography sx={{ overflow: 'hidden', WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical' }} variant='body2'>
          {album.description}
        </Typography>
      </Paper>
    </ButtonBase>
  </Box>
);

export default GalleryListItem;

export const GalleryListItemLoading = ({ sx }: Pick<NewsListItemProps, 'sx'>) => (
  <Box sx={{ textDecoration: 'none', ...sx }}>
    <AspectRatioLoading borderRadius />
    <Paper elevation={0} sx={{ textAlign: 'center', p: 1, width: '80%', margin: '-40px auto 0', position: 'relative' }}>
      <Typography
        sx={{ fontSize: { xs: '1.4rem', md: '1.5rem' }, textTransform: 'none', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}
        variant='h2'>
        <Skeleton sx={{ margin: 'auto' }} width='70%' />
      </Typography>
      <Typography variant='caption'>
        <Skeleton sx={{ margin: 'auto' }} width='30%' />
      </Typography>
      <Typography variant='body2'>
        <Skeleton sx={{ margin: 'auto' }} width='80%' />
        <Skeleton sx={{ margin: 'auto' }} width='60%' />
      </Typography>
    </Paper>
  </Box>
);
