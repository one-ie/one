// SSR-safe render of a published Puck Data tree. Ported from
// one.ie/web/src/components/puck/PuckRenderer.tsx — same guard, same <Render>, but
// bound to the package's self-contained pagesPuckConfig instead of the workspace
// config. No puck.css / editor-chrome import (keeps it out of any SSR bundle).
import { Render, type Data } from '@puckeditor/core'
import { pagesPuckConfig } from './config'

export type PuckData = Data

export interface PageRendererProps {
  data: PuckData
}

export function PageRenderer({ data }: PageRendererProps) {
  if (!data || !data.content || data.content.length === 0) return null
  return <Render config={pagesPuckConfig} data={data} />
}
