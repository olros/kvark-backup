import BadgesIcon from '@mui/icons-material/EmojiEventsRounded';
import LeaderboardIcon from '@mui/icons-material/LeaderboardRounded';
import { Box, Stack, Typography } from '@mui/material';
import { Suspense } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import URLS from 'URLS';

import { useBadgeCategory } from 'hooks/Badge';

import Paper from 'components/layout/Paper';
import { RouterTabs } from 'components/layout/Tabs';
import { PrimaryTopBox } from 'components/layout/TopBox';
import AspectRatioImg from 'components/miscellaneous/AspectRatioImg';
import Page from 'components/navigation/Page';

const BadgeCategory = () => {
  const { categoryId } = useParams<'categoryId'>();
  const { data } = useBadgeCategory(categoryId || '_');
  const leaderboardTab = { to: URLS.badges.category_leaderboard(categoryId || '_'), label: 'Ledertavle', icon: LeaderboardIcon };
  const badgesTab = { to: URLS.badges.category_badges(categoryId || '_'), label: 'Offentlige badges', icon: BadgesIcon };
  const tabs = [leaderboardTab, badgesTab];

  return (
    <Page banner={<PrimaryTopBox />} options={{ title: data?.name || 'Laster...' }}>
      <Paper sx={{ margin: '-60px auto 60px', position: 'relative' }}>
        <Stack direction='row' gap={1} sx={{ alignItems: 'center', flex: 1 }}>
          <Box sx={{ display: 'block', height: { xs: 45, md: 70 }, width: { xs: 45, md: 70 } }}>
            <AspectRatioImg alt={data?.image_alt || ''} borderRadius ratio={1} src={data?.image || ''} />
          </Box>
          <Typography variant='h1'>{data?.name}</Typography>
        </Stack>
        <RouterTabs tabs={tabs} />
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </Paper>
    </Page>
  );
};

export default BadgeCategory;
