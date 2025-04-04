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
          <nav className="order-first sm:w-32"></nav>
  
          <aside className="sm:w-32"></aside>
        </div>
        <footer className=""></footer>
      </div>
    );
  };
  