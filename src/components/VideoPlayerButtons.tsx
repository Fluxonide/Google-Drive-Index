import { DownloadButton } from './DownloadButtonGroup'

interface VideoPlayerButtonsProps {
    videoUrl: string
}

/**
 * External video player buttons for opening videos in desktop applications.
 * Supports VLC, PotPlayer, IINA (macOS), and nPlayer.
 */
const VideoPlayerButtons = ({ videoUrl }: VideoPlayerButtonsProps) => {
    const fullUrl = `${window.location.origin}${videoUrl}`
    const hostname = window.location.hostname

    // Protocol URLs for various video players
    const players = [
        {
            name: 'VLC',
            icon: '/players/vlc.png',
            getUrl: () => `vlc://${fullUrl}`,
            color: 'gray',
        },
        {
            name: 'PotPlayer',
            icon: '/players/potplayer.png',
            getUrl: () => `potplayer://${fullUrl}`,
            color: 'gray',
        },
        {
            name: 'IINA',
            icon: '/players/iina.png',
            getUrl: () => `iina://weblink?url=${encodeURIComponent(fullUrl)}`,
            color: 'gray',
        },
        {
            name: 'nPlayer',
            icon: '/players/nplayer.png',
            getUrl: () => `nplayer-http://${hostname}${videoUrl}`,
            color: 'gray',
        },
    ]

    return (
        <div className="flex flex-wrap justify-center gap-2 mt-2">
            {players.map((player) => (
                <DownloadButton
                    key={player.name}
                    onClickCallback={() => window.open(player.getUrl(), '_blank')}
                    btnText={player.name}
                    btnImage={player.icon}
                    btnColor={player.color}
                    btnTitle={`Open in ${player.name}`}
                />
            ))}
        </div>
    )
}

export default VideoPlayerButtons
