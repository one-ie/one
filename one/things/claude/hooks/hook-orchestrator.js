#!/usr/bin/env node

/**
 * Advanced Hook Orchestration and Coordination System
 * Manages complex workflows, parallel execution, and hook dependencies
 */

import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import AgentHookManager from './agent-hook-manager.js';
import QualityScoringEngine from './quality-scoring-engine.js';
import { PerformanceMonitor } from './performance-monitoring-hook.js';

class HookOrchestrator extends EventEmitter {
    constructor() {
        super();
        this.agentHookManager = new AgentHookManager();
        this.qualityEngine = new QualityScoringEngine();
        this.performanceMonitor = new PerformanceMonitor();
        
        this.activeExecutions = new Map(); // executionId -> execution context
        this.executionQueue = [];
        this.maxConcurrentExecutions = 3;
        this.executionHistory = [];
        this.dependencies = new Map(); // hookType -> dependencies
        
        this.initializeDependencies();
        this.startExecutionProcessor();
    }

    initializeDependencies() {
        // Define hook execution dependencies
        this.dependencies.set('securityValidation', []);
        this.dependencies.set('storyValidation', ['securityValidation']);
        this.dependencies.set('qualityScoring', ['storyValidation']);
        this.dependencies.set('performanceMonitoring', []);
        this.dependencies.set('notifications', ['qualityScoring', 'performanceMonitoring']);
    }

    startExecutionProcessor() {
        // Process execution queue every 100ms
        setInterval(() => {
            this.processExecutionQueue();
        }, 100);
    }

    async orchestrateAgentWorkflow(agentName, workflowContext = {}) {
        const executionId = this.generateExecutionId();
        const startTime = Date.now();
        
        const execution = {
            id: executionId,
            agentName,
            context: workflowContext,
            status: 'pending',
            startTime,
            endTime: null,
            results: {},
            dependencies: new Map(),
            completedHooks: new Set(),
            failedHooks: new Set(),
            totalDuration: 0
        };

        this.activeExecutions.set(executionId, execution);
        this.emit('executionStarted', { executionId, agentName });

        try {
            // Get hook execution order based on dependencies
            const executionPlan = this.createExecutionPlan(agentName);
            execution.executionPlan = executionPlan;
            
            // Execute hooks according to plan
            const results = await this.executeWorkflowPlan(execution);
            
            execution.status = results.success ? 'completed' : 'failed';
            execution.endTime = Date.now();
            execution.totalDuration = execution.endTime - execution.startTime;
            execution.results = results;

            this.executionHistory.push({
                executionId,
                agentName,
                success: results.success,
                duration: execution.totalDuration,
                timestamp: new Date().toISOString()
            });

            this.emit('executionCompleted', { executionId, agentName, results });
            return results;

        } catch (error) {
            execution.status = 'error';
            execution.endTime = Date.now();
            execution.totalDuration = execution.endTime - execution.startTime;
            execution.error = error.message;

            this.emit('executionError', { executionId, agentName, error });
            throw error;
        } finally {
            this.activeExecutions.delete(executionId);
        }
    }

    createExecutionPlan(agentName) {
        const config = this.agentHookManager.getAgentConfiguration(agentName);
        const enabledHooks = Object.keys(config.hooks).filter(
            hookType => config.hooks[hookType].enabled
        );

        // Create dependency graph
        const dependencyGraph = new Map();
        const inDegree = new Map();

        // Initialize graph
        enabledHooks.forEach(hook => {
            dependencyGraph.set(hook, []);
            inDegree.set(hook, 0);
        });

        // Build dependency edges
        enabledHooks.forEach(hook => {
            const deps = this.dependencies.get(hook) || [];
            deps.forEach(dep => {
                if (enabledHooks.includes(dep)) {
                    dependencyGraph.get(dep).push(hook);
                    inDegree.set(hook, inDegree.get(hook) + 1);
                }
            });
        });

        // Topological sort to determine execution order
        const executionOrder = [];
        const queue = [];

        // Find hooks with no dependencies
        inDegree.forEach((degree, hook) => {
            if (degree === 0) {
                queue.push(hook);
            }
        });

        while (queue.length > 0) {
            const currentHook = queue.shift();
            executionOrder.push(currentHook);

            // Update dependent hooks
            dependencyGraph.get(currentHook).forEach(dependentHook => {
                inDegree.set(dependentHook, inDegree.get(dependentHook) - 1);
                if (inDegree.get(dependentHook) === 0) {
                    queue.push(dependentHook);
                }
            });
        }

        // Check for circular dependencies
        if (executionOrder.length !== enabledHooks.length) {
            throw new Error(`Circular dependency detected in hooks for agent ${agentName}`);
        }

        return {
            hooks: executionOrder,
            parallelGroups: this.identifyParallelGroups(executionOrder, dependencyGraph),
            estimatedDuration: this.estimateExecutionDuration(agentName, executionOrder)
        };
    }

