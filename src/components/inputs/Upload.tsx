import { useState, useCallback, forwardRef } from 'react';
import { UseFormReturn, UseFormRegisterReturn, Path, FieldError, UnpackNestedValue, PathValue } from 'react-hook-form';
import Cropper from 'react-easy-crop';
import { useGoogleAnalytics, useShare } from 'hooks/Utils';
import API from 'api/api';
import { useSnackbar } from 'hooks/Snackbar';

// Material UI Components
import {
  Button,
  ButtonProps,
  FormHelperText,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  styled,
} from '@mui/material';

// Icons
import ShareIcon from '@mui/icons-material/ShareRounded';

// Project components
import Dialog from 'components/layout/Dialog';
import Paper from 'components/layout/Paper';
import { getCroppedImgAsBlob, blobToFile, readFile } from 'components/inputs/ImageUploadUtils';

const UploadPaper = styled(Paper)(({ theme }) => ({
  display: 'grid',
  gridGap: theme.spacing(1),
  padding: theme.spacing(2),
  background: theme.palette.background.default,
}));

const Img = styled('img')(({ theme }) => ({
  margin: 'auto',
  maxHeight: 200,
  width: 'auto',
  maxWidth: '100%',
  borderRadius: theme.shape.borderRadius,
}));

const CropperWrapper = styled('div')({
  position: 'relative',
  width: '100%',
  height: 400,
  maxHeight: '90vh',
});

const analytics = () =>
  window.gtag('event', 'upload', {
    event_category: 'file-upload',
    event_label: `Uploaded file`,
  });

export type ImageUploadProps<FormValues> = ButtonProps &
  Pick<UseFormReturn<FormValues>, 'formState' | 'watch' | 'setValue'> & {
    register: UseFormRegisterReturn;
    label?: string;
    ratio?: number;
  };

// eslint-disable-next-line comma-spacing
export const GenericImageUpload = <FormValues,>({
  register,
  watch,
  setValue,
  formState,
  label = 'Last opp fil',
  ratio,
  ...props
}: ImageUploadProps<FormValues>) => {
  const name = register.name as Path<FormValues>;
  const showSnackbar = useSnackbar();
  const url = watch(name);
  const [imageSrc, setImageSrc] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const closeDialog = () => {
    setDialogOpen(false);
    setImageSrc('');
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setCroppedAreaPixels(null);
    setImageFile(undefined);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const onSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        setImageFile(file);
        if (ratio) {
          const imageDataUrl = await readFile(file);
          setImageSrc(imageDataUrl);
          setDialogOpen(true);
        } else {
          uploadFile(file);
        }
      }
    } catch (e) {
      showSnackbar(e.detail, 'error');
    }
  };
  const dialogConfirmCrop = async () => {
    try {
      setIsLoading(true);
      const file = await getCroppedImgAsBlob(imageSrc, croppedAreaPixels, imageFile?.type);
      await uploadFile(file);
    } catch (e) {
      showSnackbar(e.detail, 'error');
    }
    closeDialog();
  };
  const uploadFile = async (file: File | Blob) => {
    setIsLoading(true);
    try {
      const { default: compressImage } = await import('browser-image-compression');
      const compressedImage = await compressImage(file as File, { maxSizeMB: 0.8, maxWidthOrHeight: 1500 });
      const newFile = blobToFile(compressedImage, file instanceof File ? file.name : imageFile?.name || '', imageFile?.type || file.type || '');
      const data = await API.uploadFile(newFile);
      analytics();
      setValue(name, data.url as UnpackNestedValue<PathValue<FormValues, Path<FormValues>>>);
    } catch (e) {
      showSnackbar(e.detail, 'error');
    }
    setIsLoading(false);
  };
  return (
    <>
      <UploadPaper>
        {url && <Img src={url as string} />}
        <div>
          <input hidden {...register} />
          <input accept='image/*' hidden id='image-upload-button' onChange={onSelect} type='file' />
          <label htmlFor='image-upload-button'>
            <Button component='span' disabled={isLoading} fullWidth variant='contained' {...props}>
              {label}
            </Button>
          </label>
        </div>
        {Boolean(formState.errors[name] as FieldError) && <FormHelperText error>{(formState.errors[name] as FieldError)?.message}</FormHelperText>}
        {url && (
          <Button color='error' disabled={isLoading} fullWidth onClick={() => setValue(name, '' as UnpackNestedValue<PathValue<FormValues, Path<FormValues>>>)}>
            Fjern bilde
          </Button>
        )}
      </UploadPaper>
      <Dialog
        closeText='Avbryt'
        confirmText='Ferdig'
        disabled={isLoading}
        onClose={closeDialog}
        onConfirm={() => dialogConfirmCrop()}
        open={dialogOpen}
        titleText='Tilpass bildet'>
        <CropperWrapper>
          <Cropper aspect={ratio} crop={crop} image={imageSrc} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} zoom={zoom} />
        </CropperWrapper>
        {isLoading && <LinearProgress />}
      </Dialog>
    </>
  );
};

