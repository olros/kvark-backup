import DownloadIcon from '@mui/icons-material/FileDownloadRounded';
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { ACCESS_TOKEN, TIHLDE_API_URL, TOKEN_HEADER_NAME } from 'constant';
import { getCookie } from 'cookie';
import { useState } from 'react';
import { urlEncode } from 'utils';

import { SelectFieldSubmission, SelectFormField, TextFieldSubmission, TextFormField, UserSubmission } from 'types';
import { FormFieldType, FormResourceType } from 'types/Enums';

import { FORMS_ENDPOINT, SUBMISSIONS_ENDPOINT } from 'api/api';

import { useFormById, useFormSubmissions } from 'hooks/Form';
import { useSnackbar } from 'hooks/Snackbar';

import Paper from 'components/layout/Paper';

export type FormAnswersProps = {
  formId: string | null;
};

const FormAnswers = ({ formId }: FormAnswersProps) => {
  const showSnackbar = useSnackbar();
  const [selectedPage, setSelectedPage] = useState(0);
  const { data: form, isLoading: isFormLoading } = useFormById(formId || '-');
  const { data, isLoading, error } = useFormSubmissions(formId || '-', selectedPage + 1);

  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const handleSelectFields = (event: SelectChangeEvent<typeof selectedFields>) => {
    const {
      target: { value },
    } = event;
    setSelectedFields(typeof value === 'string' ? value.split(',') : value);
  };

  if (isLoading || isFormLoading) {
    return <Typography>Laster statistikken...</Typography>;
  } else if (error) {
    return <Typography>Noe gikk galt: {error.detail}</Typography>;
  } else if (!form || !formId || !data) {
    return <Typography>Du må opprette et skjema for å se svar</Typography>;
  } else if (!data.results.length) {
    return <Typography>Ingen har svart på dette skjemaet</Typography>;
  }

  const getTableCellText = (field: TextFormField | SelectFormField, submission: UserSubmission) => {
    const answer = submission.answers.find((ans) => ans.field.id === field.id);
    if (answer === undefined) {
      return '';
    } else if (field.type === FormFieldType.TEXT_ANSWER) {
      return (answer as TextFieldSubmission).answer_text;
    } else {
      return (answer as SelectFieldSubmission).selected_options.map((opt) => field.options.find((o) => o.id === opt.id)?.title || '').join(', ');
    }
  };

  const downloadCSV = async () => {
    try {
      const headers = new Headers();
      headers.append('Accept', 'text/csv');
      headers.append(TOKEN_HEADER_NAME, getCookie(ACCESS_TOKEN) as string);
      const response = await fetch(`${TIHLDE_API_URL}${FORMS_ENDPOINT}/${formId}/${SUBMISSIONS_ENDPOINT}/download/`, {
        headers,
        method: 'GET',
      });
      if (response.ok) {
        const blob = await response.blob();
        // Creates a hidden <a> element
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.setAttribute('style', 'display: none');
        // Adds a object url to the link
        const url = URL.createObjectURL(blob);
        a.href = url;
        // Set filename
        a.download = form.resource_type === FormResourceType.EVENT_FORM ? `${urlEncode(form.title)}_${form.type}.csv` : `${urlEncode(form.title)}.csv`;
        // Clicks the link to download the file
        a.click();
        // Revokes link and removes the <a> from document
        URL.revokeObjectURL(url);
        a.remove();
      } else {
        showSnackbar('Noe gikk galt', 'error');
      }
    } catch {
      showSnackbar('Noe gikk galt', 'error');
    }
  };

  return (
    <>
      <FormControl sx={{ m: 1, width: 300 }}>
        <InputLabel id='sporsmol-filtrering-label'>Velg spørsmål</InputLabel>
        <Select
          input={<OutlinedInput label='Chip' />}
          labelId='sporsmol-filtrering-label'
          multiple
          onChange={handleSelectFields}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value, index) => (
                <Chip key={index} label={value} />
              ))}
            </Box>
          )}
          value={selectedFields}>
          {form.fields.map((field) => (
            <MenuItem key={field.id} value={field.title}>
              {field.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TableContainer component={Paper} noPadding>
        <Table aria-label={`Svar for ${form.title}`} size='small' sx={{ minWidth: 250 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Navn</TableCell>
              {selectedFields.map((field, index) => (
                <TableCell align='right' key={index} sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  {field}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.results.map((submission) => (
              <TableRow key={submission.user.user_id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  {submission.user.first_name} {submission.user.last_name}
                </TableCell>
                {form.fields
                  .filter((field) => selectedFields.includes(field.title))
                  .map((field) => (
                    <TableCell align='right' key={field.id}>
                      {getTableCellText(field, submission)}
                    </TableCell>
                  ))}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                count={data.count}
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} av ${count}`}
                onPageChange={(_, p) => setSelectedPage(p)}
                page={selectedPage}
                rowsPerPage={25}
                rowsPerPageOptions={[-1]}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
      <Button endIcon={<DownloadIcon />} onClick={downloadCSV} size='small' sx={{ width: 'fit-content', height: 35, mt: 2, ml: 'auto' }} variant='contained'>
        Last ned som csv
      </Button>
    </>
  );
};

export default FormAnswers;
