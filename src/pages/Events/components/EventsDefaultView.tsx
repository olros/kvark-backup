import { useAuth0 } from '@auth0/auth0-react';
import { Button, Divider, MenuItem, Stack, Theme, useMediaQuery } from '@mui/material';
import { makeStyles } from 'makeStyles';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { argsToParams } from 'utils';

import { useCategories } from 'hooks/Categories';
import { useEvents } from 'hooks/Event';
import { useAnalytics } from 'hooks/Utils';

import Bool from 'components/inputs/Bool';
import Select from 'components/inputs/Select';
import SubmitButton from 'components/inputs/SubmitButton';
import TextField from 'components/inputs/TextField';
import Expand from 'components/layout/Expand';
import Pagination from 'components/layout/Pagination';
import Paper from 'components/layout/Paper';
import EventListItem, { EventListItemLoading } from 'components/miscellaneous/EventListItem';
import NotFoundIndicator from 'components/miscellaneous/NotFoundIndicator';

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
    gridTemplateColumns: '1fr',
    gap: theme.spacing(1),
    [theme.breakpoints.down('lg')]: {
      order: 1,
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
  category?: string;
  open_for_sign_up?: boolean;
  user_favorite?: boolean;
  expired: boolean;
};

const EventsDefaultView = () => {
  const { isAuthenticated } = useAuth0();
  const { event } = useAnalytics();
  const getInitialFilters = useCallback((): Filters => {
    const params = new URLSearchParams(location.search);
    const expired = params.get('expired') ? Boolean(params.get('expired') === 'true') : false;
    const open_for_sign_up = params.get('open_for_sign_up') ? Boolean(params.get('open_for_sign_up') === 'true') : undefined;
    const user_favorite = params.get('user_favorite') ? Boolean(params.get('user_favorite') === 'true') : undefined;
    const category = params.get('category') || undefined;
    const search = params.get('search') || undefined;
    return { expired, category, search, open_for_sign_up, user_favorite };
  }, []);
  const { classes } = useStyles();
  const navigate = useNavigate();
  const lgDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));
  const { data: categories = [] } = useCategories();
  const [filters, setFilters] = useState<Filters>(getInitialFilters());
  const { data, error, hasNextPage, fetchNextPage, isLoading, isFetching } = useEvents(filters);
  const events = useMemo(() => (data ? data.pages.map((page) => page.results).flat() : []), [data]);
  const { register, control, handleSubmit, setValue, formState } = useForm<Filters>({ defaultValues: getInitialFilters() });
  const isEmpty = useMemo(() => (data !== undefined ? !data.pages.some((page) => Boolean(page.results.length)) : false), [data]);

  const resetFilters = () => {
    setValue('category', '');
    setValue('search', '');
    setValue('expired', false);
    setFilters({ expired: false, open_for_sign_up: false, user_favorite: false });
    navigate(`${location.pathname}${argsToParams({ expired: false })}`, { replace: true });
  };

  const search = (data: Filters) => {
    event('search', 'events', JSON.stringify(data));
    setFilters(data);
    navigate(`${location.pathname}${argsToParams(data)}`, { replace: true });
    !lgDown || setSearchFormExpanded((prev) => !prev);
  };

  const [searchFormExpanded, setSearchFormExpanded] = useState(false);

  const SearchForm = () => (
    <form onSubmit={handleSubmit(search)}>
      <TextField disabled={isFetching} formState={formState} label='Søk' margin='none' {...register('search')} />
      {Boolean(categories.length) && (
        <Select control={control} formState={formState} label='Kategori' name='category'>
          {categories.map((value, index) => (
            <MenuItem key={index} value={value.id}>
              {value.text}
            </MenuItem>
          ))}
        </Select>
      )}
      <Bool control={control} formState={formState} label='Tidligere' name='expired' type='switch' />
      <Bool control={control} formState={formState} label='Kun med åpen påmelding' name='open_for_sign_up' type='switch' />
      {isAuthenticated && <Bool control={control} formState={formState} label='Favoritter' name='user_favorite' type='switch' />}
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
    <>
      <div className={classes.grid}>
        <div className={classes.list}>
          {isLoading && <EventListItemLoading />}
          {isEmpty && <NotFoundIndicator header='Fant ingen arrangementer' />}
          {error && <Paper>{error.detail}</Paper>}
          {data !== undefined && (
            <Pagination fullWidth hasNextPage={hasNextPage} isLoading={isFetching} nextPage={() => fetchNextPage()}>
              <Stack gap={1}>
                {events.map((event) => (
                  <EventListItem event={event} key={event.id} />
                ))}
              </Stack>
            </Pagination>
          )}
          {isFetching && <EventListItemLoading />}
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
    </>
  );
};

export default EventsDefaultView;
