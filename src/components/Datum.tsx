import { useLiveQuery } from 'dexie-react-hooks';
import { db, renderToJSON, renderToYaml } from '../cbor/plutus_json';
import { Fragment, useContext, useMemo, useState } from 'react';
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
import { DatumContext } from '../context/DatumContext';
import jsonBigInt from 'json-bigint';

const JSONbig = jsonBigInt();

function ExternalLinkButton({
  href,
  className = 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
}: { href: string; className?: string }) {
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

  const [error, setError] = useState<string | null>(null);

  const parsedDatum = useMemo(() => {
    try {
      const parsed = cbor2.decode(datum);
      setError(null);
      return parsed;
    } catch (e) {
      console.error('Failed to decode datum:', e);
      setError((e as Error)?.toString() ?? 'Unknown error');
      return null;
    }
  }, [datum]);

  const enrichedDatum = useMemo(() => {
    if (!parsedDatum || !blueprints) {
      return null;
    }

    const rawDatum = parseRawDatum(parsedDatum);

    const context = createParsingContext(blueprints);

    const enrichedDatum = parseAgainstSchema(rawDatum, context);

    return enrichedDatum;
  }, [parsedDatum, blueprints]);

  const datumContext = useContext(DatumContext);

  const [isExpanded, setIsExpanded] = useState(true);

  const handleViewModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    datumContext?.setViewMode(
      e.target.value as
        | 'hex'
        | 'json'
        | 'diag'
        | 'raw_datum'
        | 'enriched_datum'
        | 'enriched_yaml',
    );
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const datumJson = useMemo(() => {
    return JSONbig.stringify(parsedDatum, null, 2);
  }, [parsedDatum]);

  const textToDisplay = useMemo(() => {
    switch (datumContext?.viewMode || 'enriched_yaml') {
      case 'hex':
        return datum;
      case 'json':
        return datumJson;
      case 'diag':
        return cbor2.diagnose(datum, {
          pretty: true,
        });
      case 'raw_datum':
        return JSON.stringify(parseRawDatum(parsedDatum), null, 2);
      case 'enriched_datum':
        return renderToJSON(enrichedDatum);
      case 'enriched_yaml':
        return renderToYaml(enrichedDatum);
    }
  }, [datum, datumJson, parsedDatum, enrichedDatum, datumContext?.viewMode]);

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

  return (
    <div className="flex p-1 flex-col gap-2">
      <span className="text-sm dark:text-white">Datum:</span>
      <div className="border-black border-1 bg-gray-900 text-white overflow-hidden">
        <div className="flex flex-col">
          {/* Toolbar with buttons always visible at the top */}
          <div className="flex justify-between items-center p-1 border-b border-gray-800">
            <select
              value={datumContext?.viewMode || 'enriched_yaml'}
              onChange={handleViewModeChange}
              className="text-xs text-white border-r border-gray-700 px-2 py-1 focus:outline-none bg-transparent"
            >
              <option value="hex">Hex</option>
              <option value="json">JSON</option>
              <option value="diag">Diagnostic</option>
              <option value="raw_datum">Raw Datum</option>
              <option value="enriched_datum">Enriched Datum</option>
              <option value="enriched_yaml">Enriched Datum (YAML)</option>
            </select>
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
              className={`text-xs font-mono break-all dark:text-white ${isExpanded ? 'whitespace-pre-wrap' : ''}`}
            >
              {jsxRuntime}
            </span>
          </div>

          {error && <ErrorBox message={error} />}
        </div>
      </div>
    </div>
  );
};
