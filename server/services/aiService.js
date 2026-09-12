/**
 * AI Service Layer
 * Supports OpenAI-compatible API (works with IBM watsonx via proxy too).
 * Falls back to a LOCAL TEXT PARSER when DEMO_MODE=true or API key is missing.
 *
 * IMPORTANT: In demo/no-key mode we still analyse the ACTUAL resume text
 * using regex-based extraction so we NEVER show Jane Smith / ABC University.
 * Hardcoded demo data is only used when no resume text is supplied at all
 * (e.g. the Career Recommendations flow where there is no resume to parse).
 */

const OpenAI = require('openai');

const isDemoMode =
  process.env.DEMO_MODE === 'true' || !process.env.OPENAI_API_KEY;

let openai = null;
if (!isDemoMode) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Helper: call AI with a system + user prompt
async function callAI(systemPrompt, userPrompt, jsonMode = true) {
  if (isDemoMode) return null;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.7,
    response_format: jsonMode ? { type: 'json_object' } : undefined,
  });

  const text = response.choices[0].message.content;
  return jsonMode ? JSON.parse(text) : text;
}

// ─────────────────────────────────────────────────────────────
// LOCAL TEXT PARSER  (used in demo/no-key mode)
// Extracts real data from the resume text using heuristics.
// Returns the same shape as the AI response.
// ─────────────────────────────────────────────────────────────

const SKILL_KEYWORDS = [
  // Languages
  'python','javascript','typescript','java','c++','c#','c','go','rust','ruby','php','swift','kotlin','scala',
  'html','css','html5','css3','sass','scss','less',
  // Frameworks / libs
  'react','angular','vue','next.js','nuxt','svelte','express','fastapi','django','flask','spring','laravel',
  'node.js','nodejs','rails','asp.net',
  // Databases
  'sql','mysql','postgresql','sqlite','mongodb','redis','cassandra','dynamodb','firebase','supabase',
  // Cloud / DevOps
  'aws','azure','gcp','docker','kubernetes','terraform','ansible','jenkins','github actions','ci/cd',
  'linux','bash','shell','nginx','apache',
  // AI / Data
  'machine learning','deep learning','tensorflow','pytorch','keras','scikit-learn','pandas','numpy',
  'matplotlib','seaborn','tableau','power bi','excel','r',
  // Other tools
  'git','github','gitlab','bitbucket','jira','figma','rest api','graphql','websockets','oauth','jwt',
  // Soft
  'problem solving','communication','teamwork','leadership','agile','scrum',
];

function extractSkills(text) {
  const lower = text.toLowerCase();
  const found = new Set();
  for (const kw of SKILL_KEYWORDS) {
    // word-boundary friendly: check if the keyword appears as a standalone word/phrase
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'i');
    if (re.test(lower)) found.add(toTitleCase(kw));
  }
  return [...found];
}

// Map of lowercase keyword → display name
const DISPLAY_NAME = {
  'html': 'HTML', 'css': 'CSS', 'html5': 'HTML5', 'css3': 'CSS3',
  'sql': 'SQL', 'aws': 'AWS', 'gcp': 'GCP', 'api': 'API',
  'jwt': 'JWT', 'oauth': 'OAuth', 'scss': 'SCSS', 'sass': 'Sass',
  'rest api': 'REST API', 'graphql': 'GraphQL', 'ci/cd': 'CI/CD',
  'asp.net': 'ASP.NET', 'node.js': 'Node.js', 'next.js': 'Next.js',
  'nuxt': 'Nuxt', 'mongodb': 'MongoDB', 'postgresql': 'PostgreSQL',
  'mysql': 'MySQL', 'sqlite': 'SQLite', 'redis': 'Redis',
  'dynamodb': 'DynamoDB', 'firebase': 'Firebase', 'supabase': 'Supabase',
  'tensorflow': 'TensorFlow', 'pytorch': 'PyTorch', 'scikit-learn': 'Scikit-learn',
  'github': 'GitHub', 'gitlab': 'GitLab', 'bitbucket': 'Bitbucket',
  'github actions': 'GitHub Actions', 'power bi': 'Power BI',
  'c++': 'C++', 'c#': 'C#', 'r': 'R',
  'javascript': 'JavaScript', 'typescript': 'TypeScript',
  'nodejs': 'Node.js', 'reactjs': 'React',
};

