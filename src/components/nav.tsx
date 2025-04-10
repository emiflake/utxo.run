import { useCallback, useState } from "react"
import { Link, useNavigate } from "react-router"
import { AnimatedSearchInput } from "./AnimatedSearchInput"
import { SettingsModal } from "./SettingsModal"

// Icon components
function LogoIcon({ className = "h-6 w-6 text-orange-500" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  )
}

function RegistryIcon({ className = "mr-2 h-4 w-4" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  )
}

function ChevronDownIcon({ className = "ml-1 h-4 w-4" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function ExplorerIcon({ className = "mr-2 h-4 w-4" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20a14.5 14.5 0 0 0 0-20" />
    </svg>
  )
}

function FileIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

function FileSearchIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 11.08V8l-6-6H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h6" />
      <path d="M14 3v5h5" />
      <circle cx="17" cy="17" r="3" />
      <path d="m21 21-1.5-1.5" />
    </svg>
  )
}

function SearchIcon({ className = "h-4 w-4", color = "currentColor" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function SettingsIcon({ className = "h-4 w-4 text-gray-500" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

type SearchType = "hash" | "cbor"

// TODO: We could support more types of search if we are clever enough
const classifySearch = (searchValue: string): SearchType => {
  if (searchValue.length === 64) {
    return "hash"
  }
  return "cbor"
}

export function NavBar() {
  const [searchValue, setSearchValue] = useState("")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const navigate = useNavigate()

  const handleSearch = useCallback(() => {
    const searchType = classifySearch(searchValue)
    if (searchType === "hash") {
      navigate(`/submitted-tx/${searchValue}`)
    } else {
      navigate(`/tx/${searchValue}`)
    }
  }, [searchValue, navigate])

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center gap-2 mr-8">
            <Link to="/" className="flex items-center gap-2">
              <LogoIcon />
              <span className="text-2xl font-bold tracking-tight text-orange-500">fine.tx</span>
            </Link>
          </div>

          <nav className="hidden lg:flex flex-1">
            <ul className="flex items-center gap-4">
              <li>
                <Link
                  to="/registry"
                  className="group inline-flex h-9 w-max items-center justify-center bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 focus:bg-gray-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50 rounded"
                >
                  <RegistryIcon />
                  Registry
                </Link>
              </li>
              <li>
                <div className="relative group">
                  <button
                    className="inline-flex h-9 w-max items-center justify-center bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 focus:bg-gray-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50 rounded"
                  >
                    Transactions
                    <ChevronDownIcon />
                  </button>
                  <div className="absolute left-0 mt-2 w-[200px] bg-white shadow-md border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <ul className="py-1">
                      <li>
                        <Link
                          to="/tx/"
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium no-underline outline-none transition-colors hover:bg-gray-100"
                        >
                          <FileIcon />
                          <span>Tx by CBOR</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/submitted-tx/"
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium no-underline outline-none transition-colors hover:bg-gray-100"
                        >
                          <FileSearchIcon />
                          <span>Tx by Hash</span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
              <li>
                <Link
                  to="/chain"
                  className="group inline-flex h-9 w-max items-center justify-center bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 focus:bg-gray-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50 rounded"
                >
                  <ExplorerIcon />
                  Chain Explorer
                </Link>
              </li>
            </ul>
          </nav>

          <div className="flex items-center ml-auto">
            <div className="relative w-full md:w-64 lg:w-80">
              <SearchIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 z-10" color="#9ca3af" />
              <AnimatedSearchInput
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onSubmit={handleSearch}
                placeholder="Enter your transaction hash here..."
                type="search"
                inputClassName="pl-8 h-9 text-sm border border-gray-200"
              />
            </div>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="h-9 ml-2 px-4 flex items-center justify-center rounded border border-gray-200 bg-background hover:bg-gray-100 focus:bg-gray-100 focus-visible:outline-none text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
            >
              <SettingsIcon />
              <span className="sr-only">Settings</span>
            </button>
          </div>
        </div>



        {/* Mobile navigation */}
        <div className="border-t border-gray-200 py-2 lg:hidden">
          <nav className="container mx-auto max-w-md flex justify-between px-4">
            <Link to="/registry" className="flex flex-col items-center text-sm font-medium hover:underline">
              <RegistryIcon className="mb-1 h-5 w-5" />
              Registry
            </Link>
            <Link to="/tx/" className="flex flex-col items-center text-sm font-medium hover:underline">
              <FileIcon className="mb-1 h-5 w-5" />
              Tx by CBOR
            </Link>
            <Link to="/chain" className="flex flex-col items-center text-sm font-medium hover:underline">
              <ExplorerIcon className="mb-1 h-5 w-5" />
              Explorer
            </Link>
            <Link to="/submitted-tx/" className="flex flex-col items-center text-sm font-medium hover:underline">
              <FileSearchIcon className="mb-1 h-5 w-5" />
              Tx by Hash
            </Link>
          </nav>
        </div>
      </header>
      {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}
    </>
  )
}
