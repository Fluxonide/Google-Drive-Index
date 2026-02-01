import { useState, useEffect, Fragment } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Dialog, Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    getFileIcon,
    formatFileSize,
    formatDate
} from '../../utils/fileIcons'
import type { DriveFile } from '../../types'
import { MOCK_FILES } from '../../utils/api'
import toast from 'react-hot-toast'
import DownloadButtonGroup from '../DownloadButtonGroup'
import CustomEmbedLinkMenu from '../CustomEmbedLinkMenu'
import RenameModal from '../RenameModal'
import { renameFile, parsePathInfo } from '../../utils/api'

import VideoPlayer from './VideoPlayer'
import AudioPlayer from './AudioPlayer'
import Breadcrumb from '../Breadcrumb'
import { PreviewContainer, DownloadBtnContainer } from './Containers'

interface FilePreviewProps {
    file?: DriveFile
    onClose?: () => void
}

const FilePreview = ({ file, onClose }: FilePreviewProps) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [fileData, setFileData] = useState<DriveFile | null>(file || null)
    const [loading, setLoading] = useState(!file)
    const [customizeOpen, setCustomizeOpen] = useState(false)
    const [renameOpen, setRenameOpen] = useState(false)

    // If no file prop, fetch from current path
    useEffect(() => {
        if (file) {
            setFileData(file)
            return
        }

        // Fetch file details from path
        const fetchFile = async () => {
            setLoading(true)
            try {
                const pathParts = location.pathname.split('/').filter(Boolean)
                const fileName = decodeURIComponent(pathParts[pathParts.length - 1])

                // Use mock data for local dev to ensure links work on refresh
                if (import.meta.env.DEV) {
                    const mockFile = MOCK_FILES.find(f => f.name === fileName)
                    if (mockFile) {
                        setFileData(mockFile)
                        setLoading(false)
                        return
                    }
                }

                setFileData({
                    id: 'temp',
                    name: fileName,
                    mimeType: getMimeType(fileName),
                    size: undefined,
                })
            } catch (err) {
                toast.error('Failed to load file')
            } finally {
                setLoading(false)
            }
        }

        fetchFile()
    }, [file, location.pathname])

    const getMimeType = (filename: string): string => {
        const ext = filename.split('.').pop()?.toLowerCase() || ''
        const mimeMap: Record<string, string> = {
            mp4: 'video/mp4',
            webm: 'video/webm',
            mkv: 'video/x-matroska',
            avi: 'video/x-msvideo',
            mov: 'video/quicktime',
            flv: 'video/x-flv',
            mp3: 'audio/mpeg',
            wav: 'audio/wav',
            flac: 'audio/flac',
            ogg: 'audio/ogg',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            gif: 'image/gif',
            webp: 'image/webp',
            svg: 'image/svg+xml',
            pdf: 'application/pdf',
            txt: 'text/plain',
            md: 'text/markdown',
            json: 'application/json',
            js: 'application/javascript',
            ts: 'application/typescript',
            html: 'text/html',
            css: 'text/css',
            zip: 'application/zip',
            rar: 'application/x-rar-compressed',
            '7z': 'application/x-7z-compressed',
        }
        return mimeMap[ext] || 'application/octet-stream'
    }

    const handleClose = () => {
        if (onClose) {
            onClose()
        } else {
            const pathParts = location.pathname.split('/').filter(Boolean)
            pathParts.pop()
            navigate('/' + pathParts.join('/') + '/')
        }
    }

    const handleRename = async (newName: string) => {
        if (!fileData || !fileData.id || fileData.id === 'temp') {
            toast.error('Cannot rename file: Missing File ID (Try navigating from folder)')
            return
        }

        try {
            const { drive } = parsePathInfo(location.pathname)
            await renameFile(drive, fileData.id, newName)

            toast.success('File renamed successfully')
            // Update local state
            setFileData(prev => prev ? ({ ...prev, name: newName }) : null)

            // Optionally update URL if needed, but that might cause reload loops
            // For now just update the view
        } catch (error: any) {
            console.error('Rename failed:', error)
            toast.error(error.message || 'Failed to rename file')
            throw error // Re-throw for modal to handle if needed
        }
    }

    const isVideo = fileData?.mimeType?.startsWith('video/')
    const isAudio = fileData?.mimeType?.startsWith('audio/')
    const isImage = fileData?.mimeType?.startsWith('image/')
    const isPDF = fileData?.mimeType === 'application/pdf'

    const downloadUrl = fileData?.link || location.pathname.replace(/\/$/, '')

    const DefaultPreviewContent = () => {
        if (!fileData) return null
        return (
            <div className="items-center px-5 py-4 md:flex md:space-x-8">
                <div className="rounded-lg border border-gray-900/10 px-8 py-20 text-center dark:border-gray-500/30">
                    <FontAwesomeIcon
                        icon={getFileIcon(fileData.mimeType, fileData.name.split('.').pop())}
                        className="h-10 w-10 text-gray-500 dark:text-gray-400"
                    />
                    <div className="mt-6 text-sm font-medium line-clamp-3 md:w-28 text-gray-900 dark:text-white">
                        {fileData.name}
                    </div>
                </div>

                <div className="flex flex-col space-y-2 py-4 md:flex-1">
                    <div>
                        <div className="py-2 text-xs font-medium uppercase opacity-80 text-gray-500 dark:text-gray-400">Last modified</div>
                        <div className="text-gray-900 dark:text-white">{fileData.modifiedTime ? formatDate(fileData.modifiedTime) : 'Unavailable'}</div>
                    </div>

                    <div>
                        <div className="py-2 text-xs font-medium uppercase opacity-80 text-gray-500 dark:text-gray-400">File size</div>
                        <div className="text-gray-900 dark:text-white">{fileData.size ? formatFileSize(fileData.size) : 'Unavailable'}</div>
                    </div>

                    <div>
                        <div className="py-2 text-xs font-medium uppercase opacity-80 text-gray-500 dark:text-gray-400">MIME type</div>
                        <div className="text-gray-900 dark:text-white">{fileData.mimeType || 'Unavailable'}</div>
                    </div>
                </div>
            </div>
        )
    }

    const renderPreviewContent = () => {
        if (!fileData) return null

        const { name } = fileData

        if (isVideo) {
            return (
                <VideoPlayer
                    videoUrl={downloadUrl}
                    videoName={name}
                />
            )
        }

        if (isAudio) {
            return (
                <AudioPlayer
                    audioUrl={downloadUrl}
                    fileName={name}
                    modifiedTime={fileData?.modifiedTime}
                />
            )
        }

        if (isImage) {
            return (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                    className="mx-auto max-h-[70vh]"
                    src={downloadUrl}
                    alt={name}
                />
            )
        }

        if (isPDF) {
            return (
                <div className="h-[70vh] w-full overflow-hidden rounded-lg">
                    <iframe
                        src={`${downloadUrl}#view=FitH`}
                        className="h-full w-full"
                        title={name}
                    />
                </div>
            )
        }

        return <DefaultPreviewContent />
    }

    // Video uses custom FileMetadata
    const VideoFileMetadata = () => (
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            {fileData?.size !== undefined && (
                <div>
                    <div className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                        File Size
                    </div>
                    <div className="mt-1 text-gray-900 dark:text-white">
                        {formatFileSize(fileData.size)}
                    </div>
                </div>
            )}
            {fileData?.mimeType && (
                <div>
                    <div className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                        MIME Type
                    </div>
                    <div className="mt-1 font-mono text-gray-900 dark:text-white">
                        {fileData.mimeType}
                    </div>
                </div>
            )}
            {fileData?.modifiedTime && (
                <div>
                    <div className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                        Last Modified
                    </div>
                    <div className="mt-1 text-gray-900 dark:text-white">
                        {formatDate(fileData.modifiedTime)}
                    </div>
                </div>
            )}
            {fileData?.createdTime && (
                <div>
                    <div className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                        Created
                    </div>
                    <div className="mt-1 text-gray-900 dark:text-white">
                        {formatDate(fileData.createdTime)}
                    </div>
                </div>
            )}
        </div>
    )

    const content = (
        <div className="bg-gray-50 dark:bg-gray-800/50">
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <FontAwesomeIcon icon="spinner" className="h-8 w-8 animate-spin text-gray-500" />
                </div>
            ) : isVideo ? (
                <div className="overflow-hidden rounded-xl border border-gray-200/50 bg-white shadow-lg dark:border-gray-700/50 dark:bg-[#18181B]">
                    <div className="bg-gray-50 dark:bg-gray-800/50">
                        {renderPreviewContent()}
                    </div>
                    {/* Metadata & Actions for Video */}
                    <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                        <VideoFileMetadata />

                        <div className="flex justify-center md:justify-end">
                            <DownloadButtonGroup
                                downloadUrl={downloadUrl}
                                fileName={fileData?.name || 'file'}
                                onCustomizeClick={() => setCustomizeOpen(true)}
                                onRenameClick={fileData?.id && fileData.id !== 'temp' ? () => setRenameOpen(true) : undefined}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <PreviewContainer>
                        {renderPreviewContent()}
                    </PreviewContainer>
                    <DownloadBtnContainer>
                        <DownloadButtonGroup
                            downloadUrl={downloadUrl}
                            fileName={fileData?.name || 'file'}
                            onCustomizeClick={() => setCustomizeOpen(true)}
                            onRenameClick={fileData?.id && fileData.id !== 'temp' ? () => setRenameOpen(true) : undefined}
                        />
                    </DownloadBtnContainer>
                </>
            )}
        </div>
    )

    // Modal view (when file prop provided)
    if (file && onClose) {
        return (
            <>
                <CustomEmbedLinkMenu
                    path={downloadUrl}
                    fileName={fileData?.name || 'file'}
                    menuOpen={customizeOpen}
                    setMenuOpen={setCustomizeOpen}
                />
                <RenameModal
                    isOpen={renameOpen}
                    currentName={fileData?.name || ''}
                    onClose={() => setRenameOpen(false)}
                    onRename={handleRename}
                />
                <Transition appear show={true} as={Fragment}>
                    <Dialog as="div" className="relative z-50" onClose={handleClose}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black/70" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-200"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-150"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all dark:bg-[#18181B]">
                                        {/* Header */}
                                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                                            <Dialog.Title className="truncate pr-4 text-lg font-medium text-gray-900 dark:text-white">
                                                {fileData?.name}
                                            </Dialog.Title>
                                            <button
                                                onClick={handleClose}
                                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                                            >
                                                <FontAwesomeIcon icon="times" className="h-5 w-5" />
                                            </button>
                                        </div>
                                        {content}
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </>
        )
    }

    // Full page view (direct path navigation)
    return (
        <>
            <CustomEmbedLinkMenu
                path={downloadUrl}
                fileName={fileData?.name || 'file'}
                menuOpen={customizeOpen}
                setMenuOpen={setCustomizeOpen}
            />
            <RenameModal
                isOpen={renameOpen}
                currentName={fileData?.name || ''}
                onClose={() => setRenameOpen(false)}
                onRename={handleRename}
            />
            <div className="mx-auto max-w-6xl px-4 py-4">
                <div className="mb-4">
                    <Breadcrumb />
                </div>
                {content}
            </div>
        </>
    )
}

export default FilePreview
