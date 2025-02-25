import React from 'react';
import { CheckIcon } from 'lucide-react';

interface Lesson {
  name: string;
  value: string;
}

interface CourseModuleContentProps {
  description: string;
  lessons: Lesson[];
}

export function CourseModuleContent({ description, lessons }: CourseModuleContentProps) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">{description}</p>
      <ul className="space-y-2">
        {lessons.map((lesson, index) => (
          <li key={index} className="flex items-start">
            <div className="mr-2 mt-1 bg-primary/10 rounded-full p-1 flex-shrink-0">
              <CheckIcon className="h-3 w-3 text-primary" />
            </div>
            <div>
              <p className="font-medium">{lesson.name}</p>
              <p className="text-sm text-muted-foreground">{lesson.value}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 