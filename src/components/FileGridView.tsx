import { Link, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getFileIcon, formatFileSize } from '../utils/fileIcons'
import { parsePathInfo, getDownloadUrl, isFolder } from '../utils/api'
import type { DriveFile } from '../types'

interface FileGridViewProps {
    files: DriveFile[]
    onFileClick: (file: DriveFile) => void
}

const FileGridView = ({ files, onFileClick }: FileGridViewProps) => {
    const location = useLocation()
    const { drive, path } = parsePathInfo(location.pathname)

    const getItemPath = (file: DriveFile): string => {
        const basePath = location.pathname.endsWith('/')
            ? location.pathname
            : location.pathname + '/'
        const isFolderItem = isFolder(file.mimeType)
        return `${basePath}${encodeURIComponent(file.name)}${isFolderItem ? '/' : ''}`
    }

    const getFileDownloadUrl = (file: DriveFile): string => {
        return getDownloadUrl(drive, path, file.name)
    }

    const isImage = (file: DriveFile): boolean => {
        return file.mimeType.startsWith('image/')
    }

    // Sort: folders first, then files alphabetically
    const sortedFiles = [...files].sort((a, b) => {
        const aIsFolder = isFolder(a.mimeType)
        const bIsFolder = isFolder(b.mimeType)
        if (aIsFolder && !bIsFolder) return -1
        if (!aIsFolder && bIsFolder) return 1
        return a.name.localeCompare(b.name)
    })

    return (
        <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {sortedFiles.map((file) => (
                <div
                    key={file.id}
                    className="group relative overflow-hidden rounded-lg border border-gray-200/50 bg-white transition-all hover:border-gray-300 hover:shadow-md dark:border-gray-700/50 dark:bg-gray-800 dark:hover:border-gray-600"
                >
                    {/* Thumbnail area */}
                    <Link
                        to={getItemPath(file)}
                        className="block"
                    >
                        <div className="relative aspect-square bg-gray-100 dark:bg-gray-900">
                            {isImage(file) ? (
                                <img
                                    src={getFileDownloadUrl(file)}
                                    alt={file.name}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                    <FontAwesomeIcon
                                        icon={getFileIcon(file.mimeType, file.fileExtension)}
                                        className={`h-12 w-12 ${isFolder(file.mimeType) ? 'text-gray-500' : 'text-gray-400'
                                            }`}
                                    />
                                </div>
                            )}

                            {/* Hover overlay with actions */}
                            {!isFolder(file.mimeType) && (
                                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault()
                                            onFileClick(file)
                                        }}
                                        className="rounded-full bg-white/90 p-2 text-gray-900 hover:bg-white"
                                        title="Preview"
                                    >
                                        <FontAwesomeIcon icon="eye" className="h-4 w-4" />
                                    </button>
                                    <a
                                        href={getFileDownloadUrl(file)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="rounded-full bg-white/90 p-2 text-gray-900 hover:bg-white"
                                        title="Download"
                                    >
                                        <FontAwesomeIcon icon="download" className="h-4 w-4" />
                                    </a>
                                </div>
                            )}
                        </div>
                    </Link>

                    {/* File info */}
                    <div className="p-2">
                        <Link
                            to={getItemPath(file)}
                            className="block truncate text-sm font-medium text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                            title={file.name}
                        >
                            {file.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            {isFolder(file.mimeType) ? 'Folder' : formatFileSize(file.size)}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default FileGridView
