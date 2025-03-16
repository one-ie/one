import { getCollection, type CollectionEntry } from 'astro:content';

// Load prompt content from collections - server side only
export async function loadPromptContent(promptId: string): Promise<string | null> {
  try {
    const prompts = await getCollection('prompts');
    const prompt = prompts.find((p: CollectionEntry<'prompts'>) => p.id === promptId);
    if (!prompt) return null;
    const { Content } = await prompt.render();
    return Content;
  } catch (error) {
    console.error(`[loadPromptContent] Error loading prompt ${promptId}:`, error);
    return null;
  }
}

// Combine prompts with content - server side only
export async function loadAndCombinePrompts(systemPrompt: any, addSystemPrompt: boolean = true, addBusinessPrompt: boolean = true): Promise<any[]> {
  const prompts = [];

  // Add initial system prompt
  if (Array.isArray(systemPrompt)) {
    prompts.push(...systemPrompt);
  } else if (systemPrompt) {
    prompts.push({ type: 'text', text: systemPrompt });
  }

  try {
    // Load system prompt if needed
    if (addSystemPrompt) {
      const systemContent = await loadPromptContent('system');
      if (systemContent) {
        prompts.push({ type: 'text', text: systemContent });
      }
    }

    // Load business prompt if needed
    if (addBusinessPrompt) {
      const businessContent = await loadPromptContent('business');
      if (businessContent) {
        prompts.push({ type: 'text', text: businessContent });
      }
    }

    return prompts;
  } catch (error) {
    console.error('[loadAndCombinePrompts] Error combining prompts:', error);
    return prompts;
  }
} 