    identifyParallelGroups(executionOrder, dependencyGraph) {
        const parallelGroups = [];
        let currentGroup = [];
        const processed = new Set();

        for (const hook of executionOrder) {
            const deps = this.dependencies.get(hook) || [];
            const hasUnmetDependencies = deps.some(dep => !processed.has(dep));

            if (!hasUnmetDependencies && currentGroup.length === 0) {
                currentGroup.push(hook);
            } else if (!hasUnmetDependencies) {
                // Can run in parallel with current group
                currentGroup.push(hook);
            } else {
                // Start new group
                if (currentGroup.length > 0) {
                    parallelGroups.push([...currentGroup]);
                    currentGroup.forEach(h => processed.add(h));
                    currentGroup = [];
                }
                currentGroup.push(hook);
            }
        }

        if (currentGroup.length > 0) {
            parallelGroups.push(currentGroup);
        }

        return parallelGroups;
    }

    estimateExecutionDuration(agentName, hooks) {
        const baseDurations = {
            'securityValidation': 200,
            'storyValidation': 1500,
            'qualityScoring': 800,
            'performanceMonitoring': 100,
            'notifications': 300
        };

        let totalEstimate = 0;
        hooks.forEach(hook => {
            totalEstimate += baseDurations[hook] || 500;
        });

        return totalEstimate;
    }

    async executeWorkflowPlan(execution) {
        const { agentName, context, executionPlan } = execution;
        const results = {
            executionId: execution.id,
            agentName,
            success: true,
            hookResults: {},
            parallelGroupResults: [],
            totalDuration: 0,
            errors: []
        };

        const startTime = Date.now();

        try {
            // Execute hooks in parallel groups
            for (let i = 0; i < executionPlan.parallelGroups.length; i++) {
                const group = executionPlan.parallelGroups[i];
                const groupResults = await this.executeParallelGroup(agentName, group, context);
                
                results.parallelGroupResults.push({
                    groupIndex: i,
                    hooks: group,
                    results: groupResults,
                    success: groupResults.every(r => r.success)
                });

                // Update execution tracking
                group.forEach(hook => {
                    const hookResult = groupResults.find(r => r.hookType === hook);
                    if (hookResult) {
                        results.hookResults[hook] = hookResult;
                        if (hookResult.success) {
                            execution.completedHooks.add(hook);
                        } else {
                            execution.failedHooks.add(hook);
                            results.errors.push(`${hook}: ${hookResult.error || hookResult.message}`);
                        }
                    }
                });

                // Check if we should continue after failures
                const groupSuccess = results.parallelGroupResults[i].success;
                if (!groupSuccess) {
                    const criticalFailures = groupResults.filter(r => !r.success && r.blocking);
                    if (criticalFailures.length > 0) {
                        results.success = false;
                        this.emit('executionBlocked', { 
                            executionId: execution.id, 
                            agentName, 
                            blockingHooks: criticalFailures.map(f => f.hookType)
                        });
                        break;
                    }
                }
            }

            results.totalDuration = Date.now() - startTime;
            
            // Update performance metrics
            this.performanceMonitor.recordAgentMetrics(agentName, {
                responseTime: results.totalDuration,
                error: !results.success,
                qualityScore: results.hookResults.qualityScoring?.score,
                delegated: context.delegated || false
            });

            return results;

        } catch (error) {
            results.success = false;
            results.error = error.message;
            results.totalDuration = Date.now() - startTime;
            results.errors.push(`Execution error: ${error.message}`);
            
            throw error;
        }
    }

    async executeParallelGroup(agentName, hooks, context) {
        const promises = hooks.map(async (hookType) => {
            const hookStartTime = Date.now();
            
            try {
                const result = await this.executeHook(agentName, hookType, context);
                return {
                    hookType,
                    success: true,
                    result,
                    duration: Date.now() - hookStartTime,
                    blocking: result.blocking || false
                };
            } catch (error) {
                return {
                    hookType,
                    success: false,
                    error: error.message,
                    duration: Date.now() - hookStartTime,
                    blocking: true
                };
            }
        });

        return await Promise.all(promises);
    }

