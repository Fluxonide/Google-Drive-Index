// Types for Google Drive API responses

export interface DriveFile {
    id: string
    name: string
    mimeType: string
    size?: string
    modifiedTime?: string
    createdTime?: string
    fileExtension?: string
    link?: string
    driveId?: string
}

export interface FolderListResponse {
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

export type LayoutType = 'list' | 'grid'

export interface SiteConfig {
    siteName: string
    apiBase: string
    theme: string
}
