import { useState, useEffect } from 'react'
import { LightAsync as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrowNightEighties } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getLanguageByFileName } from '../../utils/getPreviewType'

interface CodePreviewProps {
    fileUrl: string
    fileName: string
}

const CodePreview = ({ fileUrl, fileName }: CodePreviewProps) => {
    const [content, setContent] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await fetch(fileUrl)
                if (!res.ok) throw new Error(`Failed to fetch file: ${res.status}`)
                const text = await res.text()
                setContent(text)
            } catch (err: any) {
                console.error('Failed to load code file:', err)
                setError(err.message || 'Failed to load file content')
            } finally {
                setLoading(false)
            }
        }
        fetchContent()
    }, [fileUrl])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <FontAwesomeIcon icon="spinner" className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-3 text-sm text-gray-400">Loading file content...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-20 text-red-400">
                <span className="text-sm">{error}</span>
            </div>
        )
    }

    const language = getLanguageByFileName(fileName)

    return (
        <div className="overflow-auto rounded-lg text-sm">
            <SyntaxHighlighter
                language={language}
                style={tomorrowNightEighties}
                showLineNumbers
                lineNumberStyle={{ color: '#636363', minWidth: '3em', paddingRight: '1em' }}
                customStyle={{
                    margin: 0,
                    padding: '1rem',
                    background: '#1e1e1e',
                    borderRadius: '0.5rem',
                    fontSize: '0.85rem',
                    lineHeight: '1.6',
                }}
                wrapLongLines
            >
                {content || ''}
            </SyntaxHighlighter>
        </div>
    )
}

export default CodePreview
