import ParticipantsIcon from '@mui/icons-material/PeopleRounded';
import { IconButton, IconButtonProps, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import URLS from 'URLS';

import { Event } from 'types';

import { usePublicEventRegistrations } from 'hooks/Event';

import Dialog from 'components/layout/Dialog';
import Pagination from 'components/layout/Pagination';
import Paper from 'components/layout/Paper';
import Avatar from 'components/miscellaneous/Avatar';
import NotFoundIndicator from 'components/miscellaneous/NotFoundIndicator';

export type EventPublicRegistrationsListProps = IconButtonProps & {
  eventId: Event['id'];
};

const EventPublicRegistrationsList = ({ eventId, ...props }: EventPublicRegistrationsListProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading, isError, error, hasNextPage, fetchNextPage, isFetching } = usePublicEventRegistrations(eventId, { enabled: isOpen });
  const registrations = useMemo(() => (data ? data.pages.map((page) => page.results).flat() : []), [data]);

  return (
    <>
      <Tooltip title='Se deltagerliste'>
        <IconButton {...props} onClick={() => setIsOpen(true)}>
          <ParticipantsIcon />
        </IconButton>
      </Tooltip>
      <Dialog
        contentText='Oversikt over påmeldte til dette arrangementet. Du kan selv bestemme om du ønsker å stå oppført her med fullt navn eller som anonym gjennom innstillingene i din profil.'
        onClose={() => setIsOpen(false)}
        open={isOpen}
        titleText='Deltagerliste'>
        <Pagination fullWidth hasNextPage={hasNextPage} isLoading={isFetching} label='Last flere deltagere' nextPage={() => fetchNextPage()}>
          {isError && <Typography>Noe gikk galt: {error?.detail}</Typography>}
          {!isLoading && !registrations.length && !isError && <NotFoundIndicator header='Ingen brukere er påmeldt dette arrangementet' />}
          <Stack component={List} gap={1}>
            {registrations.map((registration, index) => (
              <ListItem component={Paper} dense disablePadding key={index} noOverflow noPadding>
                {registration.user_info ? (
                  <ListItemButton component={Link} to={`${URLS.profile}${registration.user_info.user_id}/`}>
                    <ListItemAvatar>
                      <Avatar user={registration.user_info} />
                    </ListItemAvatar>
                    <ListItemText primary={`${registration.user_info.first_name} ${registration.user_info.last_name}`} />
                  </ListItemButton>
                ) : (
                  <Stack direction='row' sx={{ alignItems: 'center', px: 2, py: 0.5 }}>
                    <ListItemAvatar>
                      <Avatar user={{ first_name: '?', last_name: '', image: '' }} />
                    </ListItemAvatar>
                    <ListItemText primary='Anonym' />
                  </Stack>
                )}
              </ListItem>
            ))}
            {(isFetching || isLoading) && (
              <ListItem component={Paper} dense noPadding>
                <ListItemAvatar>
                  <Avatar />
                </ListItemAvatar>
                <ListItemText primary={<Skeleton height={30} width={150} />} />
              </ListItem>
            )}
          </Stack>
        </Pagination>
      </Dialog>
    </>
  );
};

export default EventPublicRegistrationsList;
