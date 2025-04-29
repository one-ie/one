import type { Course } from '@/schema/course';

export const webDevelopmentCourse: Course = {
  id: 'web-development',
  title: 'Web Development Fundamentals',
  description: 'Learn modern web development from the ground up. Master HTML, CSS, and JavaScript through hands-on projects and interactive lessons.',
  image: '/courses/web-development.jpg',
  duration: 1200, // 20 hours
  level: 'beginner',
  prerequisites: [],
  tags: ['web-development', 'html', 'css', 'javascript'],
  status: 'public',
  modules: [
    {
      id: 'introduction',
      title: 'Introduction to Web Development',
      description: 'Get started with the fundamentals of web development and understand how the web works.',
      order: 1,
      duration: 60,
      status: 'public',
      lessons: [
        'demo-course/introduction',
        'demo-course/html-basics',
        'demo-course/css-fundamentals',
        'demo-course/javascript-intro'
      ]
    },
    {
      id: 'html',
      title: 'HTML Deep Dive',
      description: 'Master HTML5 elements, semantic markup, and best practices for structuring web content.',
      order: 2,
      duration: 180,
      status: 'public',
      lessons: [
        'demo-course/html-structure',
        'demo-course/semantic-html',
        'demo-course/forms-and-validation',
        'demo-course/html-best-practices'
      ]
    }
  ],
  instructors: [
    {
      name: 'John Doe',
      avatar: '/instructors/john-doe.jpg',
      bio: 'Senior Web Developer with 10+ years of experience in building modern web applications.'
    }
  ],
  features: [
    {
      icon: '🎯',
      title: 'Project-Based Learning',
      description: 'Learn by building real-world projects that you can add to your portfolio.'
    },
    {
      icon: '🤖',
      title: 'AI-Powered Assistant',
      description: 'Get help from our AI tutor whenever you need clarification or additional examples.'
    },
    {
      icon: '✅',
      title: 'Interactive Quizzes',
      description: 'Test your knowledge with quizzes and get immediate feedback on your progress.'
    }
  ],
  aiConfig: {
    systemPrompt: [
      {
        type: 'text',
        text: `I am your Web Development Course Assistant. I can help you with:

1. Understanding web development concepts
2. Debugging code problems
3. Explaining best practices
4. Providing additional resources
5. Answering technical questions

Feel free to ask me anything about web development!`
      }
    ],
    welcomeMessage: '👋 Welcome to the Web Development course! How can I help you today?',
    suggestions: [
      {
        label: '🌐 Course Overview',
        prompt: 'Can you give me an overview of what I\'ll learn in this course?'
      },
      {
        label: '📚 Learning Path',
        prompt: 'What\'s the recommended learning path for this course?'
      },
      {
        label: '💻 Projects',
        prompt: 'What projects will I build in this course?'
      }
    ]
  }
}; 