import { useLocalStorage } from 'react-use';
import { useContext, useState } from 'react';
import { dynamicRegistry, useRegistry } from './registry';
import { ShimmerBox } from './components/tx';
import { ErrorBox } from './App';
import { RegistryContext } from '@/context/RegistryContext';

const defaultRegistryURL = '/registry-proxy/registry.json';

export const RegistryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [registryURL, setRegistryURL] = useLocalStorage<string>(
    'registry-url',
    defaultRegistryURL,
  );

  if (!dynamicRegistry) {
    return (
      <RegistryContext.Provider
        value={{ registryURL: defaultRegistryURL, setRegistryURL }}
      >
        {children}
      </RegistryContext.Provider>
    );
  }

  return (
    <RegistryContext.Provider value={{ registryURL, setRegistryURL }}>
      {children}
    </RegistryContext.Provider>
  );
};

export const RegistryUrlSetting = () => {
  const registryContext = useContext(RegistryContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const registryQuery = useRegistry();

  // This is a hack to allow the user to set the registry URL key in devnet environment.
  if (!dynamicRegistry) {
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
          className="rounded p-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 min-h-[44px] border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm rounded flex items-center opacity-60 cursor-not-allowed"
          title="This is disabled because `VITE_DYN_REGISTRY` is set to `false`"
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
      registryContext?.setRegistryURL(defaultRegistryURL);
    } else {
      registryContext?.setRegistryURL(
        `/registry-proxy/${safeId}/registry.json`,
      );
    }
    registryQuery.refetch();
  };

  const registryId = getRegistryId(registryContext?.registryURL);

  const handleFocus = () => setIsExpanded(true);
  const handleBlur = () => setIsExpanded(false);

  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor="registry-id" className="dark:text-white">
        Registry URL:
      </label>
      {isExpanded ? (
        <div
          className="flex-wrap rounded bg-white dark:bg-gray-800 border-gray-200 
            dark:border-gray-700 overflow-hidden group focus-within:border-gray-300 dark:focus-within:border-gray-600 shadow-sm
            min-h-[44px] border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm rounded flex items-center opacity-60 cursor-not-allowed
            "
        >
          <span className="pl-3 py-2 text-gray-500 dark:text-gray-400 whitespace-nowrap select-none">
            /registry-proxy/
          </span>
          <input
            type="text"
            id="registry-id"
            value={registryId}
            onChange={(e) => handleIdChange(e.target.value)}
            onBlur={handleBlur}
            autoFocus
            className="flex-1 min-w-[150px] h-10 px-2 py-1 bg-transparent dark:bg-transparent outline-none font-mono text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border-none focus:ring-0 focus:outline-none"
            aria-label="Registry ID"
            placeholder="registry ID here"
          />
          <span className="pr-3 py-2 text-gray-500 dark:text-gray-400 whitespace-nowrap select-none">
            /registry.json
          </span>
        </div>
      ) : (
        <div
          onClick={handleFocus}
          className="flex items-center min-h-[44px] border-2 rounded bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm p-2 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600"
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
      {registryQuery.isLoading && (
        <div className="flex flex-col max-w-[200px] space-y-1">
          <ShimmerBox />
        </div>
      )}
      {registryQuery.error && (
        <ErrorBox message={registryQuery.error.message} />
      )}
    </div>
  );
};
