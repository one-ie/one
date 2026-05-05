export type CompileTarget = 'python' | 'mcp' | 'skill'

export function compile(agent: string, target: CompileTarget): string {
  if (target === 'python') {
    return `# Generated Python agent\n# Install: pip install oneie\n\nfrom oneie.agent import Agent\n\nAGENT_SPEC = """\n${agent}\n"""\n\nagent_instance = Agent.from_spec(AGENT_SPEC)\n`
  }
  if (target === 'mcp') {
    return `// Generated MCP tool\n// Usage: npx @oneie/mcp\n\nexport const agentSpec = \`\n${agent}\n\`;\n`
  }
  return agent
}
