import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SearchModal from './SearchModal'
import { getDriveNames, parsePathInfo } from '../utils/api'

const Navbar = () => {
    const [searchOpen, setSearchOpen] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    const [showModified, setShowModified] = useState(() => localStorage.getItem('showModifiedColumn') !== 'false')

    // Drive switcher state
    const driveNames = getDriveNames()
    const { drive: currentDrive } = parsePathInfo(location.pathname)
    const [driveMenuOpen, setDriveMenuOpen] = useState(false)
    const driveMenuRef = useRef<HTMLDivElement>(null)

    const hasMultipleDrives = driveNames.length > 1

    // Keyboard shortcut for search (Ctrl/Cmd + K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault()
                e.stopPropagation() // Stop event bubbling
                setSearchOpen(true)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Close drive menu on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (driveMenuRef.current && !driveMenuRef.current.contains(e.target as Node)) {
                setDriveMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const toggleModifiedColumn = () => {
        const newValue = !showModified
        setShowModified(newValue)
        localStorage.setItem('showModifiedColumn', String(newValue))
        // Dispatch custom event for FileListView to listen
        window.dispatchEvent(new CustomEvent('columnVisibilityChange', { detail: { showModified: newValue } }))
    }

    const switchDrive = (driveIndex: number) => {
        setDriveMenuOpen(false)
        navigate(`/${driveIndex}:/`)
    }

    return (
        <>
            <nav className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-md dark:border-gray-700/50 dark:bg-[#18181B]">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
                    {/* Logo + Drive Switcher */}
                    <div className="flex items-center space-x-2">
                        <Link
                            to="/"
                            className="flex items-center space-x-2 text-gray-900 transition-opacity hover:opacity-70 dark:text-white"
                        >
                            <img
                                src="https://cdn.jsdelivr.net/gh/Fluxonide/Google-Drive-Index@master/public/icons/64.png"
                                alt="Logo"
                                className="h-6 w-6"
                            />
                            <span className="hidden font-semibold sm:inline">{window.SITE_NAME || 'Google Drive Index'}</span>
                        </Link>

                        {/* Drive Switcher Dropdown */}
                        {hasMultipleDrives && (
                            <div className="relative" ref={driveMenuRef}>
                                <button
                                    onClick={() => setDriveMenuOpen(!driveMenuOpen)}
                                    className="ml-2 flex items-center space-x-1.5 rounded-lg border border-gray-200/60 bg-gray-50 px-2.5 py-1 text-sm text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-100 dark:border-gray-600/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700"
                                >
                                    <FontAwesomeIcon icon="hard-drive" className="h-3 w-3 opacity-60" />
                                    <span className="max-w-[120px] truncate">{driveNames[currentDrive] || 'Drive'}</span>
                                    <FontAwesomeIcon
                                        icon="chevron-down"
                                        className={`h-2.5 w-2.5 opacity-50 transition-transform duration-200 ${driveMenuOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {/* Dropdown Menu */}
                                {driveMenuOpen && (
                                    <div className="absolute left-0 top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-lg border border-gray-200/60 bg-white shadow-lg dark:border-gray-600/60 dark:bg-[#1f1f23]">
                                        <div className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                            Switch Drive
                                        </div>
                                        {driveNames.map((name, index) => (
                                            <button
                                                key={index}
                                                onClick={() => switchDrive(index)}
                                                className={`flex w-full items-center space-x-2.5 px-3 py-2 text-left text-sm transition-colors ${index === currentDrive
                                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                                                    }`}
                                            >
                                                <FontAwesomeIcon
                                                    icon="hard-drive"
                                                    className={`h-3.5 w-3.5 ${index === currentDrive
                                                            ? 'text-blue-500 dark:text-blue-400'
                                                            : 'text-gray-400 dark:text-gray-500'
                                                        }`}
                                                />
                                                <span className="flex-1 truncate">{name}</span>
                                                {index === currentDrive && (
                                                    <FontAwesomeIcon icon="check" className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center space-x-3">
                        {/* Show/Hide Modified Date toggle */}
                        <button
                            title={showModified ? 'Hide modified date' : 'Show modified date'}
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                            onClick={toggleModifiedColumn}
                        >
                            <FontAwesomeIcon
                                icon={showModified ? 'eye' : 'eye-slash'}
                                className="h-4 w-4"
                            />
                        </button>

                        {/* Search button */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="flex items-center space-x-2 rounded-lg bg-gray-100 px-3 py-1.5 text-gray-600 transition-all hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <FontAwesomeIcon icon="search" className="h-4 w-4" />
                            <span className="hidden text-sm md:inline">Search...</span>
                            <div className="hidden items-center space-x-1 md:flex">
                                <kbd className="rounded bg-gray-200 px-1.5 py-0.5 text-xs font-medium dark:bg-gray-700">
                                    Ctrl
                                </kbd>
                                <kbd className="rounded bg-gray-200 px-1.5 py-0.5 text-xs font-medium dark:bg-gray-700">
                                    K
                                </kbd>
                            </div>
                        </button>


                        {/* Logout button */}
                        {window.UI?.show_logout_button && (
                            <a
                                href="/logout"
                                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800 dark:hover:text-red-400"
                                title="Logout"
                            >
                                <FontAwesomeIcon icon="sign-out-alt" className="h-4 w-4" />
                            </a>
                        )}

                        <a
                            href="https://github.com/Fluxonide/Google-Drive-Index"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            <FontAwesomeIcon icon={['fab', 'github'] as any} className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </nav>

            {/* Search Modal */}
            <SearchModal
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
            />
        </>
    )
}

export default Navbar
