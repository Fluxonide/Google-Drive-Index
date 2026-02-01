import { MouseEventHandler } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import toast from 'react-hot-toast'

// Button style color mapping
const btnStyleMap = (btnColor?: string) => {
    const colorMap: Record<string, string> = {
        gray: 'hover:text-gray-600 dark:hover:text-white focus:ring-gray-200 focus:text-gray-600 dark:focus:text-white border-gray-300 dark:border-gray-500 dark:focus:ring-gray-500',
        blue: 'hover:text-blue-600 focus:ring-blue-200 focus:text-blue-600 border-blue-300 dark:border-blue-700 dark:focus:ring-blue-500',
        teal: 'hover:text-teal-600 focus:ring-teal-200 focus:text-teal-600 border-teal-300 dark:border-teal-700 dark:focus:ring-teal-500',
        red: 'hover:text-red-600 focus:ring-red-200 focus:text-red-600 border-red-300 dark:border-red-700 dark:focus:ring-red-500',
        green: 'hover:text-green-600 focus:ring-green-200 focus:text-green-600 border-green-300 dark:border-green-700 dark:focus:ring-green-500',
        pink: 'hover:text-pink-600 focus:ring-pink-200 focus:text-pink-600 border-pink-300 dark:border-pink-700 dark:focus:ring-pink-500',
        yellow: 'hover:text-yellow-400 focus:ring-yellow-100 focus:text-yellow-400 border-yellow-300 dark:border-yellow-400 dark:focus:ring-yellow-300',
        purple: 'hover:text-purple-600 focus:ring-purple-200 focus:text-purple-600 border-purple-300 dark:border-purple-700 dark:focus:ring-purple-500',
    }
    return btnColor ? colorMap[btnColor] || colorMap.gray : colorMap.gray
}

interface DownloadButtonProps {
    onClickCallback: MouseEventHandler<HTMLButtonElement>
    btnColor?: string
    btnText: string
    btnIcon?: IconProp
    btnImage?: string
    btnTitle?: string
}

export const DownloadButton = ({
    onClickCallback,
    btnColor,
    btnText,
    btnIcon,
    btnImage,
    btnTitle,
}: DownloadButtonProps) => {
    return (
        <button
            className={`flex items-center space-x-2 rounded-lg border bg-white py-2 px-4 text-sm font-medium text-gray-900 hover:bg-gray-100/10 focus:z-10 focus:ring-2 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-900 transition-all ${btnStyleMap(btnColor)}`}
            title={btnTitle}
            onClick={onClickCallback}
        >
            {btnIcon && <FontAwesomeIcon icon={btnIcon} />}
            {btnImage && <img src={btnImage} alt={btnText} className="h-5 w-5" />}
            <span>{btnText}</span>
        </button>
    )
}

interface DownloadButtonGroupProps {
    downloadUrl: string
    fileName: string
    onCustomizeClick?: () => void
    onRenameClick?: () => void
}

const DownloadButtonGroup = ({ downloadUrl, fileName, onCustomizeClick, onRenameClick }: DownloadButtonGroupProps) => {
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

    return (
        <div className="flex flex-wrap justify-center gap-2">
            <DownloadButton
                onClickCallback={() => window.open(downloadUrl, '_blank')}
                btnColor="blue"
                btnText="Download"
                btnIcon="file-download"
                btnTitle="Download the file directly"
            />
            <DownloadButton
                onClickCallback={() => copyToClipboard(getFullUrl())}
                btnColor="pink"
                btnText="Copy Direct Link"
                btnIcon="copy"
                btnTitle="Copy the direct link to clipboard"
            />
            {onCustomizeClick && (
                <DownloadButton
                    onClickCallback={onCustomizeClick}
                    btnColor="teal"
                    btnText="Customize Link"
                    btnIcon="pen"
                    btnTitle="Customize the download link"
                />
            )}
            {onRenameClick && (
                <DownloadButton
                    onClickCallback={onRenameClick}
                    btnColor="purple"
                    btnText="Rename"
                    btnIcon="edit"
                    btnTitle="Rename file"
                />
            )}
        </div>
    )
}

export default DownloadButtonGroup