function toTitleCase(str) {
  const lower = str.toLowerCase();
  if (DISPLAY_NAME[lower]) return DISPLAY_NAME[lower];
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function extractEducation(text) {
  const results = [];
  const lines = text.split(/\n+/);
  const degreeRe = /\b(b\.?tech|b\.?e|b\.?sc|bsc|m\.?tech|m\.?sc|msc|mba|phd|bachelor|master|diploma|b\.?a|m\.?a|b\.?com|m\.?com)\b/i;
  const uniRe = /\b(university|college|institute|school|iit|nit|bits|vit|srm|manipal|amity|anna|osmania|du|mu|pu|lpu)\b/i;
  // Section boundary: stop including lines once we hit these section headers
  const stopRe = /^(skills?|experience|projects?|certifications?|achievements?)\s*[:\-]?\s*$/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (stopRe.test(line)) break; // reached next section
    if (degreeRe.test(line) || uniRe.test(line)) {
      // Use only the current line (not adjacent) to avoid bleeding into Skills section
      if (line.length > 5) results.push(line.substring(0, 120));
    }
  }
  return results.length ? [...new Set(results)].slice(0, 3) : [];
}

function extractExperience(text) {
  const results = [];
  const lines = text.split(/\n+/);
  const expRe = /\b(intern|internship|engineer|developer|analyst|manager|consultant|associate|trainee|worked at|software engineer|data analyst)\b/i;
  const companyRe = /\b(at|@|–|-|,)\s+[A-Z][a-zA-Z0-9 &,.']+/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 10) continue;
    if (expRe.test(trimmed)) {
      results.push(trimmed.substring(0, 120));
    }
  }
  return [...new Set(results)].slice(0, 5);
}

function extractProjects(text) {
  const results = [];
  const lines = text.split(/\n+/);
  // Look for project section headings and the items after them
  let inProjects = false;
  const sectionRe = /^(projects?|personal projects?|academic projects?|side projects?)\s*[:\-]?\s*$/i;
  const endSectionRe = /^(experience|work experience|education|skills|certifications?|achievements?|awards?|publications?|internship)\s*[:\-]?\s*$/i;
  const bulletRe = /^[\-\*\•\d]+[\.\)]\s*/;
  // Lines that look like experience entries rather than project names
  const expLineRe = /\b(intern|internship|worked at|employed|engineer|developer)\b/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (sectionRe.test(line)) { inProjects = true; continue; }
    if (inProjects && endSectionRe.test(line)) { inProjects = false; continue; }
    if (inProjects) {
      const cleaned = line.replace(bulletRe, '').trim();
      // Skip lines that look like experience entries
      if (cleaned.length > 5 && !expLineRe.test(cleaned)) {
        results.push(cleaned.substring(0, 100));
      }
    }
  }
  return [...new Set(results)].slice(0, 5);
}

function extractCertifications(text) {
  const results = [];
  const lines = text.split(/\n+/);
  const certRe = /\b(certified|certification|certificate|aws|azure|google cloud|coursera|udemy|edx|nptel|hackerrank|leetcode|microsoft|oracle|comptia)\b/i;
  for (const line of lines) {
    const trimmed = line.trim();
    if (certRe.test(trimmed) && trimmed.length > 8) {
      results.push(trimmed.substring(0, 100));
    }
  }
  return [...new Set(results)].slice(0, 5);
}

function scoreResume(skills, education, experience, projects) {
  let score = 0;
  score += Math.min(skills.length * 4, 40);     // up to 40 pts for skills
  score += education.length > 0 ? 20 : 0;        // 20 for education
  score += Math.min(experience.length * 8, 24);  // up to 24 for experience
  score += Math.min(projects.length * 4, 16);    // up to 16 for projects
  return Math.min(score, 100);
}

function generateStrengths(skills, experience, projects) {
  const strengths = [];
  if (skills.length >= 6) strengths.push(`Broad skill set with ${skills.length} identified technical skills`);
  else if (skills.length > 0) strengths.push(`Has foundational technical skills including ${skills.slice(0, 3).join(', ')}`);
  if (experience.length > 0) strengths.push('Has practical work or internship experience');
  if (projects.length >= 2) strengths.push(`Built ${projects.length} projects demonstrating hands-on ability`);
  if (skills.some(s => /react|angular|vue|next/i.test(s))) strengths.push('Front-end framework experience (React / Vue / Angular)');
  if (skills.some(s => /python|machine learning|tensorflow|pytorch/i.test(s))) strengths.push('Python and/or ML skills present');
  if (strengths.length === 0) strengths.push('Resume submitted — add more detail for better analysis');
  return strengths.slice(0, 4);
}

