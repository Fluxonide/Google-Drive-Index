import { useState, Fragment } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Dialog, Transition } from '@headlessui/react'
import SearchModal from './SearchModal'

const Navbar = () => {
    const [searchOpen, setSearchOpen] = useState(false)
    const navigate = useNavigate()

    // Keyboard shortcut for search (Ctrl/Cmd + K)
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault()
            setSearchOpen(true)
        }
    }

    // Set up keyboard listener
    useState(() => {
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    })

    return (
        <>
            <nav className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-900/80">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center space-x-2 text-gray-900 transition-opacity hover:opacity-70 dark:text-white"
                    >
                        <img
                            src="https://cdn.jsdelivr.net/gh/Fluxonide/Google-Drive-Index@master/public/icons/64.png"
                            alt="Logo"
                            className="h-6 w-6"
                        />
                        <span className="hidden font-semibold sm:inline">Google Drive Index</span>
                    </Link>

                    {/* Right side actions */}
                    <div className="flex items-center space-x-3">
                        {/* Show/Hide Modified Date toggle */}
                        <button
                            title={localStorage.getItem('showModifiedColumn') !== 'false' ? 'Hide modified date' : 'Show modified date'}
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                            onClick={() => {
                                const current = localStorage.getItem('showModifiedColumn') !== 'false'
                                const newValue = !current
                                localStorage.setItem('showModifiedColumn', String(newValue))
                                // Dispatch custom event for FileListView to listen
                                window.dispatchEvent(new CustomEvent('columnVisibilityChange', { detail: { showModified: newValue } }))
                            }}
                        >
                            <FontAwesomeIcon
                                icon={localStorage.getItem('showModifiedColumn') !== 'false' ? 'eye' : 'eye-slash'}
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
                                    ⌘
                                </kbd>
                                <kbd className="rounded bg-gray-200 px-1.5 py-0.5 text-xs font-medium dark:bg-gray-700">
                                    K
                                </kbd>
                            </div>
                        </button>

                        {/* GitHub link */}
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
