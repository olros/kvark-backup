import { useState, useEffect } from 'react';
import { Registration } from 'types/Types';
import { getUserStudyShort, formatDate } from 'utils';
import { useDeleteEventRegistration, useUpdateEventRegistration } from 'api/hooks/Event';
import parseISO from 'date-fns/parseISO';

// Material-ui
import { makeStyles, Theme } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import Collapse from '@material-ui/core/Collapse';

// Icons
import Delete from '@material-ui/icons/DeleteRounded';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownwardRounded';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpwardRounded';

// Project components
import Dialog from 'components/layout/Dialog';
import Paper from 'components/layout/Paper';

const useStyles = makeStyles((theme: Theme) => ({
  content: {
    padding: theme.spacing(2),
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
    marginBottom: 3,
    background: theme.palette.background.smoke,
  },
  userName: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  deleteButton: {
    '&:hover': {
      cursor: 'pointer',
      color: theme.palette.error.main,
    },
  },
  arrowButton: {
    marginRight: theme.spacing(1),
    '&:hover': {
      cursor: 'pointer',
      color: theme.palette.secondary.main,
    },
  },
  buttonContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  actionArea: {
    display: 'flex',
  },
  button: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  lightText: {
    color: theme.palette.text.secondary,
  },
}));

export type ParticipantProps = {
  eventId: number;
  registration: Registration;
  showEmail: boolean;
};

const Participant = ({ registration, eventId, showEmail }: ParticipantProps) => {
  const classes = useStyles();
  const updateRegistration = useUpdateEventRegistration(eventId);
  const deleteRegistration = useDeleteEventRegistration(eventId);
  const userInfo = registration.user_info;
  const [checkedState, setCheckedState] = useState(registration.has_attended);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setCheckedState(registration.has_attended);
  }, [registration]);

  const deleteHandler = async () => {
    await deleteRegistration.mutate(registration.user_info.user_id);
    setShowModal(false);
  };

  const handleAttendedCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCheckedState(event.target.checked);
    updateRegistration.mutate(
      { registration: { has_attended: event.target.checked }, userId: registration.user_info.user_id },
      {
        onError: () => {
          setCheckedState(!event.target.checked);
        },
      },
    );
  };

  const changeList = (onWait: boolean) => {
    updateRegistration.mutate({ registration: { is_on_wait: onWait }, userId: registration.user_info.user_id });
  };

  return (
    <Paper className={classes.content}>
      <Dialog
        confirmText='Ja, jeg er sikker'
        contentText={`Er du sikker på at du vil fjerne ${userInfo.first_name} ${userInfo.last_name} fra arrangementet?`}
        onClose={() => setShowModal(false)}
        onConfirm={deleteHandler}
        open={showModal}
        titleText='Er du sikker?'
      />
      <div className={classes.userName}>
        <Typography>{`${userInfo.first_name} ${userInfo.last_name}`}</Typography>
        <Typography>
          {userInfo.user_class}. klasse - {getUserStudyShort(userInfo.user_study)}
        </Typography>
        <Typography>Påmeldt: {formatDate(parseISO(registration.created_at))}</Typography>
        <Collapse in={showEmail}>
          <Typography>{registration.user_info.email}</Typography>
        </Collapse>
        {userInfo.allergy !== '' && <Typography>Allergier: {userInfo.allergy}</Typography>}
        {registration.allow_photo && !registration.allow_photo && <Typography>Vil ikke bli tatt bilde av</Typography>}
      </div>
      <div className={classes.actionArea}>
        {!registration.is_on_wait && (
          <div className={classes.buttonContainer}>
            <FormControlLabel control={<Checkbox checked={checkedState} onChange={handleAttendedCheck} />} label='Ankommet' />
          </div>
        )}
        <div className={classes.buttonContainer}>
          {registration.is_on_wait ? (
            <ArrowUpwardIcon className={classes.arrowButton} onClick={() => changeList(false)} />
          ) : (
            <ArrowDownwardIcon className={classes.arrowButton} onClick={() => changeList(true)} />
          )}
          <Delete className={classes.deleteButton} onClick={() => setShowModal(true)} />
        </div>
      </div>
    </Paper>
  );
};

export default Participant;
