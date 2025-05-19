import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AnimatedSearchInput } from './AnimatedSearchInput';
import { SettingsModal } from './SettingsModal';
import { ThemeToggle } from './Toggle';
import { IconButton } from './Button';
import {
  BlueprintIcon,
  ChevronDownIcon,
  ExplorerIcon,
  FileIcon,
  FileSearchIcon,
  LogoIcon,
  RegistryIcon,
  SearchIcon,
  SettingsIcon,
} from './Icons';
import { classifySearch } from '../search';

export function SearchBar() {
  const [searchValue, setSearchValue] = useState('');

  const navigate = useNavigate();

  const handleSearch = useCallback(() => {
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
  }, [searchValue, navigate]);

  return (
    <div className="relative w-full md:w-64 lg:w-80">
      <SearchIcon
        className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 z-20"
        color="#9ca3af"
      />
      <AnimatedSearchInput
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onSubmit={handleSearch}
        placeholder="Enter your transaction hash here..."
        title="Addresses, tx CBORs and tx hashes all work!"
        type="search"
        inputClassName="pl-8 h-9 text-sm border border-gray-200 dark:border-gray-700"
      />
    </div>
  );
}

export function NavBar() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center gap-2 mr-8">
            <Link to="/" className="flex items-center gap-2">
              <LogoIcon />
              <span className="text-2xl font-bold tracking-tight text-orange-300">
                fine.tx
              </span>
            </Link>
          </div>

          <nav className="hidden lg:flex flex-1">
            <ul className="flex items-center gap-4">
              <li>
                <Link
                  to="/registry"
                  className="group inline-flex h-9 w-max items-center justify-center bg-background dark:bg-gray-800 px-4 py-2 text-sm font-medium dark:text-white transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none disabled:pointer-events-none disabled:opacity-50 rounded"
                >
                  <RegistryIcon />
                  Registry
                </Link>
              </li>
              <li>
                <div className="relative group">
                  <button className="inline-flex h-9 w-max items-center justify-center bg-background dark:bg-gray-800 px-4 py-2 text-sm font-medium dark:text-white transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none disabled:pointer-events-none disabled:opacity-50 rounded">
                    Transactions
                    <ChevronDownIcon />
                  </button>
                  <div className="absolute left-0 mt-2 w-[200px] bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <ul className="py-1">
                      <li>
                        <Link
                          to="/tx/"
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium dark:text-white no-underline outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <FileIcon />
                          <span>Tx by CBOR</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/submitted-tx/"
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium dark:text-white no-underline outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <FileSearchIcon />
                          <span>Tx by Hash</span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>

              <li>
                <div className="relative group">
                  <button className="inline-flex h-9 w-max items-center justify-center bg-background dark:bg-gray-800 px-4 py-2 text-sm font-medium dark:text-white transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none disabled:pointer-events-none disabled:opacity-50 rounded">
                    Other
                    <ChevronDownIcon />
                  </button>
                  <div className="absolute left-0 mt-2 w-[200px] bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <ul className="py-1">
                      <li>
                        <Link
                          to="/blueprint"
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium dark:text-white no-underline outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <BlueprintIcon />
                          plutus.json
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/chain"
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium dark:text-white no-underline outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <ExplorerIcon />
                          Chain Explorer
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
            </ul>
          </nav>

          <div className="flex items-center ml-auto">
            <SearchBar />
            <div className="flex items-center gap-3 p-3">
              <ThemeToggle />
              <IconButton
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                disabled={isSettingsOpen}
                ariaLabel="Settings"
              >
                <SettingsIcon />
              </IconButton>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="border-t border-gray-200 dark:border-gray-700 py-2 lg:hidden">
          <nav className="container mx-auto max-w-md flex justify-between px-4">
            <Link
              to="/registry"
              className="flex flex-col items-center text-sm font-medium dark:text-white hover:underline"
            >
              <RegistryIcon className="mb-1 h-5 w-5" />
              Registry
            </Link>
            <Link
              to="/tx/"
              className="flex flex-col items-center text-sm font-medium dark:text-white hover:underline"
            >
              <FileIcon className="mb-1 h-5 w-5" />
              Tx by CBOR
            </Link>
            <Link
              to="/chain"
              className="flex flex-col items-center text-sm font-medium dark:text-white hover:underline"
            >
              <ExplorerIcon className="mb-1 h-5 w-5" />
              Explorer
            </Link>
            <Link
              to="/submitted-tx/"
              className="flex flex-col items-center text-sm font-medium dark:text-white hover:underline"
            >
              <FileSearchIcon className="mb-1 h-5 w-5" />
              Tx by Hash
            </Link>
          </nav>
        </div>
      </header>
      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </>
  );
}
