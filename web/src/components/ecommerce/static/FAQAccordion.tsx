/**
 * FAQ Accordion Component (Static)
 * Collapsible Q&A sections with search/filter
 * Uses shadcn/ui Accordion component
 */

'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

interface FAQAccordionProps {
  faqs: FAQItem[];
  searchable?: boolean;
  title?: string;
  description?: string;
}

export function FAQAccordion({
  faqs,
  searchable = true,
  title = 'Frequently Asked Questions',
  description = 'Find answers to common questions about our products and services',
}: FAQAccordionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extract unique categories
  const categories = Array.from(
    new Set(faqs.map((faq) => faq.category).filter(Boolean))
  );

  // Filter FAQs based on search and category
  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      !searchQuery ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !selectedCategory || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground">{title}</h2>
        {description && (
          <p className="mt-2 text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Search and filter */}
      {searchable && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Category filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === null
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category!)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FAQs */}
      {filteredFaqs.length === 0 ? (
        <div className="py-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-4 text-muted-foreground">No questions found</p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {filteredFaqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert">
                  {faq.answer}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Still have questions CTA */}
      <div className="mt-8 rounded-lg bg-muted p-6 text-center">
        <h3 className="text-lg font-semibold text-foreground">
          Still have questions?
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Can't find the answer you're looking for? Our customer support team is here to help.
        </p>
        <button className="mt-4 rounded-lg bg-primary px-6 py-2 font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
          Contact Support
        </button>
      </div>
    </div>
  );
}

/**
 * Default ecommerce FAQs
 * Common questions for product pages and checkout
 */
export const defaultEcommerceFAQs: FAQItem[] = [
  {
    id: 'shipping-time',
    question: 'How long does shipping take?',
    answer:
      'Standard shipping typically takes 5-7 business days. Express shipping is available for 2-3 business day delivery. You will receive a tracking number once your order ships.',
    category: 'Shipping',
  },
  {
    id: 'shipping-cost',
    question: 'Do you offer free shipping?',
    answer:
      'Yes! We offer free standard shipping on all orders over $50 within the continental US. Orders under $50 have a flat shipping rate of $5.99.',
    category: 'Shipping',
  },
  {
    id: 'international-shipping',
    question: 'Do you ship internationally?',
    answer:
      'Currently, we only ship within the United States and Canada. International shipping to other countries will be available soon.',
    category: 'Shipping',
  },
  {
    id: 'return-policy',
    question: 'What is your return policy?',
    answer:
      'We offer a 30-day money-back guarantee. If you\'re not completely satisfied with your purchase, you can return it for a full refund within 30 days of delivery. Items must be unused and in original packaging.',
    category: 'Returns',
  },
  {
    id: 'return-shipping',
    question: 'Who pays for return shipping?',
    answer:
      'We provide free return shipping for defective or incorrect items. For other returns, customers are responsible for return shipping costs. We recommend using a trackable shipping service.',
    category: 'Returns',
  },
  {
    id: 'exchange',
    question: 'Can I exchange an item?',
    answer:
      'Yes! If you need a different size or color, we offer free exchanges within 30 days. Contact our customer service team to initiate an exchange.',
    category: 'Returns',
  },
  {
    id: 'payment-methods',
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, Apple Pay, Google Pay, and Shop Pay. All payments are securely processed.',
    category: 'Payment',
  },
  {
    id: 'secure-checkout',
    question: 'Is checkout secure?',
    answer:
      'Absolutely. We use industry-standard SSL encryption to protect your payment information. We never store your full credit card details on our servers.',
    category: 'Payment',
  },
  {
    id: 'order-tracking',
    question: 'How can I track my order?',
    answer:
      'Once your order ships, you\'ll receive an email with a tracking number. You can also track your order by logging into your account and viewing your order history.',
    category: 'Orders',
  },
  {
    id: 'cancel-order',
    question: 'Can I cancel or modify my order?',
    answer:
      'Orders can be cancelled or modified within 1 hour of placement. After that, your order is processed for shipping. Please contact us immediately if you need to make changes.',
    category: 'Orders',
  },
  {
    id: 'warranty',
    question: 'Do products come with a warranty?',
    answer:
      'Yes, all our products come with a 1-year manufacturer\'s warranty against defects. Extended warranty options are available at checkout.',
    category: 'Product Info',
  },
  {
    id: 'size-guide',
    question: 'How do I find the right size?',
    answer:
      'Each product page has a detailed size guide with measurements. If you\'re between sizes, we recommend sizing up. Feel free to contact us if you need help choosing the right size.',
    category: 'Product Info',
  },
];

/**
 * Product-specific FAQ component
 * Shows FAQs relevant to a specific product
 */
interface ProductFAQProps {
  productType?: string;
  customFaqs?: FAQItem[];
}

export function ProductFAQ({ productType, customFaqs }: ProductFAQProps) {
  // Filter default FAQs or use custom FAQs
  const faqs = customFaqs || defaultEcommerceFAQs;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <FAQAccordion faqs={faqs} searchable={faqs.length > 5} />
    </div>
  );
}
