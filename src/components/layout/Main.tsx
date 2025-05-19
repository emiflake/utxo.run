export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex-1 flex flex-col sm:flex-row">
      <main className="flex-1 flex flex-col gap-2">{children}</main>
      <aside className="order-first md:w-16 lg:w-32"></aside>
      <aside className="md:w-16 lg:w-32"></aside>
    </div>
  );
};
