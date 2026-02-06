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
    const [isValidatingPoster, setIsValidatingPoster] = useState<boolean>(!!customPoster)
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

    // Check custom poster
    useEffect(() => {
        if (customPoster) {
            setIsValidatingPoster(true)
            console.log('VideoPlayer: Checking custom poster...', customPoster)
            fetch(customPoster, { method: 'HEAD' })
                .then((res) => {
                    if (res.ok && (res.status === 200 || res.status === 304)) {
                        console.log('VideoPlayer: Custom poster found (HEAD)', customPoster)
                        setEffectivePoster(customPoster)
                    } else {
                        console.log('VideoPlayer: Custom poster HEAD failed/404, using default')
                        // No need to reset if it's already poster (default)
                        // But if prop changed, effectivePoster would be stale?
                        // Actually validation usually happens on mount or prop change.
                        // If we are VALIDATING, effectivePoster is currently 'poster'.
                        // So if we fail, we just keep it as 'poster'.
                    }
                })
                .catch((e) => {
                    console.log('VideoPlayer: Custom poster check error', e)
                })
                .finally(() => {
                    setIsValidatingPoster(false)
                })
        } else {
            setEffectivePoster(poster || '')
            setIsValidatingPoster(false)
        }
    }, [customPoster, poster])

    // Initialize Player
    useEffect(() => {
        let mounted = true

        const initPlayer = async () => {
            if (!containerRef.current) return

            // Wait for resources ONLY. Do NOT wait for validation.
            if (!resourcesLoaded) return

            try {
                if (!mounted) return

                // If player already exists, destroy it
                if (playerRef.current) {
                    playerRef.current.destroy()
                }

                // Create VideoPlayer instance
                console.log('VideoPlayer: Init with poster', effectivePoster)
                playerRef.current = new window.DPlayer({
                    container: containerRef.current,
                    video: {
                        url: videoUrl,
                        pic: effectivePoster,
                        type: 'auto',
                    },
                    autoplay: false,
                    theme: '#a1a1aa', // Zinc-400 e
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
    }, [videoUrl, videoName, effectivePoster, resourcesLoaded]) // Removed isValidatingPoster dependency

    return (
        <div className="mx-auto aspect-video w-full max-h-[80vh] overflow-hidden rounded-lg bg-black relative group shadow-lg ring-1 ring-white/10">
            {(!resourcesLoaded) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
                    <div className="relative h-12 w-12">
                        <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                    </div>
                </div>
            )}
            <div ref={containerRef} className="h-full w-full" />
        </div>
    )
}

export default VideoPlayer
