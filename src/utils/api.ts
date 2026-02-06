// API configuration and utilities for Google Drive Worker integration

// The base URL for API calls - in production this would be the Worker URL
// When deployed together, use empty string for same-origin requests
export const API_BASE = ''

// Default drive index
export const DEFAULT_DRIVE = 0

// Types for API responses
export interface DriveFile {
    id: string
    name: string
    mimeType: string
    size?: string
    modifiedTime?: string
    fileExtension?: string
    link?: string
    driveId?: string
    thumbnailLink?: string
}

export interface FileListResponse {
    nextPageToken: string | null
    curPageIndex: number
    data: {
        files: DriveFile[]
    }
}

export interface SearchResponse {
    nextPageToken: string | null
    curPageIndex: number
    data: {
        files: DriveFile[]
    }
}

/**
 * Parse the current path to extract drive index and folder path
 * Handles paths like: /0:/folder/subfolder/ or /1:/path/
 */
export function parsePathInfo(pathname: string): { drive: number; path: string } {
    // Match pattern like /0:/ or /1:/path/
    const match = pathname.match(/^\/(\d+):(.*)$/)
    if (match) {
        return {
            drive: parseInt(match[1], 10),
            path: match[2] || '/'
        }
    }
    // Default to drive 0 and root
    return { drive: DEFAULT_DRIVE, path: '/' }
}

/**
 * Fetch folder contents from the Worker API
 */
// MOCK DATA FOR LOCAL DEV
export const MOCK_FILES: DriveFile[] = [
    {
        id: 'folder1',
        name: 'Sample Folder',
        mimeType: 'application/vnd.google-apps.folder',
        modifiedTime: new Date().toISOString(),
        size: '0',
        driveId: '0'
    },
    {
        id: 'vid1',
        name: 'Big Buck hhdhdhdhdddddddddddddddddddddddddddddddBunny.mp4',
        mimeType: 'video/mp4',
        size: '150000000',
        modifiedTime: new Date().toISOString(),
        // Use a real external sample video for testing player
        link: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
        thumbnailLink: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 'img1',
        name: 'Sample Image.jpg',
        mimeType: 'image/jpeg',
        size: '250000',
        modifiedTime: new Date().toISOString(),
        thumbnailLink: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
    },
    {
        id: 'audio1',
        name: 'Sample Audio.mp3',
        mimeType: 'audio/mpeg',
        size: '5000000',
        modifiedTime: new Date().toISOString(),
        link: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    },
    {
        id: 'pdf1',
        name: 'Sample Document.pdf',
        mimeType: 'application/pdf',
        size: '1024000',
        modifiedTime: new Date().toISOString(),
        link: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
        id: 'zip1',
        name: 'Sample Archive.zip',
        mimeType: 'application/zip',
        size: '2048000',
        modifiedTime: new Date().toISOString()
    }
]

export async function fetchFolderContents(
    drive: number,
    path: string,
    pageToken?: string,
    pageIndex: number = 0,
    password?: string
): Promise<FileListResponse> {
    // Ensure path ends with /
    const normalizedPath = path.endsWith('/') ? path : path + '/'

    // MOCK DATA FOR LOCAL DEV
    if (import.meta.env.DEV) {
        console.log('Returning mock data for DEV mode')
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    nextPageToken: null,
                    curPageIndex: 0,
                    data: {
                        files: MOCK_FILES
                    }
                })
            }, 500)
        })
    }

    const response = await fetch(`${API_BASE}/${drive}:${normalizedPath}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'folder',
            password: password || localStorage.getItem(`password_${drive}_${normalizedPath}`) || '',
            page_token: pageToken || null,
            page_index: pageIndex,
        }),
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`)
    }

    const data = await response.json()

    // Handle password-protected folders
    if (data.error?.code === 401) {
        throw new PasswordRequiredError('Password required for this folder')
    }

    return data
}

// Custom error for password-protected folders
export class PasswordRequiredError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'PasswordRequiredError'
    }
}

/**
 * Search files across drives
 */
export async function searchFiles(
    drive: number,
    query: string,
    pageToken?: string,
    pageIndex: number = 0
): Promise<SearchResponse> {
    // MOCK DATA FOR LOCAL DEV
    if (import.meta.env.DEV) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const results = MOCK_FILES.filter(f => f.name.toLowerCase().includes(query.toLowerCase()))
                resolve({
                    nextPageToken: null,
                    curPageIndex: 0,
                    data: { files: results }
                })
            }, 500)
        })
    }

    const response = await fetch(`${API_BASE}/${drive}:search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            q: query,
            page_token: pageToken || null,
            page_index: pageIndex,
        }),
    })

    if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
    }

    return response.json()
}

/**
 * Rename a file
 */
export async function renameFile(
    drive: number,
    fileId: string,
    newName: string
): Promise<any> {
    // MOCK DATA FOR LOCAL DEV
    if (import.meta.env.DEV) {
        console.log('Renaming file in DEV mode', fileId, newName)
        return new Promise((resolve) => {
            setTimeout(() => {
                const file = MOCK_FILES.find(f => f.id === fileId)
                if (file) file.name = newName
                resolve({ success: true, name: newName })
            }, 500)
        })
    }

    const response = await fetch(`${API_BASE}/${drive}:rename`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: fileId,
            name: newName,
        }),
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(error.message || `Rename failed: ${response.status}`)
    }

    return response.json()
}

/**
 * Delete a file
 */
export async function deleteFile(
    drive: number,
    fileId: string
): Promise<any> {
    // MOCK DATA FOR LOCAL DEV
    if (import.meta.env.DEV) {
        console.log('Deleting file in DEV mode', fileId)
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = MOCK_FILES.findIndex(f => f.id === fileId)
                if (index !== -1) MOCK_FILES.splice(index, 1)
                resolve({ success: true })
            }, 500)
        })
    }

    const response = await fetch(`${API_BASE}/${drive}:delete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: fileId,
        }),
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(error.message || `Delete failed: ${response.status}`)
    }

    return response.json()
}

/**
 * Get download URL for a file (raw/direct download)
 */
export function getDownloadUrl(drive: number, path: string, filename: string): string {
    const encodedPath = path === '/' ? '' : path
    return `${API_BASE}/${drive}:${encodedPath}${encodeURIComponent(filename)}`
}

/**
 * Get preview/view URL for a file (opens in UI)
 */
export function getPreviewUrl(drive: number, path: string, filename: string): string {
    const encodedPath = path === '/' ? '' : path
    return `${API_BASE}/${drive}:${encodedPath}${encodeURIComponent(filename)}?a=view`
}

/**
 * Check if a MIME type represents a folder
 */
export function isFolder(mimeType: string): boolean {
    return mimeType === 'application/vnd.google-apps.folder' || mimeType.includes('folder')
}

/**
 * Check if current path points to a file (not a folder)
 */
export function isFilePath(pathname: string): boolean {
    // Files don't end with / and typically have an extension
    return !pathname.endsWith('/') && pathname.includes('.')
}
