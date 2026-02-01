import { useEffect, useRef, useState, FC } from 'react'

interface VideoPlayerProps {
    videoUrl: string
    videoName: string
    poster?: string
    customPoster?: string
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

const VideoPlayer: FC<VideoPlayerProps> = ({ videoUrl, videoName, poster, customPoster }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const playerRef = useRef<any>(null)

    // Initial poster is the default one provided
    const [effectivePoster, setEffectivePoster] = useState<string>(poster || '')
    const [resourcesLoaded, setResourcesLoaded] = useState<boolean>(false)

    // Helper to load script and css
    const loadPlayerResources = async () => {
        // console.log('VideoPlayer: Loading resources...')
        const playerJs = window.UI?.player_js
        const playerCss = window.UI?.player_css
        // console.log('VideoPlayer: Config URLs:', { playerJs, playerCss })

        if (!playerJs || !playerCss) {
            console.error('DPlayer configuration missing in window.UI')
            return
        }

        // Load CSS
        if (!document.querySelector(`link[href="${playerCss}"]`)) {
            // console.log('VideoPlayer: Injecting CSS')
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = playerCss
            document.head.appendChild(link)
        }

        // Load JS
        if (!window.DPlayer) {
            // console.log('VideoPlayer: Injecting JS')
            return new Promise<void>((resolve, reject) => {
                const script = document.createElement('script')
                script.src = playerJs
                script.onload = () => {
                    // console.log('VideoPlayer: JS loaded successfully')
                    resolve()
                }
                script.onerror = () => {
                    console.error('VideoPlayer: Failed to load JS')
                    reject(new Error('Failed to load DPlayer'))
                }
                document.body.appendChild(script)
            })
        } else {
            // console.log('VideoPlayer: window.DPlayer already exists')
        }
    }

    // Load resources on mount
    useEffect(() => {
        loadPlayerResources().then(() => setResourcesLoaded(true)).catch(console.error)
    }, [])

    // Check custom poster in background and update running player
    useEffect(() => {
        if (customPoster) {
            console.log('VideoPlayer: Checking custom poster...', customPoster)
            fetch(customPoster, { method: 'HEAD' })
                .then((res) => {
                    if (res.ok && (res.status === 200 || res.status === 304)) {
                        console.log('VideoPlayer: Custom poster found (HEAD)', customPoster)
                        setEffectivePoster(customPoster)

                        // If player is already running, update the poster directly
                        // to avoid re-initializing (flicker/reload)
                        if (playerRef.current && playerRef.current.template && playerRef.current.template.poster) {
                            playerRef.current.template.poster.style.backgroundImage = `url("${customPoster}")`
                        }
                    } else {
                        // 404
                    }
                })
                .catch((e) => {
                    // Error
                })
        }
    }, [customPoster])

    // Initialize Player
    useEffect(() => {
        let mounted = true

        const initPlayer = async () => {
            if (!containerRef.current) return

            // Wait for resources only
            if (!resourcesLoaded) return

            try {
                if (!mounted) return

                // If player already exists, destroy it ONLY if videoUrl changed
                // We rely on the poster update effect to handle poster changes
                if (playerRef.current) {
                    playerRef.current.destroy()
                }

                // Create VideoPlayer instance
                console.log('VideoPlayer: Init with poster', effectivePoster || poster)
                playerRef.current = new window.DPlayer({
                    container: containerRef.current,
                    video: {
                        url: videoUrl,
                        pic: effectivePoster || poster || '',
                        type: 'auto',
                    },
                    autoplay: false,
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
        // Exclude effectivePoster from deps to prevent re-init on poster swap
    }, [videoUrl, videoName, resourcesLoaded]) // Removed effectivePoster

    return (
        <div className="mx-auto aspect-video w-full max-h-[80vh] overflow-hidden rounded-lg bg-black relative">
            {!resourcesLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            )}
            <div ref={containerRef} className="h-full w-full" />
        </div>
    )
}

export default VideoPlayer
