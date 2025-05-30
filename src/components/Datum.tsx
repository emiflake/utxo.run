import { useLiveQuery } from 'dexie-react-hooks';
import {
  db,
  PlutusJsonEntity,
  renderToJSON,
  renderToYaml,
} from '../cbor/plutus_json';
import { Fragment, useContext, useId, useMemo, useRef, useState } from 'react';
import * as cbor2 from 'cbor2';
import { parseRawDatum } from '../cbor/raw_datum';
import { createParsingContext } from '../cbor/plutus_json';
import { parseAgainstSchema } from '../cbor/plutus_json';
import { ChevronDownIcon, ChevronUpIcon, ExternalLinkIcon } from './Icons';
import { ClipboardButton } from './ActionButtons';
import { ErrorBox } from '../App';
import { refractor } from 'refractor';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { jsx, jsxs } from 'react/jsx-runtime';
import { DatumContext, ViewMode, ViewModeList } from '../context/DatumContext';
import jsonBigInt from 'json-bigint';
import { diffWordsWithSpace } from 'diff';
import { DiffCheckbox } from './DiffCheck';

const JSONbig = jsonBigInt();

function ExternalLinkButton({
  href,
  className = 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
}: {
  href: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-1.5 p-1 text-xs focus:outline-none transition-colors duration-200 ${className}`}
      title="View in CBOR decoder"
    >
      <div className="relative w-3.5 h-3.5 flex items-center justify-center">
        <div className="absolute inset-0">
          <ExternalLinkIcon />
        </div>
      </div>
    </a>
  );
}

export const ViewDatum = ({ datum }: { datum: string }) => {
  const blueprints = useLiveQuery(async () => {
    return db.plutusJson.toArray();
  }, []);

  const cborNemo = useMemo(() => {
    return `https://cbor.nemo157.com/#type=hex&value=${datum}`;
  }, [datum]);

  const [error] = useState<string | null>(null);

  const datumContext = useContext(DatumContext);

  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const datumParsed = handleDatum(datum, blueprints);

  const textToDisplay = datumParsed[datumContext?.viewMode ?? 'enriched_yaml'];

  const hastTree = useMemo(() => {
    if (datumContext?.viewMode === 'enriched_yaml') {
      return refractor.highlight(textToDisplay, 'yaml');
    } else if (datumContext?.viewMode === 'diag') {
      // R works nicely for diagnostics
      return refractor.highlight(textToDisplay, 'r');
    }
    return refractor.highlight(textToDisplay, 'json');
  }, [textToDisplay, datumContext?.viewMode]);

  const jsxRuntime = useMemo(() => {
    return toJsxRuntime(hastTree, { Fragment, jsx, jsxs });
  }, [hastTree]);

  const ref = useRef<HTMLInputElement>(null);

  // Could be cleaner
  const isRefObject = (
    ref: React.RefObject<HTMLInputElement | null>,
  ): ref is React.RefObject<HTMLInputElement> =>
    ref instanceof Object && ref.current instanceof HTMLInputElement;

  const handleCheckedChange = (checked: boolean) => {
    if (!isRefObject(ref)) return;
    if (checked && (datumContext?.selectedDatums?.length ?? 0) >= 2) return;
    if (checked) {
      datumContext?.selectDatum(ref, datum);
    } else {
      datumContext?.unselectDatum(ref, datum);
    }
  };

  return (
    <div className="border-black border-1 bg-gray-900 text-white overflow-hidden">
      <div className="flex flex-col">
        {/* Toolbar with buttons always visible at the top */}
        <div className="flex justify-between items-center p-1 border-b border-gray-800">
          <ViewModeSelector />
          <div className="flex gap-1">
            <DiffCheckbox
              ref={ref}
              checked={
                datumContext?.selectedDatums.some((d) => d.ref === ref) ?? false
              }
              setChecked={handleCheckedChange}
              label="Compare"
              disabled={
                !datumContext?.selectedDatums.some((d) => d.ref === ref) &&
                (datumContext?.selectedDatums?.length ?? 0) >= 2
              }
              count={datumContext?.selectedDatums?.length ?? 0}
              maxCount={2}
              className="text-white hover:text-blue-300"
            />
            <button
              onClick={toggleExpand}
              className="text-white hover:text-blue-300 p-1"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronUpIcon className="h-3.5 w-3.5" />
              ) : (
                <ChevronDownIcon className="h-3.5 w-3.5" />
              )}
            </button>
            <ExternalLinkButton
              href={cborNemo}
              className="text-white hover:text-blue-300"
            />
            <ClipboardButton
              text={textToDisplay}
              className="text-white hover:text-blue-300"
            />
          </div>
        </div>
        {/* Content area */}
        <div className="p-2 overflow-x-auto leading-none">
          <span
            className={`text-xs font-mono break-all dark:text-white ${
              isExpanded ? 'whitespace-pre-wrap' : ''
            }`}
          >
            {jsxRuntime}
          </span>
        </div>

        {error && <ErrorBox message={error} />}
      </div>
    </div>
  );
};

