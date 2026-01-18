import { useState, Fragment, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getFileIcon } from '../utils/fileIcons'
import type { DriveFile } from '../types'

interface SearchModalProps {
    isOpen: boolean
    onClose: () => void
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<DriveFile[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    // Debounced search
    useEffect(() => {
        if (!query.trim()) {
            setResults([])
            return
        }

        const timer = setTimeout(async () => {
            setLoading(true)
            setError(null)

            try {
                const response = await fetch('/0:search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ q: query }),
                })

                if (!response.ok) throw new Error('Search failed')

                const data = await response.json()
                setResults(data.data?.files || [])
            } catch (err) {
                setError('Failed to search. Please try again.')
                setResults([])
            } finally {
                setLoading(false)
            }
        }, 500) // 500ms debounce

        return () => clearTimeout(timer)
    }, [query])

    const handleResultClick = (file: DriveFile) => {
        onClose()
        setQuery('')
        // Navigate to file or folder
        // For now, just close modal - will implement proper navigation later
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-start justify-center p-4 pt-[15vh]">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 transition-all dark:bg-gray-900 dark:ring-white/10">
                                {/* Search input */}
                                <div className="flex items-center border-b border-gray-200 px-4 dark:border-gray-700">
                                    <FontAwesomeIcon
                                        icon="search"
                                        className="h-5 w-5 text-gray-400"
                                    />
                                    <input
                                        type="text"
                                        className="flex-1 bg-transparent px-4 py-4 text-gray-900 placeholder-gray-400 outline-none dark:text-white"
                                        placeholder="Search files and folders..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        autoFocus
                                    />
                                    <kbd className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                        ESC
                                    </kbd>
                                </div>

                                {/* Results */}
                                <div className="max-h-[60vh] overflow-y-auto">
                                    {loading && (
                                        <div className="flex items-center justify-center py-12">
                                            <FontAwesomeIcon
                                                icon="spinner"
                                                className="h-6 w-6 animate-spin text-blue-500"
                                            />
                                            <span className="ml-3 text-gray-500">Searching...</span>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="py-12 text-center text-red-500">
                                            {error}
                                        </div>
                                    )}

                                    {!loading && !error && query && results.length === 0 && (
                                        <div className="py-12 text-center text-gray-500">
                                            No results found for "{query}"
                                        </div>
                                    )}

                                    {!loading && results.length > 0 && (
                                        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {results.map((file) => (
                                                <li key={file.id}>
                                                    <button
                                                        onClick={() => handleResultClick(file)}
                                                        className="flex w-full items-center space-x-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={getFileIcon(file.mimeType, file.fileExtension)}
                                                            className="h-5 w-5 text-gray-400"
                                                        />
                                                        <div className="flex-1 truncate">
                                                            <div className="truncate font-medium text-gray-900 dark:text-white">
                                                                {file.name}
                                                            </div>
                                                            <div className="truncate text-sm text-gray-500">
                                                                {file.size || 'Folder'}
                                                            </div>
                                                        </div>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {!query && (
                                        <div className="py-12 text-center text-gray-400">
                                            Start typing to search...
                                        </div>
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export default SearchModal
