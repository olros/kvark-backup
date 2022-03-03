import { CloseRounded, FileUploadRounded, GridViewRounded, ListRounded } from '@mui/icons-material';
import { Box, Grid, IconButton, List, ListItem, ListItemIcon, ListItemText, Paper, Stack, Typography } from '@mui/material';
import { makeStyles } from 'makeStyles';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const useStyles = makeStyles()((theme) => ({
  fileUploader: {
    display: 'block',
  },
  uploadBox: {
    padding: theme.spacing(2),
    borderRadius: `${theme.shape.borderRadius}px`,
    border: '2px solid white',
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      opacity: [0.9, 0.8, 0.7],
    },
  },
}));

type GridFileItemProps = {
  index: number;
  deleteFile: (index: number) => void;
  file: File;
};

const GridFileItem = ({ index, deleteFile, file }: GridFileItemProps) => {
  const imageURL = useRef(URL.createObjectURL(file));
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png';

  useEffect(() => {
    return URL.revokeObjectURL(imageURL.current);
  }, []);

  return (
    <Grid item key={index} md={4} sm={4} xs={2}>
      <Paper
        elevation={2}
        sx={{
          height: '100px',
          background: isImage ? `url(${imageURL.current})` : 'white',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
        }}>
        <IconButton
          onClick={() => deleteFile(index)}
          size='small'
          sx={{
            background: 'rgba(0,0,0,0.2)',
            '&:hover': {
              background: 'rgba(0,0,0,0.5)',
            },
          }}>
          <CloseRounded />
        </IconButton>

        {!isImage && (
          <Box sx={{ px: 2 }}>
            <Typography color='black' fontWeight='bold' noWrap={true} textAlign='center'>
              {file.name}
            </Typography>
            <Typography color='black' textAlign='center'>
              {file.type.split('/')[1]}
            </Typography>
          </Box>
        )}
      </Paper>
    </Grid>
  );
};

export type FileUploaderProps = {
  fileTypes: ('application/pdf' | 'image/jpeg' | 'image/png')[];
  files: File[];
  title: string;
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
};

const FileUploader = ({ fileTypes, files, setFiles, title }: FileUploaderProps) => {
  const { classes } = useStyles();
  const [view, setView] = useState('list');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...Array.from(acceptedFiles)]);
  }, []);

  const deleteFile = (index: number) => {
    setFiles(files.filter((item, i) => i !== index));
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: fileTypes.join(','),
  });

  return (
    <>
      <Box sx={{ my: 2 }}>
        {files.length > 0 && (
          <Typography textAlign='center'>
            Lastet opp: <b>{files.length}</b>
          </Typography>
        )}
      </Box>
      <Box className={classes.uploadBox} {...getRootProps()}>
        <Stack alignItems='center' direction={{ xs: 'column', md: 'row' }} spacing={1}>
          <input {...getInputProps()} />
          <FileUploadRounded fontSize='large' />
          <Typography color='GrayText' textAlign='center'>
            {title}
          </Typography>
        </Stack>
      </Box>

      <Stack direction='row' justifyContent='end' sx={{ mr: 2 }}>
        <IconButton onClick={() => setView('list')}>
          <ListRounded />
        </IconButton>
        <IconButton onClick={() => setView('grid')}>
          <GridViewRounded />
        </IconButton>
      </Stack>
      <Box sx={{ mb: 2, maxHeight: 250, overflowY: 'scroll' }}>
        {view === 'list' && (
          <List>
            {files.map((file, index) => (
              <ListItem dense={true} divider={true} key={index}>
                <ListItemIcon>
                  <IconButton onClick={() => deleteFile(index)}>
                    <CloseRounded />
                  </IconButton>
                </ListItemIcon>
                <ListItemText primary={file.name} />
              </ListItem>
            ))}
          </List>
        )}
        {view === 'grid' && (
          <Grid columns={{ xs: 4, sm: 8, md: 12 }} container spacing={{ xs: 2, md: 3 }}>
            {files.map((file, index) => (
              <GridFileItem deleteFile={deleteFile} file={file} index={index} key={index} />
            ))}
          </Grid>
        )}
      </Box>
    </>
  );
};

export default FileUploader;
