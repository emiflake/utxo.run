import * as Registry from '../registry';
import { Link } from 'react-router';

// Tag component for displaying tag-like elements
const Tag = ({ label, value }: { label: string; value: React.ReactNode }) => {
  if (!value) return null;

  return (
    <span className="inline-flex items-center text-xs mr-2 mb-1 border border-gray-100 dark:border-gray-700">
      <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-1.5 py-0.5">
        {label}
      </span>
      <span className="bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1.5 py-0.5">
        {value}
      </span>
    </span>
  );
};

// MonoTag component for displaying monospace values with optional link
const MonoTag = ({
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
    <span className="inline-flex items-center text-xs mr-2 mb-1 border border-gray-100 dark:border-gray-700">
      <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-1.5 py-0.5">
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

// DeploymentInfo component for displaying deployment information
export const DeploymentInfo = ({
  deployment,
}: { deployment: Registry.ScriptInfo['deployment'] }) => {
  // Safe type check for deployment object
  if (!deployment || typeof deployment !== 'object') return null;

  // Render deployment content based on type
  const renderDeploymentContent = () => {
    if (deployment.type === 'lockedAt') {
      const txId = deployment.referenceUtxo?.input?.transactionId;
      const index = deployment.referenceUtxo?.input?.index;

      return (
        <div className="flex flex-wrap">
          {txId && (
            <MonoTag
              label="Transaction"
              value={txId}
              href={`/submitted-tx/${txId}`}
            />
          )}
          {index !== undefined && (
            <MonoTag label="Output Index" value={index.toString()} />
          )}
        </div>
      );
    } else if (deployment.type === 'notDeployed') {
      return (
        <div className="flex flex-wrap">
          {deployment.version && (
            <MonoTag label="Version" value={deployment.version} />
          )}
          {deployment.rawHex && (
            <MonoTag
              label="Raw Hex"
              value={`${deployment.rawHex.substring(0, 20)}...`}
            />
          )}
        </div>
      );
    }

    return (
      <span className="text-xs dark:text-gray-300">
        Unknown deployment type
      </span>
    );
  };

  return (
    <div className="mt-1 pt-1 border-t border-gray-200 dark:border-gray-700">
      <span className="inline-block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        Deployment
      </span>
      {renderDeploymentContent()}
    </div>
  );
};

// TokenInfo component for displaying all token information
export const ScriptInfo = ({ script }: { script: Registry.ScriptInfo }) => {
  if (!script) return null;

  return (
    <div className="border border-gray-200 dark:border-gray-700 p-4 mb-2 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-medium dark:text-white">{script.name}</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            (source: registry)
          </span>
          {script.tag && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({script.tag})
            </span>
          )}
        </div>
      </div>

      {script.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
          {script.description}
        </p>
      )}

      <div className="flex flex-wrap">
        <Tag label="Component" value={script.componentName} />
        <Tag label="Market" value={script.market} />
        {script.network && <Tag label="Network" value={script.network.tag} />}
      </div>

      {/* Deployment information */}
      {script.deployment && <DeploymentInfo deployment={script.deployment} />}
    </div>
  );
};
