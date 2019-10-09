import React from 'react';
import PropTypes from 'prop-types';
import {shortDownString} from '../../../utils';

// Text
import Text from '../../../text/EventText';

// Material-ui
import Modal from '@material-ui/core/Modal';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
// import ButtonBase from '@material-ui/core/ButtonBase';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import {withStyles} from '@material-ui/core/styles';

// Icons
import AccountCircle from '@material-ui/icons/AccountCircle';
import Email from '@material-ui/icons/Email';
import Fastfood from '@material-ui/icons/Fastfood';
import School from '@material-ui/icons/School';
import Home from '@material-ui/icons/Home';
// import Close from '@material-ui/icons/Close';

// Project components
import EventListItem from './EventListItem';

const style = {
  paper: {
    position: 'absolute',
    maxWidth: 460,
    minWidth: 320,
    maxHeight: '75%',
    display: 'flex',
    flexDirection: 'column',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%,-50%)',
    '@media only screen and (max-width: 400px)': {
        width: '100%',
    },
  },
  heading: {
    display: 'flex',
    padding: 26,
  },
  title: {
    width: '100%',
    // paddingLeft: 40,
  },
  content: {
    padding: 20,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    overflow: 'scroll',
  },
  nestedElement: {
    paddingLeft: 32,
  },
  closeButton: {
    paddingLeft: 8,
    paddingRight: 8,
  },
  button: {
    width: '100%',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  footer: {
    padding: 26,
    textAlign: 'center',
  },
  text: {
    paddingBottom: 25,
    alignObject: 'flex-start',
  },
  progress: {
    margin: 26,
    position: 'relative',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginRight: -20,
  },
};

const getUserStudy = (userStudy) => {
  let userStudyText = '';

  switch (userStudy) {
    case 1:
      userStudyText = 'Dataing';
      break;
    case 2:
      userStudyText = 'DigFor';
      break;
    case 3:
      userStudyText = 'DigInc';
      break;
    case 4:
      userStudyText = 'DigSam';
      break;
  }

  return userStudyText;
};

const EventDialog = (props) => {
  const {classes, userData, isApplying, message} = props;

  const closeDialog = () => {
    props.applyToEvent();
  };

  const allergy = userData.allergy ?
    shortDownString(userData.allergy, 20)
    :
    'Ingen';
  const userStudy = getUserStudy(userData.user_study);
  const userClass = userData.user_class + '. Klasse';

  return (
    <Modal
      open={props.status}
      onClose={props.onClose}>
      <Paper className={classes.paper} square>
          <div className={classes.heading}>
            <Typography className={classes.title} align='center' variant='h5'>
              {Text.signUp}
            </Typography>
            {/* <ButtonBase className={classes.closeButton} onClick={props.onClose}>
              <Close />
            </ButtonBase> */}
          </div>
          <Divider />
          {!isApplying && message === '' &&
          <div className={classes.content}>
            <div className={classes.text}>
              <Typography>{Text.confirmData}</Typography>
            </div>
            <div className={classes.list}>
              <EventListItem
                icon={<AccountCircle />}
                text={'Navn: ' + userData.first_name + ' ' + userData.last_name}
              />
              <EventListItem
                icon={<Email />}
                text={'Navn: ' + userData.email}
              />
              <EventListItem
                icon={<School />}
                text={'Studieprogram: ' + userStudy}
              />
              <EventListItem
                icon={<Home />}
                text={'Klasse: ' + userClass}
              />
              <EventListItem
                icon={<Fastfood />}
                text={'Alergier: ' + allergy}
              />
            </div>
          </div>
          }
          {isApplying &&
          <CircularProgress className={classes.progress} />
          }
          {message &&
          <div className={classes.content}>
            <Typography>{message}</Typography>
          </div>
          }
          <Divider />
          <div className={classes.footer}>
            {message ?
              <Button
                className={classes.button}
                onClick={props.onClose}
                align='center'
                variant='contained'
                color='primary'>Ok</Button>
              :
              <Button
                className={classes.button}
                onClick={closeDialog}
                disabled={isApplying}
                align='center'
                variant='contained'
                color='primary'>{Text.signUp}</Button>
            }
          </div>
      </Paper>
    </Modal>
  );
};

EventDialog.propTypes = {
  status: PropTypes.bool,
  onClose: PropTypes.func,
  classes: PropTypes.object,
  userData: PropTypes.object,
  applyToEvent: PropTypes.func,
  isApplying: PropTypes.bool,
  message: PropTypes.string,
};

export default withStyles(style)(EventDialog);
