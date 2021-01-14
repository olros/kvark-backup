import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import URLS from '../../URLS';
import { getUserStudyLong, getUserClass } from '../../utils';
import Helmet from 'react-helmet';

// Service and action imports
import { useAuth } from '../../api/hooks/Auth';
import { useMisc } from '../../api/hooks/Misc';

// Material UI Components
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import LinearProgress from '@material-ui/core/LinearProgress';
import MenuItem from '@material-ui/core/MenuItem';

// Project Components
import Navigation from '../../components/navigation/Navigation';
import Paper from '../../components/layout/Paper';
import TihldeLogo from '../../components/miscellaneous/TihldeLogo';
import ExpandMoreIcon from '@material-ui/icons/ExpandMoreRounded';
import ExpandLessIcon from '@material-ui/icons/ExpandLessRounded';

const styles = (theme) => ({
  root: {
    minHeight: '100vh',
    width: '100%',
  },
  top: {
    height: 220,
    background:
      'radial-gradient(circle at bottom, ' + theme.palette.colors.gradient.secondary.top + ', ' + theme.palette.colors.gradient.secondary.bottom + ')',
  },
  main: {
    maxWidth: 1000,
    margin: 'auto',
    position: 'relative',
  },
  paper: {
    width: '90%',
    maxWidth: 460,
    margin: 'auto',
    position: 'relative',
    left: 0,
    right: 0,
    top: '-60px',
  },
  logo: {
    height: 30,
    width: 'auto',
    marginBottom: 10,
  },
  header: {
    color: theme.palette.text.primary,
  },
  button: {
    marginTop: 16,
    width: '100%',
  },
  progress: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});

