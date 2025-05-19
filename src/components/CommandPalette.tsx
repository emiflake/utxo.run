import React, { useState, useRef, useEffect, useMemo } from 'react';
import { TerminalIcon } from './Icons';
import { NavigateFunction, useNavigate } from 'react-router';
import { classifySearch } from '../search';
import { shorten } from '../utils';
import { useTheme } from '../context/Theme';

type CommandContext = {
  navigate: NavigateFunction;
  theme: ReturnType<typeof useTheme>;
};

type Command = {
  name: string;
  displayAs?: React.ReactNode;
  action: (context: CommandContext) => void;
};

// Example commands (extend as needed)
const DEFAULT_GLOBAL_COMMANDS: Command[] = [
  {
    name: 'Theme Toggle',
    action: (ctx: CommandContext) => {
      ctx.theme.toggleDarkMode();
    },
  },

  /// Navigation
  {
    name: 'plutus.json blueprints',
    action: (ctx: CommandContext) => {
      ctx.navigate('/blueprint');
    },
  },
  {
    name: 'Registry',
    action: (ctx: CommandContext) => {
      ctx.navigate('/registry');
    },
  },
  {
    name: 'Chain explorer',
    action: (ctx: CommandContext) => {
      ctx.navigate('/chain');
    },
  },
];

function syntheticCommands(input: string): Command[] {
  const searchType = classifySearch(input);
  if (searchType === 'hash') {
    return [
      {
        name: `Tx with hash: ${shorten(input)}`,
        displayAs: (
          <>
            Tx with hash: <span className="font-mono">{shorten(input)}</span>
          </>
        ),
        action: (ctx: CommandContext) => {
          ctx.navigate(`/submitted-tx/${input}`);
        },
      },
    ];
  } else if (searchType === 'address') {
    return [
      {
        name: `Address: ${shorten(input)}`,
        displayAs: (
          <>
            Address: <span className="font-mono">{shorten(input)}</span>
          </>
        ),
        action: (ctx: CommandContext) => {
          ctx.navigate(`/address/${input}`);
        },
      },
    ];
  } else if (searchType === 'cbor') {
    return [
      {
        name: `Tx with CBOR: ${shorten(input)}`,
        displayAs: (
          <>
            Tx with CBOR: <span className="font-mono">{shorten(input)}</span>
          </>
        ),
        action: (ctx: CommandContext) => {
          ctx.navigate(`/tx/${input}`);
        },
      },
    ];
  }
  return [];
}

function useOnKeyCombo(key: string, ctrl = false, callback: () => void) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (
        e.key.toLowerCase() === key.toLowerCase() &&
        !!ctrl === (e.ctrlKey || e.metaKey)
      ) {
        e.preventDefault();
        callback();
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, ctrl, callback]);
}

const CommandPalette = ({
  extraCommands = [],
}: { extraCommands?: Command[] }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Open on Ctrl+K
  useOnKeyCombo('k', true, () => setOpen(true));

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
    } else {
      setQuery('');
      setSelected(0);
    }
  }, [open]);

  // Filter commands
  const filtered = DEFAULT_GLOBAL_COMMANDS.filter((cmd) =>
    cmd.name.toLowerCase().includes(query.toLowerCase()),
  );

  const synthetic = syntheticCommands(query);

  const commands = useMemo(
    () => [...filtered, ...synthetic, ...extraCommands],
    [filtered, synthetic, extraCommands],
  );

  // Trap focus
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'ArrowDown')
        setSelected((i) => Math.min(i + 1, commands.length - 1));
      if (e.key === 'ArrowUp') setSelected((i) => Math.max(i - 1, 0));
      if (e.key === 'Enter' && commands[selected]) {
        commands[selected].action({ navigate, theme });
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, selected, query, theme, commands, navigate]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 dark:bg-black/60 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      onClick={() => setOpen(false)}
    >
      <div
        className="mt-32 w-full max-w-sm rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-t-lg px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
          <TerminalIcon className="h-4 w-4 mr-2 text-zinc-400 dark:text-zinc-500" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-sm outline-none text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600"
            placeholder="Type a command..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            aria-label="Command palette input"
          />
        </div>
        <ul
          ref={listRef}
          className="flex flex-col max-h-56 p-2 gap-1 overflow-y-auto"
        >
          {commands.length === 0 && (
            <li className="p-2 text-xs text-zinc-400 dark:text-zinc-600">
              No commands found.
            </li>
          )}
          {commands.map((cmd, i) => (
            <li
              key={cmd.name}
              className={`p-2 cursor-pointer select-none text-sm rounded-md break-all ${
                i === selected
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  : ' text-gray-900 dark:text-gray-400'
              }`}
              onMouseEnter={() => setSelected(i)}
              onClick={() => {
                cmd.action({ navigate, theme });
                setOpen(false);
              }}
              role="option"
              aria-selected={i === selected}
              tabIndex={-1}
            >
              {cmd.displayAs || cmd.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CommandPalette;
