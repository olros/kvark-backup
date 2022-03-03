import { PictureAsPdfRounded } from '@mui/icons-material/';
import { Button } from '@mui/material';
import { useState } from 'react';

import { Event } from 'types';

import { useSendGiftCardsToAttendees } from 'hooks/Event';
import { useSnackbar } from 'hooks/Snackbar';

// Project components
import FileUploader from 'components/inputs/FileUploader';
import Dialog from 'components/layout/Dialog';

export type EventFileSenderProps = {
  eventId: Event['id'];
};

const EventGiftCardSender = ({ eventId }: EventFileSenderProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const showSnackbar = useSnackbar();
  const [files, setFiles] = useState<File[]>([]);

  const sendEmail = useSendGiftCardsToAttendees(eventId);

  const submit = () => {
    if (sendEmail.isLoading || !files) {
      return;
    }
    sendEmail.mutate(
      { files },
      {
        onSuccess: (data) => {
          showSnackbar(data.detail, 'success');
          setDialogOpen(false);
        },
        onError: (error) => showSnackbar(error.detail, 'error'),
      },
    );
  };

  return (
    <>
      <Button endIcon={<PictureAsPdfRounded />} fullWidth onClick={() => setDialogOpen(true)} variant='outlined'>
        Send gavekort til deltagere
      </Button>
      <Dialog
        contentText='Send et gavekort på epost til alle deltagere som er merket som ankommet.'
        onClose={() => setDialogOpen(false)}
        open={dialogOpen}
        titleText='Send gavekort til deltagere'>
        <FileUploader files={files} fileTypes={['application/pdf']} setFiles={setFiles} title='Last opp eller dra gavekort hit.' />
        <Button disabled={files.length < 1 || sendEmail.isLoading} fullWidth onClick={submit} variant='contained'>
          Send Gavekort
        </Button>
      </Dialog>
    </>
  );
};

export default EventGiftCardSender;
