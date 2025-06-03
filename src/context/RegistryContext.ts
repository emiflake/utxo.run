import { createContext } from 'react';

export type RegistryContextInterface = {
  registryURL: string | undefined;
  setRegistryURL: (url: string | undefined) => void;
};

export const RegistryContext = createContext<
  RegistryContextInterface | undefined
>(undefined);
