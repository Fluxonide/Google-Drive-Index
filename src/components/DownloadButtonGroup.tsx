import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import toast from 'react-hot-toast'

interface DownloadButtonGroupProps {
    downloadUrl: string
    fileName: string
    onCustomizeClick?: () => void
    onRenameClick?: () => void
    color?: 'gray' | 'white'
}

const DownloadButtonGroup = ({
    downloadUrl,
    fileName,
    onCustomizeClick,
    onRenameClick,
    color = 'gray'
}: DownloadButtonGroupProps) => {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('Copied direct link to clipboard!')
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

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className={buttonClass}>
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
                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-[#18181B] dark:divide-gray-700 dark:ring-gray-700 z-50">
                    <div className="px-1 py-1">
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => window.open(downloadUrl, '_blank')}
                                    className={`${active ? 'bg-indigo-500 text-white' : 'text-gray-900 dark:text-gray-100'
                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                >
                                    <FontAwesomeIcon icon="file-download" className="mr-2 h-4 w-4" />
                                    Download
                                </button>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => copyToClipboard(getFullUrl())}
                                    className={`${active ? 'bg-indigo-500 text-white' : 'text-gray-900 dark:text-gray-100'
                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                >
                                    <FontAwesomeIcon icon="copy" className="mr-2 h-4 w-4" />
                                    Copy Direct Link
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
                                            onClick={onCustomizeClick}
                                            className={`${active ? 'bg-indigo-500 text-white' : 'text-gray-900 dark:text-gray-100'
                                                } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
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
                                            onClick={onRenameClick}
                                            className={`${active ? 'bg-indigo-500 text-white' : 'text-gray-900 dark:text-gray-100'
                                                } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                        >
                                            <FontAwesomeIcon icon="edit" className="mr-2 h-4 w-4" />
                                            Rename
                                        </button>
                                    )}
                                </Menu.Item>
                            )}
                        </div>
                    )}
                </Menu.Items>
            </Transition>
        </Menu>
    )
}

export default DownloadButtonGroup
