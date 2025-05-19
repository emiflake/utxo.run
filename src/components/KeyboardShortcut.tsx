export const KeyboardShortcut = ({
  children,
}: {
  children: string;
}) => {
  const elements = children.split('+').map((el) => el.trim());

  const Key = ({ keyName }: { keyName: string }) => {
    return (
      <span
        className="inline-flex items-center justify-center px-1
                         bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-400 font-mono text-xs font-medium
                         rounded-md border border-gray-300 dark:border-gray-500
                         shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.2),0_1px_1px_0_rgba(0,0,0,0.1)]
                         min-w-[1.25rem] h-[1.25rem] mx-0.5
                         relative top-0"
      >
        {keyName}
      </span>
    );
  };

  return (
    <span className="text-xs text-gray-500 dark:text-gray-500">
      {elements.map((el, i) => (
        <span key={i}>
          <Key keyName={el} />
          {i < elements.length - 1 && (
            <span className="text-gray-500 dark:text-gray-500 text-md">
              {' + '}
            </span>
          )}
        </span>
      ))}
    </span>
  );
};
