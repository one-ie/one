'use client';

import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon, BookOpen, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import { CourseModuleContent } from './course/CourseModuleContent';
import {
  Accordion as UiAccordion,
  AccordionContent as UiAccordionContent,
  AccordionItem as UiAccordionItem,
  AccordionTrigger as UiAccordionTrigger
} from "./ui/accordion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SimpleAccordionItem {
  title: string;
  content: string;
}

interface CourseModule {
  title: string;
  description: string;
  lessons: { name: string; value: string }[];
  moduleNumber: number;
}

interface Lesson {
  name: string;
  value: string;
  slug: string;
}

interface Module {
  title: string;
  description: string;
  lessons: Lesson[];
}

// Using custom Radix UI implementation
export function CustomAccordionWrapper({ items }: { items: SimpleAccordionItem[] }) {
  return (
    <Accordion.Root
      className="space-y-4"
      type="single"
      defaultValue="item-0"
      collapsible
    >
      {items.map((item, i) => (
        <CustomAccordionItem
          key={`item-${i}`}
          value={`item-${i}`}
          title={item.title}
          content={item.content}
        />
      ))}
    </Accordion.Root>
  );
}

export function CourseModulesAccordion({ modules }: { modules: CourseModule[] }) {
  return (
    <Accordion.Root
      className="space-y-4"
      type="single"
      defaultValue="module-0"
      collapsible
    >
      {modules.map((module, i) => (
        <Accordion.Item
          key={`module-${i}`}
          value={`module-${i}`}
          className="border border-[hsla(var(--one-border),0.3)] rounded-lg overflow-hidden transition-all duration-200 hover:border-[hsla(var(--one-border),0.5)]"
        >
          <CustomAccordionTrigger className="px-6 py-4 w-full">
            <div className="text-left flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-[hsla(var(--one-primary),0.1)] flex items-center justify-center flex-shrink-0">
                <span className="text-[hsla(var(--one-primary),1)] font-bold">{module.moduleNumber}</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">{module.title}</h3>
                <p className="text-sm text-[hsla(var(--one-white),0.7)]">{module.description}</p>
              </div>
            </div>
          </CustomAccordionTrigger>
          <CustomAccordionContent className="px-6 py-4 bg-[hsla(var(--one-white),0.03)]">
            <div className="mb-4 text-[#888888]">{module.description}</div>
            <CourseModuleContent
              lessons={module.lessons}
              moduleNumber={module.moduleNumber}
            />
          </CustomAccordionContent>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

const CustomAccordionItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Accordion.Item> & {
    title: string;
    content: string;
  }
>(({ className, title, content, ...props }, ref) => (
  <Accordion.Item
    ref={ref}
    className={cn(
      "border border-[hsla(var(--one-border),0.3)] rounded-lg overflow-hidden transition-all duration-200 hover:border-[hsla(var(--one-border),0.5)]",
      className
    )}
    {...props}
  >
    <CustomAccordionTrigger className="px-6 py-4">{title}</CustomAccordionTrigger>
    <CustomAccordionContent className="px-6 py-4 bg-[hsla(var(--one-white),0.03)]">
      {content}
    </CustomAccordionContent>
  </Accordion.Item>
));
CustomAccordionItem.displayName = "CustomAccordionItem";

const CustomAccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Accordion.Trigger>
>(({ className, children, ...props }, ref) => (
  <Accordion.Header className="flex">
    <Accordion.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="h-5 w-5 shrink-0 text-[hsla(var(--one-white),0.7)] transition-transform duration-200" />
    </Accordion.Trigger>
  </Accordion.Header>
));
CustomAccordionTrigger.displayName = "CustomAccordionTrigger";

const CustomAccordionContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Accordion.Content>
>(({ className, children, ...props }, ref) => (
  <Accordion.Content
    ref={ref}
    className={cn(
      "data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden text-sm transition-all",
      className
    )}
    {...props}
  >
    <div className="pt-0">{children}</div>
  </Accordion.Content>
));
CustomAccordionContent.displayName = "CustomAccordionContent";

// Using shadcn/ui components
interface AccordionWrapperProps {
  items: SimpleAccordionItem[];
}

// This is the component we'll use in the course.astro page
export function AccordionWrapper({ items }: AccordionWrapperProps) {
  return (
    <UiAccordion type="single" collapsible className="w-full">
      {items.map((item, index) => (
        <UiAccordionItem key={index} value={`item-${index}`}>
          <UiAccordionTrigger className="text-xl font-semibold">
            {item.title}
          </UiAccordionTrigger>
          <UiAccordionContent>
            <Card className="p-6">
              {item.content}
            </Card>
          </UiAccordionContent>
        </UiAccordionItem>
      ))}
    </UiAccordion>
  );
}