declare module "@oneie/templates" {
  export interface Preset {
    name: string;
    role: string;
    description: string;
    skills: string[];
    tags: string[];
    defaultPrice?: number;
  }
  export function listPresets(): Preset[];
  export function getPreset(name: string): Preset | undefined;
  export function generate(opts: {
    name: string;
    preset: Preset;
    model?: string;
    systemPrompt?: string;
    group?: string;
  }): { markdown: string; filename: string };
}
