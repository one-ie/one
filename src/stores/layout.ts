import { atom } from 'nanostores';

/** Panel display modes and their layout configurations */
export const PanelMode = {
  Icon: {
    main: { width: '100%' },
    right: {
      width: '48px',
      height: '48px',
      position: 'fixed',
      bottom: 'max(1rem, env(safe-area-inset-bottom))',
      right: 'max(1rem, env(safe-area-inset-right))',
      zIndex: 100,
      borderRadius: '9999px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      border: 'none'
    }
  },
  Floating: {
    main: { width: '100%' },
    right: {
      width: '400px',
      height: '600px',
      position: 'fixed',
      top: 'calc(50% + 100px)',
      right: '20px',
      transform: 'translateY(-50%)',
      zIndex: 1000,
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: '1px solid var(--one-border)',
      background: 'var(--one-background-nav)',
      '@media (max-width: 768px)': {
        width: 'calc(100% - 40px)',
        height: 'calc(100% - 120px)'
      }
    }
  },
  Quarter: {
    main: { width: '75%' },
    right: {
      width: '25%',
      minWidth: '320px',
      background: 'var(--one-background-nav)',
      borderLeft: '1px solid var(--one-border)',
      height: '100%',
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      zIndex: 50
    }
  },
  Half: {
    main: { width: '50%' },
    right: {
      width: '50%',
      background: 'var(--one-background-nav)',
      borderLeft: '1px solid var(--one-border)',
      height: '100%',
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      zIndex: 50
    }
  },
  Full: {
    main: { 
      width: '0%',
      overflow: 'hidden',
      visibility: 'hidden'
    },
    right: { 
      width: '100%',
      background: 'var(--one-background-nav)',
      height: '100%',
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 9999
    }
  }
} as const;

export type PanelModeType = keyof typeof PanelMode;

interface LayoutState {
  mode: PanelModeType;
  isVisible: boolean;
}

const defaultLayout: LayoutState = {
  mode: 'Quarter',  // Default fallback
  isVisible: true
};

const store = atom<LayoutState>(defaultLayout);

export const layoutActions = {
  setMode(mode: PanelModeType) {
    const current = store.get();
    store.set({ ...current, mode });
  },

  toggleVisibility() {
    const current = store.get();
    store.set({ ...current, isVisible: !current.isVisible });
  },

  initLayout() {
    // Set initial mode based on screen size
    const initialMode = typeof window !== 'undefined' && window.innerWidth < 768 
      ? 'Icon' 
      : 'Quarter';
    
    // Check for saved preferences
    const saved = localStorage.getItem('layoutPreference');
    if (saved) {
      try {
        const savedState = JSON.parse(saved) as LayoutState;
        // Check if we should use Icon mode on mobile regardless of saved state
        if (window.innerWidth < 768 && savedState.mode !== 'Icon' && savedState.mode !== 'Full') {
          savedState.mode = 'Icon';
        }
        store.set(savedState);
      } catch (e) {
        store.set({ ...defaultLayout, mode: initialMode });
      }
    } else {
      // No saved preference, use screen-size based default
      store.set({ ...defaultLayout, mode: initialMode });
    }
    
    const handleResize = () => {
      const current = store.get();
      const width = window.innerWidth;
      
      if (width < 768) {
        // On mobile, switch to Icon mode if not already in Icon or Full mode
        if (current.mode !== 'Icon' && current.mode !== 'Full') {
          store.set({ ...current, mode: 'Icon' });
        }
      } else if (width < 1024) {
        // On tablet, prefer Floating or Quarter modes
        if (current.mode === 'Full') {
          store.set({ ...current, mode: 'Floating' });
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    store.subscribe(state => localStorage.setItem('layoutPreference', JSON.stringify(state)));
  }
};

export const layoutStore = store;