import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';

export const useTheme = () => {
  // Okay this is admittedly a bit of a hack, but it works quite well.
  const isDarkMode = useQuery({
    queryKey: ['theme'],
    queryFn: () => {
      return (
        localStorage.theme === 'dark' ||
        (!('theme' in localStorage) &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    },
    // Local query, it's free!
    refetchInterval: 1000,
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode.data);
  }, [isDarkMode]);

  const setDarkMode = useCallback(
    (mode: boolean) => {
      document.documentElement.classList.toggle('dark', mode);
      localStorage.theme = mode ? 'dark' : 'light';

      // Refetch to skip waiting for the normal refetch interval
      isDarkMode.refetch({ cancelRefetch: true });
    },
    [isDarkMode],
  );

  const toggleDarkMode = useCallback(() => {
    const newMode = !isDarkMode.data;
    setDarkMode(newMode);
  }, [isDarkMode, setDarkMode]);

  return { isDarkMode: isDarkMode.data!, setDarkMode, toggleDarkMode };
};
