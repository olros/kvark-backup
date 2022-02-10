import { Fragment, useMemo, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useJobPosts } from 'hooks/JobPost';
import { argsToParams, getUserClass } from 'utils';

// Material UI Components
import { makeStyles } from 'makeStyles';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { useMediaQuery, Theme } from '@mui/material';

// Project Components
import Page from 'components/navigation/Page';
import Banner from 'components/layout/Banner';
import Pagination from 'components/layout/Pagination';
import JobPostListItem, { JobPostListItemLoading } from 'components/miscellaneous/JobPostListItem';
import Paper from 'components/layout/Paper';
import Bool from 'components/inputs/Bool';
import TextField from 'components/inputs/TextField';
import SubmitButton from 'components/inputs/SubmitButton';
import NotFoundIndicator from 'components/miscellaneous/NotFoundIndicator';
import { useGoogleAnalytics } from 'hooks/Utils';
import Expand from 'components/layout/Expand';
import { useUser } from 'hooks/User';

const useStyles = makeStyles()((theme) => ({
  grid: {
    display: 'grid',
    gridTemplateColumns: '3fr 1fr',
    gridGap: theme.spacing(2),
    alignItems: 'self-start',
    paddingBottom: theme.spacing(2),

    [theme.breakpoints.down('lg')]: {
      gridTemplateColumns: '1fr',
    },
  },
  list: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing(1),
    [theme.breakpoints.down('lg')]: {
      order: 1,
    },
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: '1fr',
    },
  },
  settings: {
    display: 'grid',
    gridGap: theme.spacing(1),
    position: 'sticky',
    top: 80,

    [theme.breakpoints.down('lg')]: {
      order: 0,
      position: 'static',
      top: 0,
    },
  },
}));

type Filters = {
  search?: string;
  classes?: number[];
  expired: boolean;
};

type FormState = {
  search?: string;
  classes?: boolean;
  expired: boolean;
};

const JobPosts = () => {
  const { data: user } = useUser();
  const { event } = useGoogleAnalytics();
  const getInitialFilters = useCallback((): FormState => {
    const params = new URLSearchParams(location.search);
    const expired = params.get('expired') ? Boolean(params.get('expired') === 'true') : false;
    const search = params.get('search') || undefined;
    const classes = params.get('classes') ? Boolean(params.get('classes') === 'true') : false;

    //const classes = params.get('classes') || undefined;
    return { classes, expired, search };
  }, []);
  const { classes } = useStyles();
  const navigate = useNavigate();
  const lgDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));
  const [filters, setFilters] = useState<Filters>();
  const { data, error, hasNextPage, fetchNextPage, isLoading, isFetching } = useJobPosts(filters);
  const { register, control, handleSubmit, setValue, formState } = useForm<FormState>({ defaultValues: getInitialFilters() });
  const isEmpty = useMemo(() => (data !== undefined ? !data.pages.some((page) => Boolean(page.results.length)) : false), [data]);

  const resetFilters = () => {
    setValue('search', '');
    setValue('expired', false);
    setValue('classes', false);

    setFilters({ expired: false });

    //setFilters({ classes: undefined });
    navigate(`${location.pathname}${argsToParams({ expired: false })}`, { replace: true });
  };

  const search = (data: FormState) => {
    event('search', 'jobposts', JSON.stringify(data));
      setFilters({
        search: data.search,
        expired : data.expired,
        classes: data.classes && user ? [user.user_class] : undefined
      });
    navigate(`${location.pathname}${argsToParams(data)}`, { replace: true });
    !lgDown || setSearchFormExpanded((prev) => !prev);
  };

  const [searchFormExpanded, setSearchFormExpanded] = useState(false);

  const SearchForm = () => (
    <form onSubmit={handleSubmit(search)}>
      <TextField disabled={isFetching} formState={formState} label='Søk' {...register('search')} />
      <Bool control={control} formState={formState} label='Relevant år' name='classes' type='switch' />
      <Bool control={control} formState={formState} label='Tidligere' name='expired' type='switch' />
      <SubmitButton disabled={isFetching} formState={formState}>
        Søk
      </SubmitButton>
      <Divider sx={{ my: 1 }} />
      <Button color='error' fullWidth onClick={resetFilters} variant='outlined'>
        Tilbakestill
      </Button>
    </form>
  );

  return (
    <Page banner={<Banner title='Karriere' />} options={{ title: 'Karriere' }}>
      <div className={classes.grid}>
        <div className={classes.list}>
          {isLoading && <JobPostListItemLoading />}
          {isEmpty && <NotFoundIndicator header='Fant ingen annonser' />}
          {error && <Paper>{error.detail}</Paper>}
          {data !== undefined && (
            <Pagination fullWidth hasNextPage={hasNextPage} isLoading={isFetching} nextPage={() => fetchNextPage()}>
              {data.pages.map((page, i) => (
                <Fragment key={i}>
                  {page.results.map((jobpost) => (
                    <JobPostListItem jobpost={jobpost} key={jobpost.id} />
                  ))}
                </Fragment>
              ))}
            </Pagination>
          )}
          {isFetching && <JobPostListItemLoading />}
        </div>
        {lgDown ? (
          <div>
            <Expand expanded={searchFormExpanded} flat header='Filtrering' onChange={() => setSearchFormExpanded((prev) => !prev)}>
              <SearchForm />
            </Expand>
          </div>
        ) : (
          <Paper className={classes.settings}>
            <SearchForm />
          </Paper>
        )}
      </div>
    </Page>
  );
};

export default JobPosts;
