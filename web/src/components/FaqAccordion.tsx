import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

interface Faq {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  faqs: Faq[];
}

export default function FaqAccordion({ faqs }: FaqAccordionProps) {
  return (
    <Accordion.Root type="single" collapsible className="space-y-4">
      {faqs.map((faq, index: number) => (
        <Accordion.Item 
          key={index} 
          value={`item-${index}`}
          className="bg-card rounded-lg border p-4"
        >
          <Accordion.Trigger className="flex w-full justify-between items-center">
            <span>{faq.question}</span>
            <ChevronDown className="h-4 w-4 transition-transform duration-200" />
          </Accordion.Trigger>
          <Accordion.Content className="pt-4 text-muted-foreground">
            {faq.answer}
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
} 