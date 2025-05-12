/**
 * Shortens a string by removing the middle characters and replacing them with "...".
 *
 * @param str The string to shorten.
 * @param len The total length of the shortened string (default is 10).
 * @returns The shortened string.
 */
export const shorten = (str: string, len = 20) => {
  return `${str.slice(0, len * 0.65)}...${str.slice(-len * 0.35)}`;
};

export const mapRecord = <K extends string, V, R>(
  record: Record<K, V>,
  fn: (key: K, value: V) => R,
): Record<K, R> => {
  const res: Record<K, R> = {} as Record<K, R>;
  for (const key of Object.keys(record)) {
    const v = record[key as K];
    res[key as K] = fn(key as K, v);
  }
  return res;
};
