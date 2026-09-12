// Course recommendations are static, curated resources.
// They are matched by career and skill gap, not fetched from a live API.

const COURSES = [
  // Python
  { title: 'Python for Everybody', skill: 'Python', difficulty: 'Beginner', duration: '30 hours', url: 'https://www.coursera.org/specializations/python', platform: 'Coursera' },
  { title: 'Automate the Boring Stuff with Python', skill: 'Python', difficulty: 'Beginner', duration: '20 hours', url: 'https://automatetheboringstuff.com/', platform: 'Free Book/Online' },
  // JavaScript
  { title: 'JavaScript Algorithms and Data Structures', skill: 'JavaScript', difficulty: 'Beginner', duration: '40 hours', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', platform: 'freeCodeCamp' },
  { title: 'The Complete JavaScript Course', skill: 'JavaScript', difficulty: 'Intermediate', duration: '68 hours', url: 'https://www.udemy.com/course/the-complete-javascript-course/', platform: 'Udemy' },
  // React
  { title: 'React - The Complete Guide', skill: 'React', difficulty: 'Intermediate', duration: '48 hours', url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/', platform: 'Udemy' },
  { title: 'Full Stack Open - React', skill: 'React', difficulty: 'Intermediate', duration: '60 hours', url: 'https://fullstackopen.com/en/', platform: 'University of Helsinki (Free)' },
  // TypeScript
  { title: 'TypeScript Handbook', skill: 'TypeScript', difficulty: 'Beginner', duration: '10 hours', url: 'https://www.typescriptlang.org/docs/handbook/intro.html', platform: 'Official Docs (Free)' },
  { title: 'Understanding TypeScript', skill: 'TypeScript', difficulty: 'Intermediate', duration: '22 hours', url: 'https://www.udemy.com/course/understanding-typescript/', platform: 'Udemy' },
  // Node.js
  { title: 'The Complete Node.js Developer Course', skill: 'Node.js', difficulty: 'Intermediate', duration: '35 hours', url: 'https://www.udemy.com/course/the-complete-nodejs-developer-course-2/', platform: 'Udemy' },
  { title: 'Node.js Official Guides', skill: 'Node.js', difficulty: 'Beginner', duration: '8 hours', url: 'https://nodejs.org/en/docs/guides/', platform: 'Official Docs (Free)' },
  // SQL
  { title: 'SQL for Data Science', skill: 'SQL', difficulty: 'Beginner', duration: '15 hours', url: 'https://www.coursera.org/learn/sql-for-data-science', platform: 'Coursera' },
  { title: 'SQLZoo Interactive SQL Tutorial', skill: 'SQL', difficulty: 'Beginner', duration: '12 hours', url: 'https://sqlzoo.net/', platform: 'Free Online' },
  // Machine Learning
  { title: 'Machine Learning Specialization', skill: 'Machine Learning', difficulty: 'Intermediate', duration: '60 hours', url: 'https://www.coursera.org/specializations/machine-learning-introduction', platform: 'Coursera (Andrew Ng)' },
  { title: 'fast.ai Practical Deep Learning', skill: 'Deep Learning', difficulty: 'Intermediate', duration: '40 hours', url: 'https://course.fast.ai/', platform: 'fast.ai (Free)' },
  // Data Structures
  { title: 'Data Structures and Algorithms Specialization', skill: 'Data Structures', difficulty: 'Intermediate', duration: '50 hours', url: 'https://www.coursera.org/specializations/data-structures-algorithms', platform: 'Coursera' },
  { title: 'NeetCode DSA for Beginners', skill: 'Algorithms', difficulty: 'Beginner', duration: '20 hours', url: 'https://neetcode.io/', platform: 'Free Online' },
  // Docker
  { title: 'Docker Mastery', skill: 'Docker', difficulty: 'Beginner', duration: '19 hours', url: 'https://www.udemy.com/course/docker-mastery/', platform: 'Udemy' },
  { title: 'Docker Official Get Started', skill: 'Docker', difficulty: 'Beginner', duration: '4 hours', url: 'https://docs.docker.com/get-started/', platform: 'Official Docs (Free)' },
  // System Design
  { title: 'System Design Primer', skill: 'System Design', difficulty: 'Intermediate', duration: '20 hours', url: 'https://github.com/donnemartin/system-design-primer', platform: 'GitHub (Free)' },
  // Cybersecurity
  { title: 'Google Cybersecurity Certificate', skill: 'Cybersecurity', difficulty: 'Beginner', duration: '30 hours', url: 'https://www.coursera.org/professional-certificates/google-cybersecurity', platform: 'Coursera' },
  // Statistics
  { title: 'Statistics with Python', skill: 'Statistics', difficulty: 'Beginner', duration: '20 hours', url: 'https://www.coursera.org/specializations/statistics-with-python', platform: 'Coursera' },
  // MongoDB
  { title: 'MongoDB University - M001', skill: 'MongoDB', difficulty: 'Beginner', duration: '8 hours', url: 'https://learn.mongodb.com/learning-paths/introduction-to-mongodb', platform: 'MongoDB University (Free)' },
  // Git
  { title: 'Git & GitHub Crash Course', skill: 'Git', difficulty: 'Beginner', duration: '5 hours', url: 'https://www.youtube.com/watch?v=RGOj5yH7evk', platform: 'YouTube (Free)' },
  // CSS
  { title: 'CSS Flexbox and Grid', skill: 'CSS', difficulty: 'Beginner', duration: '6 hours', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/', platform: 'CSS-Tricks (Free)' },
];

// GET /api/courses/recommend
const recommendCourses = async (req, res) => {
  const { skills, career } = req.query;

  try {
    let filtered = COURSES;

    if (skills) {
      const skillList = skills
        .split(',')
        .map((s) => s.trim().toLowerCase());
      filtered = COURSES.filter((c) =>
        skillList.some((s) => c.skill.toLowerCase().includes(s))
      );
    }

    // If nothing matches, return all courses
    if (filtered.length === 0) filtered = COURSES;

    res.json({ courses: filtered });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch course recommendations.' });
  }
};

module.exports = { recommendCourses };
