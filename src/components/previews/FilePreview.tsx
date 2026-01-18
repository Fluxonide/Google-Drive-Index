import { useState, useEffect, Fragment } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Dialog, Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getFileIcon, formatFileSize, formatDate } from '../../utils/fileIcons'
import type { DriveFile } from '../../types'
import toast from 'react-hot-toast'

interface FilePreviewProps {
    file?: DriveFile
    onClose?: () => void
}

const FilePreview = ({ file, onClose }: FilePreviewProps) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [fileData, setFileData] = useState<DriveFile | null>(file || null)
    const [loading, setLoading] = useState(!file)
    const [fileContent, setFileContent] = useState<string | null>(null)

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
                // Parse path to get file info
                const pathParts = location.pathname.split('/').filter(Boolean)
                const fileName = decodeURIComponent(pathParts[pathParts.length - 1])

                // For now, create a mock file object
                // In production, this would fetch from the API
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
            mp3: 'audio/mpeg',
            wav: 'audio/wav',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            gif: 'image/gif',
            webp: 'image/webp',
            pdf: 'application/pdf',
            txt: 'text/plain',
            md: 'text/markdown',
            json: 'application/json',
        }
        return mimeMap[ext] || 'application/octet-stream'
    }

    const handleClose = () => {
        if (onClose) {
            onClose()
        } else {
            // Navigate back to parent folder
            const pathParts = location.pathname.split('/').filter(Boolean)
            pathParts.pop()
            navigate('/' + pathParts.join('/') + '/')
        }
    }

    const renderPreview = () => {
        if (!fileData) return null

        const { mimeType, name, link } = fileData
        const downloadUrl = link || location.pathname.replace(/\/$/, '')

        // Video
        if (mimeType.startsWith('video/')) {
            return (
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                    <video
                        controls
                        autoPlay
                        className="h-full w-full"
                        src={downloadUrl}
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            )
        }

        // Audio
        if (mimeType.startsWith('audio/')) {
            return (
                <div className="flex flex-col items-center space-y-4 p-8">
                    <FontAwesomeIcon icon="music" className="h-24 w-24 text-purple-500" />
                    <audio controls autoPlay className="w-full max-w-lg">
                        <source src={downloadUrl} type={mimeType} />
                        Your browser does not support the audio tag.
                    </audio>
                </div>
            )
        }

        // Image
        if (mimeType.startsWith('image/')) {
            return (
                <div className="flex items-center justify-center p-4">
                    <img
                        src={downloadUrl}
                        alt={name}
                        className="max-h-[70vh] max-w-full rounded-lg shadow-lg"
                    />
                </div>
            )
        }

        // PDF
        if (mimeType === 'application/pdf') {
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

        // Default: show download option
        return (
            <div className="flex flex-col items-center space-y-6 p-12">
                <FontAwesomeIcon
                    icon={getFileIcon(mimeType, name.split('.').pop())}
                    className="h-24 w-24 text-gray-400"
                />
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {formatFileSize(fileData.size)}
                    </p>
                </div>
                <p className="text-sm text-gray-500">
                    Preview not available for this file type
                </p>
                <a
                    href={downloadUrl}
                    download
                    className="inline-flex items-center space-x-2 rounded-lg bg-blue-500 px-6 py-3 text-white hover:bg-blue-600"
                >
                    <FontAwesomeIcon icon="download" />
                    <span>Download File</span>
                </a>
            </div>
        )
    }

    // Modal view (when file prop provided)
    if (file && onClose) {
        return (
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
                                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all dark:bg-gray-900">
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

                                    {/* Content */}
                                    <div className="bg-gray-50 dark:bg-gray-800/50">
                                        {loading ? (
                                            <div className="flex items-center justify-center py-20">
                                                <FontAwesomeIcon icon="spinner" className="h-8 w-8 animate-spin text-blue-500" />
                                            </div>
                                        ) : (
                                            renderPreview()
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                                        <div className="text-sm text-gray-500">
                                            {fileData && formatFileSize(fileData.size)}
                                        </div>
                                        <a
                                            href={fileData?.link || '#'}
                                            download
                                            className="inline-flex items-center space-x-2 rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
                                        >
                                            <FontAwesomeIcon icon="download" />
                                            <span>Download</span>
                                        </a>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        )
    }

    // Full page view (direct path navigation)
    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            {/* Back button */}
            <button
                onClick={handleClose}
                className="mb-4 inline-flex items-center space-x-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
                <FontAwesomeIcon icon="arrow-left" />
                <span>Back to folder</span>
            </button>

            {/* Preview card */}
            <div className="overflow-hidden rounded-xl border border-gray-200/50 bg-white shadow-lg dark:border-gray-700/50 dark:bg-gray-900">
                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                    <h1 className="text-xl font-medium text-gray-900 dark:text-white">
                        {fileData?.name}
                    </h1>
                    {fileData && (
                        <p className="mt-1 text-sm text-gray-500">
                            {formatFileSize(fileData.size)}
                            {fileData.modifiedTime && ` • Modified ${formatDate(fileData.modifiedTime)}`}
                        </p>
                    )}
                </div>

                {/* Content */}
                <div className="bg-gray-50 dark:bg-gray-800/50">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <FontAwesomeIcon icon="spinner" className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        renderPreview()
                    )}
                </div>
            </div>
        </div>
    )
}

export default FilePreview
