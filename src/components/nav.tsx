import { Link } from "react-router";

export type NavBarProps = {
  children?: React.ReactNode;
};

export const NavBar = (props: NavBarProps) => {
  return (
    <div className="items-center min-h-20 max-h-20 p-5 border-b-2 border-gray-200 grid grid-cols-3 gap-4">
      <div>
        <img
          src="/fine_full.svg"
          alt="fine icon"
          className="inline-block w-40 h-8"
        />
        <span className="text-xs align-bottom font-bold text-gray-500">
          ... a tx viewer that is just fine
        </span>
      </div>
      <div className="flex-1 flex gap-4 justify-center">
        <Link
          to="/registry"
          className="border-2 border-gray-200 p-2 rounded-md"
        >
          <span className="text-indigo-500 hover:underline ">Registry</span>
        </Link>
        <Link to="/" className="border-2 border-gray-200 p-2 rounded-md">
          <span className="text-indigo-500 hover:underline">Viewer</span>
        </Link>
      </div>
      <div className="flex-1 flex flex-col sm:flex-row gap-4">
        {props.children}
      </div>
    </div>
  );
};
