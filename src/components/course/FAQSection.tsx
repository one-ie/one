import React from "react";
import FaqAccordion from "@/components/FaqAccordion";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
}

export function FAQSection({ faqs }: FAQSectionProps) {
  return (
    <section className="container mx-auto px-6 py-20 border-t border-border bg-background/10 backdrop-blur-sm">
      <div className="w-full max-w-[1400px] mx-auto">
        <h2 className="text-4xl font-bold mb-10 text-center text-foreground one-animate-fade-in">
          Frequently Asked Questions
        </h2>
        <div className="one-animate-fade-in">
          <FaqAccordion faqs={faqs} />
        </div>
      </div>
    </section>
  );
} 