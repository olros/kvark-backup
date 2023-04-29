import { useQuery } from 'react-query';

import { Category, RequestResponse } from 'types';

import { useAPI } from 'hooks/API';

export const CATEGORIES_QUERY_KEY = 'categories';

export const useCategories = () => {
  const { getCategories } = useAPI();

  return useQuery<Array<Category>, RequestResponse>([CATEGORIES_QUERY_KEY], () => getCategories());
};
