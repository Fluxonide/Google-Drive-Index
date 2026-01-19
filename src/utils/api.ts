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
export async function fetchFolderContents(
    drive: number,
    path: string,
    pageToken?: string,
    pageIndex: number = 0,
    password?: string
): Promise<FileListResponse> {
    // Ensure path ends with /
    const normalizedPath = path.endsWith('/') ? path : path + '/'

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
