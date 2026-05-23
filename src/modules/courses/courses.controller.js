import courseAggregatorService from './courseAggregator.service.js';
import Course from './courses.model.js';

export const searchCourses = async (req, res) => {
  try {
    const { query, skillLevel = 'Beginner' } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const courses = await courseAggregatorService.aggregateCourses(query, skillLevel);
    
    if (courses.length === 0) {
      return res.json({ 
        success: true, 
        data: [], 
        count: 0,
        message: 'No courses found. Make sure YouTube API key is configured.' 
      });
    }

    res.json({ success: true, data: courses, count: courses.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRecommendedCourses = async (req, res) => {
  try {
    const { careerGoal, interests, skillLevel, mainGoal } = req.body;

    if (!careerGoal) {
      return res.status(400).json({ error: 'Career goal is required' });
    }

    const userProfile = { careerGoal, interests, skillLevel, mainGoal };
    const allCourses = await courseAggregatorService.aggregateCourses(careerGoal, skillLevel);
    
    if (allCourses.length === 0) {
      return res.json({ 
        success: true, 
        data: [], 
        count: 0,
        message: 'No courses available. Check YouTube API configuration.' 
      });
    }

    const recommended = await courseAggregatorService.recommendCourses(userProfile, allCourses);

    res.json({ success: true, data: recommended, count: recommended.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCoursesBySkill = async (req, res) => {
  try {
    const { skill } = req.params;

    if (!skill) {
      return res.status(400).json({ error: 'Skill is required' });
    }

    const courses = await courseAggregatorService.aggregateCourses(skill);
    
    res.json({ success: true, data: courses, count: courses.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCoursesByCareer = async (req, res) => {
  try {
    const { career } = req.params;

    if (!career) {
      return res.status(400).json({ error: 'Career is required' });
    }

    const courses = await courseAggregatorService.aggregateCourses(career);
    
    res.json({ success: true, data: courses, count: courses.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const generateLearningPath = async (req, res) => {
  try {
    const { careerGoal, skillLevel, interests, mainGoal } = req.body;

    if (!careerGoal) {
      return res.status(400).json({ error: 'Career goal is required' });
    }

    const userProfile = { careerGoal, skillLevel, interests, mainGoal };
    const learningPath = await courseAggregatorService.generateLearningPath(userProfile);

    if (!learningPath) {
      return res.status(500).json({ error: 'Failed to generate learning path' });
    }

    res.json({ success: true, data: learningPath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const saveCourse = async (req, res) => {
  try {
    const { courseId, title, platform, url } = req.body;
    const userId = req.user.id;

    if (!courseId || !title || !platform) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const course = new Course({
      userId,
      courseId,
      title,
      platform,
      url,
      savedAt: new Date()
    });

    await course.save();
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSavedCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const courses = await Course.find({ userId }).sort({ savedAt: -1 });
    res.json({ success: true, data: courses, count: courses.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeSavedCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const result = await Course.findOneAndDelete({ courseId, userId });

    if (!result) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ success: true, message: 'Course removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const trackCourseProgress = async (req, res) => {
  try {
    const { courseId, progress, status } = req.body;
    const userId = req.user.id;

    if (!courseId || progress === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const course = await Course.findOneAndUpdate(
      { courseId, userId },
      { progress, status, lastAccessedAt: new Date() },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
