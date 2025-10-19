import type { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  title: string;
  path: string;
  icon: LucideIcon;
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  author: {
    name: string;
    email?: string;
    url?: string;
  };
  social: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
  navigation: Omit<NavigationItem, 'icon'>[];
}

export const siteConfig: SiteConfig = {
  name: 'Nine Padel',
  description:
    'Premium padel rackets, bags, shoes, and accessories - Expert gear for every level',
  url: 'https://ninepadel.com',

  author: {
    name: 'Nine Padel',
    email: 'hello@ninepadel.com',
    url: 'https://ninepadel.com',
  },

  social: {
    github: 'https://github.com/ninepadel',
    twitter: 'https://twitter.com/ninepadel',
    linkedin: 'https://linkedin.com/company/ninepadel',
  },

  navigation: [
    { title: 'Rackets', path: '/shop?category=rackets' },
    { title: 'Bags', path: '/shop?category=bags' },
    { title: 'Shoes', path: '/shop?category=shoes' },
    { title: 'Balls', path: '/shop?category=balls' },
    { title: 'Apparel', path: '/shop?category=apparel' },
    { title: 'Guides', path: '/guides' },
  ],
};
