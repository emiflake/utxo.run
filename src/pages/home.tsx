import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { AnimatedSearchInput } from '../components/AnimatedSearchInput';
import { NavBar } from '../components/nav';
import CommandPalette from '../components/CommandPalette';
import { MainLayout } from '../components/layout/Main';
import { classifySearch } from '../search';
import { useOgmiosHealth } from '../ogmios';
import { useLatestBlock } from '../betterfrost';
import { KeyboardShortcut } from '../components/KeyboardShortcut';
import { Footer } from '../components/layout/Footer';

/// Silly animated placeholder text
function useAnimatedText({ options }: { options: string[] }) {
  const [displayText, setDisplayText] = useState('');
  const [currentOptionIndex, setCurrentOptionIndex] = useState(0);
  const [nextOptionIndex, setNextOptionIndex] = useState(0);
  const [phase, setPhase] = useState<
    'typing' | 'pausing' | 'erasing' | 'transitioning'
  >('typing');

  const [charIndex, setCharIndex] = useState(0);
  const [commonPrefixLength, setCommonPrefixLength] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_diffStartIndex, setDiffStartIndex] = useState(0);

  // Find the common prefix length between two strings
  const findCommonPrefix = (str1: string, str2: string) => {
    let i = 0;
    while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
      i++;
    }
    return i;
  };

  useEffect(() => {
    const currentOption = options[currentOptionIndex];

    switch (phase) {
      case 'typing':
        if (charIndex < currentOption.length) {
          const typingTimer = setTimeout(
            () => {
              setDisplayText(currentOption.substring(0, charIndex + 1));
              setCharIndex(charIndex + 1);
            },
            20 + Math.random() * 20,
          );
          return () => clearTimeout(typingTimer);
        } else {
          // Finished typing, pause before next action
          const pauseTimer = setTimeout(() => {
            // Calculate next option and find common prefix
            const next = (currentOptionIndex + 1) % options.length;
            setNextOptionIndex(next);
            const commonPrefix = findCommonPrefix(currentOption, options[next]);
            setCommonPrefixLength(commonPrefix);
            setDiffStartIndex(commonPrefix);
            setPhase('pausing');
          }, 1500);
          return () => clearTimeout(pauseTimer);
        }

      case 'pausing': {
        // Transition to erasing phase after pause
        const transitionTimer = setTimeout(() => {
          setPhase('erasing');
        }, 200);
        return () => clearTimeout(transitionTimer);
      }

      case 'erasing':
        // Only erase the part that differs
        if (charIndex > commonPrefixLength) {
          const erasingTimer = setTimeout(() => {
            setDisplayText(currentOption.substring(0, charIndex - 1));
            setCharIndex(charIndex - 1);
          }, 20);
          return () => clearTimeout(erasingTimer);
        } else {
          // Done erasing, ready to type the new option
          const nextTimer = setTimeout(() => {
            setCurrentOptionIndex(nextOptionIndex);
            setPhase('typing');
          }, 100);
          return () => clearTimeout(nextTimer);
        }

      default:
        return undefined;
    }
  }, [
    options,
    currentOptionIndex,
    phase,
    charIndex,
    commonPrefixLength,
    nextOptionIndex,
  ]);

  return displayText || '|'; // Show cursor when empty
}

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

  const animatedText = useAnimatedText({
    options: [
      'Enter your transaction hash here...',
      'Enter your CBOR here...',
      'Enter your address here...',
    ],
  });

  return (
    <AnimatedSearchInput
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
      onSubmit={handleSearch}
      placeholder={animatedText}
      title="Addresses, tx CBORs and tx hashes all work!"
      type="search"
      inputClassName=" text-sm border border-gray-200 dark:border-gray-700"
    />
  );
}

export const HomePage = () => {
  const {
    data: latestBlock,
    isLoading: latestBlockLoading,
    isError: latestBlockError,
  } = useLatestBlock();
  const ogmiosHealth = useOgmiosHealth();
  const ogmiosConnectionState = useMemo(() => {
    if (ogmiosHealth.isLoading) return 'loading';
    if (ogmiosHealth.isError) return 'error';
    return ogmiosHealth.data ? 'connected' : 'error';
  }, [ogmiosHealth]);

  const betterfrostConnectionState = useMemo(() => {
    if (latestBlockLoading) return 'loading';
    if (latestBlockError) return 'error';
    return latestBlock !== undefined ? 'connected' : 'error';
  }, [latestBlock, latestBlockLoading, latestBlockError]);

  return (
    <div className="min-h-screen flex flex-col p-1 gap-5 dark:bg-gray-900">
      <NavBar />

      <CommandPalette />

      <MainLayout>
        <div className="flex flex-col p-2 gap-2 max-w-[600px] lg:max-w-[1200px] mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            fine-tx
          </h1>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            Git repo:{' '}
            <a
              href="https://github.com/emiflake/fine-tx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 dark:text-blue-300 hover:underline"
            >
              emiflake/fine-tx
            </a>
          </span>

          <p className="text-gray-700 dark:text-gray-300">
            A feature... fine transaction viewer. Especially useful for local
            devnet debugging!
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Service status:
          </h2>
          <p className="p-2 text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Betterfrost:</span>{' '}
            {betterfrostConnectionState}
          </p>
          <p className="p-2 text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Ogmios:</span>{' '}
            {ogmiosConnectionState}
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Using fine-tx
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            You can use fine-tx to view transactions, both submitted and raw
            CBOR. You can also view addresses and policies. The search bar
            accepts any of those in their common formats. You can also open the
            command palette with <KeyboardShortcut>Ctrl + K</KeyboardShortcut>.
          </p>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            You can also view the liqwid registry. This is a registry of scripts
            and policies that are used in the liqwid protocol, as well as agora.
            These are used to enrich the information displayed on the various
            pages.
          </p>
        </div>
        <div className="flex flex-col min-w-[600px] max-w-[800px] lg:max-w-[1200px] mx-auto">
          <div className="flex flex-col gap-2 p-4 m-2 border border-gray-200 dark:border-gray-700">
            <h1 className="text-lg min-w-[160px] font-medium text-gray-700 dark:text-gray-300">
              Get started!
            </h1>
            <div className="flex flex-row sm:flex-row items-start sm:items-center gap-1">
              <label
                htmlFor="query"
                className="text-sm min-w-[160px] font-medium text-gray-700 dark:text-gray-300"
              >
                Enter query:
              </label>
              <div className="w-full">
                <SearchBar />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
      <Footer />
    </div>
  );
};
