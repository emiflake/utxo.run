import { useEffect, useState } from 'react';
import { DatumContext, SelectedDatum, ViewMode } from './DatumContext';
import { useLocation } from 'react-router';

export const DatumProvider = ({ children }: { children: React.ReactNode }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('enriched_yaml');
  const [selectedDatums, setSelectedDatums] = useState<SelectedDatum[]>([]);

  const location = useLocation();

  const selectDatum = (
    ref: React.RefObject<HTMLInputElement>,
    datum: string,
  ) => {
    setSelectedDatums([...selectedDatums, { ref, cbor: datum }]);
  };

  const unselectDatum = (
    ref: React.RefObject<HTMLInputElement>,
    datum: string,
  ) => {
    setSelectedDatums(
      selectedDatums.filter((d) => d.cbor !== datum || d.ref !== ref),
    );
  };

  const unselectAllDatums = () => {
    setSelectedDatums([]);
  };

  useEffect(() => {
    setSelectedDatums([]);
  }, [location]);

  return (
    <DatumContext.Provider
      value={{
        viewMode,
        setViewMode,
        selectedDatums,
        selectDatum,
        unselectDatum,
        unselectAllDatums,
      }}
    >
      {children}
    </DatumContext.Provider>
  );
};
