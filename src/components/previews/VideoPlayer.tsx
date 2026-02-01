import { useEffect, useRef, FC } from 'react'
import VideoPlayerLib from 'dplayer-enhanced'

interface VideoPlayerProps {
    videoUrl: string
    videoName: string
    poster?: string
}

const VideoPlayer: FC<VideoPlayerProps> = ({ videoUrl, videoName, poster }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const playerRef = useRef<any>(null)

    useEffect(() => {
        if (!containerRef.current) return

        // Create VideoPlayer instance
        playerRef.current = new VideoPlayerLib({
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

        // Cleanup on unmount
        return () => {
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
