import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import URLS from 'URLS';

import { BadgeCategory } from 'types';

import Paper from 'components/layout/Paper';
import AspectRatioImg from 'components/miscellaneous/AspectRatioImg';

export type BadgeItemProps = {
  badgeCategory: BadgeCategory;
};

const BadgeCategoryItem = ({ badgeCategory }: BadgeItemProps) => (
  <ListItem component={Paper} disablePadding key={badgeCategory.id} noOverflow noPadding>
    <ListItemButton component={Link} to={URLS.badges.category_leaderboard(badgeCategory.id)}>
      <ListItemIcon>
        <AspectRatioImg
          alt={badgeCategory.name}
          ratio={1}
          src={badgeCategory.image || ''}
          sx={{ height: 100, borderRadius: (theme) => `${theme.shape.borderRadius}px`, mr: 1 }}
        />
      </ListItemIcon>
      <ListItemText primary={badgeCategory.name} secondary={badgeCategory.description} />
    </ListItemButton>
  </ListItem>
);

export default BadgeCategoryItem;