export const ImageUpload = forwardRef(GenericImageUpload) as <FormValues>(
  props: ImageUploadProps<FormValues> & { ref?: React.ForwardedRef<HTMLDivElement> },
) => ReturnType<typeof GenericImageUpload>;

export type FormFileUploadProps<FormValues> = Omit<ImageUploadProps<FormValues>, 'ratio'>;

// eslint-disable-next-line comma-spacing
export const FormFileUpload = <FormValues,>({ register, watch, setValue, formState, label = 'Last opp fil', ...props }: FormFileUploadProps<FormValues>) => {
  const name = register.name as Path<FormValues>;
  const showSnackbar = useSnackbar();
  const url = watch(name);
  const [isLoading, setIsLoading] = useState(false);
  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      try {
        const data = await API.uploadFile(file);
        analytics();
        setValue(name, data.url as UnpackNestedValue<PathValue<FormValues, Path<FormValues>>>);
        showSnackbar('Filen ble lastet opp, husk å trykk lagre', 'info');
      } catch (e) {
        showSnackbar(e.detail, 'error');
      }
      setIsLoading(false);
    }
  };
  return (
    <UploadPaper>
      {url && (
        <Typography>
          Fil: <a href={url as string}>{url as string}</a>
        </Typography>
      )}
      <div>
        <input hidden {...register} />
        <input hidden id='file-upload-button' onChange={upload} type='file' />
        <label htmlFor='file-upload-button'>
          <Button component='span' disabled={isLoading} fullWidth variant='contained' {...props}>
            {label}
          </Button>
        </label>
      </div>
      {Boolean(formState.errors[name] as FieldError) && <FormHelperText error>{(formState.errors[name] as FieldError)?.message}</FormHelperText>}
      {url && (
        <Button color='error' disabled={isLoading} fullWidth onClick={() => setValue(name, '' as UnpackNestedValue<PathValue<FormValues, Path<FormValues>>>)}>
          Fjern fil
        </Button>
      )}
    </UploadPaper>
  );
};

export type FileUploadProps<FormValues> = Pick<ImageUploadProps<FormValues>, 'label'> & ButtonProps;

// eslint-disable-next-line comma-spacing
export const FileUpload = <FormValues,>({ label = 'Last opp filer', ...props }: FileUploadProps<FormValues>) => {
  const { event } = useGoogleAnalytics();
  const showSnackbar = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [uploaded, setUploaded] = useState<Array<string>>([]);
  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setIsLoading(true);
      try {
        const data = await Promise.all(Array.from(files).map((file) => API.uploadFile(file)));
        analytics();
        setUploaded(data.map((file) => file.url));
        showSnackbar('Filen(e) ble lastet opp', 'info');
      } catch (e) {
        showSnackbar(e.detail, 'error');
      }
      setIsLoading(false);
    }
  };

  const File = ({ url }: { url: string }) => {
    const { share } = useShare(
      {
        title: 'Del fil',
        url,
      },
      'Link til filen ble kopiert til utklippstavlen',
      () => event('share-uploaded-file', 'share', url),
    );
    return (
      <Paper bgColor='default' noPadding>
        <ListItem>
          <ListItemText
            primary={
              <a href={url} rel='noopener noreferrer' target='_blank'>
                {url}
              </a>
            }
            sx={{ overflowWrap: 'anywhere' }}
          />
          <ListItemSecondaryAction>
            <IconButton onClick={share}>
              <ShareIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      </Paper>
    );
  };

  return (
    <UploadPaper>
      <List disablePadding sx={{ display: 'grid', gap: 1 }}>
        {uploaded.map((url, i) => (
          <File key={i} url={url} />
        ))}
      </List>
      <div>
        <input hidden id='files-upload-button' multiple onChange={upload} type='file' />
        <label htmlFor='files-upload-button'>
          <Button component='span' disabled={isLoading} fullWidth variant='contained' {...props}>
            {label}
          </Button>
        </label>
      </div>
    </UploadPaper>
  );
};
