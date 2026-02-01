import { useEffect, useRef, FC } from 'react'

interface VideoPlayerProps {
    videoUrl: string
    videoName: string
    poster?: string
}

declare global {
    interface Window {
        DPlayer: any
        UI: {
            player_js?: string
            player_css?: string
            [key: string]: any
        }
    }
}

const VideoPlayer: FC<VideoPlayerProps> = ({ videoUrl, videoName, poster }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const playerRef = useRef<any>(null)

    // Helper to load script and css
    const loadPlayerResources = async () => {
        const playerJs = window.UI?.player_js || "https://cdn.jsdelivr.net/npm/dplayer-enhanced@1.2.0/dist/DPlayer.min.js"
        const playerCss = window.UI?.player_css || "https://cdn.jsdelivr.net/npm/dplayer-enhanced@1.2.0/dist/DPlayer.min.css"

        // Load CSS
        if (!document.querySelector(`link[href="${playerCss}"]`)) {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = playerCss
            document.head.appendChild(link)
        }

        // Load JS
        if (!window.DPlayer) {
            return new Promise<void>((resolve, reject) => {
                const script = document.createElement('script')
                script.src = playerJs
                script.onload = () => resolve()
                script.onerror = () => reject(new Error('Failed to load DPlayer'))
                document.body.appendChild(script)
            })
        }
    }

    useEffect(() => {
        let mounted = true

        const initPlayer = async () => {
            if (!containerRef.current) return

            try {
                await loadPlayerResources()

                if (!mounted) return

                // Create VideoPlayer instance
                playerRef.current = new window.DPlayer({
                    container: containerRef.current,
                    video: {
                        url: videoUrl,
                        pic: poster || '',
                        type: 'auto',
                    },
                    autoplay: true,
                    theme: '#6366f1', // Indigo theme color
                    loop: false,
                    lang: 'en',
                    screenshot: true,
                    hotkey: true,
                    preload: 'auto',
                    volume: 0.7,
                    playbackSpeed: [0.5, 0.75, 1, 1.25, 1.5, 2],
                    contextmenu: [
                        {
                            text: videoName,
                            link: videoUrl,
                        },
                    ],
                })
            } catch (err) {
                console.error('Failed to initialize player:', err)
            }
        }

        initPlayer()

        // Cleanup on unmount
        return () => {
            mounted = false
            if (playerRef.current) {
                playerRef.current.destroy()
                playerRef.current = null
            }
        }
    }, [videoUrl, videoName, poster])

    return (
        <div className="mx-auto aspect-video w-full max-h-[80vh] overflow-hidden rounded-lg bg-black">
            <div ref={containerRef} className="h-full w-full" />
        </div>
    )
}

export default VideoPlayer