const handleDatum = (
  datum: string,
  blueprints: PlutusJsonEntity[] | undefined,
) => {
  const parsedDatum = (() => {
    try {
      return cbor2.decode(datum);
    } catch (e) {
      console.error('Failed to decode datum:', e);
      return e;
    }
  })();

  const rawDatum = parseRawDatum(parsedDatum);

  const enrichedDatum = blueprints
    ? parseAgainstSchema(rawDatum, createParsingContext(blueprints))
    : null;

  return {
    hex: datum,
    json: JSONbig.stringify(parsedDatum, null, 2),
    diag: cbor2.diagnose(datum, {
      pretty: true,
    }),
    raw_datum: JSON.stringify(rawDatum, null, 2),
    enriched_datum: renderToJSON(enrichedDatum),
    enriched_yaml: renderToYaml(enrichedDatum),
  };
};

export const ViewDatumDiff = ({
  datumA,
  datumB,
}: {
  datumA: string;
  datumB: string;
}) => {
  const blueprints = useLiveQuery(async () => {
    return db.plutusJson.toArray();
  }, []);

  const [error] = useState<string | null>(null);

  const datumAParsed = handleDatum(datumA, blueprints);
  const datumBParsed = handleDatum(datumB, blueprints);

  const datumContext = useContext(DatumContext);

  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const textToDisplayA =
    datumAParsed[datumContext?.viewMode ?? 'enriched_yaml'];
  const textToDisplayB =
    datumBParsed[datumContext?.viewMode ?? 'enriched_yaml'];

  const diff = useMemo(() => {
    return diffWordsWithSpace(textToDisplayA, textToDisplayB);
  }, [textToDisplayA, textToDisplayB]);

  const diffString = useMemo(() => {
    let diffString = '';
    for (const change of diff) {
      if (change.added) {
        diffString += `+ ${change.value}\n`;
      } else if (change.removed) {
        diffString += `- ${change.value}\n`;
      } else {
        diffString += ` ${change.value}\n`;
      }
    }
    return diffString;
  }, [diff]);

  const { nodesA, nodesB } = useMemo(() => {
    const nodesA: React.ReactNode[] = [];
    const nodesB: React.ReactNode[] = [];
    const nodes: React.ReactNode[] = [];
    for (const change of diff) {
      if (change.added) {
        nodesB.push(
          <span className="bg-green-600/20 text-green-500">
            {change.value}
          </span>,
        );
        nodes.push(
          <span className="bg-green-600/20 text-green-500">
            {change.value}
          </span>,
        );
      } else if (change.removed) {
        nodesA.push(
          <span className="bg-red-600/20 text-red-500">{change.value}</span>,
        );
        nodes.push(
          <span className="bg-red-600/20 text-red-500">{change.value}</span>,
        );
      } else {
        nodesA.push(<span>{change.value}</span>);
        nodesB.push(<span>{change.value}</span>);
        nodes.push(<span>{change.value}</span>);
      }
    }
    return { nodesA, nodesB, nodes };
  }, [diff]);

  return (
    <div className="border-black border-1 bg-gray-900 text-white overflow-hidden">
      <div className="flex flex-col">
        <div className="flex justify-between items-center p-1 border-b border-gray-800">
          <ViewModeSelector />
          <div className="flex gap-1">
            <button
              onClick={toggleExpand}
              className="text-white hover:text-blue-300 p-1"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronUpIcon className="h-3.5 w-3.5" />
              ) : (
                <ChevronDownIcon className="h-3.5 w-3.5" />
              )}
            </button>

            <ClipboardButton
              text={diffString}
              className="text-white hover:text-blue-300"
            />
          </div>
        </div>
        <div className="p-2 overflow-x-auto leading-none">
          <div className="flex flex-1 gap-2">
            <div className="flex w-1/2">
              <span
                className={`text-xs font-mono break-all dark:text-white ${
                  isExpanded ? 'whitespace-pre-wrap' : ''
                }`}
              >
                {nodesA}
              </span>
            </div>
            {
              <div className="flex border-l border-gray-00 pl-5 w-1/2">
                <span
                  className={`text-xs font-mono break-all dark:text-white ${
                    isExpanded ? 'whitespace-pre-wrap' : ''
                  }`}
                >
                  {nodesB}
                </span>
              </div>
            }
          </div>
        </div>

        {error && <ErrorBox message={error} />}
      </div>
    </div>
  );
};

export const ViewModeSelector = () => {
  const datumSelectId = useId();

  const datumContext = useContext(DatumContext);

  const handleViewModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    datumContext?.setViewMode(e.target.value as ViewMode);
  };

  return (
    <>
      <label htmlFor={datumSelectId} className="sr-only">
        View mode selector
      </label>
      <select
        id={datumSelectId}
        aria-label="View mode selector"
        aria-description="Select the format to view the datum in"
        value={datumContext?.viewMode || 'enriched_yaml'}
        onChange={handleViewModeChange}
        className="text-xs text-white border-r border-gray-700 px-2 py-1 focus:outline-none bg-transparent"
      >
        {Object.entries(ViewModeList).map(([key, value]) => (
          <option key={key} label={value} value={key}>
            {value}
          </option>
        ))}
      </select>
    </>
  );
};
