import * as pkg from '../../../package.json';

export const Footer = () => {
  return (
    <footer className="flex justify-center">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        utxo.run version {pkg.version}
      </p>
    </footer>
  );
};
