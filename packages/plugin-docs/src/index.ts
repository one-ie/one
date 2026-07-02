import type { OnePluginFactory } from '@oneie/frontend'

export interface SidebarFolder {
  folder: string
  label: string
  icon?: string
}

export interface OneDocsConfig {
  /** Directory where docs content lives. Default: 'src/content/docs' */
  docsDir?: string
  /** Whether to inject /docs and /docs/[slug] routes automatically. Default: true */
  injectRoutes?: boolean
  /** User-defined folder order and labels for the sidebar */
  sidebar?: SidebarFolder[]
  /** Base URL for "Edit this page" GitHub links, e.g. 'https://github.com/org/repo/edit/main' */
  editBaseUrl?: string
}

export const docs: OnePluginFactory<OneDocsConfig> = (config = {}) => ({
  name: 'plugin-docs',
  tier: 'free',
  config: undefined,
  integration: undefined,
  entitlement: undefined,
})

export type { OneDocsConfig as DocsConfig, SidebarFolder }
