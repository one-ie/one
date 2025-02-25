'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CourseModuleContent } from "./CourseModuleContent";

interface ModuleContent {
  type: 'module';
  description: string;
  lessons: Array<{
    name: string;
    value: string;
  }>;
}

export interface AccordionItem {
  title: string;
  content: React.ReactNode | ModuleContent;
}

interface AccordionWrapperProps {
  items: AccordionItem[];
}

export function AccordionWrapper({ items }: AccordionWrapperProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>
            {isModuleContent(item.content) ? (
              <CourseModuleContent 
                description={item.content.description} 
                lessons={item.content.lessons} 
              />
            ) : typeof item.content === 'string' ? (
              <p className="text-muted-foreground">{item.content}</p>
            ) : (
              item.content
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function isModuleContent(content: React.ReactNode | ModuleContent): content is ModuleContent {
  return (content as ModuleContent)?.type === 'module';
} 