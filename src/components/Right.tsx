"use client";
 
import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { layoutStore, layoutActions, PanelMode } from '../stores/layout';
import { Maximize2, PanelRightClose, Columns, Minus, X } from 'lucide-react';
import { Chat } from '@/components/Chat';
import type { ChatConfig } from '@/schema/chat';

export interface RightPanelProps {
  chatConfig?: ChatConfig;
  rightPanelMode?: 'full' | 'half' | 'quarter' | 'floating' | 'hidden' | 'icon';
  content?: string;
  "client:load"?: boolean;
  "client:idle"?: boolean;
  "client:only"?: string;
}

const Right: React.FC<RightPanelProps> = (props) => {
  // Filter out Astro client directives
  const componentProps = Object.fromEntries(
    Object.entries(props).filter(([key]) => !key.startsWith("client:"))
  ) as Omit<RightPanelProps, "client:load" | "client:idle" | "client:only">;

  // Initialize with undefined to avoid hydration mismatch
  const [hydratedChatConfig, setHydratedChatConfig] = useState<ChatConfig | undefined>(undefined);

  const { rightPanelMode, chatConfig } = componentProps;
  const layout = useStore(layoutStore);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Enhanced debug logging
    if (chatConfig) {
      console.log('Right component - Chat config details:', {
        welcome: chatConfig.welcome,
        welcomeMessage: chatConfig.welcome?.message,
        suggestions: chatConfig.welcome?.suggestions?.map(s => 
          typeof s === 'string' ? s : s.label
        ),
        mounted,
        previousConfig: hydratedChatConfig ? true : false
      });
      
      // Only update if config changed
      if (JSON.stringify(chatConfig) !== JSON.stringify(hydratedChatConfig)) {
        console.log('Updating hydrated config');
        setHydratedChatConfig(chatConfig);
      }
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [chatConfig, mounted, hydratedChatConfig]);

  useEffect(() => {
    if (mounted) {
      const mainGrid = document.getElementById('main-grid');
      if (mainGrid) {
        mainGrid.setAttribute('data-panel-mode', layout.mode);
      }
    }
  }, [layout.mode, mounted]);

  useEffect(() => {
    if (mounted && rightPanelMode) {
      const modeMap = {
        'full': 'Full',
        'half': 'Half',
        'quarter': 'Quarter',
        'floating': 'Floating',
        'hidden': 'Icon',
        'icon': 'Icon'
      } as const;
      
      if (window.innerWidth < 768) {
        layoutActions.setMode('Icon');
      } else {
        layoutActions.setMode(modeMap[rightPanelMode]);
      }
    }
  }, [rightPanelMode, mounted]);

  const handleModeChange = (mode: keyof typeof PanelMode) => {
    if (isMobile && mode !== 'Icon') {
      layoutActions.setMode('Full');
    } else {
      layoutActions.setMode(mode);
    }
  };

  if (!layout.isVisible) return null;
  
  if (!mounted) {
    return (
      <div className="right-panel right-panel-bg layout-transition flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const isIcon = layout.mode === "Icon";
  
  return (
    <div
      className={`right-panel right-panel-bg layout-transition ${layout.mode === 'Floating' ? 'floating' : ''}`}
      data-mode={layout.mode.toLowerCase()}
    >
      {isIcon ? (
        <button 
          onClick={() => handleModeChange("Quarter")}
          className="w-full h-full bg-primary text-primary-foreground 
                     rounded-full flex items-center justify-center 
                     hover:bg-primary/90"
          aria-label="Open AI Assistant"
        >
          AI
        </button>
      ) : (
        <div className="h-full flex flex-col right-panel-bg">
          <header 
            className="flex-none px-2 h-[65px] border-b border-l flex items-center relative right-panel-bg"
          >
            <div className="flex items-center w-full">
              <div className="flex items-center gap-1">
                {layout.mode !== 'Full' && (
                  <button
                    onClick={() => handleModeChange("Full")}
                    className="p-1.5 hover:bg-accent/80 rounded-md transition-colors"
                    aria-label="Full"
                  >
                    <Maximize2 className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                )}
                {layout.mode !== 'Half' && layout.mode !== 'Floating' && (
                  <button
                    onClick={() => handleModeChange("Half")}
                    className="p-1.5 hover:bg-accent/80 rounded-md transition-colors"
                    aria-label="Half"
                  >
                    <PanelRightClose className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                )}
                {layout.mode !== 'Quarter' && (
                  <button
                    onClick={() => handleModeChange("Quarter")}
                    className="p-1.5 hover:bg-accent/80 rounded-md transition-colors"
                    aria-label="Quarter"
                  >
                    <Columns className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                )}
              </div>
              <h2 className="font-semibold absolute left-1/2 -translate-x-1/2 text-sm tracking-wide">Agent ONE</h2>
              <div className="flex items-center gap-1 ml-auto">
                {layout.mode !== 'Floating' && (
                  <button
                    onClick={() => handleModeChange("Floating")}
                    className="p-1.5 hover:bg-accent/80 rounded-md transition-colors"
                    aria-label="Float"
                  >
                    <Minus className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                )}
                <button
                  onClick={() => handleModeChange("Icon")}
                  className="p-1.5 hover:bg-accent/80 rounded-md transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                </button>
              </div>
            </div>
          </header>
          <main 
            className="flex-1 overflow-hidden mx-auto w-full max-w-[850px] right-panel-bg"
          >
            <Chat
              className="right-panel-bg"
              chatConfig={hydratedChatConfig}
              key={hydratedChatConfig ? JSON.stringify(hydratedChatConfig.welcome) : 'initial'}
            />
          </main>
        </div>
      )}
    </div>
  );
};

Right.displayName = "Right";

export default Right;