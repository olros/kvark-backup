import CategoryIcon from '@mui/icons-material/CategoryRounded';
import BadgesIcon from '@mui/icons-material/EmojiEventsRounded';
import GetBadgeIcon from '@mui/icons-material/GetAppRounded';
import LeaderboardIcon from '@mui/icons-material/LeaderboardRounded';
import { Typography } from '@mui/material';
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import URLS from 'URLS';

import Paper from 'components/layout/Paper';
import { RouterTabs } from 'components/layout/Tabs';
import { PrimaryTopBox } from 'components/layout/TopBox';
import Page from 'components/navigation/Page';

const Badges = () => {
  const leaderboardTab = { to: URLS.badges.index, label: 'Ledertavle', icon: LeaderboardIcon };
  const badgesTab = { to: URLS.badges.public_badges(), label: 'Offentlige badges', icon: BadgesIcon };
  const categoriesTab = { to: URLS.badges.categories(), label: 'Kategorier', icon: CategoryIcon };
  const getTab = { to: URLS.badges.get_badge(), label: 'Erverv badge', icon: GetBadgeIcon };
  const tabs = [leaderboardTab, badgesTab, categoriesTab, getTab];

  return (
    <Page banner={<PrimaryTopBox />} options={{ title: 'Badges' }}>
      <Paper sx={{ margin: '-60px auto 60px', position: 'relative' }}>
        <Typography component='a' href='https://tihldestorage.blob.core.windows.net/textplain/cf8aaf35-4aa7-46c5-9a4d-fa835d3b6167flags.txt' variant='h1'>
          Badges
        </Typography>
        <RouterTabs tabs={tabs} />
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </Paper>
    </Page>
  );
};

export default Badges;
