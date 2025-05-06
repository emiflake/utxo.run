import { useCallback, useRef, useState, useMemo } from 'react';
import { db, PlutusJsonEntity, plutusJsonSchema } from '../cbor/plutus_json';
import { useLiveQuery } from 'dexie-react-hooks';
import { NavBar } from '../components/nav';
import * as z from 'zod';
import { BlueprintIcon, FileIcon, TrashIcon } from '../components/Icons';
import { MiniTag } from '../components/MiniTag';

export const BlueprintPage = () => {
  const blueprints = useLiveQuery(async () => {
    return db.plutusJson.toArray();
  }, []);

  const [errorMessage, setErrorMessage] = useState<string | z.ZodError | null>(
    null,
  );

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      setIsUploading(true);
      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.type !== 'application/json') {
            console.warn(`Skipping non-JSON file: ${file.name}`);
            continue;
          }

          const text = await file.text();
          try {
            // Validate JSON
            const parsed = JSON.parse(text);

            const result = plutusJsonSchema.safeParse(parsed);
            if (!result.success) {
              console.error(`Error parsing file ${file.name}:`, result.error);
              setErrorMessage(result.error);
              continue;
            }

            const title = result.data.preamble.title;
            const description = result.data.preamble.description;

            // Store in IndexedDB
            await db.plutusJson.add({
              rawJson: text,
              title,
              description,
            });
            setErrorMessage(null);
          } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
          }
        }
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error uploading files:', error);
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  // Handle file deletion
  const handleDelete = useCallback(async (id: number) => {
    try {
      await db.plutusJson.delete(id);
    } catch (error) {
      console.error(`Error deleting blueprint with ID ${id}:`, error);
    }
  }, []);

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const BlueprintStats = ({ blueprint }: { blueprint: PlutusJsonEntity }) => {
    const blueprintParsed = useMemo(() => {
      return plutusJsonSchema.parse(JSON.parse(blueprint.rawJson));
    }, [blueprint.rawJson]);

    const definitionsCount = Object.keys(blueprintParsed.definitions).length;
    const validatorsCount = blueprintParsed.validators.length;

    return (
      <div className="flex flex-row gap-2 mt-2">
        <MiniTag
          text={`${definitionsCount} Definition${definitionsCount !== 1 ? 's' : ''}`}
          className="bg-blue-100 text-blue-700 dark:bg-blue-700/50 dark:text-blue-100"
        />
        <MiniTag
          text={`${validatorsCount} Validator${validatorsCount !== 1 ? 's' : ''}`}
          className="bg-green-100 text-green-700 dark:bg-green-700/50 dark:text-green-100"
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col p-1 gap-5 dark:bg-gray-900">
      <NavBar />

      <div className="flex-1 flex flex-col sm:flex-row">
        <main className="flex-1 flex flex-col gap-2">
          <h2 className="dark:text-white flex items-center gap-1">
            <BlueprintIcon className="h-5 w-5" /> Blueprints
          </h2>

          <div className="flex items-center gap-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              multiple
              className="hidden"
            />
            <button
              onClick={triggerFileInput}
              disabled={isUploading}
              className="px-3 py-1 bg-blue-600 text-white hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
            >
              <FileIcon />
              {isUploading ? 'Uploading...' : 'Upload plutus.json file'}
            </button>
          </div>

          {errorMessage && (
            <div className="text-red-500 p-2 border-1 border-red-500 bg-red-50 dark:bg-red-900/30">
              <span className="font-bold">Error:</span>
              {errorMessage instanceof z.ZodError ? (
                <ul>
                  {errorMessage.errors.map((error) => (
                    <li
                      className="text-xs list-disc ml-4"
                      key={error.path.join('.')}
                    >
                      {error.path.join('.')}: {error.message}.{' '}
                      {error.code === 'invalid_type'
                        ? `Expected ${error.expected}`
                        : ''}
                    </li>
                  ))}
                </ul>
              ) : (
                errorMessage
              )}
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:flex-1 gap-2">
            <div className="flex flex-col lg:w-1/2 gap-2 border-1 border-gray-200 dark:border-gray-700 p-4 dark:text-white">
              <span className="text-md dark:text-white">Blueprints</span>
              {blueprints && (
                <span className="text-xs dark:text-gray-300">
                  Count: {blueprints.length}
                </span>
              )}

              {blueprints && blueprints.length === 0 ? (
                <div className="p-2 text-sm text-gray-500 dark:text-gray-400">
                  No blueprints uploaded yet. Upload JSON files to get started.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {blueprints &&
                    blueprints.map((blueprint) => (
                      <div
                        key={blueprint.id}
                        className="flex flex-col border-1 border-gray-200 dark:border-gray-700 p-2 bg-white/50 dark:bg-gray-800/50"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-medium text-indigo-500 dark:text-indigo-300 text-sm">
                            {blueprint.title}
                          </h4>
                          <button
                            onClick={() => handleDelete(blueprint.id)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            aria-label="Delete blueprint"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                          <span className="font-medium">
                            {blueprint.description}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <div className="max-h-16 overflow-hidden border-1 border-gray-100 dark:border-gray-800 p-1 bg-gray-50 dark:bg-gray-900/50">
                            <pre className="text-xs whitespace-pre-wrap overflow-hidden font-mono">
                              {blueprint.rawJson.length > 150
                                ? `${blueprint.rawJson.substring(0, 150)}...`
                                : blueprint.rawJson}
                            </pre>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <BlueprintStats blueprint={blueprint} />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="flex flex-col lg:w-1/2 gap-2 border-1 border-gray-200 dark:border-gray-700 p-4 dark:text-white">
              <span className="text-md dark:text-white">
                Upload Instructions
              </span>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <ul className="list-disc ml-4 space-y-1">
                  <li>Upload JSON files containing plutus.json blueprints</li>
                  <li>Files will be stored locally in your browser</li>
                  <li>Blueprint files are used for parsing datums</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
        <aside className="order-first md:w-16 lg:w-32"></aside>
        <aside className="md:w-16 lg:w-32"></aside>
      </div>
      <footer className=""></footer>
    </div>
  );
};