function generateMissingSkills(skills) {
  const common = ['SQL', 'Git', 'Docker', 'REST API', 'Data Structures', 'System Design', 'Cloud (AWS/GCP/Azure)'];
  const lowerSkills = skills.map(s => s.toLowerCase());
  return common.filter(s => !lowerSkills.includes(s.toLowerCase())).slice(0, 4);
}

function generateSuggestions(skills, education, experience, projects, score) {
  const suggestions = [];
  if (score < 40) suggestions.push('Add more detail to each section — employers need specifics');
  if (experience.length === 0) suggestions.push('Add internship or project experience to strengthen your resume');
  if (projects.length < 2) suggestions.push('Include 2–3 personal or academic projects with technologies used');
  if (!skills.some(s => /sql|postgres|mysql|mongodb/i.test(s))) suggestions.push('Learn SQL or a database technology — required for most tech roles');
  if (!skills.some(s => /git|github/i.test(s))) suggestions.push('Add Git / GitHub — version control is expected in every tech job');
  suggestions.push('Quantify achievements (e.g. "improved load time by 40%") wherever possible');
  return suggestions.slice(0, 5);
}

/**
 * Parse resume text WITHOUT calling an AI API.
 * Returns data in the same shape as the real AI response.
 */
function parseResumeLocally(resumeText) {
  const skills = extractSkills(resumeText);
  const education = extractEducation(resumeText);
  const experience = extractExperience(resumeText);
  const projects = extractProjects(resumeText);
  const certifications = extractCertifications(resumeText);
  const overallScore = scoreResume(skills, education, experience, projects);
  const strengths = generateStrengths(skills, experience, projects);
  const missingSkills = generateMissingSkills(skills);
  const suggestions = generateSuggestions(skills, education, experience, projects, overallScore);

  return {
    education: education.length ? education : ['Education details not found — please include degree, college, and year'],
    skills: skills.length ? skills : [],
    experience: experience.length ? experience : [],
    projects: projects.length ? projects : [],
    certifications: certifications.length ? certifications : [],
    strengths,
    missingSkills,
    suggestions,
    overallScore,
  };
}

// ─────────────────────────────────────────────────────────────
// 1. RESUME ANALYSIS
// ─────────────────────────────────────────────────────────────
async function analyzeResume(resumeText) {
  // In demo / no-API-key mode, always parse the REAL text — never return
  // hardcoded Jane Smith data for an actual uploaded / pasted resume.
  if (isDemoMode) {
    return parseResumeLocally(resumeText);
  }

  const system = `You are an expert resume analyst. Analyze the provided resume text and return a JSON object with these exact keys:
{
  "education": [],
  "skills": [],
  "experience": [],
  "projects": [],
  "certifications": [],
  "strengths": [],
  "missingSkills": [],
  "suggestions": [],
  "overallScore": 0
}
overallScore is 0-100 based on resume quality. Extract ONLY information that actually appears in the resume text. Do not invent or assume details.`;

  const result = await callAI(system, `Resume:\n${resumeText}`);
  return result || parseResumeLocally(resumeText);
}

// ─────────────────────────────────────────────────────────────
// 2. CAREER RECOMMENDATIONS
// ─────────────────────────────────────────────────────────────
async function getCareerRecommendations(skills, interests) {
  if (isDemoMode) return getDemoCareerRecommendations(skills);

  const system = `You are a career counselor for college students. Given the student's skills and interests, suggest 4 suitable career paths.
Return a JSON object with key "recommendations" containing an array. Each item:
{
  "careerName": "",
  "whySuitable": "",
  "requiredSkills": [],
  "currentMatch": 0,
  "missingSkills": [],
  "nextSteps": []
}
currentMatch is 0-100 percentage. Be realistic, not overly optimistic.`;

  const result = await callAI(
    system,
    `Skills: ${skills.join(', ')}\nInterests: ${interests.join(', ')}`
  );
  return result?.recommendations || getDemoCareerRecommendations(skills);
}

