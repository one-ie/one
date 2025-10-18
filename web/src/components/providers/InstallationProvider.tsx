import { createContext, useContext, useState, type ReactNode } from 'react';

// Type-safe ID type compatible with Convex
type Id<T extends string> = string & { __tableName: T };

interface InstallationContextValue {
  installationName: string | null;
  currentGroupId: Id<'groups'> | null;
  setCurrentGroup: (groupId: Id<'groups'> | null) => void;
}

const InstallationContext = createContext<InstallationContextValue | null>(null);

interface InstallationProviderProps {
  children: ReactNode;
  initialGroupId?: Id<'groups'> | null;
}

export function InstallationProvider({ children, initialGroupId = null }: InstallationProviderProps) {
  const [currentGroupId, setCurrentGroupId] = useState<Id<'groups'> | null>(initialGroupId);

  const value: InstallationContextValue = {
    installationName: import.meta.env.PUBLIC_INSTALLATION_NAME || null,
    currentGroupId,
    setCurrentGroup: setCurrentGroupId,
  };

  return <InstallationContext.Provider value={value}>{children}</InstallationContext.Provider>;
}

export function useInstallation() {
  const context = useContext(InstallationContext);
  if (!context) {
    throw new Error('useInstallation must be used within InstallationProvider');
  }
  return context;
}
