import { Grid, Typography } from '@mui/material';

import BadgesGet from 'pages/Badges/get';

import Paper from 'components/layout/Paper';

export type BadgeInputProps = {
  flagCount: number;
  title: string;
  allBadgesFound?: boolean;
};

const BadgeInput = ({ flagCount, title, allBadgesFound = false }: BadgeInputProps) => {
  const infoText = `Velkommen til TIHLDE ${title}. Vi i Index har er skjult ${flagCount} flagg rundt omkring på siden.`;

  return (
    <Paper sx={{ mx: 2 }}>
      <Grid alignItems='center' container direction='column' justifyContent='center'>
        <Typography align='center' gutterBottom variant='h2'>
          {title}
        </Typography>
        {allBadgesFound ? (
          <Typography align='center'>{infoText} Alle flaggene er funnet, men hvis du har lyst på kule badges så er det bare å lete</Typography>
        ) : (
          <Typography align='center'>
            {infoText} Når du finner alle flaggene, send mail til <a href='mailto:Index@tihlde.org'>index@tihlde.org</a>
          </Typography>
        )}
        <Typography align='center' gutterBottom>
          Lykke til!!
        </Typography>
        <BadgesGet />
      </Grid>
    </Paper>
  );
};

export default BadgeInput;
