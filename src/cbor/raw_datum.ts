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
// eslint-disable-next-line
const computeCborTag = (index: number): number => {
  if (index < 7) {
    return 121 + index;
  } else if (index < 128) {
    return 1280 + index - 7;
  } else {
    throw new Error(
      "Constructors with more than 128 fields are not (yet) supported, you have " +
        index
    );
  }
};

// See: https://github.com/aiken-lang/aiken/blob/6d2e38851eb9b14cf5ea04fdc4722405b5c1544a/crates/uplc/src/ast.rs#L437
// Inverse of computeCborTag
const remapTag = (tag: number): number => {
  if (tag >= 121 && tag < 128) {
    return tag - 121;
  } else if (tag >= 1280 && tag < 1280 + 128) {
    return tag - 1280 + 7;
  } else {
    throw new Error("Invalid tag: " + tag);
  }
};

export const parseRawDatum = (rawDatum: unknown): RawDatum => {
  if (rawDatum === null) {
    return null;
  }

  if (typeof rawDatum === "number") {
    return rawDatum;
  } else if (typeof rawDatum === "string") {
    return rawDatum;
  } else if (Array.isArray(rawDatum)) {
    return rawDatum.map(parseRawDatum).filter((d) => d !== null);
  } else if (typeof rawDatum === "object") {
    if ("0" in rawDatum) {
      const parsed = parseByteString(rawDatum as { [k: string]: number });

      // Convert to hex
      return parsed.map((b) => b.toString(16).padStart(2, "0")).join("");
    }

    if (
      "tag" in rawDatum &&
      typeof rawDatum.tag === "number" &&
      "contents" in rawDatum &&
      typeof rawDatum.contents === "object" &&
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
