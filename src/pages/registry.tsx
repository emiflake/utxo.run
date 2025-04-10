import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import { NavBar } from "../components/nav";
import { registryJSONURL, ScriptInfo, useRegistry } from "../registry";
import { ShimmerBox } from "../components/tx";
import { ErrorBox } from "../App";

const ViewScriptInfo = ({ scriptInfo }: { scriptInfo: ScriptInfo }) => {
  const Field = ({
    name,
    value,
  }: {
    name: string;
    value: string | undefined;
  }) => {
    if (value === undefined) {
      return (
        <tr>
          <td className="p-2">{name}</td>
          <td className="text-gray-500">N/A</td>
        </tr>
      );
    }
    return (
      <tr>
        <td className="p-2">{name}</td>
        <td>{value}</td>
      </tr>
    );
  };

  return (
    <table className="table-auto border-2 border-gray-200 p-2">
      <thead>
        <tr className="border-b-2 border-gray-200">
          <th className="p-2 text-left">Property</th>
          <th className="text-left">Value</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        <Field name="Type" value={scriptInfo.type} />
        <Field name="Name" value={scriptInfo.name} />
        <Field name="Tag" value={scriptInfo.tag} />
        <Field name="Network" value={scriptInfo.network?.tag} />
        <Field name="Description" value={scriptInfo.description} />
        <Field
          name="Script Hash"
          value={scriptInfo.scriptHash}
        />
        <Field name="Component Name" value={scriptInfo.componentName} />
        <Field name="Market" value={scriptInfo.market} />
      </tbody>
    </table>
  );
};

export type Network = "Mainnet" | "Preview";

export const NetworkSelector = ({
  network,
  setNetwork,
}: {
  network: Network;
  setNetwork: (network: Network) => void;
}) => {
  return (
    <div className="flex flex-1 gap-2 max-h-10">
      <span className="self-center text-xs text-gray-500">Network:</span>
      <select
        className="border-2 border-gray-200 p-2"
        onChange={(e) =>
          ["Mainnet", "Preview"].includes(e.target.value) &&
          setNetwork(e.target.value as Network)
        }
        value={network}
      >
        <option value="Mainnet">Mainnet</option>
        <option value="Preview">Preview</option>
      </select>
    </div>
  );
};

export const SearchBar = ({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (search: string) => void;
}) => {
  return (
    <div className="flex flex-1 gap-2 max-h-10">
      <span className="self-center text-xs text-gray-500">Search:</span>
      <input
        className="border-2 border-gray-200 p-2"
        onChange={(e) => setSearch(e.target.value)}
        value={search}
      />
    </div>
  );
};

export const RegistryPage = () => {
  const { data: registry, isLoading, isError } = useRegistry();

  const [network, setNetwork] = useState<Network>("Mainnet");

  const [search, setSearch] = useState("");

  const filteredScriptInfos = useMemo(() => {
    if (registry) {
      const networkId = network === "Mainnet" ? "MainnetId" : "TestnetId";
      const options = registry.scriptInfos.filter((scriptInfo: ScriptInfo) => {
        return scriptInfo.network?.tag === networkId;
      });

      if (search === "") {
        return options;
      }
      const fuse = new Fuse(options, {
        keys: ["name", "tag", "description"],
      });

      return fuse.search(search).map((r) => r.item);
    }
  }, [registry, search, network]);

  const scriptInfoViews = useMemo(() => {
    if (registry && filteredScriptInfos !== undefined) {
      return filteredScriptInfos.map((scriptInfo: ScriptInfo) => (
        <ViewScriptInfo
          key={
            scriptInfo.scriptHash +
            "-" +
            scriptInfo.type +
            "-" +
            scriptInfo.name +
            "-" +
            scriptInfo.tag
          }
          scriptInfo={scriptInfo}
        />
      ));
    } else if (isLoading) {
      return <ShimmerBox />;
    }
  }, [registry, filteredScriptInfos, isLoading]);

  return (
    <div className="min-h-screen flex flex-col p-1 gap-5">
      <NavBar />

      <div className="flex-1 flex flex-col sm:flex-row">
        <main className="flex-1 flex flex-col gap-2 border-2 border-gray-200 p-4">
          <h2>Registry</h2>
          <div className="flex flex-col gap-2">
            <span className="text-xs text-gray-500">
              URL: {registryJSONURL}
            </span>
          </div>

          <NetworkSelector network={network} setNetwork={setNetwork} />
          <SearchBar search={search} setSearch={setSearch} />

          <div className="flex flex-col gap-2">{scriptInfoViews}</div>
          {isError && <ErrorBox message={"Could not load registry"} />}
        </main>
        <aside className="order-first md:w-16 lg:w-32"></aside>
        <aside className="md:w-16 lg:w-32"></aside>
      </div>
      <footer className="bg-gray-100"></footer>
    </div>
  );
};
