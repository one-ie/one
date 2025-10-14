/**
 * Continuous Improvement Monitor Hook
 * 
 * This hook monitors all system interactions and feeds learning data to the Improver agent
 * for continuous system enhancement while maintaining stability.
 */

const fs = require('fs');
const path = require('path');

class ContinuousImprovementMonitor {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'one', 'data', 'improvement-analytics');
    this.ensureDataDirectory();
    
    this.metrics = {
      missions: new Map(),
      stories: new Map(),
      tasks: new Map(),
      agents: new Map(),
      qualityScores: [],
      userInteractions: [],
      systemPerformance: []
    };
  }

  ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Monitor mission execution and outcomes
   */
  trackMissionExecution(missionData) {
    const missionId = missionData.id || `mission_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const missionMetrics = {
      id: missionId,
      timestamp,
      objective: missionData.objective,
      qualityScore: missionData.qualityScore || 0,
      completionTime: missionData.completionTime || 0,
      storyCount: missionData.stories?.length || 0,
      successRate: missionData.successRate || 0,
      stakeholderSatisfaction: missionData.stakeholderSatisfaction || 0,
      resourceUtilization: missionData.resourceUtilization || 0
    };

    this.metrics.missions.set(missionId, missionMetrics);
    this.saveMetricsToFile('missions', missionMetrics);
    this.analyzeForImprovements('mission', missionMetrics);
  }

  /**
   * Monitor story creation and effectiveness
   */
  trackStoryExecution(storyData) {
    const storyId = storyData.id || `story_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const storyMetrics = {
      id: storyId,
      timestamp,
      narrative: storyData.narrative,
      qualityScore: storyData.qualityScore || 0,
      technicalPrecision: storyData.technicalPrecision || 0,
      userEngagement: storyData.userEngagement || 0,
      implementationClarity: storyData.implementationClarity || 0,
      taskCount: storyData.tasks?.length || 0,
      completionTime: storyData.completionTime || 0
    };

    this.metrics.stories.set(storyId, storyMetrics);
    this.saveMetricsToFile('stories', storyMetrics);
    this.analyzeForImprovements('story', storyMetrics);
  }

  /**
   * Monitor task execution patterns
   */
  trackTaskExecution(taskData) {
    const taskId = taskData.id || `task_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const taskMetrics = {
      id: taskId,
      timestamp,
      scope: taskData.scope,
      assignedAgent: taskData.assignedAgent,
      qualityScore: taskData.qualityScore || 0,
      completionTime: taskData.completionTime || 0,
      dependencies: taskData.dependencies || [],
      coordinationEfficiency: taskData.coordinationEfficiency || 0,
      resourceUsage: taskData.resourceUsage || 0
    };

    this.metrics.tasks.set(taskId, taskMetrics);
    this.saveMetricsToFile('tasks', taskMetrics);
    this.analyzeForImprovements('task', taskMetrics);
  }

  /**
   * Monitor agent performance and collaboration
   */
  trackAgentPerformance(agentData) {
    const agentId = agentData.name || agentData.id;
    const timestamp = new Date().toISOString();

    const existing = this.metrics.agents.get(agentId) || {
      interactions: [],
      averageQuality: 0,
      successRate: 0,
      collaborationScore: 0
    };

    const agentMetrics = {
      ...existing,
      lastInteraction: timestamp,
      interactions: [...existing.interactions, {
        timestamp,
        taskType: agentData.taskType,
        qualityScore: agentData.qualityScore || 0,
        completionTime: agentData.completionTime || 0,
        collaboratingAgents: agentData.collaboratingAgents || [],
        userSatisfaction: agentData.userSatisfaction || 0
      }]
    };

    // Calculate rolling averages
    const recentInteractions = agentMetrics.interactions.slice(-10);
    agentMetrics.averageQuality = recentInteractions.reduce((sum, i) => sum + i.qualityScore, 0) / recentInteractions.length;
    agentMetrics.successRate = recentInteractions.filter(i => i.qualityScore >= 4.0).length / recentInteractions.length;

    this.metrics.agents.set(agentId, agentMetrics);
    this.saveMetricsToFile('agents', agentMetrics);
    this.analyzeForImprovements('agent', agentMetrics);
  }

  /**
   * Track user interactions and satisfaction
   */
  trackUserInteraction(interactionData) {
    const timestamp = new Date().toISOString();

    const userMetrics = {
      timestamp,
      action: interactionData.action,
      commandUsed: interactionData.commandUsed,
      completionTime: interactionData.completionTime || 0,
      satisfactionScore: interactionData.satisfactionScore || 0,
      errorOccurred: interactionData.errorOccurred || false,
      context: interactionData.context || {}
    };

    this.metrics.userInteractions.push(userMetrics);
    this.saveMetricsToFile('user-interactions', userMetrics);
    this.analyzeForImprovements('user-interaction', userMetrics);
  }

  /**
   * Monitor system performance metrics
   */
  trackSystemPerformance(performanceData) {
    const timestamp = new Date().toISOString();

    const perfMetrics = {
      timestamp,
      cpuUsage: performanceData.cpuUsage || 0,
      memoryUsage: performanceData.memoryUsage || 0,
      responseTime: performanceData.responseTime || 0,
      errorRate: performanceData.errorRate || 0,
      activeAgents: performanceData.activeAgents || 0,
      concurrent_operations: performanceData.concurrentOperations || 0
    };

    this.metrics.systemPerformance.push(perfMetrics);
    this.saveMetricsToFile('system-performance', perfMetrics);
    this.analyzeForImprovements('system', perfMetrics);
  }

  /**
   * Analyze metrics for improvement opportunities
   */
  analyzeForImprovements(type, data) {
    const improvementOpportunities = [];

    switch (type) {
      case 'mission':
        if (data.qualityScore < 4.0) {
          improvementOpportunities.push({
            type: 'quality_improvement',
            area: 'mission_planning',
            issue: 'Low quality score',
            suggestion: 'Enhance mission objective definition template'
          });
        }
        if (data.completionTime > this.getAverageCompletionTime('missions')) {
          improvementOpportunities.push({
            type: 'efficiency_improvement',
            area: 'mission_execution',
            issue: 'Above average completion time',
            suggestion: 'Optimize mission workflow coordination'
          });
        }
        break;

      case 'story':
        if (data.technicalPrecision < 4.0) {
          improvementOpportunities.push({
            type: 'quality_improvement',
            area: 'story_technical_precision',
            issue: 'Low technical precision score',
            suggestion: 'Enhance technical specification framework'
          });
        }
        break;

      case 'task':
        if (data.coordinationEfficiency < 0.8) {
          improvementOpportunities.push({
            type: 'workflow_improvement',
            area: 'task_coordination',
            issue: 'Low coordination efficiency',
            suggestion: 'Improve inter-agent communication patterns'
          });
        }
        break;

      case 'agent':
        if (data.averageQuality < 4.0) {
          improvementOpportunities.push({
            type: 'agent_improvement',
            area: 'agent_performance',
            issue: 'Below average quality performance',
            suggestion: 'Provide additional training or context enhancement'
          });
        }
        break;

      case 'user-interaction':
        if (data.completionTime > this.getAverageUserActionTime()) {
          improvementOpportunities.push({
            type: 'ux_improvement',
            area: 'user_interface',
            issue: 'Above average interaction time',
            suggestion: 'Streamline command interface or add shortcuts'
          });
        }
        break;
    }

    if (improvementOpportunities.length > 0) {
      this.queueImprovements(improvementOpportunities);
    }
  }

  /**
   * Queue improvement suggestions for the Improver agent
   */
  queueImprovements(opportunities) {
    const improvementQueue = path.join(this.dataDir, 'improvement-queue.json');
    
    let existingQueue = [];
    if (fs.existsSync(improvementQueue)) {
      try {
        existingQueue = JSON.parse(fs.readFileSync(improvementQueue, 'utf8'));
      } catch (error) {
        console.warn('Failed to read improvement queue:', error.message);
      }
    }

    const newOpportunities = opportunities.map(opp => ({
      ...opp,
      timestamp: new Date().toISOString(),
      priority: this.calculatePriority(opp),
      status: 'pending'
    }));

    existingQueue.push(...newOpportunities);
    
    // Keep only top 50 pending improvements to avoid queue overflow
    const pendingImprovements = existingQueue
      .filter(item => item.status === 'pending')
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 50);

    const completedImprovements = existingQueue
      .filter(item => item.status !== 'pending')
      .slice(-100); // Keep last 100 completed for learning

    fs.writeFileSync(improvementQueue, JSON.stringify([...pendingImprovements, ...completedImprovements], null, 2));
  }

  /**
   * Calculate improvement priority based on impact and frequency
   */
  calculatePriority(opportunity) {
    let priority = 5; // Base priority

    // Increase priority for quality issues
    if (opportunity.type === 'quality_improvement') {
      priority += 3;
    }

    // Increase priority for user experience issues
    if (opportunity.type === 'ux_improvement') {
      priority += 2;
    }

    // Increase priority for system-wide issues
    if (opportunity.area.includes('system')) {
      priority += 2;
    }

    return Math.min(priority, 10); // Cap at 10
  }

  /**
   * Save metrics to persistent storage
   */
  saveMetricsToFile(type, data) {
    const filePath = path.join(this.dataDir, `${type}-${new Date().toISOString().split('T')[0]}.json`);
    
    let existingData = [];
    if (fs.existsSync(filePath)) {
      try {
        existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (error) {
        console.warn(`Failed to read existing ${type} data:`, error.message);
      }
    }

    existingData.push(data);
    
    // Keep only last 1000 entries per file to manage size
    if (existingData.length > 1000) {
      existingData = existingData.slice(-1000);
    }

    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
  }

  /**
   * Generate improvement insights report
   */
  generateImprovementReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalMissions: this.metrics.missions.size,
        totalStories: this.metrics.stories.size,
        totalTasks: this.metrics.tasks.size,
        activeAgents: this.metrics.agents.size,
        averageQuality: this.calculateAverageQuality(),
        systemHealth: this.calculateSystemHealth()
      },
      improvements: {
        implemented: this.getImplementedImprovements(),
        pending: this.getPendingImprovements(),
        recommendations: this.generateRecommendations()
      }
    };

    const reportPath = path.join(this.dataDir, `improvement-report-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    return report;
  }

  /**
   * Utility methods for calculations
   */
  getAverageCompletionTime(type) {
    const items = Array.from(this.metrics[type].values());
    if (items.length === 0) return 0;
    return items.reduce((sum, item) => sum + (item.completionTime || 0), 0) / items.length;
  }

  getAverageUserActionTime() {
    if (this.metrics.userInteractions.length === 0) return 0;
    return this.metrics.userInteractions.reduce((sum, item) => sum + item.completionTime, 0) / this.metrics.userInteractions.length;
  }

  calculateAverageQuality() {
    const allQualityScores = [];
    
    this.metrics.missions.forEach(mission => allQualityScores.push(mission.qualityScore));
    this.metrics.stories.forEach(story => allQualityScores.push(story.qualityScore));
    this.metrics.tasks.forEach(task => allQualityScores.push(task.qualityScore));

    if (allQualityScores.length === 0) return 0;
    return allQualityScores.reduce((sum, score) => sum + score, 0) / allQualityScores.length;
  }

  calculateSystemHealth() {
    const recent = this.metrics.systemPerformance.slice(-10);
    if (recent.length === 0) return 100;

    const avgCpu = recent.reduce((sum, p) => sum + p.cpuUsage, 0) / recent.length;
    const avgMemory = recent.reduce((sum, p) => sum + p.memoryUsage, 0) / recent.length;
    const avgErrorRate = recent.reduce((sum, p) => sum + p.errorRate, 0) / recent.length;

    // Simple health calculation (0-100)
    const health = 100 - (avgCpu * 0.3) - (avgMemory * 0.3) - (avgErrorRate * 0.4);
    return Math.max(0, Math.min(100, health));
  }

  getImplementedImprovements() {
    const queuePath = path.join(this.dataDir, 'improvement-queue.json');
    if (!fs.existsSync(queuePath)) return [];

    try {
      const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
      return queue.filter(item => item.status === 'implemented');
    } catch (error) {
      return [];
    }
  }

  getPendingImprovements() {
    const queuePath = path.join(this.dataDir, 'improvement-queue.json');
    if (!fs.existsSync(queuePath)) return [];

    try {
      const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
      return queue.filter(item => item.status === 'pending');
    } catch (error) {
      return [];
    }
  }

  generateRecommendations() {
    return [
      'Continue monitoring quality scores and implement targeted improvements for sub-4.0 performance',
      'Focus on optimizing frequently used workflows to reduce user completion times',
      'Enhance agent coordination patterns based on successful collaboration examples',
      'Implement predictive analytics for proactive system optimization'
    ];
  }
}

