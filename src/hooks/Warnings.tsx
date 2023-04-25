import { WARNINGS_READ } from 'constant';
import { getCookie, setCookie } from 'cookie';
import { useCallback, useMemo, useState } from 'react';
import { useQuery } from 'react-query';

import { RequestResponse, Warning } from 'types';

import { useAPI } from './API';

export const WARNINGS_QUERY_KEY = 'warnings';

const getReadWarnings = () => {
  const warningsRead = getCookie(WARNINGS_READ);
  return (warningsRead === undefined ? [] : warningsRead) as number[];
};

export const useWarnings = () => {
  const { getWarnings } = useAPI();
  const { data, ...result } = useQuery<Array<Warning>, RequestResponse>([WARNINGS_QUERY_KEY], () => getWarnings());
  const [readWarnings, setReadWarnings] = useState(getReadWarnings());
  const warnings = useMemo(() => (data ? data.filter((warning) => !readWarnings.includes(warning.id)) : data), [data, readWarnings]);

  const closeWarning = useCallback(
    (warningId: number) => {
      const newReadWarnings = [...readWarnings, warningId];
      setCookie(WARNINGS_READ, JSON.stringify(newReadWarnings));
      setReadWarnings(newReadWarnings);
    },
    [setReadWarnings, readWarnings],
  );

  return { data: warnings, ...result, closeWarning };
};
