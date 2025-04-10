import { NavBar } from "../components/nav";

export const PolicyPage = () => {
    return (
      <div className="min-h-screen flex flex-col p-1 gap-5">
        <NavBar>  
        </NavBar>
  
        <div className="flex-1 flex flex-col sm:flex-row">
          <main className="flex-1 flex flex-col gap-2">
            We would render policy information here
          </main>
          <aside className="order-first md:w-16 lg:w-32"></aside>
          <aside className="md:w-16 lg:w-32"></aside>
        </div>
        <footer className=""></footer>
      </div>
    );
  };
  