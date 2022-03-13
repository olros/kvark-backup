import Grid from '@mui/material/Grid';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useUserGroups } from 'hooks/User';

import GroupItem, { GroupItemLoading } from 'pages/Groups/overview/GroupItem';

import NotFoundIndicator from 'components/miscellaneous/NotFoundIndicator';

const ProfileGroups = () => {
  const { userId } = useParams();
  const { data } = useUserGroups(userId);
  const groups = useMemo(() => data || [], [data]);
  if (!data) {
    return (
      <Grid container spacing={1}>
        <Grid item md={6} xs={12}>
          <GroupItemLoading />
        </Grid>
      </Grid>
    );
  } else if (!groups.length) {
    return <NotFoundIndicator header='Fant ingen grupper' subtitle={`${userId ? 'Brukeren' : 'Du'} er ikke medlem av noen grupper`} />;
  }
  return (
    <Grid container spacing={1}>
      {groups.map((group) => (
        <Grid item key={group.slug} md={6} xs={12}>
          <GroupItem group={group} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProfileGroups;