/**
 * Hook implementation
 */
const monitor = new ContinuousImprovementMonitor();

// Export hook functions
module.exports = {
  onFileChange: (filePath) => {
    // Track file modification patterns for improvement opportunities
    monitor.trackUserInteraction({
      action: 'file_modification',
      context: { filePath },
      timestamp: new Date().toISOString()
    });
  },

  onCommandRun: (command, result) => {
    // Track command usage patterns
    monitor.trackUserInteraction({
      action: 'command_execution',
      commandUsed: command,
      completionTime: result?.executionTime || 0,
      errorOccurred: result?.error ? true : false,
      satisfactionScore: result?.error ? 2 : 4 // Simple heuristic
    });
  },

  onAgentInvocation: (agentName, taskData) => {
    // Track agent performance
    monitor.trackAgentPerformance({
      name: agentName,
      taskType: taskData.type,
      qualityScore: taskData.qualityScore || 4,
      completionTime: taskData.completionTime || 0,
      collaboratingAgents: taskData.collaboratingAgents || []
    });
  },

  onMissionComplete: (missionData) => {
    monitor.trackMissionExecution(missionData);
  },

  onStoryComplete: (storyData) => {
    monitor.trackStoryExecution(storyData);
  },

  onTaskComplete: (taskData) => {
    monitor.trackTaskExecution(taskData);
  },

  generateReport: () => {
    return monitor.generateImprovementReport();
  },

  // Utility function for external access to metrics
  getMetrics: () => {
    return {
      missions: Array.from(monitor.metrics.missions.entries()),
      stories: Array.from(monitor.metrics.stories.entries()),
      tasks: Array.from(monitor.metrics.tasks.entries()),
      agents: Array.from(monitor.metrics.agents.entries()),
      userInteractions: monitor.metrics.userInteractions.slice(-100),
      systemPerformance: monitor.metrics.systemPerformance.slice(-100)
    };
  }
};