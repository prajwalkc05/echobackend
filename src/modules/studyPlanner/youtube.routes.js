import express from 'express';
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

// Get YouTube videos for a topic
router.get('/videos', authMiddleware, async (req, res) => {
  try {
    const { topic } = req.query;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      });
    }

    const query = `${topic} easy explanation tutorial`;
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

    if (!YOUTUBE_API_KEY) {
      // Return mock data if no API key
      return res.json({
        success: true,
        videos: getMockVideos(topic)
      });
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        query
      )}&type=video&maxResults=5&key=${YOUTUBE_API_KEY}`
    );

    const data = await response.json();

    if (!data.items) {
      return res.json({
        success: true,
        videos: getMockVideos(topic)
      });
    }

    const videos = data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail: item.snippet.thumbnails.medium.url,
      channel: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      description: item.snippet.description
    }));

    res.json({
      success: true,
      videos
    });

  } catch (error) {
    console.error('YouTube API error:', error);
    res.json({
      success: true,
      videos: getMockVideos(req.query.topic)
    });
  }
});

// Mock videos for fallback
function getMockVideos(topic) {
  return [
    {
      id: 'mock1',
      title: `${topic} - Complete Tutorial`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' tutorial')}`,
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      channel: 'Educational Channel',
      publishedAt: new Date().toISOString(),
      description: `Learn ${topic} with this comprehensive tutorial`
    },
    {
      id: 'mock2',
      title: `${topic} Explained Simply`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' explained')}`,
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      channel: 'Learning Hub',
      publishedAt: new Date().toISOString(),
      description: `Simple explanation of ${topic} concepts`
    },
    {
      id: 'mock3',
      title: `${topic} Practice Problems`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' practice')}`,
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      channel: 'Study Helper',
      publishedAt: new Date().toISOString(),
      description: `Practice problems and solutions for ${topic}`
    }
  ];
}

export default router;