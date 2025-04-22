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
