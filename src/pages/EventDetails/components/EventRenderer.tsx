import CalendarIcon from '@mui/icons-material/EventRounded';
import { Alert, Button, Collapse, Skeleton, Stack, styled, Theme, Typography, useMediaQuery } from '@mui/material';
import { addHours, formatDistanceToNowStrict, isFuture, isPast, parseISO, subHours } from 'date-fns';
import nbLocale from 'date-fns/locale/nb';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import URLS from 'URLS';
import { formatDate, getICSFromEvent, getStrikesDelayedRegistrationHours } from 'utils';

import { Event, Registration } from 'types';

import { useCategories } from 'hooks/Categories';
import { useDeleteEventRegistration, useEventRegistration } from 'hooks/Event';
import { useSetRedirectUrl } from 'hooks/Misc';
import { useSnackbar } from 'hooks/Snackbar';
import { useUser } from 'hooks/User';
import { useAnalytics, useInterval } from 'hooks/Utils';

import EventPriorities from 'pages/EventDetails/components/EventPriorities';
import EventPublicRegistrationsList from 'pages/EventDetails/components/EventPublicRegistrationsList';
import EventRegistration from 'pages/EventDetails/components/EventRegistration';
import { EventsSubscription } from 'pages/Profile/components/ProfileEvents';

import FormUserAnswers from 'components/forms/FormUserAnswers';
import Expand from 'components/layout/Expand';
import Paper from 'components/layout/Paper';
import VerifyDialog from 'components/layout/VerifyDialog';
import AspectRatioImg, { AspectRatioLoading } from 'components/miscellaneous/AspectRatioImg';
import DetailContent, { DetailContentLoading } from 'components/miscellaneous/DetailContent';
import MarkdownRenderer from 'components/miscellaneous/MarkdownRenderer';
import QRButton from 'components/miscellaneous/QRButton';
import ShareButton from 'components/miscellaneous/ShareButton';

const DetailsPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  display: 'grid',
  gap: theme.spacing(1),
}));

const ContentPaper = styled(Paper)({
  height: 'fit-content',
  overflowX: 'auto',
});

const DetailsHeader = styled(Typography)({
  fontSize: '1.5rem',
});

export type EventRendererProps = {
  data: Event;
  preview?: boolean;
};

enum Views {
  Info,
  Apply,
}

