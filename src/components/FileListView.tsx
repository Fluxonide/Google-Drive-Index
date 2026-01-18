import { Link, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getFileIcon, formatFileSize, formatDate } from '../utils/fileIcons'
import type { DriveFile } from '../types'

interface FileListViewProps {
    files: DriveFile[]
    onFileClick: (file: DriveFile) => void
}

const FileListView = ({ files, onFileClick }: FileListViewProps) => {
    const location = useLocation()

    const getItemPath = (file: DriveFile): string => {
        const basePath = location.pathname.endsWith('/')
            ? location.pathname
            : location.pathname + '/'
        const isFolder = file.mimeType.includes('folder')
        return `${basePath}${encodeURIComponent(file.name)}${isFolder ? '/' : ''}`
    }

    const isFolder = (file: DriveFile): boolean => {
        return file.mimeType.includes('folder')
    }

    // Sort: folders first, then files alphabetically
    const sortedFiles = [...files].sort((a, b) => {
        const aIsFolder = isFolder(a)
        const bIsFolder = isFolder(b)
        if (aIsFolder && !bIsFolder) return -1
        if (!aIsFolder && bIsFolder) return 1
        return a.name.localeCompare(b.name)
    })

    return (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {/* Header */}
            <div className="hidden grid-cols-12 gap-4 bg-gray-50 px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:bg-gray-800/50 dark:text-gray-400 md:grid">
                <div className="col-span-6">Name</div>
                <div className="col-span-3">Modified</div>
                <div className="col-span-2 text-right">Size</div>
                <div className="col-span-1"></div>
            </div>

            {/* Files */}
            {sortedFiles.map((file) => (
                <div
                    key={file.id}
                    className="group grid grid-cols-12 items-center gap-4 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                    {/* Name */}
                    <div className="col-span-12 flex items-center space-x-3 md:col-span-6">
                        <FontAwesomeIcon
                            icon={getFileIcon(file.mimeType, file.fileExtension)}
                            className={`h-5 w-5 flex-shrink-0 ${isFolder(file) ? 'text-yellow-500' : 'text-gray-400'
                                }`}
                        />
                        <Link
                            to={getItemPath(file)}
                            className="truncate font-medium text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                        >
                            {file.name}
                        </Link>
                    </div>

                    {/* Modified date */}
                    <div className="col-span-3 hidden text-sm text-gray-500 dark:text-gray-400 md:block">
                        {formatDate(file.modifiedTime)}
                    </div>

                    {/* Size */}
                    <div className="col-span-2 hidden text-right text-sm text-gray-500 dark:text-gray-400 md:block">
                        {isFolder(file) ? '—' : formatFileSize(file.size)}
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 hidden justify-end space-x-2 opacity-0 transition-opacity group-hover:opacity-100 md:flex">
                        {!isFolder(file) && (
                            <button
                                onClick={() => onFileClick(file)}
                                className="rounded p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                title="Preview"
                            >
                                <FontAwesomeIcon icon="eye" className="h-4 w-4" />
                            </button>
                        )}
                        <a
                            href={file.link || `#`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                            title="Download"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <FontAwesomeIcon icon="download" className="h-4 w-4" />
                        </a>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default FileListView
