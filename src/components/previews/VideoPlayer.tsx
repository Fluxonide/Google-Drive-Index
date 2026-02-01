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

    // Check custom poster
    useEffect(() => {
        // If we have a custom poster URL, try to load it first
        if (customPoster) {
            setIsValidatingPoster(true)
            const img = new Image()
            img.src = customPoster
            img.onload = () => {
                console.log('VideoPlayer: Custom poster loaded', customPoster)
                setEffectivePoster(customPoster)
                setIsValidatingPoster(false)
            }
            img.onerror = () => {
                console.log('VideoPlayer: Custom poster failed, using default')
                setEffectivePoster(poster || '')
                setIsValidatingPoster(false)
            }
        } else {
            setEffectivePoster(poster || '')
            setIsValidatingPoster(false)
        }
    }, [customPoster, poster])

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

        // Only init if we have determined the poster (or if no custom poster provided)
        // This avoids a flash of the wrong poster
        if (!isValidatingPoster) {
            initPlayer()
        }

        // Cleanup on unmount
        // Note: We don't destroy immediately in useEffect cleanup to avoid flashing during re-renders?
        // Actually DPlayer destroy removes the check, so we should be careful.
        // But here we want to destroy if the component unmounts.
        return () => {
            mounted = false
            if (playerRef.current) {
                playerRef.current.destroy()
                playerRef.current = null
            }
        }
    }, [videoUrl, videoName, effectivePoster, isValidatingPoster])

    return (
        <div className="mx-auto aspect-video w-full max-h-[80vh] overflow-hidden rounded-lg bg-black">
            <div ref={containerRef} className="h-full w-full" />
        </div>
    )
}

export default VideoPlayer