    async executeHook(agentName, hookType, context) {
        const config = this.agentHookManager.getHookConfiguration(agentName, hookType);
        
        // Route to appropriate hook implementation
        switch (hookType) {
            case 'securityValidation':
                return await this.executeSecurityValidation(agentName, config, context);
            case 'storyValidation':
                return await this.executeStoryValidation(agentName, config, context);
            case 'qualityScoring':
                return await this.executeQualityScoring(agentName, config, context);
            case 'performanceMonitoring':
                return await this.executePerformanceMonitoring(agentName, config, context);
            case 'notifications':
                return await this.executeNotifications(agentName, config, context);
            default:
                throw new Error(`Unknown hook type: ${hookType}`);
        }
    }

    async executeSecurityValidation(agentName, config, context) {
        // Tool validation
        if (context.toolRequested) {
            const validation = this.agentHookManager.validateToolUsage(agentName, context.toolRequested);
            if (!validation.allowed) {
                return {
                    success: false,
                    message: validation.reason,
                    blocking: true,
                    allowedTools: validation.allowedTools
                };
            }
        }

        // Path validation
        if (context.filePath) {
            const sensitivePatterns = [
                /.*\/secrets\/.*/,
                /.*\.env.*/,
                /.*\/credentials\/.*/,
                /.*private.*key.*/
            ];

            const isSensitive = sensitivePatterns.some(pattern => pattern.test(context.filePath));
            if (isSensitive && !config.allowSensitiveFiles) {
                return {
                    success: false,
                    message: `Access to sensitive file blocked: ${context.filePath}`,
                    blocking: true
                };
            }
        }

        return {
            success: true,
            message: 'Security validation passed',
            blocking: false
        };
    }

    async executeStoryValidation(agentName, config, context) {
        if (!context.storyContent) {
            return {
                success: true,
                message: 'No story content to validate',
                blocking: false
            };
        }

        // Simulate story validation with R.O.C.K.E.T. framework
        const score = this.calculateStoryScore(context.storyContent, agentName);
        const threshold = config.qualityThreshold || 7.0;

        return {
            success: score >= threshold,
            message: `Story validation ${score >= threshold ? 'passed' : 'failed'}: ${score}/${threshold}`,
            score,
            threshold,
            blocking: score < 5.0 // Block if critically poor
        };
    }

    async executeQualityScoring(agentName, config, context) {
        if (!context.content) {
            return {
                success: true,
                message: 'No content to score',
                score: 0,
                blocking: false
            };
        }

        try {
            const contentType = context.contentType || 'general';
            const scoreResult = await this.qualityEngine.scoreOutput(context.content, {
                agentType: agentName,
                contentType
            });

            const threshold = config.qualityThreshold || 7.0;
            
            return {
                success: scoreResult.adjustedScore >= threshold,
                message: `Quality score: ${scoreResult.adjustedScore.toFixed(1)}/${threshold}`,
                score: scoreResult.adjustedScore,
                threshold,
                qualityBand: scoreResult.qualityBand,
                blocking: scoreResult.adjustedScore < 5.0
            };
        } catch (error) {
            return {
                success: false,
                message: `Quality scoring failed: ${error.message}`,
                blocking: false
            };
        }
    }

    async executePerformanceMonitoring(agentName, config, context) {
        const responseTime = context.responseTime || Date.now() - (context.startTime || Date.now());
        const threshold = config.responseTimeThreshold || 2000;

        // Record metrics
        this.performanceMonitor.recordAgentMetrics(agentName, {
            responseTime,
            error: context.hasError || false,
            qualityScore: context.qualityScore,
            toolUsed: context.toolUsed,
            delegated: context.delegated
        });

        return {
            success: responseTime <= threshold,
            message: `Performance: ${responseTime}ms (threshold: ${threshold}ms)`,
            responseTime,
            threshold,
            blocking: false
        };
    }

    async executeNotifications(agentName, config, context) {
        const channels = config.channels || ['console'];
        
        if (context.notifications && context.notifications.length > 0) {
            for (const notification of context.notifications) {
                if (channels.includes('console')) {
                    console.log(`[${agentName.toUpperCase()}] ${notification.message}`);
                }
                
                if (channels.includes('file')) {
                    const logPath = path.join(__dirname, 'notifications.log');
                    const timestamp = new Date().toISOString();
                    const logEntry = `[${timestamp}] [${agentName}] ${notification.message}\n`;
                    fs.appendFileSync(logPath, logEntry);
                }
            }
        }

        return {
            success: true,
            message: `Notifications sent via: ${channels.join(', ')}`,
            blocking: false
        };
    }