function SignUp(props) {
  const { classes } = props;
  const navigate = useNavigate();
  const { createUser } = useAuth();

  const { handleSubmit, errors, control, setError } = useForm();
  const { setLogInRedirectURL, getLogInRedirectURL } = useMisc();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);

  const onSignUp = (data) => {
    if (isLoading) {
      return;
    }

    if (getUserStudyLong(data.study) === 'Digital samhandling' && ![4, 5].includes(data.userClass)) {
      setError('userClass', {
        type: 'manual',
        message: 'Digital samhandling har kun 4 og 5 klasse',
      });
      return;
    }

    if (!(getUserStudyLong(data.study) === 'Digital samhandling') && [4, 5].includes(data.userClass)) {
      setError('userClass', {
        type: 'manual',
        message: `${getUserStudyLong(data.study)} har ikke 4 og 5 klasse`,
      });
      return;
    }

    if (data.password !== data.passwordVerify) {
      setError('password', {
        type: 'manual',
        message: 'Passordene må være like',
      });
      setError('passwordVerify', {
        type: 'manual',
        message: 'Passordene må være like',
      });
      return;
    }

    setErrorMessage('');
    setIsLoading(true);
    const userData = {
      user_id: data.username.toLowerCase(),
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      user_class: data.userClass,
      user_study: data.study,
      password: data.password,
    };
    createUser(userData)
      .then(() => {
        const redirectURL = getLogInRedirectURL();
        setLogInRedirectURL(null);
        navigate(redirectURL || URLS.login);
      })
      .catch((error) => {
        setErrorMessage(error.detail);
        setIsLoading(false);
      });
  };

  return (
    <Navigation fancyNavbar>
      <Helmet>
        <title>Ny bruker - TIHLDE</title>
      </Helmet>
      <div className={classes.root}>
        <div className={classes.top}></div>
        <div className={classes.main}>
          <Paper className={classes.paper}>
            {isLoading && <LinearProgress className={classes.progress} />}
            <TihldeLogo className={classes.logo} darkColor='white' lightColor='blue' size='large' />
            <Typography className={classes.header} variant='h6'>
              Opprett bruker
            </Typography>
            <form onSubmit={handleSubmit(onSignUp)}>
              <Grid container direction='column'>
                <Controller
                  as={TextField}
                  control={control}
                  defaultValue=''
                  error={Boolean(errors.firstName)}
                  helperText={errors.firstName?.message}
                  label='Fornavn *'
                  margin='normal'
                  name='firstName'
                  rules={{ required: 'Feltet er påkrevd' }}
                  variant='outlined'
                />
                <Controller
                  as={TextField}
                  control={control}
                  defaultValue=''
                  error={Boolean(errors.lastName)}
                  helperText={errors.lastName?.message}
                  label='Etternavn *'
                  margin='normal'
                  name='lastName'
                  rules={{ required: 'Feltet er påkrevd' }}
                  variant='outlined'
                />
                <Controller
                  as={TextField}
                  control={control}
                  defaultValue=''
                  error={Boolean(errors.username)}
                  helperText={errors.username?.message}
                  label='NTNU brukernavn *'
                  margin='normal'
                  name='username'
                  rules={{
                    required: 'Feltet er påkrevd',
                    validate: (value) => !value.includes('@') || 'Brukernavn må være uten @stud.ntnu.no',
                  }}
                  variant='outlined'
                />
                <Controller
                  as={TextField}
                  control={control}
                  defaultValue=''
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                  label='E-post *'
                  margin='normal'
                  name='email'
                  rules={{
                    required: 'Feltet er påkrevd',
                    pattern: {
                      // eslint-disable-next-line no-useless-escape
                      value: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                      message: 'Ugyldig e-post',
                    },
                  }}
                  type='email'
                  variant='outlined'
                />
                <Controller
                  as={TextField}
                  control={control}
                  defaultValue=''
                  error={Boolean(errors.study)}
                  helperText={errors.study?.message}
                  label='Studie'
                  margin='normal'
                  name='study'
                  required
                  rules={{ required: 'Feltet er påkrevd' }}
                  select
                  variant='outlined'>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <MenuItem key={i} value={i}>
                      {getUserStudyLong(i)}
                    </MenuItem>
                  ))}
                </Controller>
                <Controller
                  as={TextField}
                  control={control}
                  defaultValue=''
                  error={Boolean(errors.userClass)}
                  helperText={errors.userClass?.message}
                  label='Klasse'
                  margin='normal'
                  name='userClass'
                  required
                  rules={{ required: 'Feltet er påkrevd' }}
                  select
                  variant='outlined'>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <MenuItem key={i} value={i}>
                      {getUserClass(i)}
                    </MenuItem>
                  ))}
                </Controller>
                <Controller
                  as={TextField}
                  control={control}
                  defaultValue=''
                  error={Boolean(errors.password)}
                  helperText={errors.password?.message}
                  label='Passord *'
                  margin='normal'
                  name='password'
                  rules={{
                    required: 'Feltet er påkrevd',
                    minLength: {
                      value: 8,
                      message: 'Minimum 8 karakterer',
                    },
                  }}
                  type='password'
                  variant='outlined'
                />
                <Controller
                  as={TextField}
                  control={control}
                  defaultValue=''
                  error={Boolean(errors.passwordVerify)}
                  helperText={errors.passwordVerify?.message}
                  label='Gjenta passord *'
                  margin='normal'
                  name='passwordVerify'
                  rules={{
                    required: 'Feltet er påkrevd',
                    minLength: {
                      value: 8,
                      message: 'Minimum 8 karakterer',
                    },
                  }}
                  type='password'
                  variant='outlined'
                />
                <Typography color='error'>{errorMessage}</Typography>
                <Typography variant='body2'>
                  OBS: Når du har klikket &quot;Opprett bruker&quot; må vi godkjenne deg før du får logge inn. Les mer om hvorfor lengre ned.
                </Typography>
                <Button className={classes.button} color='primary' disabled={isLoading} type='submit' variant='contained'>
                  Opprett bruker
                </Button>
                <Button className={classes.button} color='primary' component={Link} disabled={isLoading} to={URLS.login}>
                  Logg inn
                </Button>
                <Button
                  className={classes.button}
                  color='primary'
                  endIcon={faqOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  onClick={() => setFaqOpen((oldState) => !oldState)}
                  variant='outlined'>
                  Hvorfor må vi godkjenne deg?
                </Button>
                <Collapse in={faqOpen}>
                  <Typography className={classes.button} variant='body2'>
                    For å unngå at vi får mange brukere som ikke er reelle TIHLDE-medlemmer, må vi aktivere nye brukere før de får logge inn. Det kan ta noen
                    timer før noen av oss i Index eller HS får verifisert brukeren din. Hvis det haster eller tar mer enn 24 timer kan du sende en melding til
                    TIHLDE på{' '}
                    <a href='https://m.me/tihlde' rel='noopener noreferrer' target='_blank'>
                      Messenger
                    </a>
                    .
                  </Typography>
                </Collapse>
              </Grid>
            </form>
          </Paper>
        </div>
      </div>
    </Navigation>
  );
}

SignUp.propTypes = {
  classes: PropTypes.object,
};

export default withStyles(styles)(SignUp);
