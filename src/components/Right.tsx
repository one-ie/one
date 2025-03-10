"use client";

import { useStore } from '@nanostores/react';
import { layoutStore } from '../stores/layout';
import { RightContent } from './RightContent';

export interface ChatConfig {
  api?: string;
  welcome?: {
    message: string;
    avatar: string;
  };
  initialMessages?: Array<{
    id: string;
    content: string;
    role: 'user' | 'assistant' | 'system';
  }>;
}

export interface RightPanelProps {
  chatConfig?: ChatConfig;
  rightPanelMode?: 'full' | 'half' | 'quarter' | 'floating' | 'hidden' | 'icon';
  content?: string;
  "client:load"?: boolean;
  "client:idle"?: boolean;
  "client:only"?: string;
}

const Right: React.FC<RightPanelProps> = (props) => {
  // Initialize the store
  useStore(layoutStore);

  // Filter out Astro client directives
  const componentProps = Object.fromEntries(
    Object.entries(props).filter(([key]) => !key.startsWith("client:"))
  ) as Omit<RightPanelProps, "client:load" | "client:idle" | "client:only">;
  
  return <RightContent {...componentProps} />;
};

Right.displayName = "Right";

export default Right;