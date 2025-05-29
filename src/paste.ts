// Support for paste websites containing shareable links.
// For some specific routes, like CBOR. The URLs could hypothetically get really long.
// Because of this, we support paste websites containing shareable links.

import { useQuery } from '@tanstack/react-query';
import { classifySearch } from './search';
import z from 'zod';

export type PasteInterface = {
  url: string;

  /**
   * Creates a paste and returns the ID at which the content is available.
   */
  createPaste: (content: unknown) => Promise<string>;
  /**
   * Returns the content of a paste.
   */
  getPaste: (id: string) => Promise<unknown>;
};

export const superfishialURL = '/paste/sf';

export const superfishial: PasteInterface = {
  url: superfishialURL,

  createPaste: async (content) => {
    const response = await fetch(`${superfishial.url}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        meta: {
          created_by: 'utxo.run',
        },
      }),
    });
    const text = await response.text();

    if (!text.startsWith('/p/') || response.status !== 200) {
      throw new Error(`Failed to create paste: ${response.status}`);
    }

    // paste.super.fish responds with `/p/<some id>`, let's extract the id.
    const id = text.replace('/p/', '');

    return id;
  },
  getPaste: async (id) => {
    const response = await fetch(`${superfishial.url}/${id}`);
    try {
      const json = await response.json();
      return json;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
};

export const pasteInterfaces = {
  sf: superfishial,
};

export const usePaste = (
  ifaceName: keyof typeof pasteInterfaces,
  id: string,
) => {
  const iface = pasteInterfaces[ifaceName];

  return useQuery({
    queryKey: ['paste', ifaceName, id],
    queryFn: () => {
      return iface.getPaste(id);
    },
  });
};

///

export const pageDataSchema = z.union([
  z.object({
    type: z.literal('cbor'),
    body: z.string(),
  }),
  z.object({
    type: z.literal('address'),
    body: z.string(),
  }),
  z.object({
    type: z.literal('hash'),
    body: z.string(),
  }),
]);

export type PageData = z.infer<typeof pageDataSchema>;

export const pasteSchema = z.object({
  content: pageDataSchema,
  meta: z.object({
    created_by: z.string(),
  }),
});

/**
 * Shortens a query string based on its classification. This is effectful
 * because it creates a paste.
 *
 * @param query The query string to shorten.
 * @returns The shortened query string.
 */
export const shortenQuery = async (
  ifaceName: keyof typeof pasteInterfaces,
  query: string,
  forcePaste?: boolean,
): Promise<PageData | string> => {
  const classification = classifySearch(query);

  if (!classification) {
    return query;
  }

  const pageData = (): PageData => {
    if (classification === 'address') {
      return {
        type: 'address',
        body: query,
      };
    }

    if (classification === 'hash') {
      return {
        type: 'hash',
        body: query,
      };
    }

    if (classification === 'cbor') {
      return {
        type: 'cbor',
        body: query,
      };
    }

    throw new Error('Unsupported classification');
  };

  const data = pageData();

  if (data.body.length > 128 || forcePaste) {
    try {
      const id = await pasteInterfaces[ifaceName].createPaste(data);
      return id;
    } catch (e) {
      // Could not create paste, return the original query.
      console.error(e);
      return data;
    }
  }

  return data;
};