// ─────────────────────────────────────────────────────────────
// 3. SKILL GAP ANALYSIS
// ─────────────────────────────────────────────────────────────
async function analyzeSkillGap(career, currentSkills) {
  if (isDemoMode) return getDemoSkillGap(career, currentSkills);

  const system = `You are a technical skills advisor. Given a target career and the student's current skills, perform a skill gap analysis.
Return a JSON object:
{
  "requiredSkills": [],
  "matchedSkills": [],
  "missingSkills": [],
  "matchPercentage": 0,
  "beginner": [],
  "intermediate": [],
  "advanced": [],
  "suggestions": []
}
beginner/intermediate/advanced arrays contain missing skills categorised by difficulty to learn.`;

  const result = await callAI(
    system,
    `Target career: ${career}\nCurrent skills: ${currentSkills.join(', ')}`
  );
  return result || getDemoSkillGap(career, currentSkills);
}

// ─────────────────────────────────────────────────────────────
// 4. LEARNING ROADMAP
// ─────────────────────────────────────────────────────────────
async function generateRoadmap(career, missingSkills, experienceLevel, studyHours) {
  if (isDemoMode) return getDemoRoadmap(career, missingSkills);

  const system = `You are a learning coach. Create a personalised weekly study roadmap.
Return a JSON object with key "tasks" as an array of weekly tasks:
{
  "tasks": [
    {
      "weekNumber": 1,
      "title": "",
      "description": "",
      "topics": [],
      "practiceProblems": [],
      "miniProject": "",
      "resources": []
    }
  ]
}
Generate 8-12 weeks based on the number of missing skills and experience level.`;

  const result = await callAI(
    system,
    `Career: ${career}\nMissing skills: ${missingSkills.join(', ')}\nExperience: ${experienceLevel}\nStudy hours/week: ${studyHours}`
  );
  return result?.tasks || getDemoRoadmap(career, missingSkills);
}

// ─────────────────────────────────────────────────────────────
// 5. INTERVIEW QUESTION
// ─────────────────────────────────────────────────────────────
async function getInterviewQuestion(career, difficulty, questionNumber, previousQuestions) {
  if (isDemoMode) return getDemoInterviewQuestion(career, questionNumber);

  const prev = previousQuestions.length
    ? `Previously asked: ${previousQuestions.join(' | ')}`
    : 'This is the first question.';

  const system = `You are a technical interviewer. Generate a single interview question.
Return JSON: { "question": "..." }
The question should be ${difficulty} difficulty for a ${career} role. Do not repeat previous questions.`;

  const result = await callAI(system, `${prev}`);
  return result?.question || getDemoInterviewQuestion(career, questionNumber);
}

// ─────────────────────────────────────────────────────────────
// 6. EVALUATE ANSWER
// ─────────────────────────────────────────────────────────────
async function evaluateAnswer(career, question, userAnswer, difficulty) {
  if (isDemoMode) return getDemoAnswerFeedback(userAnswer);

  const system = `You are a technical interview evaluator. Evaluate the candidate's answer.
Return JSON:
{
  "score": 0,
  "evaluation": "",
  "strengths": [],
  "improvements": [],
  "suggestedAnswer": ""
}
score is 0-10. Be constructive and educational.`;

  const result = await callAI(
    system,
    `Career: ${career}\nDifficulty: ${difficulty}\nQuestion: ${question}\nCandidate answer: ${userAnswer}`
  );
  return result || getDemoAnswerFeedback(userAnswer);
}

// ─────────────────────────────────────────────────────────────
// 7. FINAL INTERVIEW SUMMARY
// ─────────────────────────────────────────────────────────────
async function generateInterviewSummary(career, questionsAndAnswers) {
  if (isDemoMode) return getDemoInterviewSummary();

  const qa = questionsAndAnswers
    .map((q) => `Q: ${q.question}\nA: ${q.userAnswer}\nScore: ${q.feedback?.score || 0}/10`)
    .join('\n\n');

  const system = `You are an interview coach. Based on the full interview session, give a summary.
Return JSON:
{
  "overallPerformance": "",
  "topStrengths": [],
  "areasToImprove": [],
  "recommendedResources": []
}`;

  const result = await callAI(system, `Career: ${career}\n\n${qa}`);
  return result || getDemoInterviewSummary();
}