    calculateStoryScore(content, agentName) {
        let score = 7.0; // Base score

        // Check for user story format
        if (/\*\*As a\*\*.*\*\*I want\*\*.*\*\*so that\*\*/i.test(content)) {
            score += 1.0;
        } else {
            score -= 1.5;
        }

        // Check for acceptance criteria
        if (/acceptance criteria/i.test(content) && /\d+\./g.test(content)) {
            score += 0.5;
        } else {
            score -= 1.0;
        }

        // Check for tasks/subtasks
        if (/- \[ \]/g.test(content)) {
            score += 0.5;
        } else {
            score -= 0.5;
        }

        // Agent-specific scoring adjustments
        const agentConfig = this.agentHookManager.getAgentConfiguration(agentName);
        if (agentConfig.specialization === 'technical-leadership' && /architecture|technical/i.test(content)) {
            score += 0.5;
        }

        if (agentConfig.specialization === 'strategic-marketing' && /strategy|marketing|campaign/i.test(content)) {
            score += 0.5;
        }

        return Math.max(0, Math.min(10, score));
    }

    processExecutionQueue() {
        // Process queued executions if we have capacity
        while (this.executionQueue.length > 0 && this.activeExecutions.size < this.maxConcurrentExecutions) {
            const queuedExecution = this.executionQueue.shift();
            this.orchestrateAgentWorkflow(queuedExecution.agentName, queuedExecution.context)
                .then(queuedExecution.resolve)
                .catch(queuedExecution.reject);
        }
    }

    async queueExecution(agentName, context = {}) {
        return new Promise((resolve, reject) => {
            this.executionQueue.push({
                agentName,
                context,
                resolve,
                reject,
                queuedAt: Date.now()
            });
        });
    }

    generateExecutionId() {
        return `exec_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }

    getExecutionStatus(executionId) {
        const execution = this.activeExecutions.get(executionId);
        if (!execution) {
            return null;
        }

        return {
            id: execution.id,
            agentName: execution.agentName,
            status: execution.status,
            progress: {
                completed: execution.completedHooks.size,
                failed: execution.failedHooks.size,
                total: execution.executionPlan?.hooks.length || 0
            },
            duration: execution.endTime ? 
                      execution.totalDuration : 
                      Date.now() - execution.startTime
        };
    }

    getSystemMetrics() {
        return {
            activeExecutions: this.activeExecutions.size,
            queuedExecutions: this.executionQueue.length,
            maxConcurrentExecutions: this.maxConcurrentExecutions,
            totalExecutionsCompleted: this.executionHistory.length,
            averageExecutionTime: this.executionHistory.length > 0 ?
                this.executionHistory.reduce((sum, exec) => sum + exec.duration, 0) / this.executionHistory.length :
                0,
            successRate: this.executionHistory.length > 0 ?
                this.executionHistory.filter(exec => exec.success).length / this.executionHistory.length :
                0
        };
    }

    emergencyStop() {
        // Cancel all active executions
        this.activeExecutions.forEach((execution, executionId) => {
            execution.status = 'cancelled';
            execution.endTime = Date.now();
            execution.totalDuration = execution.endTime - execution.startTime;
            this.emit('executionCancelled', { executionId, agentName: execution.agentName });
        });

        this.activeExecutions.clear();
        this.executionQueue.length = 0;
        
        this.emit('emergencyStop', { timestamp: new Date().toISOString() });
    }
}

// CLI interface
async function main() {
    const orchestrator = new HookOrchestrator();
    const command = process.argv[2];

    switch (command) {
        case 'execute':
            const agentName = process.argv[3];
            const contextStr = process.argv[4] || '{}';
            
            if (!agentName) {
                console.error('Agent name required');
                process.exit(1);
            }

            try {
                const context = JSON.parse(contextStr);
                const results = await orchestrator.orchestrateAgentWorkflow(agentName, context);
                console.log(JSON.stringify(results, null, 2));
            } catch (error) {
                console.error('Execution failed:', error.message);
                process.exit(1);
            }
            break;

        case 'status':
            const executionId = process.argv[3];
            if (executionId) {
                const status = orchestrator.getExecutionStatus(executionId);
                console.log(JSON.stringify(status, null, 2));
            } else {
                const metrics = orchestrator.getSystemMetrics();
                console.log(JSON.stringify(metrics, null, 2));
            }
            break;

        case 'metrics':
            const systemMetrics = orchestrator.getSystemMetrics();
            console.log(JSON.stringify(systemMetrics, null, 2));
            break;

        default:
            console.log('Usage: hook-orchestrator.js <command> [args...]');
            console.log('Commands:');
            console.log('  execute <agent-name> [context-json]  - Execute workflow for agent');
            console.log('  status [execution-id]                - Get execution status or system metrics');
            console.log('  metrics                              - Get system performance metrics');
            process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
}

export default HookOrchestrator;