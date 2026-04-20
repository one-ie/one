import { createContext, useContext, type ReactNode } from "react";
import type { SubstrateClient } from "../client.js";

export interface SubstrateContextValue {
  client: SubstrateClient;
}

const SubstrateContext = createContext<SubstrateContextValue | null>(null);

export function SubstrateProvider({
  client,
  children,
}: {
  client: SubstrateClient;
  children: ReactNode;
}) {
  return (
    <SubstrateContext.Provider value={{ client }}>
      {children}
    </SubstrateContext.Provider>
  );
}

export function useSubstrate(): SubstrateContextValue {
  const ctx = useContext(SubstrateContext);
  if (!ctx) throw new Error("useSubstrate must be used inside <SubstrateProvider>");
  return ctx;
}
