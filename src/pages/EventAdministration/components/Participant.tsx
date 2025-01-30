import parseISO from 'date-fns/parseISO';
import { cn } from 'lib/utils';
import { BadgeCheck, ChevronDown, ChevronRight, HandCoins, NutOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { formatDate, getUserAffiliation } from 'utils';

import { Registration } from 'types';

import { useEventById, useUpdateEventRegistration } from 'hooks/Event';
import { useUserStrikes } from 'hooks/User';

import StrikeCreateDialog from 'components/miscellaneous/StrikeCreateDialog';
import StrikeListItem from 'components/miscellaneous/StrikeListItem';
import { Avatar, AvatarFallback, AvatarImage } from 'components/ui/avatar';
import { Button } from 'components/ui/button';
import { Checkbox } from 'components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from 'components/ui/collapsible';
import { Label } from 'components/ui/label';
import { Separator } from 'components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'components/ui/tooltip';

import DeleteRegistration from './DeleteRegistration';
import MoveParticipant from './MoveParticipant';

export type ParticipantProps = {
  eventId: number;
  registration: Registration;
};

const Participant = ({ registration, eventId }: ParticipantProps) => {
  const updateRegistration = useUpdateEventRegistration(eventId);
  const [checkedState, setCheckedState] = useState(registration.has_attended);
  const [expanded, setExpanded] = useState(false);
  const { data: event } = useEventById(eventId);

  useEffect(() => {
    setCheckedState(registration.has_attended);
  }, [registration]);

  const handleAttendedCheck = (checked: boolean) => {
    setCheckedState(checked);
    updateRegistration.mutate(
      { registration: { has_attended: checked }, userId: registration.user_info.user_id },
      {
        onSuccess: () => {
          toast.success(`${registration.user_info.first_name} ${registration.user_info.last_name} ble satt til ${!checked ? 'ikke ' : ''}ankommet`);
        },
        onError: () => {
          toast.error('Klarer ikke å endre ankomststatus');
          setCheckedState(!checked);
        },
      },
    );
  };

  const StrikesInfo = () => {
    const { data = [] } = useUserStrikes(registration.user_info.user_id);

    return (
      <div className='space-y-2'>
        <h1>{`Alle prikker (${data.reduce((val, strike) => val + strike.strike_size, 0)}):`}</h1>
        <div className='space-y-4'>
          <div className='space-y-2'>
            {data.map((strike) => (
              <StrikeListItem key={strike.id} strike={strike} user={registration.user_info} />
            ))}
          </div>
          {!data.length && (
            <h1 className='text-sm text-muted-foreground text-center'>
              {`${registration.user_info.first_name} ${registration.user_info.last_name} har ingen aktive prikker`}
            </h1>
          )}
          <StrikeCreateDialog eventId={eventId} userId={registration.user_info.user_id} />
        </div>
      </div>
    );
  };

  const UserAvatar = () => (
    <Avatar>
      <AvatarImage alt={registration.user_info.first_name} src={registration.user_info.image} />
      <AvatarFallback>{registration.user_info.first_name[0] + registration.user_info.last_name[0]}</AvatarFallback>
    </Avatar>
  );

  return (
    <Collapsible className='w-full bg-white dark:bg-inherit border border-secondary rounded-md' onOpenChange={setExpanded} open={expanded}>
      <CollapsibleTrigger asChild>
        <Button
          className={cn(
            'whitespace-normal py-8 w-full rounded-t-md rounded-b-none bg-white dark:bg-inherit dark:hover:bg-secondary border-none flex justify-between items-center rounded-sm',
            expanded && 'rounded-b-none',
          )}
          variant='outline'>
          <div className='flex items-center space-x-4'>
            <UserAvatar />
            <div className='text-start break-words'>
              <h1>
                {registration.user_info.first_name} {registration.user_info.last_name}
              </h1>
              <h1 className='text-sm hidden md:block'>{getUserAffiliation(registration.user_info)}</h1>
              <div className='text-muted-foreground '>
                {registration.user_info.allergy !== '' ? (
                  <>
                    <div className='flex gap-1 items-center'>
                      <NutOff className='w-3.5 h-3.5 stroke-[1.5px] text-muted-foreground float-left shrink-0' />
                      <span className='break-words line-clamp-1'> {registration.user_info.allergy}</span>
                    </div>
                  </>
                ) : (
                  ''
                )}
              </div>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            {event?.is_paid_event && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HandCoins className={cn('w-5 h-5 stroke-[1.5px]', registration.has_paid_order ? 'text-emerald-700' : 'text-red-700')} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{registration.has_paid_order ? 'Deltager har betalt' : 'Deltager har ikke betalt'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {!registration.is_on_wait && checkedState && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <BadgeCheck className='w-5 h-5 stroke-[1.5px] text-emerald-700' />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Deltager har ankommet</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {expanded ? <ChevronDown className='stroke-[1.5px]' /> : <ChevronRight className='stroke-[1.5px]' />}
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className='border border-t-secondary border-b-0 border-x-0 p-4'>
        <div className='space-y-4'>
          <div className='space-y-2 md:space-y-0 md:flex md:items-center md:justify-between'>
            <div className='text-sm space-y-1'>
              <h1>Epost: {registration.user_info.email}</h1>
              <h1>Påmeldt: {formatDate(parseISO(registration.created_at))}</h1>
              <h1>Allergier: {registration.user_info.allergy.length > 0 ? registration.user_info.allergy : 'Ingen allergier'}</h1>
            </div>

            {!registration.is_on_wait && (
              <label
                className='w-full md:w-auto flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer hover:border-primary shrink-0'
                htmlFor={registration.user_info.user_id}>
                <Checkbox checked={checkedState} id={registration.user_info.user_id} onCheckedChange={(checked) => handleAttendedCheck(Boolean(checked))} />
                <div className='space-y-1 leading-none'>
                  <Label>Ankommet? </Label>
                  <p className='text-sm text-muted-foreground'>Marker om deltager har ankommet</p>
                </div>
              </label>
            )}
          </div>

          <div className='space-y-2 md:space-y-0 md:flex md:items-center md:space-x-4'>
            {registration.is_on_wait && event && event.list_count >= event.limit ? (
              <MoveParticipant checkedState={checkedState} eventId={eventId} isOnWait={registration.is_on_wait} />
            ) : registration.is_on_wait && event && event.list_count <= event.limit ? (
              <MoveParticipant checkedState={checkedState} eventId={eventId} isOnWait={registration.is_on_wait} userId={registration.user_info.user_id} />
            ) : (
              <MoveParticipant checkedState={checkedState} eventId={eventId} isOnWait={registration.is_on_wait} userId={registration.user_info.user_id} />
            )}

            <DeleteRegistration eventId={eventId} userInfo={registration.user_info} />
          </div>
        </div>

        <Separator className='my-4' />

        <StrikesInfo />
      </CollapsibleContent>
    </Collapsible>
  );
};

export default Participant;
