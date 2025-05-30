import { Suspense } from 'react';
import { ShimmerBox } from '../tx';

export const MainLayout = ({
  children,
  ariaLabel,
}: {
  children: React.ReactNode;
  ariaLabel?: string;
}) => {
  return (
    <div className="flex-1 flex flex-col sm:flex-row">
      <main
        className="flex-1 flex flex-col gap-2"
        // For accessibility, we tag this as the main content so the skip link works
        id="content"
        aria-label={ariaLabel}
      >
        {children}
      </main>
      <aside className="order-first md:w-16 lg:w-32" aria-hidden></aside>
      <aside className="md:w-16 lg:w-32" aria-hidden></aside>
    </div>
  );
};

const Fallback = () => {
  return (
    <div className="flex-1 flex flex-col sm:flex-row">
      <main className="flex-1 flex flex-col gap-2">
        <div className="flex flex-col p-4 border-1 border-gray-200 dark:border-gray-700 gap-2 dark:bg-gray-900">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2">
              <div className="flex flex-col w-1/2 gap-2 border border-gray-300 dark:border-gray-700 p-2">
                <ShimmerBox className="w-40" />
                <ShimmerBox className="w-60" />
                <ShimmerBox className="w-20" />
              </div>
              <div className="flex flex-col w-1/2 gap-2 border border-gray-300 dark:border-gray-700 p-2">
                <h2 className="text-md text-slate-900 dark:text-white">
                  <ShimmerBox className="w-30" />
                </h2>
                <ShimmerBox className="w-40" />
                <ShimmerBox />
                <ShimmerBox className="w-30" />
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-2">
            <div className="flex flex-col lg:w-1/2 gap-2">
              <ShimmerBox />
              <div className="flex flex-col gap-2">
                <ShimmerBox className="w-40" />
                <ShimmerBox className="w-60" />
                <ShimmerBox className="w-20" />
              </div>
            </div>
            <div className="flex flex-col lg:w-1/2 gap-2">
              <ShimmerBox />
              <div className="flex flex-col gap-2">
                <ShimmerBox className="w-40" />
                <ShimmerBox className="w-60" />
                <ShimmerBox className="w-20" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <ShimmerBox className="w-120" />
            <ShimmerBox className="w-80" />
            <ShimmerBox className="w-100" />
            <ShimmerBox className="w-60" />
          </div>
        </div>
      </main>
      <aside className="order-first md:w-16 lg:w-32" aria-hidden></aside>
      <aside className="md:w-16 lg:w-32" aria-hidden></aside>
    </div>
  );
};
