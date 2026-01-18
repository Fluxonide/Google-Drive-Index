import { IconProp } from '@fortawesome/fontawesome-svg-core'

// Mapping of MIME types and extensions to FontAwesome icons
export const getFileIcon = (mimeType: string, extension?: string): IconProp => {
    // Folder
    if (mimeType === 'application/vnd.google-apps.folder' || mimeType.includes('folder')) {
        return ['far', 'folder']
    }

    // Extension-based mapping first (more specific)
    if (extension) {
        const ext = extension.toLowerCase().replace('.', '')

        // Videos
        if (['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'm4v'].includes(ext)) {
            return 'film'
        }

        // Audio
        if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'].includes(ext)) {
            return 'music'
        }

        // Images
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff'].includes(ext)) {
            return 'image'
        }

        // Documents
        if (['pdf'].includes(ext)) {
            return 'file-pdf'
        }
        if (['doc', 'docx'].includes(ext)) {
            return 'file-word'
        }
        if (['xls', 'xlsx'].includes(ext)) {
            return 'file-excel'
        }
        if (['ppt', 'pptx'].includes(ext)) {
            return 'file-powerpoint'
        }

        // Code
        if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'cs', 'go', 'rs', 'php', 'rb', 'swift', 'kt'].includes(ext)) {
            return 'file-code'
        }

        // Archives
        if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext)) {
            return 'file-archive'
        }

        // Text
        if (['txt', 'md', 'markdown', 'json', 'xml', 'yaml', 'yml', 'csv'].includes(ext)) {
            return 'file-alt'
        }
    }

    // MIME type-based mapping
    if (mimeType.startsWith('video/')) return 'film'
    if (mimeType.startsWith('audio/')) return 'music'
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('text/')) return 'file-alt'
    if (mimeType.includes('pdf')) return 'file-pdf'
    if (mimeType.includes('word')) return 'file-word'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'file-excel'
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'file-powerpoint'
    if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed')) return 'file-archive'

    // Default
    return 'file'
}

// Format file size to human readable
export const formatFileSize = (bytes: string | number | undefined): string => {
    if (!bytes) return ''

    const size = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes
    if (isNaN(size)) return ''

    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let unitIndex = 0
    let value = size

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024
        unitIndex++
    }

    return `${value.toFixed(unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`
}

// Format date to readable format
export const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return ''

    try {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    } catch {
        return ''
    }
}

// Check if file is previewable
export const isPreviewable = (mimeType: string, extension?: string): boolean => {
    const ext = extension?.toLowerCase().replace('.', '') || ''

    // Video
    if (['mp4', 'webm', 'ogg'].includes(ext) || mimeType.startsWith('video/')) return true

    // Audio
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext) || mimeType.startsWith('audio/')) return true

    // Image
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext) || mimeType.startsWith('image/')) return true

    // PDF
    if (ext === 'pdf' || mimeType.includes('pdf')) return true

    // Text/Code
    if (['txt', 'md', 'json', 'js', 'ts', 'py', 'html', 'css', 'xml', 'yaml'].includes(ext)) return true

    return false
}
