import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import URLS from '../../../URLS';
import { getDay, getMonth } from '../../../utils';
import moment from 'moment';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

// Material UI Components
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';

// Icons
import Date from '@material-ui/icons/DateRange';
import Location from '@material-ui/icons/LocationOn';
import TIHLDELOGO from '../../../assets/img/TihldeBackgroundNew.png';

const styles = (theme) => ({
  root: {
    boxShadow: '0px 2px 4px ' + theme.colors.border.main + '88, 0px 0px 4px ' + theme.colors.border.main + '88',
    borderRadius: theme.sizes.border.radius,
    marginBottom: 10,
    height: 140,
    padding: 10,
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
    display: 'flex',
    backgroundColor: theme.colors.background.light,
    '@media only screen and (min-width: 900px)': {
      height: 160,
    },
    '@media only screen and (max-width: 600px)': {
      overflow: 'hidden',
      minHeight: 150,
      height: 'auto',
      flexDirection: 'column',
    },
  },
  src: {
    objectFit: 'contain',
    height: '100%',
    width: '40%',
    maxWidth: 250,
    borderRadius: theme.sizes.border.radius,
    '@media only screen and (min-width: 900px)': {
      minWidth: '45%',
      maxWidth: 'none',
    },
    '@media only screen and (max-width: 600px)': {
      width: '100%',
      maxWidth: 'none',
      height: 150,
    },
  },
  content: {
    marginLeft: 20,
    padding: '10px 0px',
    border: 6,
    height: '100%',
    justifyContent: 'space-evenly',
    '@media only screen and (max-width: 600px)': {
      padding: '10px 0px 0px',
    },
  },
  title: {
    color: theme.colors.text.main,
    fontWeight: 'bold',
    fontSize: '24px',
    '@media only screen and (max-width: 600px)': {
      textAlign: 'center',
    },
  },
  infoRoot: {
    width: 'auto',
    '@media only screen and (max-width: 600px)': {
      justifyContent: 'center',
    },
  },
  info: {
    marginLeft: 10,
    color: theme.colors.text.lighter,
    fontSize: '1rem',
    textAlign: 'center',
  },
  icon: {
    color: theme.colors.text.lighter,
    height: 24,
    width: 24,
    margin: 0,
  },
  expired: {
    color: theme.colors.text.main + 'cc',
  },
  filter: {
    filter: 'opacity(0.4)',
  },
});

const InfoContent = withStyles(styles)((props) => (
  <Grid alignItems='center' className={props.classes.infoRoot} container direction='row' wrap='nowrap'>
    {props.icon}
    <Typography className={props.classes.info} variant='h6'>
      {props.label}
    </Typography>
  </Grid>
));

InfoContent.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.string,
};

const getDate = (date) => {
  return getDay(date.day()) + ' ' + date.date() + ' ' + getMonth(date.month()) + ' - kl. ' + date.format('HH:mm');
};

const EventListItem = (props) => {
  const { classes, data } = props;
  const src = data.image ? data.image : TIHLDELOGO;
  const start = moment(data.start_date, ['YYYY-MM-DD HH:mm'], 'nb');
  return (
    <ListItem button className={classes.root} component={Link} to={URLS.events + ''.concat(data.id, '/')}>
      <img alt={data.title} className={classNames(classes.src, data.expired ? classes.filter : '')} src={src} />
      <Grid className={classes.content} container direction='column' wrap='nowrap'>
        <Typography className={classNames(classes.title, data.expired ? classes.expired : '')} variant='h5'>
          <strong>{data.title}</strong>
        </Typography>
        <InfoContent icon={<Date className={classes.icon} />} label={getDate(start)} />
        <InfoContent icon={<Location className={classes.icon} />} label={data.location} />
      </Grid>
    </ListItem>
  );
};

EventListItem.propTypes = {
  classes: PropTypes.object,

  data: PropTypes.object,
  onClick: PropTypes.func,
};

export default withStyles(styles)(EventListItem);
