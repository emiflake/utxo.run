import { useLocalStorage } from 'react-use';
import { createContext, useContext, useState } from 'react';
import { useRegistry } from './registry';

export type RegistryContextInterface = {
  registryURL: string | undefined;
  setRegistryURL: (url: string | undefined) => void;
};

export const RegistryContext = createContext<
  RegistryContextInterface | undefined
>(undefined);

export const RegistryProvider = ({
  children,
}: { children: React.ReactNode }) => {
  const [registryURL, setRegistryURL] = useLocalStorage<string>(
    'registry-url',
    '/registry-proxy/registry.json',
  );

  return (
    <RegistryContext.Provider value={{ registryURL, setRegistryURL }}>
      {children}
    </RegistryContext.Provider>
  );
};

export const registryBaseURL: string = import.meta.env.VITE_REGISTRY_URL;

export const RegistryUrlSetting = () => {
  const registryContext = useContext(RegistryContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const registryQuery = useRegistry();

  // This is a hack to allow the user to set the registry URL key in devnet environment.
  if (!registryBaseURL.match(/:7100/)) {
    return (
      <div className="flex flex-col space-y-1">
        <label htmlFor="registry-url" className="dark:text-white">
          Registry URL:
        </label>
        <input
          type="text"
          id="registry-url"
          value={registryContext?.registryURL}
          disabled
          className="border rounded p-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300"
          title="This is disabled because it is set in the environment"
        />
      </div>
    );
  }

  const getRegistryId = (url: string | null | undefined) => {
    if (!url) return '';
    if (url === '/registry-proxy/registry.json') return '';
    const match = url.match(/\/registry-proxy\/(.+?)\/registry\.json/);
    return match?.[1] || '';
  };

  const handleIdChange = (id: string) => {
    const safeId = id || '';
    if (safeId === '') {
      registryContext?.setRegistryURL('/registry-proxy/registry.json');
    } else {
      registryContext?.setRegistryURL(
        `/registry-proxy/${safeId}/registry.json`,
      );
    }
    registryQuery.refetch();
  };

  const registryId = getRegistryId(registryContext?.registryURL);

  const handleFocus = () => setIsExpanded(true);

  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor="registry-id" className="dark:text-white">
        Registry URL:
      </label>
      {isExpanded ? (
        <div className="flex flex-wrap items-center border rounded bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300 ease-in-out overflow-hidden">
          <span className="pl-2 py-2 text-gray-500 dark:text-gray-400 transition-all duration-300 whitespace-nowrap">
            /registry-proxy/
          </span>
          <input
            type="text"
            id="registry-id"
            value={registryId}
            onChange={(e) => handleIdChange(e.target.value)}
            onBlur={() => setIsExpanded(false)}
            autoFocus
            className="flex-1 min-w-[150px] p-2 bg-transparent outline-none transition-all duration-300 font-mono text-sm overflow-x-auto"
            aria-label="Registry ID"
            placeholder="registry ID here"
          />
          <span className="pr-2 py-2 text-gray-500 dark:text-gray-400 transition-all duration-300 whitespace-nowrap">
            /registry.json
          </span>
        </div>
      ) : (
        <div
          onClick={handleFocus}
          className="flex items-center border rounded p-2 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 ease-in-out"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleFocus()}
          aria-label="Click to edit registry URL"
          title={registryContext?.registryURL}
        >
          <div className="flex items-center w-full overflow-hidden">
            <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
              /registry-proxy/
            </span>
            {registryId ? (
              <span className="text-gray-900 dark:text-white font-mono text-sm mx-0.5 truncate max-w-[100px] inline-block">
                {registryId}
              </span>
            ) : (
              ''
            )}
            <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {registryId ? '/' : ''}registry.json
            </span>
          </div>
        </div>
      )}
      {registryQuery.data && (
        <div className="flex flex-col space-y-1">
          {registryQuery.data.scriptInfos.length > 0 && (
            <span className="text-gray-500 dark:text-gray-400">
              Loaded {registryQuery.data.scriptInfos.length} scripts
            </span>
          )}
          {registryQuery.data.scriptInfos.length === 0 && (
            <span className="text-gray-500 dark:text-gray-400">
              No scripts loaded
            </span>
          )}
        </div>
      )}
      {registryQuery.error && (
        <span className="text-red-800 dark:text-red-400">
          {registryQuery.error.message}
        </span>
      )}
    </div>
  );
};
