import { NavigateFunction } from 'react-router';
import { shortenQuery } from './paste';

export type SearchType = 'hash' | 'cbor' | 'address';

// TODO: We could support more types of search if we are clever enough
export const classifySearch = (searchValue: string): SearchType | null => {
  if (searchValue.startsWith('addr') || searchValue.startsWith('stake')) {
    return 'address';
  }
  if (searchValue.length === 64) {
    return 'hash';
  }
  if (
    searchValue.length >= 32 &&
    searchValue.split('').every((c) => '0123456789abcdefABCDEF'.includes(c))
  ) {
    return 'cbor';
  }
  return null;
};

export const handleSearch = async (
  searchValue: string,
  navigate: NavigateFunction,
  forcePaste?: boolean,
) => {
  const ifaceName = 'sf';

  const result = await shortenQuery(ifaceName, searchValue, forcePaste);

  if (typeof result === 'string') {
    // For some reason, the navigate function is not working consistently.
    // So we try a few times. This somehow seems to work! What the heck.
    navigate(`/p/${result}`);
    navigate(`/p/${result}`);
    navigate(`/p/${result}`);
    navigate(`/p/${result}`);
  } else {
    const searchType = classifySearch(searchValue);
    if (searchType === 'hash') {
      navigate(`/submitted-tx/${searchValue}`);
    } else if (searchType === 'address') {
      navigate(`/address/${searchValue}`);
    } else if (searchType === 'cbor') {
      navigate(`/tx/${searchValue}`);
    } else {
      return;
    }
  }
};
