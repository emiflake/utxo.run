export type RawDatum =
  | null
  | number
  | string
  | RawDatum[]
  | { tag: number; fields: RawDatum[] };

export const parseByteString = (rawDatum: {
  [k: string]: number;
}): number[] => {
  return Object.entries(rawDatum)
    .map(([k, v]) => [parseInt(k, 10), v])
    .sort((a, b) => a[0] - b[0])
    .map(([, v]) => v);
};

// See: https://github.com/aiken-lang/aiken/blob/6d2e38851eb9b14cf5ea04fdc4722405b5c1544a/crates/uplc/src/ast.rs#L437
// const computeCborTag = (index: number): number => {
//   if (index < 7) {
//     return 121 + index;
//   } else if (index < 128) {
//     return 1280 + index - 7;
//   } else {
//     throw new Error(
//       "Constructors with more than 128 fields are not (yet) supported, you have " +
//         index
//     );
//   }
// };

// See: https://github.com/aiken-lang/aiken/blob/6d2e38851eb9b14cf5ea04fdc4722405b5c1544a/crates/uplc/src/ast.rs#L437
// Inverse of computeCborTag
const remapTag = (tag: number): number => {
  if (tag >= 121 && tag < 128) {
    return tag - 121;
  } else if (tag >= 1280 && tag < 1280 + 128) {
    return tag - 1280 + 7;
  } else {
    throw new Error('Invalid tag: ' + tag);
  }
};

export const parseRawDatum = (rawDatum: unknown): RawDatum => {
  if (rawDatum === null) {
    return null;
  }

  if (typeof rawDatum === 'number') {
    return rawDatum;
  } else if (typeof rawDatum === 'string') {
    return rawDatum;
  } else if (Array.isArray(rawDatum)) {
    return rawDatum.map(parseRawDatum).filter((d) => d !== null);
  } else if (typeof rawDatum === 'object') {
    if ('0' in rawDatum) {
      const parsed = parseByteString(rawDatum as { [k: string]: number });

      // Convert to hex
      return parsed.map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    if (
      'tag' in rawDatum &&
      typeof rawDatum.tag === 'number' &&
      'contents' in rawDatum &&
      typeof rawDatum.contents === 'object' &&
      Array.isArray(rawDatum.contents)
    ) {
      return {
        tag: remapTag(rawDatum.tag),
        fields: rawDatum.contents.map(parseRawDatum).filter((d) => d !== null),
      };
    }
  }

  return null;
};

/// For metadata

/**
 * Metadata is encoded as JSON, but since map keys can be non-strings, it encodes it using `{ 'map': [{ 'k': <key>, 'v': <value> }] }'`
 *
 * The following function simplifies this structure when all keys are strings
 */
const simplifyObject = (
  obj: { k: unknown; v: unknown }[],
): { [k: string]: unknown } | { k: unknown; v: unknown }[] => {
  const result: { [k: string]: unknown } = {};

  console.log(obj);
  for (const { k, v } of obj) {
    if (
      typeof k === 'object' &&
      k !== null &&
      'string' in k &&
      typeof k.string === 'string'
    ) {
      result[k.string] = simplifyMetadata(v);
    } else {
      // Not all keys are strings, return the original object!
      return obj;
    }
  }
  return result;
};

/**
 * Simplifies metadata by doing the following:
 *
 * '{ "string": "value" }' -> "value"
 * '{ "int": 1 }'          -> 1
 * '{ "map": <map> }'      -> simplifyObject(<map>)
 */
export const simplifyMetadata = (metadata: unknown): unknown => {
  if (Array.isArray(metadata)) {
    return metadata.map(simplifyObject);
  } else if (
    typeof metadata === 'object' &&
    metadata !== null &&
    'map' in metadata
  ) {
    return simplifyObject(metadata.map as { k: unknown; v: unknown }[]);
  } else if (
    typeof metadata === 'object' &&
    metadata !== null &&
    'string' in metadata
  ) {
    return metadata.string;
  } else if (
    typeof metadata === 'object' &&
    metadata !== null &&
    'int' in metadata
  ) {
    return metadata.int;
  }
  return metadata;
};
