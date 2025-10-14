#!/usr/bin/env node

/**
 * Agent Request Interceptor
 * 
 * Automatically intercepts agent requests and applies load balancing
 * Integrates with Claude Code agent selection to show alternatives
 */

const AgentLoadBalancer = require('./agent-load-balancer');

/**
 * Intercept agent requests and apply load balancing
 */
function interceptAgentRequest(agentName, context = {}) {
  const balancer = new AgentLoadBalancer();
  
  // Track the request and get routing suggestions
  const routing = balancer.handleAgentRequest(agentName);
  
  // If load balanced and we have alternatives, show them to the user
  if (routing.load_balanced && routing.alternatives.length > 0) {
    return {
      proceed: true,
      show_alternatives: true,
      message: routing.message,
      alternatives: routing.alternatives,
      estimated_wait: routing.estimated_wait,
      suggested_alternative: routing.suggested_alternative
    };
  }
  
  return {
    proceed: true,
    show_alternatives: false,
    current_load: routing.current_load
  };
}

/**
 * Get quick load status for dashboard/UI
 */
function getQuickLoadStatus() {
  const balancer = new AgentLoadBalancer();
  return balancer.getLoadStats();
}

module.exports = {
  interceptAgentRequest,
  getQuickLoadStatus
};

// CLI usage
if (require.main === module) {
  const command = process.argv[2];
  const agentName = process.argv[3];
  
  if (command === 'intercept' && agentName) {
    const result = interceptAgentRequest(agentName);
    console.log(JSON.stringify(result, null, 2));
  } else if (command === 'status') {
    const status = getQuickLoadStatus();
    console.log('📊 Quick Load Status:');
    console.log(JSON.stringify(status, null, 2));
  } else {
    console.log('Usage:');
    console.log('  node agent-request-interceptor.js intercept <agent-name>');
    console.log('  node agent-request-interceptor.js status');
  }
}