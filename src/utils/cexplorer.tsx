export const cexplorerBaseUrl = "https://cexplorer.io/";
export const txHash = (hash: string) => `${cexplorerBaseUrl}tx/${hash}`;
export const address = (address: string) =>
  `${cexplorerBaseUrl}address/${address}`;
export const block = (block: string) => `${cexplorerBaseUrl}block/${block}`;
export const script = (scriptHash: string) =>
  `${cexplorerBaseUrl}script/${scriptHash}`;

