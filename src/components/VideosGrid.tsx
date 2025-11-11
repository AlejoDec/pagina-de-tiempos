import React, { useEffect, useState } from 'react'

type VideoItem = {
  id: string
  title: string
  thumbnail: string
  videoId: string
}

type YouTubeThumbnail = {
  url?: string
}

type YouTubeSearchItem = {
  id?: {
    videoId?: string
  }
  snippet?: {
    title?: string
    thumbnails?: {
      medium?: YouTubeThumbnail
      default?: YouTubeThumbnail
    }
  }
}

type YouTubeSearchResponse = {
  items?: YouTubeSearchItem[]
}

const VideosGrid: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)

      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY
      const channelId = import.meta.env.VITE_YOUTUBE_CHANNEL_ID
      if (!apiKey || !channelId) {
        setError('Falta VITE_YOUTUBE_API_KEY o VITE_YOUTUBE_CHANNEL_ID en .env')
        setLoading(false)
        return
      }

      try {
        const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=6&type=video`
        const res = await fetch(url)
        if (!res.ok) throw new Error(`YouTube API error ${res.status}`)
        const data: YouTubeSearchResponse = await res.json()
        const items: VideoItem[] = (data.items ?? [])
          .map((item) => ({
            id: item.id?.videoId ?? '',
            videoId: item.id?.videoId ?? '',
            title: item.snippet?.title ?? '',
            thumbnail:
              item.snippet?.thumbnails?.medium?.url ??
              item.snippet?.thumbnails?.default?.url ??
              '',
          }))
          .filter((video) => video.id !== '')
        setVideos(items)
      } catch (e: unknown) {
        setError(String(e))
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) return <p>Cargando videos...</p>
  if (error) return <div style={{ color: 'red' }}>Error cargando videos: {error}</div>

  return (
    <div style={{ padding: 12 }}>
      <h3>Videos de CarCultureColombia</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 12,
        }}
      >
        {videos.map((v) => (
          <div key={v.id} style={{ border: '1px solid #eee', padding: 8 }}>
            <div style={{ position: 'relative', paddingTop: '56.25%' }}>
              <iframe
                src={`https://www.youtube.com/embed/${v.videoId}`}
                title={v.title}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div style={{ marginTop: 8 }}>
              <strong style={{ fontSize: 14 }}>{v.title}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VideosGrid
