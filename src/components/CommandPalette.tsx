import React, { useState, useRef, useEffect, useMemo } from "react";
import { NavigateFunction, useNavigate } from "react-router";
import { classifySearch, handleSearch } from "../search";
import { shorten } from "../utils";
import { useTheme } from "../context/Theme";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import Fuse from "fuse.js";
import { Command } from "cmdk";
import { BlueprintIcon, MoonIcon, SunIcon } from "@/components/Icons";

type CommandContext = {
  navigate: NavigateFunction;
  theme: ReturnType<typeof useTheme>;
};

type Command = {
  name: string;
  displayAs?: React.ReactNode;
  action: (context: CommandContext) => void;
};

const NotCurrentThemeIcon = () => {
  const { isDarkMode } = useTheme();
  return isDarkMode ? <SunIcon /> : <MoonIcon />;
};

// Example commands (extend as needed)
const DEFAULT_GLOBAL_COMMANDS: Command[] = [
  /// Navigation
  {
    name: "plutus.json blueprints",
    action: (ctx: CommandContext) => {
      ctx.navigate("/blueprint");
    },
    displayAs: (
      <>
        plutus.json blueprints <BlueprintIcon />
      </>
    ),
  },
  {
    name: "Registry",
    action: (ctx: CommandContext) => {
      ctx.navigate("/registry");
    },
  },
  {
    name: "Chain explorer",
    action: (ctx: CommandContext) => {
      ctx.navigate("/chain");
    },
  },

  {
    name: "Theme Toggle",
    action: (ctx: CommandContext) => {
      ctx.theme.toggleDarkMode();
    },
    displayAs: (
      <>
        Theme Toggle <NotCurrentThemeIcon />
      </>
    ),
  },
];

function syntheticCommands(input: string): Command[] {
  const searchType = classifySearch(input);
  if (searchType === "hash") {
    return [
      {
        name: `Tx with hash: ${shorten(input)}`,
        displayAs: (
          <>
            Tx with hash:{" "}
            <span className="font-mono text-foreground-accent">
              {shorten(input)}
            </span>
          </>
        ),
        action: (ctx: CommandContext) => {
          handleSearch(input, ctx.navigate);
        },
      },
    ];
  } else if (searchType === "address") {
    return [
      {
        name: `Address: ${shorten(input)}`,
        displayAs: (
          <>
            Address: <span className="font-mono">{shorten(input)}</span>
          </>
        ),
        action: (ctx: CommandContext) => {
          handleSearch(input, ctx.navigate);
        },
      },
    ];
  } else if (searchType === "cbor") {
    return [
      {
        name: `Tx with CBOR: ${shorten(input)}`,
        displayAs: (
          <>
            Tx with CBOR: <span className="font-mono">{shorten(input)}</span>
          </>
        ),
        action: (ctx: CommandContext) => {
          handleSearch(input, ctx.navigate);
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
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, ctrl, callback]);
}

const CommandPalette = ({
  extraCommands: pageCommands = [],
}: {
  extraCommands?: Command[];
}) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Open on Ctrl+K
  useOnKeyCombo("k", true, () => setOpen(true));

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
    } else {
      setQuery("");
    }
  }, [open]);

  const globalFuse = new Fuse(DEFAULT_GLOBAL_COMMANDS, {
    keys: ["name"],
    threshold: 0.2,
  });

  const pageFuse = new Fuse(pageCommands, {
    keys: ["name"],
    threshold: 0.2,
  });

  const synthetic = useMemo(() => syntheticCommands(query), [query]);

  const FilteredCommandGroup = ({
    allCommands,
    fuse,
    query,
    heading,
  }: {
    allCommands: Command[];
    fuse?: Fuse<Command>;
    query: string;
    heading: string;
  }) => {
    const res =
      !query || !fuse ? allCommands : fuse.search(query).map((cmd) => cmd.item);

    return (
      <>
        {res.length > 0 && (
          <CommandGroup heading={heading}>
            {res.map((cmd, i) => (
              <CommandItem
                key={cmd.name + i}
                onSelect={() => cmd.action({ navigate, theme })}
              >
                {cmd.displayAs || cmd.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </>
    );
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
      <CommandInput
        value={query}
        onValueChange={setQuery}
        className="w-full max-w-[90%]"
        placeholder="Type a command or search..."
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <FilteredCommandGroup
          allCommands={synthetic}
          query={query}
          heading="Your search"
        />

        <FilteredCommandGroup
          allCommands={DEFAULT_GLOBAL_COMMANDS}
          fuse={globalFuse}
          query={query}
          heading="Global"
        />
        <FilteredCommandGroup
          allCommands={pageCommands}
          fuse={pageFuse}
          query={query}
          heading="Page"
        />
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
