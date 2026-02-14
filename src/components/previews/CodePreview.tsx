import { useState, useEffect } from 'react'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrowNightEighties } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getLanguageByFileName } from '../../utils/getPreviewType'

// Register only the languages we actually need — no more 180+ chunk files
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript'
import typescript from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript'
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python'
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java'
import c from 'react-syntax-highlighter/dist/esm/languages/hljs/c'
import cpp from 'react-syntax-highlighter/dist/esm/languages/hljs/cpp'
import csharp from 'react-syntax-highlighter/dist/esm/languages/hljs/csharp'
import go from 'react-syntax-highlighter/dist/esm/languages/hljs/go'
import rust from 'react-syntax-highlighter/dist/esm/languages/hljs/rust'
import ruby from 'react-syntax-highlighter/dist/esm/languages/hljs/ruby'
import php from 'react-syntax-highlighter/dist/esm/languages/hljs/php'
import swift from 'react-syntax-highlighter/dist/esm/languages/hljs/swift'
import kotlin from 'react-syntax-highlighter/dist/esm/languages/hljs/kotlin'
import dart from 'react-syntax-highlighter/dist/esm/languages/hljs/dart'
import shell from 'react-syntax-highlighter/dist/esm/languages/hljs/shell'
import bash from 'react-syntax-highlighter/dist/esm/languages/hljs/bash'
import powershell from 'react-syntax-highlighter/dist/esm/languages/hljs/powershell'
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql'
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json'
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml'
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css'
import scss from 'react-syntax-highlighter/dist/esm/languages/hljs/scss'
import less from 'react-syntax-highlighter/dist/esm/languages/hljs/less'
import yaml from 'react-syntax-highlighter/dist/esm/languages/hljs/yaml'
import ini from 'react-syntax-highlighter/dist/esm/languages/hljs/ini'
import dockerfile from 'react-syntax-highlighter/dist/esm/languages/hljs/dockerfile'
import makefile from 'react-syntax-highlighter/dist/esm/languages/hljs/makefile'
import lua from 'react-syntax-highlighter/dist/esm/languages/hljs/lua'
import perl from 'react-syntax-highlighter/dist/esm/languages/hljs/perl'
import r from 'react-syntax-highlighter/dist/esm/languages/hljs/r'
import dos from 'react-syntax-highlighter/dist/esm/languages/hljs/dos'

SyntaxHighlighter.registerLanguage('javascript', javascript)
SyntaxHighlighter.registerLanguage('typescript', typescript)
SyntaxHighlighter.registerLanguage('python', python)
SyntaxHighlighter.registerLanguage('java', java)
SyntaxHighlighter.registerLanguage('c', c)
SyntaxHighlighter.registerLanguage('cpp', cpp)
SyntaxHighlighter.registerLanguage('csharp', csharp)
SyntaxHighlighter.registerLanguage('go', go)
SyntaxHighlighter.registerLanguage('rust', rust)
SyntaxHighlighter.registerLanguage('ruby', ruby)
SyntaxHighlighter.registerLanguage('php', php)
SyntaxHighlighter.registerLanguage('swift', swift)
SyntaxHighlighter.registerLanguage('kotlin', kotlin)
SyntaxHighlighter.registerLanguage('dart', dart)
SyntaxHighlighter.registerLanguage('shell', shell)
SyntaxHighlighter.registerLanguage('bash', bash)
SyntaxHighlighter.registerLanguage('powershell', powershell)
SyntaxHighlighter.registerLanguage('sql', sql)
SyntaxHighlighter.registerLanguage('json', json)
SyntaxHighlighter.registerLanguage('xml', xml)
SyntaxHighlighter.registerLanguage('html', xml)  // HTML uses XML highlighter
SyntaxHighlighter.registerLanguage('css', css)
SyntaxHighlighter.registerLanguage('scss', scss)
SyntaxHighlighter.registerLanguage('less', less)
SyntaxHighlighter.registerLanguage('yaml', yaml)
SyntaxHighlighter.registerLanguage('ini', ini)
SyntaxHighlighter.registerLanguage('dockerfile', dockerfile)
SyntaxHighlighter.registerLanguage('makefile', makefile)
SyntaxHighlighter.registerLanguage('lua', lua)
SyntaxHighlighter.registerLanguage('perl', perl)
SyntaxHighlighter.registerLanguage('r', r)
SyntaxHighlighter.registerLanguage('dos', dos)

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
