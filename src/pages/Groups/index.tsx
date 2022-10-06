import { Outlet } from 'react-router-dom';
import { Typography } from '@mui/material';

import GroupForm from 'pages/Groups/components/GroupForm';
import Paper from 'components/layout/Paper';
import { PrimaryTopBox } from 'components/layout/TopBox';
import Page from 'components/navigation/Page';

const Groups = () => (
  <Page banner={<PrimaryTopBox />}>
    <Paper sx={{ margin: '-60px auto 60px', position: 'relative', minHeight: 200 }}>
      <Outlet />
    </Paper>
    <div style={{ paddingBottom: '40px' }}>
      <Typography align='center' gutterBottom variant='h2'>
        Opprette en ny gruppe?
      </Typography>
      <GroupForm />
    </div>
  </Page>
);

export default Groups;
