import CopyIcon from '@mui/icons-material/FileCopyOutlined';
import { Alert, AlertTitle, Box, Button, Checkbox, Divider, FormControlLabel, LinearProgress, List, Stack, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

import { Event } from 'types';

import { useEventById, useEventRegistrations } from 'hooks/Event';
import { useSnackbar } from 'hooks/Snackbar';

import EventGiftCardSender from 'pages/EventAdministration/components/EventGiftCardSender';
import EventMessageSender from 'pages/EventAdministration/components/EventMessageSender';
import EventStatistics from 'pages/EventAdministration/components/EventStatistics';
import Participant from 'pages/EventAdministration/components/Participant';

import Pagination from 'components/layout/Pagination';

type RegistrationsProps = {
  onWait?: boolean;
  eventId: Event['id'];
};

const Registrations = ({ onWait = false, eventId }: RegistrationsProps) => {
  const [showOnlyNotAttended, setShowOnlyNotAttended] = useState(false);
  const { data, hasNextPage, isFetching, isLoading, fetchNextPage } = useEventRegistrations(eventId, { is_on_wait: onWait });
  const registrations = useMemo(
    () =>
      data
        ? data.pages
            .map((page) => page.results)
            .flat()
            .filter((registration) => !showOnlyNotAttended || !registration.has_attended)
        : [],
    [data, showOnlyNotAttended],
  );
  const showSnackbar = useSnackbar();

  const getEmails = useCallback(() => {
    let emails = '';
    const participants = registrations;
    participants.forEach((participant, i) => {
      emails += participant.user_info.email;
      if (i < participants.length - 1) {
        emails += ' \n';
      }
    });
    return emails;
  }, [registrations]);

  const copyEmails = () => {
    const tempInput = document.createElement('textarea');
    tempInput.value = getEmails();
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showSnackbar('Epostene ble kopiert til utklippstavlen', 'info');
  };

  return (
    <>
      <Stack direction='row' sx={{ mt: 2, justifyContent: 'space-between' }}>
        <Typography variant='h3'>{`${onWait ? 'Venteliste' : 'Påmeldte'} (${data?.pages[0]?.count || 0})`}</Typography>
        {!onWait && (
          <FormControlLabel
            control={<Checkbox checked={showOnlyNotAttended} onChange={(e) => setShowOnlyNotAttended(e.target.checked)} sx={{ my: -0.75 }} />}
            label='Ikke ankommet'
            labelPlacement='start'
          />
        )}
      </Stack>
      {isLoading ? null : registrations.length ? (
        <>
          <Stack direction='row' sx={{ justifyContent: 'space-between' }}>
            <Typography variant='caption'>Detaljer</Typography>
            {!onWait && <Typography variant='caption'>Ankommet</Typography>}
          </Stack>
          <Pagination fullWidth hasNextPage={hasNextPage} isLoading={isFetching} nextPage={() => fetchNextPage()}>
            <List dense disablePadding>
              {registrations.map((registration) => (
                <Participant eventId={eventId} key={registration.registration_id} registration={registration} />
              ))}
            </List>
            {!onWait && !hasNextPage && (
              <>
                <Alert color='warning' sx={{ mb: 1 }} variant='outlined'>
                  <AlertTitle>Sende epost?</AlertTitle>
                  Bruk &quot;Send epost til deltagere&quot; hvis du kan. Det er lurt at alle eposter kommer fra samme epost og ser like ut for at brukerne skal
                  stole på eposter som mottas. Våre eposter havner heller ikke i søppelpost. Kopier alle eposter kun om du virkelig er nødt til å sende epost
                  selv.
                </Alert>
                <Button endIcon={<CopyIcon />} fullWidth onClick={copyEmails} variant='outlined'>
                  Kopier alle eposter
                </Button>
              </>
            )}
          </Pagination>
        </>
      ) : (
        <Typography>{onWait ? 'Ingen på ventelisten' : 'Ingen påmeldte'}</Typography>
      )}
    </>
  );
};

export type EventParticipantsProps = {
  eventId: Event['id'];
};

const EventParticipants = ({ eventId }: EventParticipantsProps) => {
  const { data, isLoading } = useEventById(eventId);

  if (isLoading) {
    return <LinearProgress />;
  }

  return (
    <>
      <Typography variant='h2'>{data?.title || 'Laster...'}</Typography>
      <Divider sx={{ my: 1 }} />
      <div>
        <Typography variant='h3'>Statistikk</Typography>
        <Box sx={{ pt: 1, pb: 2 }}>
          <EventStatistics eventId={eventId} />
        </Box>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mb: 1 }}>
          <EventMessageSender eventId={eventId} />
          <EventGiftCardSender eventId={eventId} />
        </Stack>
        <Registrations eventId={eventId} />
        <Registrations eventId={eventId} onWait />
      </div>
    </>
  );
};

export default EventParticipants;