// ─────────────────────────────────────────────────────────────
// DEMO DATA FALLBACKS
// Used ONLY for non-resume flows (career recommendations, roadmap, interview)
// where there is no actual user content to extract from.
// ─────────────────────────────────────────────────────────────
function getDemoCareerRecommendations(skills) {
  return [
    {
      careerName: 'Frontend Developer',
      whySuitable: 'Your React, JavaScript, HTML, and CSS skills align well with frontend development roles.',
      requiredSkills: ['React', 'TypeScript', 'CSS', 'JavaScript', 'REST APIs', 'Git'],
      currentMatch: 70,
      missingSkills: ['TypeScript', 'Testing (Jest)', 'Performance Optimization'],
      nextSteps: [
        'Learn TypeScript fundamentals',
        'Build 2-3 portfolio projects',
        'Contribute to open source',
      ],
    },
    {
      careerName: 'Full Stack Developer',
      whySuitable: 'You have both frontend and some backend skills, making full stack a natural fit.',
      requiredSkills: ['React', 'Node.js', 'SQL', 'MongoDB', 'REST APIs', 'Docker'],
      currentMatch: 55,
      missingSkills: ['SQL', 'Docker', 'System Design', 'Cloud deployment'],
      nextSteps: [
        'Learn SQL and database design',
        'Build a full-stack project with authentication',
        'Learn Docker basics',
      ],
    },
    {
      careerName: 'Data Analyst',
      whySuitable: 'Your Python skills provide a strong base for data analysis and visualization.',
      requiredSkills: ['Python', 'SQL', 'Pandas', 'NumPy', 'Tableau/Power BI', 'Statistics'],
      currentMatch: 40,
      missingSkills: ['SQL', 'Pandas', 'Statistics', 'Data Visualization'],
      nextSteps: [
        'Learn SQL for data querying',
        'Master Pandas and NumPy',
        'Take a statistics course',
      ],
    },
    {
      careerName: 'AI/ML Engineer',
      whySuitable: 'Python is the primary language in AI/ML. With the right upskilling, this is achievable.',
      requiredSkills: ['Python', 'ML Algorithms', 'TensorFlow/PyTorch', 'Mathematics', 'SQL', 'Data Wrangling'],
      currentMatch: 30,
      missingSkills: ['Machine Learning', 'Deep Learning', 'Mathematics for ML', 'Data Wrangling'],
      nextSteps: [
        'Complete a machine learning course (fast.ai or Coursera)',
        'Learn linear algebra and statistics',
        'Build ML projects on Kaggle',
      ],
    },
  ];
}

function getDemoSkillGap(career, currentSkills) {
  const careerSkillMap = {
    'Frontend Developer': ['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Git', 'REST APIs', 'Testing'],
    'Full Stack Developer': ['React', 'Node.js', 'SQL', 'MongoDB', 'Docker', 'TypeScript', 'REST APIs', 'Git'],
    'AI/ML Engineer': ['Python', 'Machine Learning', 'TensorFlow', 'Pandas', 'NumPy', 'SQL', 'Statistics', 'Deep Learning'],
    'Data Analyst': ['SQL', 'Python', 'Pandas', 'Tableau', 'Excel', 'Statistics', 'Data Visualization'],
    'Software Developer': ['Java', 'Data Structures', 'Algorithms', 'OOP', 'SQL', 'Git', 'System Design'],
    'Backend Developer': ['Node.js', 'SQL', 'MongoDB', 'REST APIs', 'Docker', 'Authentication', 'Caching'],
    'Cybersecurity Analyst': ['Networking', 'Linux', 'Python', 'Cryptography', 'Penetration Testing', 'SIEM Tools'],
  };

  const required = careerSkillMap[career] || ['Python', 'JavaScript', 'SQL', 'Git', 'Algorithms'];
  const lower = currentSkills.map((s) => s.toLowerCase());
  const matched = required.filter((s) => lower.includes(s.toLowerCase()));
  const missing = required.filter((s) => !lower.includes(s.toLowerCase()));
  const matchPct = Math.round((matched.length / required.length) * 100);

  return {
    requiredSkills: required,
    matchedSkills: matched,
    missingSkills: missing,
    matchPercentage: matchPct,
    beginner: missing.slice(0, Math.ceil(missing.length / 3)),
    intermediate: missing.slice(Math.ceil(missing.length / 3), Math.ceil((2 * missing.length) / 3)),
    advanced: missing.slice(Math.ceil((2 * missing.length) / 3)),
    suggestions: [
      `Focus on ${missing[0] || 'core skills'} first as it is foundational`,
      'Build a project combining multiple required skills',
      'Set aside 2-3 hours daily for focused learning',
    ],
  };
}

