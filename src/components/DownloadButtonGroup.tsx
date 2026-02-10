import { Fragment, useRef, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import toast from 'react-hot-toast'

interface DownloadButtonGroupProps {
    downloadUrl: string
    fileName: string
    onCustomizeClick?: () => void
    onRenameClick?: () => void
    color?: 'gray' | 'white'
    isFolder?: boolean
    layout?: 'menu' | 'buttons'
    onDeleteClick?: () => void
}

const DownloadButtonGroup = ({
    downloadUrl,
    fileName,
    onCustomizeClick,
    onRenameClick,
    color = 'gray',
    isFolder = false,
    layout = 'menu',
    onDeleteClick
}: DownloadButtonGroupProps) => {
    const [menuPosition, setMenuPosition] = useState<'up' | 'down'>('down')
    const buttonRef = useRef<HTMLButtonElement>(null)

    const handleTriggerClick = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            const spaceBelow = window.innerHeight - rect.bottom
            if (spaceBelow < 250) {
                setMenuPosition('up')
            } else {
                setMenuPosition('down')
            }
        }
    }

    const copyToClipboard = (text: string) => {
        const successMsg = isFolder ? 'Copied folder link to clipboard!' : 'Copied direct link to clipboard!'
        navigator.clipboard.writeText(text).then(() => {
            toast.success(successMsg)
        }).catch(() => {
            toast.error('Failed to copy link')
        })
    }

    const getFullUrl = () => {
        return `${window.location.origin}${downloadUrl}`
    }

    const buttonClass = color === 'white'
        ? "inline-flex w-full justify-center rounded-full p-2 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
        : "inline-flex w-full justify-center rounded-full p-2 text-sm font-medium text-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 dark:text-gray-400 dark:hover:bg-gray-800"

    if (layout === 'buttons') {
        const btnClass = "inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"

        return (
            <div className="flex flex-wrap gap-2">
                {!isFolder && (
                    <button
                        onClick={() => window.open(downloadUrl, '_blank')}
                        className={`${btnClass} bg-gray-900 text-white hover:bg-black border-transparent dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200`}
                    >
                        <FontAwesomeIcon icon="file-download" />
                        Download
                    </button>
                )}
                <button
                    onClick={() => copyToClipboard(getFullUrl())}
                    className={btnClass}
                >
                    <FontAwesomeIcon icon="copy" />
                    {isFolder ? 'Copy Folder Link' : 'Copy Direct Link'}
                </button>
                {onCustomizeClick && (
                    <button
                        onClick={onCustomizeClick}
                        className={btnClass}
                    >
                        <FontAwesomeIcon icon="pen" />
                        Customize Link
                    </button>
                )}
                {onRenameClick && (
                    <button
                        onClick={onRenameClick}
                        className={btnClass}
                    >
                        <FontAwesomeIcon icon="edit" />
                        Rename
                    </button>
                )}
            </div>
        )
    }

    return (
        <Menu as="div" className="relative inline-block text-left">
            {({ close }) => (
                <>
                    <div>
                        <Menu.Button ref={buttonRef} onClick={handleTriggerClick} className={buttonClass}>
                            <FontAwesomeIcon icon="ellipsis-vertical" className="h-5 w-5 drop-shadow-sm" />
                        </Menu.Button>
                    </div>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className={`absolute right-0 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-[#18181B] dark:divide-gray-700 dark:ring-gray-700 z-50 ${menuPosition === 'up' ? 'bottom-full mb-2 origin-bottom-right' : 'mt-2 origin-top-right'}`}>
                            <div className="px-1 py-1">
                                {!isFolder && (
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    window.open(downloadUrl, '_blank')
                                                    close()
                                                }}
                                                className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                                    } text-gray-900 dark:text-gray-100 group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                            >
                                                <FontAwesomeIcon icon="file-download" className="mr-2 h-4 w-4" />
                                                Download
                                            </button>
                                        )}
                                    </Menu.Item>
                                )}
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                copyToClipboard(getFullUrl())
                                                close()
                                            }}
                                            className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                                } text-gray-900 dark:text-gray-100 group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                        >
                                            <FontAwesomeIcon icon="copy" className="mr-2 h-4 w-4" />
                                            {isFolder ? 'Copy Folder Link' : 'Copy Direct Link'}
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>
                            {(onCustomizeClick || onRenameClick) && (
                                <div className="px-1 py-1">
                                    {onCustomizeClick && (
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                        if (onCustomizeClick) onCustomizeClick()
                                                        close()
                                                    }}
                                                    className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                                        } text-gray-900 dark:text-gray-100 group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                                >
                                                    <FontAwesomeIcon icon="pen" className="mr-2 h-4 w-4" />
                                                    Customize Link
                                                </button>
                                            )}
                                        </Menu.Item>
                                    )}
                                    {onRenameClick && (
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                        if (onRenameClick) onRenameClick()
                                                        close()
                                                    }}
                                                    className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                                        } text-gray-900 dark:text-gray-100 group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                                >
                                                    <FontAwesomeIcon icon="edit" className="mr-2 h-4 w-4" />
                                                    Rename
                                                </button>
                                            )}
                                        </Menu.Item>
                                    )}
                                </div>
                            )}
                            {onDeleteClick && (
                                <div className="px-1 py-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    if (onDeleteClick) onDeleteClick()
                                                    close()
                                                }}
                                                className={`${active ? 'bg-red-50 dark:bg-red-900/20' : ''
                                                    } text-red-600 dark:text-red-400 group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                            >
                                                <FontAwesomeIcon icon="trash" className="mr-2 h-4 w-4" />
                                                Delete
                                            </button>
                                        )}
                                    </Menu.Item>
                                </div>
                            )}
                        </Menu.Items>
                    </Transition>
                </>
            )}
        </Menu>
    )
}

export default DownloadButtonGroup
