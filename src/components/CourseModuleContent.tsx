import React from "react";
import { CheckIcon } from "lucide-react";

interface Lesson {
  name: string;
  value: string;
}

interface CourseModuleContentProps {
  title: string;
  description: string;
  lessons: Lesson[];
  index: number;
}

export function CourseModuleContent({ 
  title, 
  description, 
  lessons, 
  index 
}: CourseModuleContentProps) {
  return (
    <div className="bg-[#1a1a1a] border border-[#333333] rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:shadow-black/20">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 rounded-full bg-[#222222] border border-[#333333] flex items-center justify-center text-white font-bold text-xl mr-4">
          {index + 1}
        </div>
        <div>
          <h3 className="text-xl font-medium text-white">{title}</h3>
          <p className="text-[#888888]">{description}</p>
        </div>
      </div>
      
      <ul className="space-y-4">
        {lessons.map((lesson, i) => (
          <li key={i} className="flex items-start">
            <div className="w-5 h-5 rounded-full bg-[#222222] border border-[#333333] flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
              <CheckIcon className="w-3 h-3 text-[#aaaaaa]" />
            </div>
            <div>
              <p className="text-[#dddddd]">{lesson.name}</p>
              <p className="text-sm text-[#777777]">{lesson.value}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 