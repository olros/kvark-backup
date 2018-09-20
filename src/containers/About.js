import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';

// Text Imports
import Text from '../text/AboutText';

// Material UI Components
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

// Icons
import DriftIcon from '../assets/img/instagram_icon.png';
import OrgMap from '../assets/img/orgMap.png';

// Project Components
import Navigation from '../components/Navigation';
import InfoCard from '../components/InfoCard';

const styles = {
    root: {
        minHeight: '100vh',
        maxWidth: 1200,
        margin: 'auto',
        marginBottom: 100,
    },
    grid: {
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridGap: '15px',
        marginBottom: 40,

        '@media only screen and (max-width: 700px)': {
            gridTemplateColumns: '1fr',
        },
    },
    padding: {
        padding: 30,

        '@media only screen and (max-width: 700px)': {
            padding: 15,
        },
    },
    bottomMargin: {
        marginBottom: 30,
    },
    bottomSpacing: {
        marginBottom: 10,
    },
    miniPadding: {
        padding: 10,
    },
    bottomItem: {
        gridColumn: 'span 2',

        '@media only screen and (max-width: 700px)': {
            gridColumn: 'span 1',
        },
    },
};

class About extends Component {

    render() {
        const {classes} = this.props;
        return (
            <Navigation footer>
                <Grid className={classes.root} container direction='column' wrap='nowrap' alignItems='center'>
                    <Typography className={classes.padding} variant='display2' color='inherit'><strong>{Text.header}</strong></Typography>
                    <Typography className={classes.padding} variant='title'>{Text.subheader}</Typography>

                    <div className={classes.padding}>
                        <Typography className={classes.bottomSpacing} variant='display1' color='inherit' align='center'>Historie</Typography>
                        <Typography variant='subheading'>{Text.history}</Typography>
                        <Typography variant='subheading'>{Text.history2}</Typography>
                    </div>

                    <Typography className={classes.bottomMargin} variant='display1' color='inherit'>Undergrupper</Typography>
                    <div className={classes.grid}>
                        <InfoCard header='Drift' text={Text.drift} src={DriftIcon}/>
                        <InfoCard header='Sosialen' text={Text.social} src={DriftIcon}/>
                        <InfoCard header='Næringsliv og Kurs' text={Text.business} src={DriftIcon}/>
                        <InfoCard header='Promo' text={Text.promo} src={DriftIcon}/>
                    </div>

                    <Typography className={classes.bottomMargin}variant='display1' color='inherit'>Komiteer</Typography>
                    <div className={classes.grid}>
                        <InfoCard header='Jubkom' text={Text.jubkom} subheader='Opptak' subText={Text.jubkom2} justifyText/>
                        <InfoCard header='Netkom' text={Text.netkom} subheader='Opptak' subText={Text.netkom2} justifyText/>
                        <InfoCard header='Turkom' text={Text.turkom} subheader='Opptak' subText={Text.turkom2} justifyText/>
                        <InfoCard header='Kosekom' text={Text.kosekom} subheader='Opptak' subText={Text.kosekom2} justifyText/>
                        <InfoCard header='ArrKom' text={Text.arrkom} subheader='Opptak' subText={Text.arrkom2} justifyText/>
                        <InfoCard header='FestKom' text={Text.festkom} subheader='Opptak' subText={Text.festkom2} justifyText/>
                        <InfoCard header='ÅreKom' text={Text.arekom} subheader='Opptak' subText={Text.arekom2} justifyText className={classes.bottomItem}/>
                    </div>

                    <Typography className={classes.bottomMargin}variant='display1' color='inherit'>Organisasjonskart</Typography>
                    <img className={classes.miniPadding} src={OrgMap} alt='organisasjonskart' width='90%' />
                </Grid>
            </Navigation>
        );
    }

};

About.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(About);
