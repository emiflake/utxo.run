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
