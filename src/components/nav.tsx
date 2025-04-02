import React, { useState } from "react";
import { Link } from "react-router";
import { SettingsModal } from "./SettingsModal";

export type NavBarProps = {
  children?: React.ReactNode;
};

export const NavBar = (props: NavBarProps) => {
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  return (
    <>
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
            <span className="text-indigo-500 hover:underline">Tx by CBOR</span>
          </Link>
          <Link to="/chain" className="border-2 border-gray-200 p-2 rounded-md">
            <span className="text-indigo-500 hover:underline">
              Chain explorer
            </span>
          </Link>
          <Link
            to="/submitted-tx"
            className="border-2 border-gray-200 p-2 rounded-md"
          >
            <span className="text-indigo-500 hover:underline">Tx by hash</span>
          </Link>

        </div>
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          {props.children}
          <div className="flex-1 flex justify-end gap-4">
            {/* settings button */}
            <div className="border-2 border-gray-200 p-2 rounded-md cursor-pointer" onClick={() => setSettingsModalOpen(true)}>
              {/* settings icon */}
              <img
                src="/settings.svg"
                alt="settings icon"
                className="inline-block w-6 h-6"
              />
            </div>
          </div>
        </div>
      </div>
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setSettingsModalOpen(false)} />
    </>
  );
};

