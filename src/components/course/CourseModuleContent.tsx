import { CheckIcon } from "lucide-react";

export interface CourseModuleContentProps {
  lessons: { name: string; value: string }[];
  moduleNumber?: number;
}

export function CourseModuleContent({ lessons }: CourseModuleContentProps) {
  return (
    <div className="space-y-4">
      {lessons.map((lesson, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-blue-600/10 flex-shrink-0 flex items-center justify-center mt-0.5">
            <CheckIcon className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div>
            <h4 className="font-medium text-white">{lesson.name}</h4>
            <p className="text-sm text-[#888888]">{lesson.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 