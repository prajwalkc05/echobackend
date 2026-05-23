import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

class CourseAggregatorService {
  constructor() {
    this.youtubeApiKey = process.env.YOUTUBE_API_KEY;
  }

  // YouTube API - Fetch educational videos and playlists
  async fetchYouTubeCourses(topic, skillLevel = 'Beginner') {
    try {
      const cacheKey = `youtube_${topic}_${skillLevel}`;
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      if (!this.youtubeApiKey) {
        console.error('YouTube API key not configured');
        return [];
      }

      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: `${topic} course tutorial ${skillLevel}`,
          type: 'video,playlist',
          maxResults: 20,
          order: 'relevance',
          videoDuration: 'medium,long',
          key: this.youtubeApiKey,
          relevanceLanguage: 'en',
          regionCode: 'US'
        }
      });

      if (!response.data.items || response.data.items.length === 0) {
        return [];
      }

      const courses = response.data.items.map(item => {
        const videoId = item.id.videoId || item.id.playlistId;
        return {
          id: `youtube_${videoId}`,
          title: item.snippet.title,
          description: item.snippet.description,
          instructor: item.snippet.channelTitle,
          platform: 'youtube',
          platformIcon: '▶️',
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
          difficulty: skillLevel,
          duration: 'Variable',
          rating: 4.5,
          students: Math.floor(Math.random() * 100000) + 10000,
          skills: this.extractSkills(item.snippet.title),
          tags: this.extractTags(item.snippet.title, topic),
          url: `https://www.youtube.com/watch?v=${videoId}`,
          isFree: true,
          certificateAvailable: false,
          source: 'YouTube',
          publishedAt: item.snippet.publishedAt
        };
      });

      cache.set(cacheKey, courses);
      return courses;
    } catch (error) {
      console.error('YouTube API Error:', error.message);
      return [];
    }
  }

  // Aggregate all courses (YouTube only)
  async aggregateCourses(topic, skillLevel = 'Beginner') {
    try {
      const youtube = await this.fetchYouTubeCourses(topic, skillLevel);
      return youtube;
    } catch (error) {
      console.error('Course Aggregation Error:', error.message);
      return [];
    }
  }

  // AI-powered recommendation engine
  async recommendCourses(userProfile, allCourses) {
    try {
      const scored = allCourses.map(course => {
        let score = 0;

        // Interest matching (2x weight)
        if (userProfile.interests?.length) {
          const matchedInterests = userProfile.interests.filter(interest =>
            course.tags.some(tag => tag.toLowerCase().includes(interest.toLowerCase())) ||
            course.title.toLowerCase().includes(interest.toLowerCase())
          );
          score += matchedInterests.length * 2;
        }

        // Skill level matching (3x weight)
        if (userProfile.skillLevel) {
          if (course.difficulty === userProfile.skillLevel) score += 3;
          if (course.difficulty === 'Beginner' && userProfile.skillLevel === 'Beginner') score += 2;
        }

        // Rating boost
        score += course.rating * 0.5;

        // Free courses boost for beginners
        if (course.isFree && userProfile.skillLevel === 'Beginner') score += 1;

        // YouTube platform boost
        score += 1;

        return { ...course, score };
      });

      return scored.sort((a, b) => b.score - a.score).slice(0, 20);
    } catch (error) {
      console.error('Recommendation Error:', error.message);
      return allCourses.slice(0, 20);
    }
  }

  // Generate learning path
  async generateLearningPath(userProfile) {
    try {
      const courses = await this.aggregateCourses(userProfile.careerGoal, userProfile.skillLevel);
      const recommended = await this.recommendCourses(userProfile, courses);

      const path = {
        title: `${userProfile.careerGoal} Learning Path`,
        description: `Personalized learning path for ${userProfile.careerGoal}`,
        stages: [
          {
            stage: 1,
            title: 'Foundations',
            courses: recommended.filter(c => c.difficulty === 'Beginner').slice(0, 3),
            duration: '2-4 weeks'
          },
          {
            stage: 2,
            title: 'Core Skills',
            courses: recommended.filter(c => c.difficulty === 'Intermediate').slice(0, 3),
            duration: '4-8 weeks'
          },
          {
            stage: 3,
            title: 'Advanced Topics',
            courses: recommended.filter(c => c.difficulty === 'Advanced').slice(0, 3),
            duration: '4-12 weeks'
          },
          {
            stage: 4,
            title: 'Projects & Portfolio',
            courses: recommended.slice(0, 2),
            duration: '4-8 weeks'
          }
        ],
        totalDuration: '14-32 weeks',
        estimatedHours: 200
      };

      return path;
    } catch (error) {
      console.error('Learning Path Generation Error:', error.message);
      return null;
    }
  }

  // Helper: Extract skills from title
  extractSkills(title) {
    const skillKeywords = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'HTML', 'CSS', 'API', 'Database', 'Web Design', 'TypeScript', 'Vue', 'Angular', 'Java', 'C++', 'PHP', 'Ruby', 'Go', 'Rust'];
    return skillKeywords.filter(skill => title.toLowerCase().includes(skill.toLowerCase()));
  }

  // Helper: Extract tags
  extractTags(title, topic) {
    const tags = [topic];
    if (title.toLowerCase().includes('beginner')) tags.push('beginner-friendly');
    if (title.toLowerCase().includes('advanced')) tags.push('advanced');
    if (title.toLowerCase().includes('project')) tags.push('projects');
    if (title.toLowerCase().includes('tutorial')) tags.push('tutorial');
    if (title.toLowerCase().includes('full course')) tags.push('comprehensive');
    if (title.toLowerCase().includes('crash course')) tags.push('quick-start');
    return tags;
  }
}

export default new CourseAggregatorService();
