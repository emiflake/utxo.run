export const Box = ({
  children,
  noEmphasize = false,
}: { children: React.ReactNode; noEmphasize?: boolean }) => {
  return (
    <div
      className={`inline-flex shadow-xs flex-col p-2 border-1 border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-100 gap-2 
        ${noEmphasize ? '' : 'bg-gray-50 dark:bg-gray-800'}
        break-all`}
    >
      {children}
    </div>
  );
};

export const BoxHeader = ({
  title,
  children,
}: { title: string; children?: React.ReactNode }) => {
  return (
    <div className="flex items-center justify-between gap-2">
      <h2 className="dark:text-gray-100 text-gray-700 text-md font-semibold">
        {title}
      </h2>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
};
