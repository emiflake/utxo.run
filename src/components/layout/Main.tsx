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
