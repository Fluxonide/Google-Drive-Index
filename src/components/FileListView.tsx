import { useState, useRef, useEffect, MouseEventHandler } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getFileIcon, formatFileSize, formatDate, extractEmojiFromFileName } from '../utils/fileIcons'
import { parsePathInfo, getDownloadUrl, isFolder, renameFile, deleteFile } from '../utils/api'
import type { DriveFile } from '../types'
import toast from 'react-hot-toast'
import RenameModal from './RenameModal'
import DownloadButtonGroup from './DownloadButtonGroup'

// Helper component for icon with hover thumbnail
const FileHoverIcon = ({ file, isFolderItem, path, drive, emojiIcon }: { file: DriveFile, isFolderItem: boolean, path: string, drive: number, emojiIcon?: string | null }) => {
    const [isHovering, setIsHovering] = useState(false)
    const [imgSrc, setImgSrc] = useState<string>('')
    const [hasError, setHasError] = useState(false)

    // Reset state when file changes
    useEffect(() => {
        setIsHovering(false)
        setHasError(false)
        setImgSrc('')
    }, [file.id, path, drive])

    const handleMouseEnter = () => {
        setIsHovering(true)
        if (!imgSrc) {
            // Construct custom thumbnail path matches FilePreview logic
            // Requires "drive:" prefix for worker routing
            const rawName = file.name.replace(/\.[^/.]+$/, "")
            // Ensure path doesn't have double slashes
            let cleanPath = path === '/' ? '' : path
            if (cleanPath.endsWith('/')) {
                cleanPath = cleanPath.replace(/\/+$/, '')
            }
            // Format: /{drive}:/path/to/.thumbnail/file.jpg
            const customPath = `/${drive}:${cleanPath}/.thumbnail/${encodeURIComponent(rawName)}.jpg`
            setImgSrc(customPath)
        }
    }

    const handleError = () => {
        if (!hasError && file.thumbnailLink) {
            setHasError(true)
            // Fallback to Google thumbnail
            setImgSrc(file.thumbnailLink.replace('=s220', '=s400'))
        }
    }

    return (
        <div
            className="w-5 flex-shrink-0 text-center relative group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setIsHovering(false)}
        >
            {emojiIcon ? (
                <span className="flex h-5 w-5 items-center justify-center text-base leading-none select-none">
                    {emojiIcon}
                </span>
            ) : (
                <FontAwesomeIcon
                    icon={isFolderItem ? ['far', 'folder'] : getFileIcon(file.mimeType, file.fileExtension)}
                    className={`h-4 w-4 ${isFolderItem ? 'text-gray-500' : 'text-gray-400'}`}
                />
            )}
            {/* Hover Thumbnail - Persisted in DOM to avoid reload flash */}
            {!isFolderItem && (imgSrc || isHovering) && (
                <div
                    className={`absolute left-6 top-1/2 -translate-y-1/2 z-[100] w-[220px] rounded-lg shadow-xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden bg-white dark:bg-gray-800 transition-all duration-200 origin-left ${isHovering ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}
                    style={{ minHeight: '120px' }}
                >
                    {imgSrc ? (
                        <img
                            src={imgSrc}
                            alt={file.name}
                            className="w-full h-auto object-cover"
                            onError={handleError}
                        />
                    ) : (
                        /* Loading state or empty */
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 min-h-[120px]">
                            {/* Optional spinner could go here, but preloader makes it fast */}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// Checkbox component with indeterminate state support
interface CheckboxProps {
    checked: 0 | 1 | 2  // 0: unchecked, 1: indeterminate, 2: checked
    onChange: () => void
    title: string
    indeterminate?: boolean
}

const Checkbox = ({ checked, onChange, title, indeterminate }: CheckboxProps) => {
    const ref = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (ref.current) {
            ref.current.checked = Boolean(checked)
            if (indeterminate) {
                ref.current.indeterminate = checked === 1
            }
        }
    }, [ref, checked, indeterminate])

    const handleClick: MouseEventHandler = (e) => {
        if (ref.current) {
            if (e.target === ref.current) {
                e.stopPropagation()
            } else {
                ref.current.click()
            }
        }
    }

    return (
        <span
            title={title}
            className="inline-flex cursor-pointer items-center rounded p-1.5 hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={handleClick}
        >
            <input
                className="form-check-input h-4 w-4 cursor-pointer rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                type="checkbox"
                value={checked ? '1' : ''}
                ref={ref}
                aria-label={title}
                onChange={onChange}
            />
        </span>
    )
}

interface FileListViewProps {
    files: DriveFile[]
    onFileClick: (file: DriveFile) => void
    onRenameSuccess?: (id: string, newName: string) => void
    onDeleteSuccess?: (id: string) => void
}

const FileListView = ({ files, onFileClick, onRenameSuccess, onDeleteSuccess }: FileListViewProps) => {
    const location = useLocation()
    const { drive, path } = parsePathInfo(location.pathname)

    // File selection state
    const [selected, setSelected] = useState<Record<string, boolean>>({})

    // Rename state
    const [renameModalOpen, setRenameModalOpen] = useState(false)
    const [fileToRename, setFileToRename] = useState<DriveFile | null>(null)

    // Delete state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null)

    // Column visibility state (persisted to localStorage)
    const [showModified, setShowModified] = useState<boolean>(() => {
        const stored = localStorage.getItem('showModifiedColumn')
        return stored !== null ? stored !== 'false' : true
    })

    // Listen for navbar toggle events
    useEffect(() => {
        const handleVisibilityChange = (e: CustomEvent<{ showModified: boolean }>) => {
            setShowModified(e.detail.showModified)
        }
        window.addEventListener('columnVisibilityChange', handleVisibilityChange as EventListener)
        return () => window.removeEventListener('columnVisibilityChange', handleVisibilityChange as EventListener)
    }, [])

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

    // Sort: folders first, then files alphabetically
    const sortedFiles = [...files].sort((a, b) => {
        const aIsFolder = isFolder(a.mimeType)
        const bIsFolder = isFolder(b.mimeType)
        if (aIsFolder && !bIsFolder) return -1
        if (!aIsFolder && bIsFolder) return 1
        return a.name.localeCompare(b.name)
    })

    // Get non-folder files only
    const selectableFiles = sortedFiles.filter(f => !isFolder(f.mimeType))

    // Calculate total selection state
    const getSelectionState = (): 0 | 1 | 2 => {
        const selectedIds = selectableFiles.filter(f => selected[f.id])
        if (selectedIds.length === 0) return 0
        if (selectedIds.length === selectableFiles.length) return 2
        return 1
    }

    const totalSelected = getSelectionState()
    const selectedCount = selectableFiles.filter(f => selected[f.id]).length

    // Toggle individual file selection
    const toggleFileSelected = (id: string) => {
        setSelected(prev => {
            if (prev[id]) {
                const next = { ...prev }
                delete next[id]
                return next
            }
            return { ...prev, [id]: true }
        })
    }

    // Toggle all files selection
    const toggleAllSelected = () => {
        if (totalSelected === 2) {
            setSelected({})
        } else {
            const allSelected: Record<string, boolean> = {}
            selectableFiles.forEach(f => { allSelected[f.id] = true })
            setSelected(allSelected)
        }
    }

    // Copy selected files permalinks
    const copySelectedPermalinks = () => {
        const selectedFiles = selectableFiles.filter(f => selected[f.id])
        const urls = selectedFiles.map(f => {
            const fullPath = `${window.location.origin}${getFileDownloadUrl(f)}`
            return fullPath
        }).join('\n')

        navigator.clipboard.writeText(urls).then(() => {
            toast.success(`Copied ${selectedFiles.length} file link(s) to clipboard`)
        }).catch(() => {
            toast.error('Failed to copy links')
        })
    }

    // Download selected files (simple: open each in new tab)
    const downloadSelectedFiles = () => {
        const selectedFiles = selectableFiles.filter(f => selected[f.id])
        if (selectedFiles.length === 1) {
            window.open(getFileDownloadUrl(selectedFiles[0]), '_blank')
        } else {
            selectedFiles.forEach(f => {
                window.open(getFileDownloadUrl(f), '_blank')
            })
            toast.success(`Started download for ${selectedFiles.length} files`)
        }
    }

    // Copy single file link
    const copyFileLink = (file: DriveFile) => {
        const url = `${window.location.origin}${getFileDownloadUrl(file)}`
        navigator.clipboard.writeText(url).then(() => {
            toast.success('Copied file link to clipboard')
        }).catch(() => {
            toast.error('Failed to copy link')
        })
    }

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
                setTimeout(() => window.location.reload(), 500)
            }
        } catch (error) {
            console.error(error)
            toast.error('Failed to rename file')
            throw error // Re-throw for modal to handle loading state if needed
        }
    }

    // Helper to construct thumbnail path (extracted from FileHoverIcon to be reusable)
    const getHoverThumbnailPath = (file: DriveFile, path: string, drive: number): string | null => {
        if (!file.thumbnailLink) return null // Only check if file has a thumbnail link (reusing optimization from earlier)

        const rawName = file.name.replace(/\.[^/.]+$/, "")
        let cleanPath = path === '/' ? '' : path
        if (cleanPath.endsWith('/')) {
            cleanPath = cleanPath.replace(/\/+$/, '')
        }
        return `/${drive}:${cleanPath}/.thumbnail/${encodeURIComponent(rawName)}.jpg`
    }

    // Preload hover thumbnails
    useEffect(() => {
        const preloadThumbnails = async () => {
            // Select candidates: not folders, and preferably have a thumbnail link to avoid mass 404s on generic files?
            // User said "LOAD ALL".
            // If I just loop all non-folders it should be fine.
            const candidates = files.filter(f => !isFolder(f.mimeType))

            for (const file of candidates) {
                const src = getHoverThumbnailPath(file, path, drive)
                if (src) {
                    const img = new Image()
                    img.src = src
                    // We don't need to await this, just trigger the fetch
                }
            }
        }

        // Small delay to let the UI render first
        const timer = setTimeout(preloadThumbnails, 1000)
        return () => clearTimeout(timer)
    }, [files, path, drive])

    const handleDeleteClick = (file: DriveFile) => {
        setFileToDelete(file)
        setDeleteModalOpen(true)
    }

    const handleDeleteSubmit = async () => {
        if (!fileToDelete) return

        try {
            await deleteFile(drive, fileToDelete.id)
            toast.success('File deleted successfully')
            if (onDeleteSuccess) {
                onDeleteSuccess(fileToDelete.id)
            } else {
                setTimeout(() => window.location.reload(), 500)
            }
        } catch (error) {
            console.error(error)
            toast.error('Failed to delete file')
        }
    }

    return (
        <div className="rounded bg-white shadow-sm dark:bg-[#18181B] dark:text-gray-100">
            {/* Header */}
            <div className="grid grid-cols-12 items-center gap-2 border-b border-gray-900/10 px-3 py-2 dark:border-gray-500/30">
                <div className={`col-span-12 flex items-center gap-2 ${showModified ? 'md:col-span-8' : 'md:col-span-9'}`}>
                    <div className="flex-1 text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 truncate">
                        Name
                    </div>
                    {showModified && (
                        <div className="hidden w-[140px] flex-shrink-0 text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 md:block text-right">
                            Last Modified
                        </div>
                    )}
                </div>
                <div className="hidden text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 md:col-span-3 md:flex items-center justify-end gap-4 pr-3">
                    <span className="w-[80px] text-center">Size</span>
                    <span className="w-[150px] text-right">Actions</span>
                </div>
                <div className={`hidden text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 md:col-span-1 ${showModified ? 'md:block' : 'hidden'}`}>
                    {/* Bulk actions */}
                    <div className="flex items-center justify-end space-x-1 text-gray-700 dark:text-gray-400">
                        <Checkbox
                            checked={totalSelected}
                            onChange={toggleAllSelected}
                            title="Select all files"
                            indeterminate={true}
                        />
                        <button
                            title="Copy selected files permalink"
                            className="cursor-pointer rounded p-1.5 hover:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-white dark:hover:bg-gray-600 disabled:dark:text-gray-600 disabled:hover:dark:bg-gray-900"
                            disabled={selectedCount === 0}
                            onClick={copySelectedPermalinks}
                        >
                            <FontAwesomeIcon icon={['far', 'copy']} className="h-4 w-4" />
                        </button>
                        <button
                            title="Download selected files"
                            className="cursor-pointer rounded p-1.5 hover:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-white dark:hover:bg-gray-600 disabled:dark:text-gray-600 disabled:hover:dark:bg-gray-900"
                            disabled={selectedCount === 0}
                            onClick={downloadSelectedFiles}
                        >
                            <FontAwesomeIcon icon={['far', 'circle-down']} className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Files */}
            {sortedFiles.map((file) => {
                const isFolderItem = isFolder(file.mimeType)
                const { emoji, cleanName } = isFolderItem
                    ? extractEmojiFromFileName(file.name)
                    : { emoji: null, cleanName: file.name }

                return (
                    <div
                        key={file.id}
                        className="grid grid-cols-12 items-center gap-2 transition-all duration-100 hover:bg-gray-100 dark:hover:bg-gray-850"
                    >
                        {/* Name - clickable area */}
                        <Link
                            to={getItemPath(file)}
                            className={`col-span-12 flex items-center gap-2 px-3 py-2.5 ${showModified ? 'md:col-span-8' : 'md:col-span-9'}`}
                        >
                            <div className="flex-1 flex items-center space-x-2 min-w-0">
                                <FileHoverIcon file={file} isFolderItem={isFolderItem} path={path} drive={drive} emojiIcon={emoji} />
                                <span className="truncate font-medium text-gray-900 dark:text-white" title={cleanName}>
                                    {cleanName}
                                </span>
                            </div>
                            {showModified && (
                                <div className="hidden w-[140px] flex-shrink-0 font-mono text-sm text-gray-700 dark:text-gray-500 md:block text-right">
                                    {formatDate(file.modifiedTime)}
                                </div>
                            )}
                        </Link>

                        {/* Merged Size & Actions column */}
                        <div className="hidden md:col-span-3 md:flex items-center justify-end gap-4 pr-3">
                            <div className="w-[80px] flex-shrink-0 font-mono text-sm text-gray-700 dark:text-gray-500 text-left">
                                {formatFileSize(file.size) || '—'}
                            </div>
                            <div className="flex items-center justify-end space-x-1 text-gray-700 dark:text-gray-400 w-[150px]">
                                {!isFolderItem && (
                                    <span
                                        title="Preview file"
                                        className="cursor-pointer rounded px-1.5 py-1 hover:bg-gray-300 dark:hover:bg-gray-600"
                                        onClick={() => onFileClick(file)}
                                    >
                                        <FontAwesomeIcon icon="eye" />
                                    </span>
                                )}
                                <div onClick={(e) => { e.preventDefault(); e.stopPropagation() }}>
                                    <DownloadButtonGroup
                                        downloadUrl={getFileDownloadUrl(file)}
                                        fileName={file.name}
                                        onRenameClick={() => handleRenameClick(file)}
                                        onDeleteClick={() => handleDeleteClick(file)}
                                        isFolder={isFolderItem}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Checkbox column */}
                        <div className={`hidden p-1.5 text-gray-700 dark:text-gray-400 md:col-span-1 ${showModified ? 'md:flex justify-end' : 'hidden'}`}>
                            {!isFolderItem && (
                                <Checkbox
                                    checked={selected[file.id] ? 2 : 0}
                                    onChange={() => toggleFileSelected(file.id)}
                                    title="Select file"
                                />
                            )}
                        </div>
                    </div>
                )
            })}
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

export default FileListView
