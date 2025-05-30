import { createContext } from 'react';

/**
 * The view mode of datums on all datum views. This is set globally because it's convenient to do so.
 */
export const ViewModeList = {
  hex: 'Hex',
  json: 'JSON',
  diag: 'Diagnostic',
  raw_datum: 'Raw Datum',
  enriched_datum: 'Rich Datum (JSON)',
  enriched_yaml: 'Rich Datum',
} as const;

export type ViewMode = keyof typeof ViewModeList;

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
  unselectAllDatums: () => void;

  selectedDatums: SelectedDatum[];
};

export const DatumContext = createContext<DatumContextInterface | undefined>(
  undefined,
);
