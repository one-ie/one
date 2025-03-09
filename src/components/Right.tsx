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
}

// The store is globally accessible, no need for a provider
export default function Right(props: RightPanelProps) {
  // Initialize the store
  useStore(layoutStore);
  
  return <RightContent {...props} />;
}