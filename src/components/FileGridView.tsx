import { Link, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getFileIcon, formatFileSize } from '../utils/fileIcons'
import { parsePathInfo, getDownloadUrl, isFolder, renameFile } from '../utils/api'
import type { DriveFile } from '../types'
import toast from 'react-hot-toast'
import { useState } from 'react'
import RenameModal from './RenameModal'

interface FileGridViewProps {
    files: DriveFile[]
    onFileClick: (file: DriveFile) => void
    onRenameSuccess?: (id: string, newName: string) => void
}

import DownloadButtonGroup from './DownloadButtonGroup'

const FileGridView = ({ files, onFileClick, onRenameSuccess }: FileGridViewProps) => {
    const location = useLocation()
    const { drive, path } = parsePathInfo(location.pathname)

    // Rename state
    const [renameModalOpen, setRenameModalOpen] = useState(false)
    const [fileToRename, setFileToRename] = useState<DriveFile | null>(null)

    const getItemPath = (file: DriveFile): string => {
        const basePath = location.pathname.endsWith('/')
            ? location.pathname
            : location.pathname + '/'
        const isFolderItem = isFolder(file.mimeType)
        // Folders get trailing slash, files get ?a=view for preview
        return `${basePath}${encodeURIComponent(file.name)}${isFolderItem ? '/' : '?a=view'}`
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

    const handleRenameClick = (file: DriveFile) => {
        setFileToRename(file)
        setRenameModalOpen(true)
    }

    const onRenameSubmit = async (newName: string) => {
        if (!fileToRename) return

        try {
            await renameFile(drive, fileToRename.id, newName)
            toast.success('File renamed successfully')
            // Optimistic update
            if (onRenameSuccess) {
                onRenameSuccess(fileToRename.id, newName)
            } else {
                // Fallback if no callback provided
                setTimeout(() => window.location.reload(), 500)
            }
        } catch (error) {
            console.error(error)
            toast.error('Failed to rename file')
            throw error
        }
    }

    return (
        <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {sortedFiles.map((file) => (
                <div
                    key={file.id}
                    className="group relative rounded-lg border border-gray-200/50 bg-white transition-all hover:border-gray-300 hover:shadow-md dark:border-gray-700/50 dark:bg-[#18181B] dark:hover:border-gray-600"
                >
                    {/* Thumbnail area */}
                    <Link
                        to={getItemPath(file)}
                        className="block"
                    >
                        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100 dark:bg-[#18181B]">
                            {file.thumbnailLink || isImage(file) ? (
                                <img
                                    src={file.thumbnailLink || getFileDownloadUrl(file)}
                                    alt={file.name}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                        // Fallback to icon if thumbnail fails to load
                                        e.currentTarget.style.display = 'none'
                                        e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden')
                                    }}
                                />
                            ) : null}

                            {/* Fallback Icon (initially hidden if we have a thumbnail/image) */}
                            <div className={`fallback-icon flex h-full w-full items-center justify-center ${file.thumbnailLink || isImage(file) ? 'hidden' : ''}`}>
                                <FontAwesomeIcon
                                    icon={getFileIcon(file.mimeType, file.fileExtension)}
                                    className={`h-12 w-12 ${isFolder(file.mimeType) ? 'text-gray-500' : 'text-gray-400'}`}
                                />
                            </div>



                            {/* Hover overlay with Preview only */}
                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                {!isFolder(file.mimeType) && (
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
                                )}
                            </div>
                        </div>
                    </Link>

                    {/* Always visible Actions Menu */}
                    <div className="absolute top-2 right-2 z-10" onClick={(e) => { e.preventDefault(); e.stopPropagation() }}>
                        <DownloadButtonGroup
                            downloadUrl={getFileDownloadUrl(file)}
                            fileName={file.name}
                            onRenameClick={() => handleRenameClick(file)}
                            color="white"
                            isFolder={isFolder(file.mimeType)}
                        />
                    </div>

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
                            {formatFileSize(file.size) || 'Folder'}
                        </p>
                    </div>
                </div>
            ))}
            {/* Rename Modal */}
            <RenameModal
                isOpen={renameModalOpen}
                onClose={() => setRenameModalOpen(false)}
                onRename={onRenameSubmit}
                currentName={fileToRename?.name || ''}
            />
        </div>
    )
}

export default FileGridView
