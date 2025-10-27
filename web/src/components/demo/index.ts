/**
 * Demo Components - Shared foundational components for all demo pages
 *
 * This module exports all shared demo components that are used across
 * the demo pages to showcase the 6-dimension ontology.
 *
 * Components:
 * - DemoContainer: Wrapper with connection status and backend health
 * - DemoHero: Hero section with title, icon, badges, and CTA
 * - DemoPlayground: Interactive area with form and data sections
 * - DemoCodeBlock: Syntax-highlighted code examples with copy
 * - DemoStats: Live statistics with animated counters
 *
 * Architecture:
 * - All components support dark/light mode
 * - Fully responsive (mobile-first)
 * - TypeScript strict mode
 * - Accessible (ARIA labels, keyboard navigation)
 * - Built with shadcn/ui and Tailwind CSS v4
 *
 * Usage:
 * ```tsx
 * import {
 *   DemoContainer,
 *   DemoHero,
 *   DemoPlayground,
 *   DemoCodeBlock,
 *   DemoStats,
 * } from '@/components/demo';
 *
 * export default function GroupsDemo() {
 *   return (
 *     <DemoContainer title="Groups" description="Dimension 1 of the 6-dimension ontology">
 *       <DemoHero
 *         title="Groups"
 *         description="Groups are containers for collaboration..."
 *         icon={Users}
 *         badges={[
 *           { label: 'Interactive', variant: 'success' },
 *           { label: 'Backend Connected', variant: 'success' },
 *         ]}
 *       />
 *
 *       <DemoPlayground
 *         title="Create & Manage Groups"
 *         formSection={<CreateGroupForm />}
 *         dataSection={<GroupsList />}
 *       />
 *
 *       <DemoCodeBlock
 *         code="const groups = useQuery(api.queries.groups.list)"
 *         language="typescript"
 *         title="Fetch Groups"
 *       />
 *
 *       <DemoStats stats={stats} />
 *     </DemoContainer>
 *   );
 * }
 * ```
 */

export { DemoContainer, type DemoContainerProps } from './DemoContainer';
export { DemoHero, type DemoHeroProps } from './DemoHero';
export { DemoPlayground, type DemoPlaygroundProps } from './DemoPlayground';
export { DemoCodeBlock, type DemoCodeBlockProps } from './DemoCodeBlock';
export { DemoStats, type DemoStatsProps, type StatItem } from './DemoStats';
