import { useOptimistic, useTransition } from "react";
import type { MarkDimsResponse, PayResponse } from "../types.js";
import { useSubstrate } from "./context.js";

export interface MarkState {
  edge: string;
  scores: Partial<{ fit: number; form: number; truth: number; taste: number }>;
  pending: boolean;
}

export function useOptimisticMark(initialEdge = "") {
  const { client } = useSubstrate();
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic<MarkState>({
    edge: initialEdge,
    scores: { fit: 0, form: 0, truth: 0, taste: 0 },
    pending: false,
  });

  function mark(
    edge: string,
    scores?: Partial<{ fit: number; form: number; truth: number; taste: number }>,
  ): Promise<MarkDimsResponse> {
    return new Promise((resolve, reject) => {
      startTransition(async () => {
        setOptimistic({ edge, scores: scores ?? { fit: 1, form: 1, truth: 1, taste: 1 }, pending: true });
        try {
          const result = await client.mark(edge, scores);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  return { optimistic: { ...optimistic, pending: isPending }, mark };
}

export interface PayState {
  from: string;
  to: string;
  amount: number;
  pending: boolean;
}

export function useOptimisticPay() {
  const { client } = useSubstrate();
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic<PayState>({
    from: "",
    to: "",
    amount: 0,
    pending: false,
  });

  function pay(from: string, to: string, task: string, amount: number): Promise<PayResponse> {
    return new Promise((resolve, reject) => {
      startTransition(async () => {
        setOptimistic({ from, to, amount, pending: true });
        try {
          const result = await client.payWeight(from, to, task, amount);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  return { optimistic: { ...optimistic, pending: isPending }, pay };
}
