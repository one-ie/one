#!/usr/bin/env node

/**
 * Agent Hook Configuration Manager
 * Manages agent-specific hook configurations and coordinates hook execution
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AgentHookManager {
    constructor() {
        this.configPath = path.join(__dirname, 'agent-hook-config.json');
        this.config = null;
        this.loadConfiguration();
    }

    loadConfiguration() {
        try {
            if (fs.existsSync(this.configPath)) {
                const configContent = fs.readFileSync(this.configPath, 'utf8');
                this.config = JSON.parse(configContent);
            } else {
                console.warn('Agent hook configuration file not found, using defaults');
                this.config = this.getDefaultConfiguration();
            }
        } catch (error) {
            console.error('Error loading agent hook configuration:', error);
            this.config = this.getDefaultConfiguration();
        }
    }

    getDefaultConfiguration() {
        return {
            version: "1.0",
            globalDefaults: {
                enableStoryValidation: true,
                enableSecurityValidation: true,
                enablePerformanceMonitoring: true,
                enableQualityScoring: true,
                qualityThreshold: 7.0,
                performanceThreshold: 2000,
                enableNotifications: true
            },
            agentConfigurations: {},
            hookExecutionOrder: [
                "securityValidation",
                "storyValidation", 
                "qualityScoring",
                "performanceMonitoring",
                "notifications"
            ]
        };
    }

    getAgentConfiguration(agentName) {
        if (!this.config) {
            this.loadConfiguration();
        }

        // Get agent-specific configuration or fall back to defaults
        const agentConfig = this.config.agentConfigurations[agentName];
        
        if (!agentConfig) {
            console.warn(`No configuration found for agent: ${agentName}, using defaults`);
            return this.createDefaultAgentConfig(agentName);
        }

        // Merge with global defaults
        return this.mergeWithDefaults(agentConfig);
    }

    createDefaultAgentConfig(agentName) {
        const teamPrefix = this.extractTeamPrefix(agentName);
        
        return {
            displayName: this.formatDisplayName(agentName),
            teamPrefix: teamPrefix,
            specialization: "general",
            hooks: {
                storyValidation: {
                    enabled: this.config.globalDefaults.enableStoryValidation,
                    qualityThreshold: this.config.globalDefaults.qualityThreshold
                },
                securityValidation: {
                    enabled: this.config.globalDefaults.enableSecurityValidation,
                    allowedTools: this.getDefaultToolsForTeam(teamPrefix),
                    enforceToolRestrictions: true
                },
                performanceMonitoring: {
                    enabled: this.config.globalDefaults.enablePerformanceMonitoring,
                    responseTimeThreshold: this.config.globalDefaults.performanceThreshold
                },
                qualityScoring: {
                    enabled: this.config.globalDefaults.enableQualityScoring,
                    qualityThreshold: this.config.globalDefaults.qualityThreshold
                },
                notifications: {
                    enabled: this.config.globalDefaults.enableNotifications,
                    channels: ["console", "file"]
                }
            }
        };
    }

    extractTeamPrefix(agentName) {
        const prefixes = ['marketing', 'engineering', 'research', 'content', 'crypto', 'service', 'sales', 'company', 'framework'];
        
        for (const prefix of prefixes) {
            if (agentName.startsWith(prefix + '-')) {
                return prefix;
            }
        }
        
        return 'general';
    }

    formatDisplayName(agentName) {
        // Convert kebab-case to Title Case
        return agentName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    getDefaultToolsForTeam(teamPrefix) {
        const toolMap = {
            'marketing': ['Read', 'Write', 'Edit', 'Grep', 'WebSearch', 'WebFetch'],
            'engineering': ['Read', 'Write', 'Edit', 'MultiEdit', 'Bash', 'Glob', 'Grep'],
            'research': ['Read', 'Grep', 'WebSearch', 'WebFetch'],
            'content': ['Read', 'Write', 'Edit', 'Grep', 'WebSearch'],
            'crypto': ['Read', 'Write', 'Edit', 'Grep', 'WebSearch', 'WebFetch'],
            'service': ['Read', 'Write', 'Edit', 'Grep'],
            'sales': ['Read', 'Write', 'Edit', 'Grep'],
            'company': ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep', 'WebSearch'],
            'framework': ['Read', 'Write', 'Edit', 'Task', 'Bash', 'Glob', 'Grep']
        };
        
        return toolMap[teamPrefix] || ['Read', 'Write', 'Edit', 'Grep'];
    }

    mergeWithDefaults(agentConfig) {
        const defaults = this.config.globalDefaults;
        
        // Deep merge agent config with defaults
        const merged = JSON.parse(JSON.stringify(agentConfig));
        
        if (!merged.hooks.storyValidation) {
            merged.hooks.storyValidation = { enabled: defaults.enableStoryValidation };
        }
        
        if (!merged.hooks.securityValidation) {
            merged.hooks.securityValidation = { enabled: defaults.enableSecurityValidation };
        }
        
        if (!merged.hooks.performanceMonitoring) {
            merged.hooks.performanceMonitoring = { enabled: defaults.enablePerformanceMonitoring };
        }
        
        if (!merged.hooks.qualityScoring) {
            merged.hooks.qualityScoring = { enabled: defaults.enableQualityScoring };
        }
        
        if (!merged.hooks.notifications) {
            merged.hooks.notifications = { enabled: defaults.enableNotifications };
        }
        
        return merged;
    }

    validateToolUsage(agentName, requestedTool) {
        const config = this.getAgentConfiguration(agentName);
        
        if (!config.hooks.securityValidation.enabled) {
            return { allowed: true, reason: 'Security validation disabled' };
        }
        
        const allowedTools = config.hooks.securityValidation.allowedTools || [];
        
        if (allowedTools.includes(requestedTool)) {
            return { allowed: true, reason: 'Tool authorized' };
        } else {
            return { 
                allowed: false, 
                reason: `Tool '${requestedTool}' not authorized for agent '${agentName}'`,
                allowedTools: allowedTools
            };
        }
    }

    shouldExecuteHook(agentName, hookType) {
        const config = this.getAgentConfiguration(agentName);
        
        switch (hookType) {
            case 'storyValidation':
                return config.hooks.storyValidation?.enabled ?? true;
            case 'securityValidation':
                return config.hooks.securityValidation?.enabled ?? true;
            case 'performanceMonitoring':
                return config.hooks.performanceMonitoring?.enabled ?? true;
            case 'qualityScoring':
                return config.hooks.qualityScoring?.enabled ?? true;
            case 'notifications':
                return config.hooks.notifications?.enabled ?? true;
            default:
                return false;
        }
    }

    getHookConfiguration(agentName, hookType) {
        const config = this.getAgentConfiguration(agentName);
        return config.hooks[hookType] || {};
    }

    getQualityThreshold(agentName) {
        const config = this.getAgentConfiguration(agentName);
        return config.hooks.qualityScoring?.qualityThreshold || 
               this.config.globalDefaults.qualityThreshold;
    }

    getPerformanceThreshold(agentName) {
        const config = this.getAgentConfiguration(agentName);
        return config.hooks.performanceMonitoring?.responseTimeThreshold || 
               this.config.globalDefaults.performanceThreshold;
    }

    getHookExecutionOrder() {
        return this.config.hookExecutionOrder || [
            "securityValidation",
            "storyValidation", 
            "qualityScoring",
            "performanceMonitoring",
            "notifications"
        ];
    }

    async executeHooksForAgent(agentName, context = {}) {
        const executionOrder = this.getHookExecutionOrder();
        const results = {
            agentName,
            timestamp: new Date().toISOString(),
            executionOrder,
            hookResults: {},
            overallSuccess: true,
            totalExecutionTime: 0
        };

        const startTime = Date.now();

        for (const hookType of executionOrder) {
            if (!this.shouldExecuteHook(agentName, hookType)) {
                results.hookResults[hookType] = {
                    executed: false,
                    reason: 'Hook disabled for this agent'
                };
                continue;
            }

            try {
                const hookStartTime = Date.now();
                const hookResult = await this.executeSpecificHook(agentName, hookType, context);
                const hookExecutionTime = Date.now() - hookStartTime;

                results.hookResults[hookType] = {
                    executed: true,
                    success: hookResult.success,
                    result: hookResult,
                    executionTime: hookExecutionTime
                };

                if (!hookResult.success) {
                    results.overallSuccess = false;
                    
                    // Check if this is a blocking hook
                    if (hookResult.blocking) {
                        console.log(`Blocking hook ${hookType} failed for agent ${agentName}, stopping execution`);
                        break;
                    }
                }

            } catch (error) {
                results.hookResults[hookType] = {
                    executed: true,
                    success: false,
                    error: error.message,
                    executionTime: 0
                };
                results.overallSuccess = false;
            }
        }

        results.totalExecutionTime = Date.now() - startTime;
        return results;
    }

    async executeSpecificHook(agentName, hookType, context) {
        const hookConfig = this.getHookConfiguration(agentName, hookType);
        
        // This is a simplified implementation - in practice, you'd call the actual hook scripts
        switch (hookType) {
            case 'securityValidation':
                return await this.executeSecurityHook(agentName, hookConfig, context);
            case 'storyValidation':
                return await this.executeStoryValidationHook(agentName, hookConfig, context);
            case 'qualityScoring':
                return await this.executeQualityScoringHook(agentName, hookConfig, context);
            case 'performanceMonitoring':
                return await this.executePerformanceHook(agentName, hookConfig, context);
            case 'notifications':
                return await this.executeNotificationHook(agentName, hookConfig, context);
            default:
                return { success: false, message: `Unknown hook type: ${hookType}` };
        }
    }

    async executeSecurityHook(agentName, config, context) {
        // Simplified security validation
        if (context.toolRequested) {
            const validation = this.validateToolUsage(agentName, context.toolRequested);
            return {
                success: validation.allowed,
                message: validation.reason,
                blocking: !validation.allowed,
                allowedTools: validation.allowedTools
            };
        }
        
        return { success: true, message: 'Security validation passed' };
    }

    async executeStoryValidationHook(agentName, config, context) {
        // This would integrate with the actual story validation engine
        const threshold = config.qualityThreshold || 7.0;
        
        // Simulate validation score
        const score = context.storyScore || 8.0;
        
        return {
            success: score >= threshold,
            message: `Story validation ${score >= threshold ? 'passed' : 'failed'} with score ${score}/${threshold}`,
            score: score,
            threshold: threshold
        };
    }

    async executeQualityScoringHook(agentName, config, context) {
        // This would integrate with the quality scoring engine
        const threshold = config.qualityThreshold || 7.0;
        
        // Simulate quality score
        const score = context.qualityScore || 7.5;
        
        return {
            success: score >= threshold,
            message: `Quality scoring ${score >= threshold ? 'passed' : 'failed'} with score ${score}/${threshold}`,
            score: score,
            threshold: threshold
        };
    }

    async executePerformanceHook(agentName, config, context) {
        // This would integrate with the performance monitoring hook
        const responseTime = context.responseTime || 1000;
        const threshold = config.responseTimeThreshold || 2000;
        
        return {
            success: responseTime <= threshold,
            message: `Performance monitoring: ${responseTime}ms (threshold: ${threshold}ms)`,
            responseTime: responseTime,
            threshold: threshold
        };
    }

    async executeNotificationHook(agentName, config, context) {
        // This would send notifications based on configuration
        const channels = config.channels || ['console'];
        
        if (context.notification) {
            console.log(`[NOTIFICATION] [${agentName}] ${context.notification.message}`);
        }
        
        return {
            success: true,
            message: `Notifications sent via channels: ${channels.join(', ')}`
        };
    }

    updateAgentConfiguration(agentName, configUpdate) {
        if (!this.config.agentConfigurations[agentName]) {
            this.config.agentConfigurations[agentName] = this.createDefaultAgentConfig(agentName);
        }
        
        // Deep merge configuration update
        this.config.agentConfigurations[agentName] = this.deepMerge(
            this.config.agentConfigurations[agentName],
            configUpdate
        );
        
        this.saveConfiguration();
    }

    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }

    saveConfiguration() {
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
        } catch (error) {
            console.error('Error saving agent hook configuration:', error);
        }
    }

    listAgentConfigurations() {
        return Object.keys(this.config.agentConfigurations).map(agentName => ({
            agentName,
            displayName: this.config.agentConfigurations[agentName].displayName,
            teamPrefix: this.config.agentConfigurations[agentName].teamPrefix,
            specialization: this.config.agentConfigurations[agentName].specialization,
            hooksEnabled: Object.keys(this.config.agentConfigurations[agentName].hooks).filter(
                hookType => this.config.agentConfigurations[agentName].hooks[hookType].enabled
            )
        }));
    }

    generateConfigurationReport() {
        const report = {
            configurationVersion: this.config.version,
            totalAgents: Object.keys(this.config.agentConfigurations).length,
            globalDefaults: this.config.globalDefaults,
            agentSummary: this.listAgentConfigurations(),
            hookExecutionOrder: this.config.hookExecutionOrder,
            auditSettings: this.config.auditSettings
        };
        
        return report;
    }
}

// CLI interface
async function main() {
    const manager = new AgentHookManager();
    const command = process.argv[2];
    const agentName = process.argv[3];

    switch (command) {
        case 'list':
            const agents = manager.listAgentConfigurations();
            console.log('Configured Agents:');
            agents.forEach(agent => {
                console.log(`  ${agent.agentName} (${agent.displayName})`);
                console.log(`    Team: ${agent.teamPrefix}, Specialization: ${agent.specialization}`);
                console.log(`    Enabled Hooks: ${agent.hooksEnabled.join(', ')}`);
                console.log();
            });
            break;

        case 'config':
            if (!agentName) {
                console.error('Agent name required for config command');
                process.exit(1);
            }
            const config = manager.getAgentConfiguration(agentName);
            console.log(JSON.stringify(config, null, 2));
            break;

        case 'validate-tool':
            const toolName = process.argv[4];
            if (!agentName || !toolName) {
                console.error('Agent name and tool name required');
                process.exit(1);
            }
            const validation = manager.validateToolUsage(agentName, toolName);
            console.log(JSON.stringify(validation, null, 2));
            break;

        case 'execute':
            if (!agentName) {
                console.error('Agent name required for execute command');
                process.exit(1);
            }
            const context = process.argv[4] ? JSON.parse(process.argv[4]) : {};
            const results = await manager.executeHooksForAgent(agentName, context);
            console.log(JSON.stringify(results, null, 2));
            break;

        case 'report':
            const report = manager.generateConfigurationReport();
            console.log(JSON.stringify(report, null, 2));
            break;

        default:
            console.log('Usage: agent-hook-manager.js <command> [args...]');
            console.log('Commands:');
            console.log('  list                          - List all configured agents');
            console.log('  config <agent-name>           - Show configuration for agent');
            console.log('  validate-tool <agent> <tool>  - Validate tool usage for agent');
            console.log('  execute <agent> [context]     - Execute hooks for agent');
            console.log('  report                        - Generate configuration report');
            process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
}

export default AgentHookManager;