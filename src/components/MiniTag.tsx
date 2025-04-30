import { Link } from 'react-router';
import { ExternalLinkIcon } from './Icons';

export const MiniTag = ({
  text,
  className,
  children,
}: {
  text: string;
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <span className={`text-xs px-1.5 py-0.5 ${className}`}>
      {text}
      {children}
    </span>
  );
};

export const MintTag = () => {
  return (
    <MiniTag
      text="Mint"
      className="bg-blue-100 text-blue-700 dark:bg-blue-700/50 dark:text-blue-100"
    />
  );
};

export const BurnTag = () => {
  return (
    <MiniTag
      text="Burn"
      className="bg-red-100 text-red-700 dark:bg-red-700/50 dark:text-red-300"
    />
  );
};

export const SpentTag = () => {
  return (
    <MiniTag
      text="Spent"
      className="bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-200 flex items-center gap-1"
    >
      <ExternalLinkIcon />
    </MiniTag>
  );
};

export const MultisigTag = () => {
  return (
    <MiniTag
      text="Multisig"
      className="bg-purple-100 text-purple-700 dark:bg-purple-700/50 dark:text-purple-300"
    />
  );
};

export const FeeTag = ({ fee }: { fee: number }) => {
  return (
    <MiniTag
      text={`${(fee / 1000000).toFixed(2)}₳`}
      className="bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300"
    />
  );
};

export const MintingPolicyTag = () => {
  return (
    <MiniTag
      text="MintingPolicy"
      className="bg-blue-100 text-blue-700 dark:bg-blue-700/50 dark:text-blue-100"
    />
  );
};

export const ValidatorTag = () => {
  return (
    <MiniTag
      text="Validator"
      className="bg-green-100 text-green-700 dark:bg-green-700/50 dark:text-green-100"
    />
  );
};

export const StakeValidatorTag = () => {
  return (
    <MiniTag
      text="StakeValidator"
      className="bg-green-100 text-green-700 dark:bg-green-700/50 dark:text-green-100"
    />
  );
};

export const ScriptTypeTag = ({
  scriptType,
}: {
  scriptType: 'MintingPolicy' | 'Validator' | 'StakeValidator';
}) => {
  switch (scriptType) {
    case 'MintingPolicy':
      return <MintingPolicyTag />;
    case 'Validator':
      return <ValidatorTag />;
    case 'StakeValidator':
      return <StakeValidatorTag />;
    default:
      return null;
  }
};

// Tag component for displaying tag-like elements
export const Tag = ({
  label,
  value,
  href,
  labelColor = 'bg-gray-100 dark:bg-gray-700',
}: {
  label: string;
  value: React.ReactNode;
  href?: string;
  labelColor?: string;
}) => {
  if (!value) return null;

  return (
    <span className="inline-flex items-stretch text-xs mr-2 mb-1 border border-gray-100 dark:border-gray-700">
      <span
        className={`text-gray-500 dark:text-gray-300 px-1.5 py-0.5 flex-shrink-0 ${labelColor}`}
      >
        {label}
      </span>
      {href && (
        <Link
          to={href}
          className="bg-gray-50 dark:bg-gray-800 text-indigo-500 dark:text-indigo-300 hover:underline px-1.5 py-0.5"
        >
          {value}
        </Link>
      )}
      {!href && (
        <span className="bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1.5 py-0.5">
          {value}
        </span>
      )}
    </span>
  );
};

// MonoTag component for displaying monospace values with optional link
export const MonoTag = ({
  label,
  value,
  href,
}: {
  label: string;
  value: React.ReactNode;
  href?: string;
}) => {
  if (!value) return null;

  const content = (
    <span className="inline-flex items-stretch text-xs mr-2 mb-1 border border-gray-100 dark:border-gray-700">
      <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-1.5 py-0.5 flex-shrink-0">
        {label}
      </span>
      {href && (
        <Link
          to={href}
          className="bg-gray-50 dark:bg-gray-800 text-indigo-500 dark:text-indigo-300 hover:underline px-1.5 py-0.5 font-mono"
        >
          {value}
        </Link>
      )}
      {!href && (
        <span className="bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 font-mono">
          {value}
        </span>
      )}
    </span>
  );

  return content;
};
