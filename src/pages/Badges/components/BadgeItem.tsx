import { Box, ListItemButton, ListItemButtonProps, Skeleton, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import URLS from 'URLS';

import { Badge } from 'types';

import Paper from 'components/layout/Paper';

export type BadgeItemProps = Pick<ListItemButtonProps, 'sx'> & {
  badge: Badge;
};

const BadgeItem = ({ badge, sx }: BadgeItemProps) => (
  <ListItemButton
    component={Link}
    focusRipple
    sx={{ p: 0, height: '100%', overflow: 'hidden', borderRadius: (theme) => `${theme.shape.borderRadius}px`, ...sx }}
    to={URLS.badges.badge_leaderboard(badge.id)}>
    <Stack component={Paper} direction='row' gap={1} noOverflow sx={{ width: '100%', p: 1, textAlign: 'start', height: '100%' }}>
      <Box alt={badge.title} component='img' loading='lazy' src={badge.image || ''} sx={{ objectFit: 'contain', px: 1, width: 80, height: 80 }} />
      <Stack>
        <Typography sx={{ fontWeight: 'bold' }} variant='h3'>
          {badge.title}
        </Typography>
        <Typography variant='body2'>{badge.description}</Typography>
        <Typography sx={{ fontSize: '0.7rem', fontStyle: 'italic', fontWeight: 'bold', mt: 0.5 }} variant='subtitle2'>
          Ervervet av{' '}
          <Box component='span' sx={{ color: (theme) => theme.palette.error.main }}>
            {badge.total_completion_percentage.toFixed(1)}%
          </Box>
        </Typography>
      </Stack>
    </Stack>
  </ListItemButton>
);

export default BadgeItem;

export const BadgeItemLoading = () => (
  <Stack component={Paper} direction='row' gap={1} noOverflow sx={{ width: '100%', p: 1, textAlign: 'start', height: '100%' }}>
    <Skeleton sx={{ borderRadius: (theme) => `${theme.shape.borderRadius}px`, px: 1, width: 80, height: 80 }} variant='rectangular' />
    <Stack>
      <Typography sx={{ fontWeight: 'bold' }} variant='h3'>
        <Skeleton height={35} width={110} />
      </Typography>
      <Typography variant='body2'>
        <Skeleton width={100} />
      </Typography>
      <Typography sx={{ fontSize: '0.7rem', mt: 0.5 }} variant='subtitle2' width={140}>
        <Skeleton />
      </Typography>
    </Stack>
  </Stack>
);
