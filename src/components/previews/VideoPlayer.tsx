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
        console.log('VideoPlayer: Loading resources...')
        const playerJs = window.UI?.player_js
        const playerCss = window.UI?.player_css
        console.log('VideoPlayer: Config URLs:', { playerJs, playerCss })

        if (!playerJs || !playerCss) {
            console.error('DPlayer configuration missing in window.UI')
            return
        }

        // Load CSS
        if (!document.querySelector(`link[href="${playerCss}"]`)) {
            console.log('VideoPlayer: Injecting CSS')
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = playerCss
            document.head.appendChild(link)
        }

        // Load JS
        if (!window.DPlayer) {
            console.log('VideoPlayer: Injecting JS')
            return new Promise<void>((resolve, reject) => {
                const script = document.createElement('script')
                script.src = playerJs
                script.onload = () => {
                    console.log('VideoPlayer: JS loaded successfully')
                    resolve()
                }
                script.onerror = () => {
                    console.error('VideoPlayer: Failed to load JS')
                    reject(new Error('Failed to load DPlayer'))
                }
                document.body.appendChild(script)
            })
        } else {
             console.log('VideoPlayer: window.DPlayer already exists')
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
