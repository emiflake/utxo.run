import { createContext } from 'react';

/**
 * The view mode of datums on all datum views. This is set globally because it's convenient to do so.
 */
export type ViewMode =
  | 'hex'
  | 'json'
  | 'diag'
  | 'raw_datum'
  | 'enriched_datum'
  | 'enriched_yaml';

export type SelectedDatum = {
  ref: React.RefObject<HTMLInputElement>;
  cbor: string;
};

export type DatumContextInterface = {
  setViewMode: (viewMode: ViewMode) => void;
  viewMode: ViewMode;

  selectDatum: (ref: React.RefObject<HTMLInputElement>, datum: string) => void;
  unselectDatum: (
    ref: React.RefObject<HTMLInputElement>,
    datum: string,
  ) => void;

  selectedDatums: SelectedDatum[];
};

export const DatumContext = createContext<DatumContextInterface | undefined>(
  undefined,
);
