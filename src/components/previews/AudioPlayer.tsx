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
        <div className="flex flex-col space-y-4 md:flex-row md:space-x-4">
            {/* Album art / icon */}
            <div className="relative flex aspect-square w-full items-center justify-center rounded bg-gray-100 transition-all duration-75 dark:bg-gray-700 md:w-48">
                {/* Loading overlay */}
                <div
                    className={`absolute z-20 flex h-full w-full items-center justify-center rounded transition-all duration-300 ${playerStatus === PlayerState.Loading
                        ? 'bg-white/80 dark:bg-gray-800/80'
                        : 'bg-transparent opacity-0'
                        }`}
                >
                    <FontAwesomeIcon
                        icon="spinner"
                        className="h-5 w-5 animate-spin text-gray-500"
                    />
                </div>

                {/* Music icon */}
                <FontAwesomeIcon
                    icon="music"
                    className={`h-16 w-16 text-gray-400 ${playerStatus === PlayerState.Playing ? 'animate-pulse' : ''}`}
                />
            </div>

            {/* File info and player */}
            <div className="flex w-full flex-col justify-between">
                <div className="mb-2">
                    <h3 className="mb-2 font-medium text-gray-900 dark:text-white">
                        {fileName}
                    </h3>
                    {modifiedTime && (
                        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                            Last modified: {formatDate(modifiedTime)}
                        </p>
                    )}
                </div>

                <ReactAudioPlayer
                    className="h-11 w-full"
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
