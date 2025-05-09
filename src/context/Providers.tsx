import { useState } from 'react';
import { DatumContext, ViewMode } from './DatumContext';

export const DatumProvider = ({ children }: { children: React.ReactNode }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('enriched_yaml');

  return (
    <DatumContext.Provider value={{ viewMode, setViewMode }}>
      {children}
    </DatumContext.Provider>
  );
};