function getDemoRoadmap(career, missingSkills) {
  const skills = missingSkills.length ? missingSkills : ['Core Concepts', 'Advanced Topics', 'Projects'];
  const weeks = [];
  const perWeek = Math.ceil(skills.length / 4) || 1;

  for (let i = 0; i < Math.min(skills.length, 8); i += perWeek) {
    const weekSkills = skills.slice(i, i + perWeek);
    weeks.push({
      weekNumber: Math.floor(i / perWeek) + 1,
      title: `Week ${Math.floor(i / perWeek) + 1}: ${weekSkills.join(' & ')}`,
      description: `Focus on mastering ${weekSkills.join(' and ')} with hands-on practice.`,
      topics: weekSkills.flatMap((s) => [`${s} fundamentals`, `${s} advanced concepts`]),
      practiceProblems: [
        `Solve 5 problems related to ${weekSkills[0]}`,
        'Review and refactor previous code',
      ],
      miniProject: `Build a small project demonstrating ${weekSkills[0]}`,
      resources: [
        `Official ${weekSkills[0]} documentation`,
        `freeCodeCamp ${weekSkills[0]} course`,
        'YouTube tutorial series',
      ],
    });
  }

  weeks.push({
    weekNumber: weeks.length + 1,
    title: `Week ${weeks.length + 1}: Capstone Project for ${career}`,
    description: 'Combine all learned skills into a complete portfolio project.',
    topics: [`${career} project architecture`, 'Code review best practices', 'Deployment'],
    practiceProblems: ['Conduct a mock code review', 'Write documentation for your project'],
    miniProject: `Complete ${career} portfolio project and deploy it`,
    resources: ['GitHub for project hosting', 'Vercel / Render for deployment'],
  });

  return weeks;
}

function getDemoInterviewQuestion(career, questionNumber) {
  const questions = {
    'Frontend Developer': [
      'Explain the difference between var, let, and const in JavaScript.',
      'What is the Virtual DOM in React and why is it used?',
      'How do you optimize the performance of a React application?',
      'Explain CSS specificity and how it works.',
      'What is a closure in JavaScript? Give an example.',
    ],
    'Full Stack Developer': [
      'What is the difference between SQL and NoSQL databases?',
      'Explain RESTful API design principles.',
      'How does JWT authentication work?',
      'What is the event loop in Node.js?',
      'Describe a time you debugged a difficult production issue.',
    ],
    'AI/ML Engineer': [
      'What is the difference between supervised and unsupervised learning?',
      'Explain overfitting and how to prevent it.',
      'What is gradient descent?',
      'How does a decision tree work?',
      'What is the difference between precision and recall?',
    ],
  };
  const list = questions[career] || questions['Full Stack Developer'];
  return list[(questionNumber - 1) % list.length];
}

function getDemoAnswerFeedback(userAnswer) {
  const hasContent = userAnswer && userAnswer.trim().length > 20;
  return {
    score: hasContent ? 7 : 3,
    evaluation: hasContent
      ? 'Good answer that covers the main concepts. Could be improved with specific examples.'
      : 'The answer is too brief. Try to explain your reasoning and give concrete examples.',
    strengths: hasContent
      ? ['Shows understanding of core concepts', 'Clear communication']
      : ['Attempted to answer the question'],
    improvements: [
      'Add a concrete code example to illustrate your point',
      'Mention edge cases or trade-offs',
    ],
    suggestedAnswer:
      'A strong answer would explain the concept clearly, provide a code example, discuss trade-offs, and mention real-world use cases.',
  };
}

function getDemoInterviewSummary() {
  return {
    overallPerformance:
      'You demonstrated a solid foundational understanding of the subject. Your answers were generally clear but could benefit from more specific examples and deeper technical detail.',
    topStrengths: [
      'Good communication and structure in answers',
      'Demonstrated awareness of core concepts',
      'Showed willingness to think through problems',
    ],
    areasToImprove: [
      'Practice explaining concepts with concrete code examples',
      'Study advanced topics and edge cases',
      'Work on conciseness — some answers were longer than needed',
    ],
    recommendedResources: [
      'LeetCode for algorithm practice',
      'System Design Primer on GitHub',
      'Frontend Masters or Udemy for in-depth courses',
      'Mock interviews on Pramp or Interviewing.io',
    ],
  };
}

module.exports = {
  analyzeResume,
  getCareerRecommendations,
  analyzeSkillGap,
  generateRoadmap,
  getInterviewQuestion,
  evaluateAnswer,
  generateInterviewSummary,
  isDemoMode,
};
