export type SearchType = "hash" | "cbor" | "address";

// TODO: We could support more types of search if we are clever enough
export const classifySearch = (searchValue: string): SearchType | null => {
  if (searchValue.startsWith("addr") || searchValue.startsWith("stake")) {
    return "address";
  }
  if (searchValue.length === 64) {
    return "hash";
  }
  if (
    searchValue.length >= 32 &&
    searchValue.split("").every((c) => "0123456789abcdefABCDEF".includes(c))
  ) {
    return "cbor";
  }
  return null;
};