const EventRenderer = ({ data, preview = false }: EventRendererProps) => {
  const { event } = useAnalytics();
  const { data: user } = useUser();
  const { data: registration } = useEventRegistration(data.id, preview || !user ? '' : user.user_id);
  const deleteRegistration = useDeleteEventRegistration(data.id);
  const setLogInRedirectURL = useSetRedirectUrl();
  const showSnackbar = useSnackbar();
  const { data: categories = [] } = useCategories();
  const [view, setView] = useState<Views>(Views.Info);
  const startDate = parseISO(data.start_date);
  const endDate = parseISO(data.end_date);
  const strikesDelayedRegistrationHours = user ? getStrikesDelayedRegistrationHours(user.number_of_strikes) : 0;
  const startRegistrationDate = parseISO(data.start_registration_at);
  const userStartRegistrationDate = addHours(startRegistrationDate, data.enforces_previous_strikes ? strikesDelayedRegistrationHours : 0);
  const endRegistrationDate = parseISO(data.end_registration_at);
  const signOffDeadlineDate = parseISO(data.sign_off_deadline);
  const lgDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));

  const signOff = async () => {
    if (user) {
      deleteRegistration.mutate(user.user_id, {
        onSuccess: (response) => {
          showSnackbar(response.detail, 'success');
          setView(Views.Info);
          event('unregistered', 'event-registration', `Unregistered for event: ${data.title}`);
        },
        onError: (e) => {
          showSnackbar(e.detail, 'error');
        },
      });
    }
  };

  type RegistrationInfoProps = { registration: Registration };

  const RegistrationInfo = ({ registration }: RegistrationInfoProps) => {
    const unregisteringGivesStrike = isPast(signOffDeadlineDate) && !registration.is_on_wait && data.can_cause_strikes;
    return (
      <>
        {registration.is_on_wait ? (
          <>
            <Alert severity='info' variant='outlined'>
              Du står på ventelisten, vi gir deg beskjed hvis du får plass
            </Alert>
            {registration.survey_submission.answers.length > 0 && (
              <Expand flat header='Dine svar på spørsmål'>
                <FormUserAnswers submission={registration.survey_submission} />
              </Expand>
            )}
          </>
        ) : (
          <>
            <Alert severity='success' variant='outlined'>
              {`Du har ${registration.has_attended ? 'deltatt' : 'plass'} på arrangementet!`}
            </Alert>
            <QRButton fullWidth qrValue={registration.user_info.user_id} subtitle={`${registration.user_info.first_name} ${registration.user_info.last_name}`}>
              Påmeldingsbevis
            </QRButton>
            {registration.survey_submission.answers.length > 0 && (
              <div>
                <Expand flat header='Påmeldingsspørsmål'>
                  <FormUserAnswers submission={registration.survey_submission} />
                </Expand>
              </div>
            )}
            {registration.has_unanswered_evaluation && (
              <>
                <Alert severity='warning' variant='outlined'>
                  Du har ikke svart på evalueringen av dette arrangementet. Du må svare på den før du kan melde deg på flere arrangementer.
                </Alert>
                <Button component={Link} fullWidth to={`${URLS.form}${data.evaluation}/`} variant='contained'>
                  Svar på evaluering
                </Button>
              </>
            )}
          </>
        )}
        {isFuture(subHours(parseISO(data.start_date), 2)) ? (
          <>
            <VerifyDialog
              color='error'
              contentText={`Om du melder deg på igjen vil du havne på bunnen av en eventuell venteliste. ${
                unregisteringGivesStrike ? 'Du vil også få 1 prikk for å melde deg av etter avmeldingsfristen.' : ''
              }`}
              fullWidth
              onConfirm={signOff}
              variant='outlined'>
              Meld deg av
            </VerifyDialog>
            {unregisteringGivesStrike && (
              <Alert severity='info' variant='outlined'>
                Avmeldingsfristen har passert. Du kan allikevel melde deg av frem til 2 timer før arrangementsstart, men du vil da få 1 prikk.
              </Alert>
            )}
          </>
        ) : (
          <Alert severity='info' variant='outlined'>
            Det er ikke lenger mulig å melde seg av arrangementet
          </Alert>
        )}
      </>
    );
  };

  const HasUnansweredEvaluations = () =>
    user?.unanswered_evaluations_count ? (
      <Alert severity='error' variant='outlined'>
        {`Du må svare på ${user.unanswered_evaluations_count} ubesvarte evalueringsskjemaer før du kan melde deg på flere arrangementer. Du finner dine ubesvarte evalueringsskjemaer under "Spørreskjemaer" i profilen.`}
      </Alert>
    ) : null;

  const ApplyInfo = () => {
    const [notOpenText, setNotOpenText] = useState<string | null>(
      isFuture(userStartRegistrationDate) ? formatDistanceToNowStrict(userStartRegistrationDate, { addSuffix: true, locale: nbLocale }) : null,
    );

    useInterval(() => {
      if (isFuture(userStartRegistrationDate)) {
        setNotOpenText(formatDistanceToNowStrict(userStartRegistrationDate, { addSuffix: true, locale: nbLocale }));
      } else {
        !notOpenText || setNotOpenText(null);
      }
    }, 1000);

    if (preview || !data.sign_up) {
      return null;
    }
    if (data.closed) {
      return (
        <Alert severity='warning' variant='outlined'>
          Dette arrangementet er stengt. Det er derfor ikke mulig å melde seg av eller på.
        </Alert>
      );
    }
    if (notOpenText) {
      return (
        <>
          <HasUnansweredEvaluations />
          <Button disabled fullWidth variant='contained'>
            {`Påmelding åpner ${notOpenText}`}
          </Button>
        </>
      );
    }
    if (!user) {
      return isFuture(endRegistrationDate) ? (
        <Button component={Link} fullWidth onClick={() => setLogInRedirectURL(window.location.pathname)} to={URLS.login} variant='contained'>
          Logg inn for å melde deg på
        </Button>
      ) : null;
    }
    if (registration) {
      return <RegistrationInfo registration={registration} />;
    }
    if (isPast(endRegistrationDate)) {
      return null;
    }
    if (view === Views.Apply) {
      return (
        <Button fullWidth onClick={() => setView(Views.Info)} variant='outlined'>
          Se beskrivelse
        </Button>
      );
    }
    const is_prioritized =
      data.registration_priorities.some((priority) => priority.user_class === user.user_class && priority.user_study === user.user_study) &&
      (data.enforces_previous_strikes ? user.number_of_strikes < 3 : true);
    if (data.only_allow_prioritized && data.registration_priorities.length > 0 && !is_prioritized) {
      return (
        <Button disabled fullWidth variant='contained'>
          Kun åpent for prioriterte
        </Button>
      );
    }
    return (
      <>
        <HasUnansweredEvaluations />
        <Button disabled={user?.unanswered_evaluations_count > 0} fullWidth onClick={() => setView(Views.Apply)} variant='contained'>
          Meld deg på
        </Button>
      </>
    );
  };

  const Info = () => (
    <>
      <DetailsPaper noPadding>
        <DetailsHeader variant='h2'>Detaljer</DetailsHeader>
        <DetailContent info={formatDate(startDate)} title='Fra:' />
        <DetailContent info={formatDate(endDate)} title='Til:' />
        <DetailContent info={data.location} title='Sted:' />
        <DetailContent info={categories.find((c) => c.id === data.category)?.text || 'Laster...'} title='Hva:' />
        {data.organizer && <DetailContent info={<Link to={URLS.groups.details(data.organizer.slug)}>{data.organizer.name}</Link>} title='Arrangør:' />}
      </DetailsPaper>
      {data.sign_up && (
        <>
          <DetailsPaper noPadding>
            <Stack direction='row' gap={1} justifyContent='space-between' sx={{ position: 'relative' }}>
              {user && <EventPublicRegistrationsList eventId={data.id} sx={{ position: 'absolute', right: ({ spacing }) => spacing(-1) }} />}
              <DetailsHeader variant='h2'>Påmelding</DetailsHeader>
            </Stack>
            <DetailContent info={`${data.list_count}/${data.limit}`} title='Påmeldte:' />
            <DetailContent info={String(data.waiting_list_count)} title='Venteliste:' />
            {registration && isFuture(signOffDeadlineDate) ? (
              <DetailContent info={formatDate(signOffDeadlineDate)} title='Avmeldingsfrist:' />
            ) : (
              <>
                {isFuture(userStartRegistrationDate) && <DetailContent info={formatDate(startRegistrationDate)} title='Start:' />}
                {isPast(userStartRegistrationDate) && isFuture(endRegistrationDate) && <DetailContent info={formatDate(endRegistrationDate)} title='Slutt:' />}
              </>
            )}
          </DetailsPaper>
          {Boolean(data.registration_priorities.length) && (
            <DetailsPaper noPadding>
              <DetailsHeader variant='h2'>Prioritert</DetailsHeader>
              <EventPriorities priorities={data.registration_priorities} />
            </DetailsPaper>
          )}
          {data.enforces_previous_strikes ? (
            strikesDelayedRegistrationHours > 0 &&
            isFuture(userStartRegistrationDate) && (
              <Alert severity='warning' variant='outlined'>
                Du har {user?.number_of_strikes} prikker og må dermed vente {strikesDelayedRegistrationHours} timer før du kan melde deg på
              </Alert>
            )
          ) : (
            <Alert severity='info' variant='outlined'>
              Dette arrangementet håndhever ikke aktive prikker
            </Alert>
          )}
          {!data.can_cause_strikes && (
            <Alert severity='info' variant='outlined'>
              Dette arrangementet gir ikke prikker
            </Alert>
          )}
        </>
      )}
      <ApplyInfo />
    </>
  );

  const addToCalendarAnalytics = () => event('add-to-calendar', 'event', `Event: ${data.title}`);

  return (
    <Stack direction={{ xs: 'column-reverse', lg: 'row' }} gap={1} sx={{ mt: { xs: 1, lg: 2 } }}>
      <Stack gap={1} sx={{ width: '100%', maxWidth: { lg: 335 } }}>
        {!lgDown && <Info />}
        <ShareButton shareId={data.id} shareType='event' title={data.title} />
        <Button component='a' endIcon={<CalendarIcon />} href={getICSFromEvent(data)} onClick={addToCalendarAnalytics} variant='outlined'>
          Legg til i kalender
        </Button>
        {Boolean(user) && <EventsSubscription />}
        {!preview && data.permissions.write && (
          <Button component={Link} fullWidth to={`${URLS.eventAdmin}${data.id}/`} variant='outlined'>
            Endre arrangement
          </Button>
        )}
      </Stack>
      <Stack gap={1} sx={{ width: '100%' }}>
        <AspectRatioImg alt={data.image_alt || data.title} borderRadius src={data.image} />
        {lgDown && <Info />}
        <ContentPaper>
          <Typography gutterBottom sx={{ color: (theme) => theme.palette.text.primary, fontSize: '2.4rem', wordWrap: 'break-word' }} variant='h1'>
            {data.title}
          </Typography>
          <Collapse in={view === Views.Info || Boolean(registration) || preview}>
            <MarkdownRenderer value={data.description} />
          </Collapse>
          <Collapse in={view === Views.Apply && !registration && !preview} mountOnEnter>
            {user && <EventRegistration event={data} user={user} />}
          </Collapse>
        </ContentPaper>
      </Stack>
    </Stack>
  );
};

export default EventRenderer;

export const EventRendererLoading = () => (
  <Stack direction={{ xs: 'column-reverse', lg: 'row' }} gap={1} sx={{ mt: { xs: 1, lg: 2 } }}>
    <Stack gap={1} sx={{ width: '100%', maxWidth: { lg: 335 } }}>
      <DetailsPaper noPadding>
        <DetailContentLoading />
        <DetailContentLoading />
        <DetailContentLoading />
      </DetailsPaper>
      <DetailsPaper noPadding>
        <DetailContentLoading />
        <DetailContentLoading />
      </DetailsPaper>
    </Stack>
    <Stack gap={1} sx={{ width: '100%' }}>
      <AspectRatioLoading borderRadius />
      <ContentPaper>
        <Skeleton height={80} width='60%' />
        <Skeleton height={40} width={250} />
        <Skeleton height={40} width='80%' />
        <Skeleton height={40} width='85%' />
        <Skeleton height={40} width='75%' />
        <Skeleton height={40} width='90%' />
      </ContentPaper>
    </Stack>
  </Stack>
);
