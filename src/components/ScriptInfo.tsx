import * as Registry from '../registry';
import { MonoTag, ScriptTypeTag, Tag } from './MiniTag';

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
    <div className="border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <ScriptTypeTag scriptType={script.type} />
          <h3 className="text-sm font-medium dark:text-white">{script.name}</h3>
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
