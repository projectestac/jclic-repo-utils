import { useState, useCallback } from 'react';

export const checkFetchResponse = response => {
  if (!response.ok)
    throw new Error(response.statusText);
  return response;
};

export function useForceUpdate() {
  const [, setTick] = useState(0)

  const update = useCallback(() => {
    setTick(tick => tick + 1)
  }, [])

  return update
}
