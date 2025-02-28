import { z } from 'zod';

// Agent source schema
export const agentSourceSchema = z.object({
  type: z.string(),
  url: z.string().url(),
  format: z.string(),
  frequency: z.string(),
});

// Agent schema
export const agentSchema = z.object({
  title: z.string(),
  description: z.string(),
  role: z.string(),
  style: z.string(),
  goal: z.string(),
  maxResponseLength: z.number(),
  tools: z.array(z.string()),
  context: z.string(),
  sources: z.array(agentSourceSchema).optional(),
});

export type AgentSource = z.infer<typeof agentSourceSchema>;
export type Agent = z.infer<typeof agentSchema>; 