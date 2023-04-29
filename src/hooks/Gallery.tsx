/* eslint-disable @typescript-eslint/no-explicit-any */
import { useInfiniteQuery, useMutation, UseMutationResult, useQuery, useQueryClient } from 'react-query';

import { Gallery, GalleryCreate, GalleryRequired, PaginationResponse, Picture, PictureRequired, RequestResponse } from 'types';

import { useAPI } from 'hooks/API';

export const GALLERY_QUERY_KEYS = {
  all: ['gallery'] as const,
  list: (filters?: any) => [...GALLERY_QUERY_KEYS.all, 'list', ...(filters ? [filters] : [])] as const,
  detail: (galleryId: Gallery['id']) => [...GALLERY_QUERY_KEYS.all, galleryId] as const,
  pictures: {
    all: (galleryId: Gallery['id']) => [...GALLERY_QUERY_KEYS.detail(galleryId), 'pictures'] as const,
    list: (galleryId: Gallery['id'], filters?: any) => [...GALLERY_QUERY_KEYS.pictures.all(galleryId), ...(filters ? [filters] : [])] as const,
    detail: (galleryId: Gallery['id'], pictureId: Picture['id']) => [...GALLERY_QUERY_KEYS.pictures.all(galleryId), pictureId] as const,
  },
};

export const useGalleryById = (galleryId: Gallery['id']) => {
  const { getGallery } = useAPI();

  return useQuery<Gallery, RequestResponse>(GALLERY_QUERY_KEYS.detail(galleryId), () => getGallery(galleryId));
};

export const useGalleries = (filters?: any) => {
  const { getGalleries } = useAPI();

  return useInfiniteQuery<PaginationResponse<Gallery>, RequestResponse>(
    GALLERY_QUERY_KEYS.list(filters),
    ({ pageParam = 1 }) => getGalleries({ ...filters, page: pageParam }),
    {
      getNextPageParam: (lastPage) => lastPage.next,
    },
  );
};

export const useCreateGallery = (): UseMutationResult<Gallery, RequestResponse, GalleryCreate, unknown> => {
  const { createGallery } = useAPI();
  const queryClient = useQueryClient();

  return useMutation((newGallery) => createGallery(newGallery), {
    onSuccess: (data) => {
      queryClient.invalidateQueries(GALLERY_QUERY_KEYS.list());
      queryClient.setQueryData(GALLERY_QUERY_KEYS.detail(data.id), data);
    },
  });
};

export const useUpdateGallery = (galleryId: Gallery['id']): UseMutationResult<Gallery, RequestResponse, GalleryRequired, unknown> => {
  const { updateGallery } = useAPI();
  const queryClient = useQueryClient();

  return useMutation((updatedGallery) => updateGallery(galleryId, updatedGallery), {
    onSuccess: (data) => {
      queryClient.invalidateQueries(GALLERY_QUERY_KEYS.list());
      queryClient.setQueryData(GALLERY_QUERY_KEYS.detail(galleryId), data);
    },
  });
};

export const useDeleteGallery = (galleryId: Gallery['id']): UseMutationResult<RequestResponse, RequestResponse, unknown, unknown> => {
  const { deleteGallery } = useAPI();
  const queryClient = useQueryClient();

  return useMutation(() => deleteGallery(galleryId), {
    onSuccess: () => queryClient.invalidateQueries(GALLERY_QUERY_KEYS.list()),
  });
};

export const useGalleryPictures = (galleryId: Gallery['id']) => {
  const { getGalleryPictures } = useAPI();

  return useInfiniteQuery<PaginationResponse<Picture>, RequestResponse>(
    GALLERY_QUERY_KEYS.pictures.list(galleryId),
    ({ pageParam = 1 }) => getGalleryPictures(galleryId, { page: pageParam }),
    {
      getNextPageParam: (lastPage) => lastPage.next,
    },
  );
};

export const usePictureById = (galleryId: Gallery['id'], pictureId: Picture['id']) => {
  const { getPicture } = useAPI();

  return useQuery<Picture, RequestResponse>(GALLERY_QUERY_KEYS.pictures.detail(galleryId, pictureId), () => getPicture(galleryId, pictureId));
};

export const useUploadPictures = (galleryId: Gallery['id']): UseMutationResult<RequestResponse, RequestResponse, { files: File | File[] | Blob }, unknown> => {
  const { createPicture } = useAPI();
  const queryClient = useQueryClient();

  return useMutation((files) => createPicture(galleryId, files.files), {
    onSuccess: () => queryClient.invalidateQueries(GALLERY_QUERY_KEYS.pictures.all(galleryId)),
  });
};

export const useUpdatePicture = (galleryId: Gallery['id'], pictureId: Picture['id']): UseMutationResult<Picture, RequestResponse, PictureRequired, unknown> => {
  const { updatePicture } = useAPI();
  const queryClient = useQueryClient();

  return useMutation((updatedPicture) => updatePicture(galleryId, pictureId, updatedPicture), {
    onSuccess: (data) => {
      queryClient.invalidateQueries(GALLERY_QUERY_KEYS.pictures.all(galleryId));
      queryClient.setQueryData(GALLERY_QUERY_KEYS.pictures.detail(galleryId, pictureId), data);
    },
  });
};

export const useDeletePicture = (galleryId: Gallery['id'], pictureId: Picture['id']): UseMutationResult<RequestResponse, RequestResponse, unknown, unknown> => {
  const { deletePicture } = useAPI();
  const queryClient = useQueryClient();
  
  return useMutation(() => deletePicture(galleryId, pictureId), {
    onSuccess: () => queryClient.invalidateQueries(GALLERY_QUERY_KEYS.pictures.all(galleryId)),
  });
};
