import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import toast from 'react-hot-toast'
import Breadcrumb from './Breadcrumb'
import SwitchLayout from './SwitchLayout'
import FileListView from './FileListView'
import FileGridView from './FileGridView'
import Loading from './Loading'
import FilePreview from './previews/FilePreview'
import type { DriveFile, LayoutType } from '../types'

const FileListing = () => {
    const location = useLocation()
    const [files, setFiles] = useState<DriveFile[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [layout, setLayout] = useState<LayoutType>(() => {
        return (localStorage.getItem('preferredLayout') as LayoutType) || 'list'
    })
    const [nextPageToken, setNextPageToken] = useState<string | null>(null)
    const [loadingMore, setLoadingMore] = useState(false)
    const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null)

    // Parse path to determine drive and folder
    const getPathInfo = () => {
        const path = location.pathname
        const match = path.match(/^\/(\d+):(.*)$/)
        if (match) {
            return { drive: match[1], path: match[2] || '/' }
        }
        return { drive: '0', path: '/' }
    }

    // Check if current path is a file (no trailing slash and has extension)
    const isFilePath = () => {
        const path = location.pathname
        return !path.endsWith('/') && path.includes('.')
    }

    // Fetch folder contents
    const fetchFiles = async (pageToken?: string) => {
        const { drive, path } = getPathInfo()

        if (!pageToken) {
            setLoading(true)
            setFiles([])
        } else {
            setLoadingMore(true)
        }
        setError(null)

        try {
            const response = await fetch(`/${drive}:${path || '/'}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    page_token: pageToken || null,
                    page_index: 0
                }),
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status}`)
            }

            const data = await response.json()

            if (pageToken) {
                setFiles(prev => [...prev, ...(data.data?.files || [])])
            } else {
                setFiles(data.data?.files || [])
            }

            setNextPageToken(data.nextPageToken || null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load files')
            toast.error('Failed to load folder contents')
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }

    // Refetch when path changes
    useEffect(() => {
        if (!isFilePath()) {
            fetchFiles()
        }
    }, [location.pathname])

    // Save layout preference
    useEffect(() => {
        localStorage.setItem('preferredLayout', layout)
    }, [layout])

    // Check if this is a file view
    if (isFilePath()) {
        return <FilePreview />
    }

    // Show file preview modal if file selected
    if (selectedFile) {
        return (
            <FilePreview
                file={selectedFile}
                onClose={() => setSelectedFile(null)}
            />
        )
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-4">
            {/* Header with breadcrumb and layout toggle */}
            <div className="mb-4 flex items-center justify-between">
                <Breadcrumb />
                <SwitchLayout layout={layout} setLayout={setLayout} />
            </div>

            {/* Content */}
            <div className="rounded-lg border border-gray-200/50 bg-white shadow-sm dark:border-gray-700/50 dark:bg-gray-900">
                {loading && <Loading text="Loading folder contents..." />}

                {error && (
                    <div className="py-20 text-center">
                        <FontAwesomeIcon icon="exclamation-triangle" className="mb-4 h-12 w-12 text-red-500" />
                        <p className="text-gray-500">{error}</p>
                        <button
                            onClick={() => fetchFiles()}
                            className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && files.length === 0 && (
                    <div className="py-20 text-center">
                        <FontAwesomeIcon icon="folder-open" className="mb-4 h-12 w-12 text-gray-400" />
                        <p className="text-gray-500">This folder is empty</p>
                    </div>
                )}

                {!loading && !error && files.length > 0 && (
                    <>
                        {layout === 'list' ? (
                            <FileListView
                                files={files}
                                onFileClick={setSelectedFile}
                            />
                        ) : (
                            <FileGridView
                                files={files}
                                onFileClick={setSelectedFile}
                            />
                        )}

                        {/* Load more button */}
                        {nextPageToken && (
                            <div className="border-t border-gray-200/50 p-4 text-center dark:border-gray-700/50">
                                <button
                                    onClick={() => fetchFiles(nextPageToken)}
                                    disabled={loadingMore}
                                    className="inline-flex items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    {loadingMore ? (
                                        <>
                                            <FontAwesomeIcon icon="spinner" className="animate-spin" />
                                            <span>Loading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon="chevron-down" />
                                            <span>Load more</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* File count */}
            {!loading && files.length > 0 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                    {files.length} item{files.length !== 1 ? 's' : ''}
                    {nextPageToken && ' (more available)'}
                </div>
            )}
        </div>
    )
}

export default FileListing
