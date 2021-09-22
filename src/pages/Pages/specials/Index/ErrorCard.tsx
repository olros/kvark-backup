import { Box, Grid, Typography } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import GithubIcon from '@mui/icons-material/CodeRounded';

import Paper from 'components/layout/Paper';

const LINKS = [
  { link: 'https://tihlde.slack.com/archives/C01CJ0EQCFM', label: 'Kontakt oss på Slack', icon: ContactMailIcon },
  { link: 'mailto:index@tihlde.org', label: 'Kontakt oss med epost', icon: MailOutlineIcon },
  { link: 'https://github.com/TIHLDE/Kvark/issues/new/choose', label: 'Lag et issue i Github', icon: GithubIcon },
];

const ErrorCard = () => {
  return (
    <Paper>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box alignItems='center' display='flex' flexWrap='wrap'>
            <Typography variant='h2'>Feil på siden?</Typography>
          </Box>
        </Grid>
        {LINKS.map((link, index) => (
          <Grid item key={index} xs={12}>
            <Box alignItems='center' display='flex' flexWrap='wrap'>
              <link.icon sx={{ mr: (theme) => theme.spacing(1) }} />
              <a href={link.link} rel='noopener noreferrer' target='_blank'>
                {link.label}
              </a>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default ErrorCard;
