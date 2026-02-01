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

    const [effectivePoster, setEffectivePoster] = useState<string>('')
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
        // If we have a custom poster URL, try to load it first
        if (customPoster) {
            setIsValidatingPoster(true)

            // Use fetch to check existence and get blob
            // This is often faster and cleaner than new Image() for simple existence check
            fetch(customPoster)
                .then(async (res) => {
                    if (res.ok) {
                        // Found it! Use blob URL to avoid re-download
                        const blob = await res.blob()
                        const objUrl = URL.createObjectURL(blob)
                        console.log('VideoPlayer: Custom poster found')
                        setEffectivePoster(objUrl)
                    } else {
                        // 404 or other error
                        console.log('VideoPlayer: Custom poster 404/Error, using default')
                        setEffectivePoster(poster || '')
                    }
                })
                .catch((err) => {
                    console.log('VideoPlayer: Custom poster fetch error', err)
                    setEffectivePoster(poster || '')
                })
                .finally(() => {
                    setIsValidatingPoster(false)
                })
        } else {
            setEffectivePoster(poster || '')
            setIsValidatingPoster(false)
        }
    }, [customPoster, poster])

    useEffect(() => {
        let mounted = true

        const initPlayer = async () => {
            if (!containerRef.current) return

            // Wait until resources are loaded AND poster is validated
            if (!resourcesLoaded || isValidatingPoster) return

            try {
                if (!mounted) return

                // If player already exists, destroy it
                if (playerRef.current) {
                    playerRef.current.destroy()
                }

                // Create VideoPlayer instance
                playerRef.current = new window.DPlayer({
                    container: containerRef.current,
                    video: {
                        url: videoUrl,
                        pic: effectivePoster,
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
            // Revoke object URL if we created one (simple optimization)
            if (effectivePoster && effectivePoster.startsWith('blob:')) {
                URL.revokeObjectURL(effectivePoster)
            }
        }
    }, [videoUrl, videoName, effectivePoster, isValidatingPoster, resourcesLoaded])

    return (
        <div className="mx-auto aspect-video w-full max-h-[80vh] overflow-hidden rounded-lg bg-black relative">
            {(!resourcesLoaded || isValidatingPoster) && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            )}
            <div ref={containerRef} className="h-full w-full" />
        </div>
    )
}

export default VideoPlayer
