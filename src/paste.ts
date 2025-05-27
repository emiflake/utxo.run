// Support for paste websites containing shareable links.
// For some specific routes, like CBOR. The URLs could hypothetically get really long.
// Because of this, we support paste websites containing shareable links.

import { useQuery } from '@tanstack/react-query';

export type PasteInterface = {
  url: string;

  /**
   * Creates a paste and returns the ID at which the content is available.
   */
  createPaste: (content: string) => Promise<string>;
  /**
   * Returns the content of a paste.
   */
  getPaste: (id: string) => Promise<string>;
};

export const superfishialURL = 'https://paste.super.fish';

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

    // paste.super.fish responds with `/p/<some id>`, let's extract the id.
    const id = text.replace('/p/', '');

    return id;
  },
  getPaste: async (id) => {
    const response = await fetch(`${superfishial.url}/${id}`);
    const json = await response.json();
    return json.content;
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

export type PageData =
  | {
      type: 'cbor';
      // In hex format.
      body: string;
    }
  | {
      type: 'address';
      // In `addr1` format.
      body: string;
    };
