import { z } from 'zod';

export const VideoSchema = z.object({
  type: z.literal('video'),
  id: z.string(),
  platform: z.enum(['youtube', 'vimeo']).default('youtube'),
  title: z.string().optional(),
  description: z.string().optional(),
  timestamp: z.string().optional(),
  params: z.string().optional(),
});

export const TextBlockSchema = z.object({
  type: z.literal('text'),
  content: z.string(),
  title: z.string().optional(),
});

export const QuizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.number(),
  explanation: z.string().optional(),
});

export const QuizSchema = z.object({
  type: z.literal('quiz'),
  title: z.string(),
  description: z.string().optional(),
  questions: z.array(QuizQuestionSchema),
});

export const LessonContentSchema = z.array(
  z.discriminatedUnion('type', [
    VideoSchema,
    TextBlockSchema,
    QuizSchema,
  ])
);

export const LessonSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.string().or(z.date()),
  status: z.enum(['draft', 'public', 'private']).default('draft'),
  courseId: z.string(),
  moduleId: z.string(),
  duration: z.number(),
  order: z.number(),
  lessonContent: LessonContentSchema,
  content: z.string().optional(),
  tags: z.array(z.string()).default([]),
  aiConfig: z.object({
    systemPrompt: z.array(z.object({
      type: z.literal('text'),
      text: z.string()
    })).optional(),
    welcomeMessage: z.string().optional(),
    suggestions: z.array(z.object({
      label: z.string(),
      prompt: z.string()
    })).optional()
  }).optional()
});

export type Lesson = z.infer<typeof LessonSchema>;
export type LessonContent = z.infer<typeof LessonContentSchema>;
export type VideoContent = z.infer<typeof VideoSchema>;
export type TextBlock = z.infer<typeof TextBlockSchema>;
export type Quiz = z.infer<typeof QuizSchema>; 