import { addHours, formatDistanceToNowStrict, isFuture, isPast, parseISO, subHours } from 'date-fns';
import nbLocale from 'date-fns/locale/nb';
import { cn } from 'lib/utils';
import { CalendarIcon, HandCoinsIcon, Heart, LoaderCircle, PencilIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import URLS from 'URLS';
import { formatDate, getICSFromEvent, getStrikesDelayedRegistrationHours } from 'utils';

import { Event, Registration } from 'types';

import { useConfetti } from 'hooks/Confetti';
import {
  useCreateEventRegistration,
  useDeleteEventRegistration,
  useEventIsFavorite,
  useEventRegistration,
  useEventSetIsFavorite,
  useUpdateEventRegistration,
} from 'hooks/Event';
import useMediaQuery, { MEDIUM_SCREEN } from 'hooks/MediaQuery';
import { useSetRedirectUrl } from 'hooks/Misc';
import { useUser } from 'hooks/User';
import { useAnalytics, useInterval } from 'hooks/Utils';

import CountdownTimer from 'pages/EventDetails/components/CountdownTimer';
import EventPriorityPools from 'pages/EventDetails/components/EventPriorityPools';
import EventPublicRegistrationsList from 'pages/EventDetails/components/EventPublicRegistrationsList';
import { EventsSubscription } from 'pages/Profile/components/ProfileEvents';

import FormUserAnswers from 'components/forms/FormUserAnswers';
import DetailContent from 'components/miscellaneous/DetailContent';
import MarkdownRenderer from 'components/miscellaneous/MarkdownRenderer';
import QRButton from 'components/miscellaneous/QRButton';
import { ReactionHandler } from 'components/miscellaneous/reactions/ReactionHandler';
import ShareButton from 'components/miscellaneous/ShareButton';
import UpdatedAgo from 'components/miscellaneous/UpdatedAgo';
import { Alert, AlertDescription } from 'components/ui/alert';
import { Button } from 'components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { Checkbox } from 'components/ui/checkbox';
import Expandable from 'components/ui/expandable';
import ResponsiveAlertDialog from 'components/ui/responsive-alert-dialog';
import { Skeleton } from 'components/ui/skeleton';

import TIHLDE_LOGO from 'assets/img/TihldeBackground.jpg';

export type EventRendererProps = {
  data: Event;
  preview?: boolean;
};

const EventRenderer = ({ data, preview = false }: EventRendererProps) => {
  const { event } = useAnalytics();
  const { data: user } = useUser();
  const { data: registration } = useEventRegistration(data.id, preview || !user ? '' : user.user_id);
  const deleteRegistration = useDeleteEventRegistration(data.id);
  const setLogInRedirectURL = useSetRedirectUrl();
  const startDate = parseISO(data.start_date);
  const endDate = parseISO(data.end_date);
  const strikesDelayedRegistrationHours = user ? getStrikesDelayedRegistrationHours(user.number_of_strikes) : 0;
  const startRegistrationDate = parseISO(data.start_registration_at);
  const userStartRegistrationDate = addHours(startRegistrationDate, data.enforces_previous_strikes ? strikesDelayedRegistrationHours : 0);
  const endRegistrationDate = parseISO(data.end_registration_at);
  const signOffDeadlineDate = parseISO(data.sign_off_deadline);
  const updateRegistration = useUpdateEventRegistration(data.id);
  const isDesktop = useMediaQuery(MEDIUM_SCREEN);
  const [allowPhoto, setAllowPhoto] = useState<boolean>(true);
  const [isLoadingSignUp, setIsLoadingSignUp] = useState(false);

  const { run } = useConfetti();
  const createRegistration = useCreateEventRegistration(data.id);

  const handleImageRuleChange = async () => {
    updateRegistration.mutate(
      { userId: user?.user_id || '', registration: { allow_photo: !allowPhoto } },
      {
        onSuccess: (newRegistration) => {
          if (newRegistration.allow_photo === true) {
            toast.success('Du tillater å bli tatt bilde av');
            setAllowPhoto(true);
          } else {
            toast.success('Du tillater ikke å bli tatt bilde av');
            setAllowPhoto(false);
          }
        },
        onError: () => {
          toast.error('Endringen ble ikke registrert');
        },
      },
    );
  };

  useEffect(() => {
    setAllowPhoto(registration?.allow_photo || true);
  }, [registration]);

  const signUp = async () => {
    setIsLoadingSignUp(true);
    createRegistration.mutate(
      {},
      {
        onSuccess: () => {
          run();
          toast.success('Påmeldingen var vellykket');
          event('registered', 'event-registration', `Registered for event: ${data.title}`);
        },
        onError: (e) => {
          toast.error(e.detail);
        },
        onSettled: () => {
          setIsLoadingSignUp(false);
        },
      },
    );
  };

  const signOff = async () => {
    if (user) {
      deleteRegistration.mutate(user.user_id, {
        onSuccess: (response) => {
          toast.success(response.detail);
          event('unregistered', 'event-registration', `Unregistered for event: ${data.title}`);
        },
        onError: (e) => {
          toast.error(e.detail);
        },
      });
    }
  };

  type RegistrationInfoProps = { registration: Registration; event: Event };

  const RegistrationInfo = ({ registration, event }: RegistrationInfoProps) => {
    const unregisteringGivesStrike = isPast(signOffDeadlineDate) && !registration.is_on_wait && data.can_cause_strikes;
    return (
      <>
        {registration.is_on_wait ? (
          <>
            <Alert>
              <AlertDescription>
                Du står på plass {registration.wait_queue_number}/{event.waiting_list_count} på ventelisten, vi gir deg beskjed hvis du får plass
              </AlertDescription>
            </Alert>
            {registration.survey_submission.answers.length > 0 && (
              <div>
                <Expandable title='Dine svar på spørsmål'>
                  <FormUserAnswers submission={registration.survey_submission} />
                </Expandable>
              </div>
            )}
          </>
        ) : (
          <>
            {data.paid_information && !registration.has_paid_order ? (
              <Alert variant='warning'>
                <HandCoinsIcon className='stroke-[1.5px]' />
                <AlertDescription>Du er meldt på arrangementet! Men du må huske å betale</AlertDescription>
              </Alert>
            ) : (
              <>
                <Alert variant='success'>
                  <AlertDescription>{`Du har ${registration.has_attended ? 'deltatt' : 'plass'} på arrangementet!`}</AlertDescription>
                </Alert>
                <QRButton qrValue={registration.user_info.user_id} subtitle={`${registration.user_info.first_name} ${registration.user_info.last_name}`}>
                  Påmeldingsbevis
                </QRButton>
              </>
            )}
            {registration.survey_submission.answers.length > 0 && (
              <div>
                <Expandable title='Påmeldingsspørsmål'>
                  <FormUserAnswers submission={registration.survey_submission} />
                </Expandable>
              </div>
            )}
            {registration.has_unanswered_evaluation && (
              <>
                <Alert variant='warning'>
                  <AlertDescription>
                    Du har ikke svart på evalueringen av dette arrangementet. Du må svare på den før du kan melde deg på flere arrangementer.
                  </AlertDescription>
                </Alert>
                <Button asChild className='w-full text-black dark:text-white'>
                  <Link to={`${URLS.form}${data.evaluation}/`}>Svar på evaluering</Link>
                </Button>
              </>
            )}
          </>
        )}
        {isFuture(subHours(parseISO(data.start_date), 2)) && !registration.has_paid_order ? (
          <>
            <ResponsiveAlertDialog
              action={signOff}
              description='Om du melder deg av arrangementet vil du miste plassen din og eventuelt havne på venteliste om det er en. Dersom du melder deg av etter avmeldingsfristen vil du også få 1 prikk.'
              title='Meld deg av arrangementet'
              trigger={
                <Button className='w-full' variant='destructive'>
                  Meld deg av
                </Button>
              }
            />
            {unregisteringGivesStrike && (
              <Alert>
                <AlertDescription>
                  Avmeldingsfristen har passert. Du kan allikevel melde deg av frem til 2 timer før arrangementsstart, men du vil da få 1 prikk.
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <Alert>
            <AlertDescription>
              {registration.has_paid_order
                ? 'Du har betalt for arrangementet og kan ikke melde deg av.'
                : 'Det er ikke lenger mulig å melde seg av arrangementet.'}
            </AlertDescription>
          </Alert>
        )}
      </>
    );
  };

  const HasUnansweredEvaluations = () =>
    user?.unanswered_evaluations_count ? (
      <Alert variant='destructive'>
        <AlertDescription>
          {`Du må svare på ${user.unanswered_evaluations_count} ubesvarte evalueringsskjemaer før du kan melde deg på flere arrangementer. Du finner dine ubesvarte evalueringsskjemaer under "Spørreskjemaer" i profilen.`}
        </AlertDescription>
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
        <Alert variant='warning'>
          <AlertDescription>Dette arrangementet er stengt. Det er derfor ikke mulig å melde seg av eller på.</AlertDescription>
        </Alert>
      );
    }
    if (notOpenText) {
      return (
        <>
          <HasUnansweredEvaluations />
          <Button className='w-full' disabled size='lg' variant='outline'>
            {`Påmelding åpner ${notOpenText}`}
          </Button>
        </>
      );
    }
    if (!user) {
      return isFuture(endRegistrationDate) ? (
        <Button className='w-full' size='lg' variant='default'>
          <Link onClick={() => setLogInRedirectURL(window.location.pathname)} to={URLS.login}>
            Logg inn for å melde deg på
          </Link>
        </Button>
      ) : null;
    }
    if (registration) {
      return <RegistrationInfo event={data} registration={registration} />;
    }
    if (isPast(endRegistrationDate)) {
      return null;
    }

    const is_prioritized = data.priority_pools.some((pool) => pool.groups.filter((group) => !group.viewer_is_member).length === 0);
    if (data.only_allow_prioritized && data.priority_pools.length > 0 && !is_prioritized) {
      return (
        <Button className='w-full' disabled size='lg' variant='outline'>
          Kun åpent for prioriterte
        </Button>
      );
    }
    return (
      <>
        <HasUnansweredEvaluations />
        <Button className='w-full' disabled={user?.unanswered_evaluations_count > 0 || isLoadingSignUp} onClick={() => signUp()} size='lg'>
          {!isLoadingSignUp ? 'Meld deg på' : <LoaderCircle className='w-5 h-5 animate-spin' />}
        </Button>
      </>
    );
  };

  type FavoriteProps = {
    eventId: Event['id'];
  };

  const Favorite = ({ eventId }: FavoriteProps) => {
    const { data: favorite } = useEventIsFavorite(eventId);
    const updateFavorite = useEventSetIsFavorite(eventId);
    const toggleFavorite = (isFavorite: boolean) => {
      event('mark-as-favorite', 'event', `Marked event (${data.title}) as favorite`);
      updateFavorite.mutate(
        { is_favorite: isFavorite },
        {
          onSuccess: (data) => {
            toast.success(
              data.is_favorite
                ? 'Arrangementet er nå en av dine favoritter. Du kan finne dine favoritter med filtrering på arrangement-siden. Vi vil varsle deg ved påmeldingsstart.'
                : 'Arrangementet er ikke lenger en av dine favoritter',
            );
          },
          onError: (e) => {
            toast.error(e.detail);
          },
        },
      );
    };

    if (favorite) {
      return (
        <Button onClick={() => toggleFavorite(!favorite.is_favorite)} size='icon' variant='ghost'>
          <Heart className={cn('w-5 h-5 stroke-[1.5px]', favorite.is_favorite && 'text-red-500')} />
        </Button>
      );
    }
    return null;
  };

  const Info = () => (
    <>
      <Card>
        <CardHeader className='py-1 px-4'>
          <CardTitle className='flex items-center justify-between'>
            <h1>Detaljer</h1>
            {user && !preview && <Favorite eventId={data.id} />}
          </CardTitle>
        </CardHeader>
        <CardContent className='py-2 px-4 space-y-3'>
          <DetailContent info={formatDate(startDate)} title='Fra:' />
          <DetailContent info={formatDate(endDate)} title='Til:' />
          <DetailContent info={data.location} title='Sted:' />
          <DetailContent
            // TODO: Fix Event types
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            info={data.category?.text || 'Laster...'}
            title='Hva:'
          />
          {data.organizer && <DetailContent info={<Link to={URLS.groups.details(data.organizer.slug)}>{data.organizer.name}</Link>} title='Arrangør:' />}
          {data.contact_person && (
            <DetailContent
              info={
                <Link
                  className='text-blue-500 dark:text-indigo-300'
                  to={`${URLS.profile}${data.contact_person?.user_id}/`}>{`${data.contact_person?.first_name} ${data.contact_person?.last_name}`}</Link>
              }
              title='Kontaktperson:'
            />
          )}
          {data.paid_information && <DetailContent info={data.paid_information.price + ' kr'} title='Pris:' />}
        </CardContent>
      </Card>
      {data.sign_up && (
        <>
          <Card>
            <CardHeader className='py-1 px-4'>
              <CardTitle className='flex items-center justify-between'>
                <h1>Påmelding</h1>
                {user && <EventPublicRegistrationsList eventId={data.id} />}
              </CardTitle>
            </CardHeader>
            <CardContent className='py-2 px-4 space-y-3'>
              <DetailContent info={`${data.list_count}/${data.limit === 0 ? '∞' : data.limit}`} title='Påmeldte:' />
              <DetailContent info={String(data.waiting_list_count)} title='Venteliste:' />
              {registration && isFuture(signOffDeadlineDate) ? (
                <DetailContent info={formatDate(signOffDeadlineDate)} title='Avmeldingsfrist:' />
              ) : (
                <>
                  {isFuture(userStartRegistrationDate) && <DetailContent info={formatDate(startRegistrationDate)} title='Start:' />}
                  {isPast(userStartRegistrationDate) && isFuture(endRegistrationDate) && (
                    <DetailContent info={formatDate(endRegistrationDate)} title='Stenger:' />
                  )}
                </>
              )}
              
              {data.is_paid_event&&(registration?.has_paid_order || data.list_count >= data.limit) &&
              <Link to = "https://www.facebook.com/groups/598608738731749/"><Button className='my-4 w-full'>{registration?.has_paid_order?"Selg billetten din her":"Sjekk om noen selger billett her"}</Button></Link>
              }

              
      
            </CardContent>
          </Card>

          {Boolean(data.priority_pools.length) && (
            <Card>
              <CardHeader className='py-3 px-4'>
                <CardTitle>
                  <h1>Prioritert</h1>
                </CardTitle>
              </CardHeader>
              <CardContent className='py-2 px-4'>
                <EventPriorityPools priorityPools={data.priority_pools} />
              </CardContent>
            </Card>
          )}
          {data.enforces_previous_strikes ? (
            strikesDelayedRegistrationHours > 0 &&
            isFuture(userStartRegistrationDate) && (
              <Alert variant='warning'>
                <AlertDescription>
                  Du har {user?.number_of_strikes} prikker og må dermed vente {strikesDelayedRegistrationHours} timer før du kan melde deg på
                </AlertDescription>
              </Alert>
            )
          ) : (
            <Alert>
              <AlertDescription>Dette arrangementet håndhever ikke aktive prikker</AlertDescription>
            </Alert>
          )}
        </>
      )}
      <ApplyInfo />
    </>
  );

  const addToCalendarAnalytics = () => event('add-to-calendar', 'event', `Event: ${data.title}`);

  return (
    <div className='flex flex-col-reverse lg:flex-row gap-1 lg:gap-2 lg:mt-2'>
      <div className='w-full lg:max-w-[335px] space-y-2'>
        {isDesktop && <Info />}
        <Button className='flex items-center space-x-2 w-full' size='lg' variant='outline'>
          <CalendarIcon className='stroke-[1.5px] w-5 h-5' />
          <a href={getICSFromEvent(data)} onClick={addToCalendarAnalytics}>
            Legg til i kalender
          </a>
        </Button>
        {Boolean(user) && <EventsSubscription />}
        {registration && (
          <div className='flex justify-center items-center space-x-2 mt-2'>
            <Checkbox checked={allowPhoto} onCheckedChange={handleImageRuleChange} />
            <h1>Godkjenner å bli tatt bilde av</h1>
          </div>
        )}
      </div>
      <div className='space-y-2 w-full'>
        <img alt={data.image_alt || data.title} className='rounded-md aspect-auto mx-auto' src={data.image || TIHLDE_LOGO} />

        <div className='space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between'>
          <div className='flex items-center space-x-2'>
            <ShareButton shareId={data.id} shareType='event' title={data.title} />
            {!preview && data.permissions.write && (
              <Button className='w-full flex items-center space-x-2' variant='outline'>
                <PencilIcon className='w-4 h-4 md:w-5 md:h-5 stroke-[1.5px]' />
                <Link className='text-sm md:text-md text-black dark:text-white' to={`${URLS.eventAdmin}${data.id}/`}>
                  Endre arrangement
                </Link>
              </Button>
            )}
          </div>
          {!preview && data.emojis_allowed && user && <ReactionHandler content_type='event' data={data} />}
        </div>

        {!isDesktop && <Info />}
        {registration && data.paid_information && !registration.has_paid_order && !registration.is_on_wait && (
          <CountdownTimer event_id={data.id} payment_expiredate={registration.payment_expiredate} />
        )}
        <Card>
          <CardHeader className='pt-6 pb-2 px-6'>
            <CardTitle className='text-4xl break-words'>{data.title}</CardTitle>
          </CardHeader>
          <CardContent className='py-2 px-6'>
            <MarkdownRenderer value={data.description} />
          </CardContent>
        </Card>

        {data.updated_at && <UpdatedAgo updatedAt={data.updated_at} />}
      </div>
    </div>
  );
};

export default EventRenderer;

export const EventRendererLoading = () => (
  <div className='flex flex-col-reverse lg:flex-row gap-1 lg:gap-2 lg:mt-2'>
    <div className='w-full lg:max-w-[335px] space-y-2'>
      <Skeleton className='w-full h-60' />
      <Skeleton className='w-full h-32' />
      <Skeleton className='w-full h-20' />
    </div>

    <div className='space-y-2 w-full'>
      <Skeleton className='w-full h-96' />
      <Skeleton className='w-full h-60' />
    </div>
  </div>
);
