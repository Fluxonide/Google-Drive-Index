import { useRef, useState, useEffect, FC } from 'react'
import ReactAudioPlayer from 'react-audio-player'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { formatDate } from '../../utils/fileIcons'

interface AudioPlayerProps {
    audioUrl: string
    fileName: string
    modifiedTime?: string
}

enum PlayerState {
    Loading,
    Ready,
    Playing,
    Paused,
}

const AudioPlayer: FC<AudioPlayerProps> = ({ audioUrl, fileName, modifiedTime }) => {
    const rapRef = useRef<ReactAudioPlayer>(null)
    const [playerStatus, setPlayerStatus] = useState(PlayerState.Loading)
    const [playerVolume, setPlayerVolume] = useState(1)

    useEffect(() => {
        // Manually get the HTML audio element and set event handlers
        const rap = rapRef.current?.audioEl.current
        if (rap) {
            rap.oncanplay = () => setPlayerStatus(PlayerState.Ready)
            rap.onended = () => setPlayerStatus(PlayerState.Paused)
            rap.onpause = () => setPlayerStatus(PlayerState.Paused)
            rap.onplay = () => setPlayerStatus(PlayerState.Playing)
            rap.onplaying = () => setPlayerStatus(PlayerState.Playing)
            rap.onseeking = () => setPlayerStatus(PlayerState.Loading)
            rap.onwaiting = () => setPlayerStatus(PlayerState.Loading)
            rap.onerror = () => setPlayerStatus(PlayerState.Paused)
            rap.onvolumechange = () => setPlayerVolume(rap.volume)
        }
    }, [])

    return (
        <div className="flex flex-col space-y-4 p-6 md:flex-row md:space-x-6 md:space-y-0">
            {/* Album art / icon */}
            <div className="relative flex aspect-square w-full items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg transition-all duration-300 md:w-48">
                {/* Loading overlay */}
                <div
                    className={`absolute z-20 flex h-full w-full items-center justify-center rounded-lg transition-all duration-300 ${playerStatus === PlayerState.Loading
                            ? 'bg-black/50'
                            : 'bg-transparent opacity-0'
                        }`}
                >
                    <FontAwesomeIcon
                        icon="spinner"
                        className="h-8 w-8 animate-spin text-white"
                    />
                </div>

                {/* Music icon with animation */}
                <FontAwesomeIcon
                    icon="music"
                    className={`h-16 w-16 text-white/90 ${playerStatus === PlayerState.Playing ? 'animate-pulse' : ''
                        }`}
                />

                {/* Animated ring when playing */}
                {playerStatus === PlayerState.Playing && (
                    <div className="absolute inset-0 animate-ping rounded-lg border-2 border-white/30" />
                )}
            </div>

            {/* File info and player */}
            <div className="flex w-full flex-col justify-between">
                <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {fileName}
                    </h3>
                    {modifiedTime && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Last modified: {formatDate(modifiedTime)}
                        </p>
                    )}
                </div>

                <ReactAudioPlayer
                    className="h-12 w-full"
                    src={audioUrl}
                    ref={rapRef}
                    controls
                    preload="auto"
                    volume={playerVolume}
                    autoPlay
                />
            </div>
        </div>
    )
}

export default AudioPlayer
