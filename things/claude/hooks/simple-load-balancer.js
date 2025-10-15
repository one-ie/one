/**
 * Simple Agent Load Balancer
 * Detects high agent usage and suggests alternatives
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

class SimpleLoadBalancer {
  constructor() {
    this.configPath = path.join(process.cwd(), 'one/config/agent-routing.yaml');
    this.agentUsage = new Map(); // Track agent usage
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const configFile = fs.readFileSync(this.configPath, 'utf8');
      return yaml.load(configFile);
    } catch (error) {
      console.log('⚠️ No agent routing config found, using defaults');
      return this.getDefaultConfig();
    }
  }

  getDefaultConfig() {
    return {
      routing_config: {
        enabled: true,
        load_threshold: 70
      },
      agent_alternatives: {},
      load_balancing_rules: {
        auto_suggest_threshold: 70,
        max_queue_time_minutes: 10
      }
    };
  }

  /**
   * Check if agent is busy and return routing suggestions
   */
  checkAgentLoad(agentName) {
    if (!this.config.routing_config.enabled) {
      return { busy: false, suggestions: [] };
    }

    const usage = this.getAgentUsage(agentName);
    const threshold = this.config.routing_config.load_threshold;

    if (usage >= threshold) {
      return {
        busy: true,
        usage: usage,
        waitTime: this.estimateWaitTime(agentName),
        suggestions: this.getAlternatives(agentName)
      };
    }

    return { busy: false, suggestions: [] };
  }

  /**
   * Get current agent usage (simplified simulation)
   */
  getAgentUsage(agentName) {
    const currentTime = Date.now();
    const usage = this.agentUsage.get(agentName) || { requests: 0, lastRequest: 0 };
    
    // Simulate load based on recent requests
    const timeSinceLastRequest = currentTime - usage.lastRequest;
    const minutesSinceLastRequest = timeSinceLastRequest / (1000 * 60);
    
    // High-demand agents get higher simulated load
    const isHighDemand = this.config.usage_patterns?.high_demand_agents?.includes(agentName);
    const baseLoad = isHighDemand ? 60 : 20;
    
    // Decay usage over time
    const decayedLoad = Math.max(0, baseLoad - (minutesSinceLastRequest * 10));
    
    // Add some randomization for realism
    const randomFactor = Math.random() * 20;
    
    return Math.min(100, decayedLoad + randomFactor);
  }

  /**
   * Record agent usage
   */
  recordAgentUsage(agentName) {
    const currentTime = Date.now();
    const usage = this.agentUsage.get(agentName) || { requests: 0, lastRequest: 0 };
    
    this.agentUsage.set(agentName, {
      requests: usage.requests + 1,
      lastRequest: currentTime
    });
  }

  /**
   * Estimate wait time for busy agent
   */
  estimateWaitTime(agentName) {
    const usage = this.getAgentUsage(agentName);
    const maxWaitTime = this.config.load_balancing_rules.max_queue_time_minutes || 10;
    
    // Simple estimation: higher usage = longer wait
    const waitTimeMinutes = Math.round((usage / 100) * maxWaitTime);
    return Math.max(1, waitTimeMinutes);
  }

  /**
   * Get alternative agents for the given agent
   */
  getAlternatives(agentName) {
    const agentConfig = this.config.agent_alternatives[agentName];
    if (!agentConfig) {
      return [];
    }

    return agentConfig.alternatives.map(alt => ({
      agent: alt.agent,
      description: alt.description,
      capabilityMatch: alt.capability_match,
      waitTimeReduction: alt.wait_time_reduction,
      available: this.getAgentUsage(alt.agent) < 50 // Available if under 50% load
    }));
  }

  /**
   * Format routing suggestion message
   */
  formatRoutingMessage(agentName, loadInfo) {
    if (!loadInfo.busy) {
      return null;
    }

    const template = this.config.routing_messages?.busy_primary || 
      "🔄 {agent} is busy (current wait: {wait_time}min). Try these alternatives:";
    
    let message = template
      .replace('{agent}', agentName)
      .replace('{wait_time}', loadInfo.waitTime);

    if (loadInfo.suggestions.length > 0) {
      message += '\n';
      loadInfo.suggestions.forEach((suggestion, index) => {
        const availableIndicator = suggestion.available ? '🟢' : '🟡';
        message += `\n${index + 1}. ${availableIndicator} **${suggestion.agent}** - ${suggestion.description} (${suggestion.capabilityMatch}% match)`;
      });
      
      message += '\n\n💡 *Alternatives can reduce your wait time by up to 75%*';
    }

    return message;
  }

  /**
   * Get routing recommendation for user
   */
  getRoutingRecommendation(requestedAgent) {
    // Record usage
    this.recordAgentUsage(requestedAgent);
    
    // Check load
    const loadInfo = this.checkAgentLoad(requestedAgent);
    
    if (!loadInfo.busy) {
      return {
        status: 'available',
        agent: requestedAgent,
        message: `✅ ${requestedAgent} is available now!`
      };
    }

    return {
      status: 'busy',
      agent: requestedAgent,
      waitTime: loadInfo.waitTime,
      alternatives: loadInfo.suggestions,
      message: this.formatRoutingMessage(requestedAgent, loadInfo)
    };
  }

  /**
   * Get best alternative for a busy agent
   */
  getBestAlternative(requestedAgent) {
    const alternatives = this.getAlternatives(requestedAgent);
    if (alternatives.length === 0) {
      return null;
    }

    // Sort by availability first, then capability match
    const sortedAlternatives = alternatives.sort((a, b) => {
      if (a.available && !b.available) return -1;
      if (!a.available && b.available) return 1;
      return b.capabilityMatch - a.capabilityMatch;
    });

    return sortedAlternatives[0];
  }
}

// Export singleton instance
export const loadBalancer = new SimpleLoadBalancer();

/**
 * Hook function called when agent is requested
 */
export function checkAgentAvailability(agentName) {
  return loadBalancer.getRoutingRecommendation(agentName);
}

/**
 * Hook function to get routing suggestions
 */
export function getRoutingSuggestions(agentName) {
  const loadInfo = loadBalancer.checkAgentLoad(agentName);
  if (loadInfo.busy && loadInfo.suggestions.length > 0) {
    return {
      primary: agentName,
      waitTime: loadInfo.waitTime,
      alternatives: loadInfo.suggestions.filter(s => s.available)
    };
  }
  return null;
}

// CLI interface for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const testAgent = process.argv[2] || 'marketing-director';
  console.log('🧪 Testing load balancer for:', testAgent);
  
  const recommendation = loadBalancer.getRoutingRecommendation(testAgent);
  console.log('\n📊 Result:', recommendation);
}