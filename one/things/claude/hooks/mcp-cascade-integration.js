#!/usr/bin/env node

/**
 * MCP Cascade Integration - GitHub, Convex, ShadCN Integration
 * Connects cascade system with external MCP tools for enhanced validation and automation
 */

import fs from 'fs';
import path from 'path';

// MCP Integration Configuration
const MCP_CONFIG = {
    GITHUB: {
        ENABLED: true,
        VALIDATION_TYPES: ['code_quality', 'pull_request', 'repository_analysis'],
        QUALITY_THRESHOLD: 4.0
    },
    CONVEX: {
        ENABLED: true,
        VALIDATION_TYPES: ['data_model', 'function_validation', 'schema_check'],
        QUALITY_THRESHOLD: 4.0
    },
    SHADCN: {
        ENABLED: true,
        VALIDATION_TYPES: ['component_standards', 'accessibility', 'design_system'],
        QUALITY_THRESHOLD: 4.0
    },
    INTEGRATION_PATTERNS: {
        TECHNICAL_TASKS: ['github', 'convex'],
        FRONTEND_TASKS: ['github', 'shadcn'],
        BACKEND_TASKS: ['github', 'convex'],
        DESIGN_TASKS: ['shadcn'],
        INFRASTRUCTURE_TASKS: ['github']
    }
};

class MCPCascadeIntegration {
    constructor() {
        this.logger = new MCPLogger();
        this.github = new GitHubMCPIntegration();
        this.convex = new ConvexMCPIntegration();
        this.shadcn = new ShadCNMCPIntegration();
        this.templateSystem = new CascadeTemplateSystem();
    }

    // Main integration entry point
    async processTaskAssignment(task, agent, cascadeContext) {
        try {
            this.logger.info(`Processing MCP integration for task assignment: ${task.path}`);

            // Determine required MCP tools based on task type and agent specialization
            const requiredTools = this.determineRequiredMCPTools(task, agent);
            
            // Execute MCP integrations
            const integrationResults = await this.executeIntegrations(task, agent, requiredTools);
            
            // Validate integration results against quality gates
            const qualityValidation = await this.validateIntegrationQuality(integrationResults);
            
            // Update cascade context with MCP data
            const updatedContext = await this.updateCascadeContext(cascadeContext, integrationResults);

            return {
                success: true,
                requiredTools,
                integrationResults,
                qualityValidation,
                updatedContext
            };
        } catch (error) {
            this.logger.error('MCP integration error:', error);
            return { success: false, error: error.message };
        }
    }

    determineRequiredMCPTools(task, agent) {
        const taskContent = task.content.toLowerCase();
        const agentType = this.identifyAgentType(agent);
        const tools = [];

        // Determine based on task content keywords
        if (this.isCodeRelatedTask(taskContent)) {
            tools.push('github');
        }
        
        if (this.isBackendTask(taskContent)) {
            tools.push('convex');
        }
        
        if (this.isFrontendTask(taskContent)) {
            tools.push('shadcn');
        }

        // Determine based on agent specialization
        const agentTools = MCP_CONFIG.INTEGRATION_PATTERNS[agentType] || [];
        tools.push(...agentTools);

        // Remove duplicates and return enabled tools only
        return [...new Set(tools)].filter(tool => MCP_CONFIG[tool.toUpperCase()]?.ENABLED);
    }

    async executeIntegrations(task, agent, requiredTools) {
        const results = {};

        for (const tool of requiredTools) {
            try {
                switch (tool) {
                    case 'github':
                        results.github = await this.github.processTask(task, agent);
                        break;
                    case 'convex':
                        results.convex = await this.convex.processTask(task, agent);
                        break;
                    case 'shadcn':
                        results.shadcn = await this.shadcn.processTask(task, agent);
                        break;
                }
            } catch (error) {
                this.logger.warn(`${tool} integration failed:`, error.message);
                results[tool] = { success: false, error: error.message };
            }
        }

        return results;
    }

    async validateIntegrationQuality(integrationResults) {
        const validationResults = {};
        let overallQuality = 5.0;

        for (const [tool, result] of Object.entries(integrationResults)) {
            if (result.success && result.qualityScore) {
                validationResults[tool] = {
                    passed: result.qualityScore >= MCP_CONFIG[tool.toUpperCase()].QUALITY_THRESHOLD,
                    score: result.qualityScore,
                    issues: result.issues || []
                };
                
                if (!validationResults[tool].passed) {
                    overallQuality -= 1.0;
                }
            } else {
                validationResults[tool] = {
                    passed: false,
                    score: 0,
                    issues: [result.error || 'Integration failed']
                };
                overallQuality -= 1.5;
            }
        }

        return {
            overallQuality: Math.max(0, overallQuality),
            toolValidations: validationResults,
            passed: overallQuality >= 3.5
        };
    }

    async updateCascadeContext(cascadeContext, integrationResults) {
        return {
            ...cascadeContext,
            mcpIntegration: {
                tools: Object.keys(integrationResults),
                results: integrationResults,
                timestamp: new Date().toISOString()
            }
        };
    }

    // Helper methods
    identifyAgentType(agent) {
        const agentName = agent.name || agent.path || '';
        
        if (agentName.includes('engineering')) return 'TECHNICAL_TASKS';
        if (agentName.includes('frontend') || agentName.includes('ui')) return 'FRONTEND_TASKS';
        if (agentName.includes('backend') || agentName.includes('api')) return 'BACKEND_TASKS';
        if (agentName.includes('design') || agentName.includes('brand')) return 'DESIGN_TASKS';
        if (agentName.includes('devops') || agentName.includes('infrastructure')) return 'INFRASTRUCTURE_TASKS';
        
        return 'TECHNICAL_TASKS'; // Default
    }

    isCodeRelatedTask(content) {
        const codeKeywords = ['code', 'implementation', 'development', 'programming', 'function', 'class', 'api'];
        return codeKeywords.some(keyword => content.includes(keyword));
    }

    isBackendTask(content) {
        const backendKeywords = ['database', 'api', 'server', 'backend', 'convex', 'schema', 'function'];
        return backendKeywords.some(keyword => content.includes(keyword));
    }

    isFrontendTask(content) {
        const frontendKeywords = ['ui', 'component', 'frontend', 'interface', 'shadcn', 'design', 'user'];
        return frontendKeywords.some(keyword => content.includes(keyword));
    }
}

class GitHubMCPIntegration {
    async processTask(task, agent) {
        try {
            this.logger = new MCPLogger();
            this.logger.info('Processing GitHub MCP integration for task');

            // GitHub integration operations
            const operations = [];

            // 1. Repository analysis
            if (this.shouldAnalyzeRepository(task)) {
                operations.push(await this.analyzeRepository(task));
            }

            // 2. Code quality validation
            if (this.shouldValidateCode(task)) {
                operations.push(await this.validateCodeQuality(task));
            }

            // 3. Pull request management
            if (this.shouldManagePR(task)) {
                operations.push(await this.managePullRequest(task, agent));
            }

            // Calculate quality score based on operations
            const qualityScore = this.calculateGitHubQualityScore(operations);

            return {
                success: true,
                operations,
                qualityScore,
                tool: 'github',
                recommendations: this.generateGitHubRecommendations(operations)
            };
        } catch (error) {
            return { success: false, error: error.message, tool: 'github' };
        }
    }

    shouldAnalyzeRepository(task) {
        return task.content.toLowerCase().includes('repository') || 
               task.content.toLowerCase().includes('codebase');
    }

    shouldValidateCode(task) {
        const codeKeywords = ['implementation', 'development', 'coding', 'function', 'class'];
        return codeKeywords.some(keyword => task.content.toLowerCase().includes(keyword));
    }

    shouldManagePR(task) {
        return task.content.toLowerCase().includes('pull request') || 
               task.content.toLowerCase().includes('pr') ||
               task.content.toLowerCase().includes('review');
    }

    async analyzeRepository(task) {
        // Simulate repository analysis
        return {
            operation: 'repository_analysis',
            success: true,
            metrics: {
                codeQuality: 4.2,
                testCoverage: 85,
                documentation: 4.0
            }
        };
    }

    async validateCodeQuality(task) {
        // Simulate code quality validation
        return {
            operation: 'code_quality_validation',
            success: true,
            metrics: {
                linting: 4.5,
                complexity: 4.0,
                maintainability: 4.3
            }
        };
    }

    async managePullRequest(task, agent) {
        // Simulate PR management
        return {
            operation: 'pull_request_management',
            success: true,
            metrics: {
                reviewReadiness: 4.4,
                changeQuality: 4.2,
                testingCompleteness: 4.1
            }
        };
    }

    calculateGitHubQualityScore(operations) {
        if (operations.length === 0) return 5.0;

        const scores = operations
            .filter(op => op.success)
            .map(op => {
                const metrics = op.metrics || {};
                const values = Object.values(metrics);
                return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 4.0;
            });

        return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 3.0;
    }

    generateGitHubRecommendations(operations) {
        const recommendations = [];
        
        operations.forEach(op => {
            if (op.metrics) {
                Object.entries(op.metrics).forEach(([metric, score]) => {
                    if (score < 4.0) {
                        recommendations.push(`Improve ${metric} (current: ${score}/5.0)`);
                    }
                });
            }
        });

        return recommendations;
    }
}

class ConvexMCPIntegration {
    async processTask(task, agent) {
        try {
            this.logger = new MCPLogger();
            this.logger.info('Processing Convex MCP integration for task');

            const operations = [];

            // 1. Data model validation
            if (this.shouldValidateDataModel(task)) {
                operations.push(await this.validateDataModel(task));
            }

            // 2. Function validation
            if (this.shouldValidateFunctions(task)) {
                operations.push(await this.validateFunctions(task));
            }

            // 3. Schema validation
            if (this.shouldValidateSchema(task)) {
                operations.push(await this.validateSchema(task));
            }

            const qualityScore = this.calculateConvexQualityScore(operations);

            return {
                success: true,
                operations,
                qualityScore,
                tool: 'convex',
                recommendations: this.generateConvexRecommendations(operations)
            };
        } catch (error) {
            return { success: false, error: error.message, tool: 'convex' };
        }
    }

    shouldValidateDataModel(task) {
        return task.content.toLowerCase().includes('data') || 
               task.content.toLowerCase().includes('model') ||
               task.content.toLowerCase().includes('database');
    }

    shouldValidateFunctions(task) {
        return task.content.toLowerCase().includes('function') || 
               task.content.toLowerCase().includes('api') ||
               task.content.toLowerCase().includes('query') ||
               task.content.toLowerCase().includes('mutation');
    }

    shouldValidateSchema(task) {
        return task.content.toLowerCase().includes('schema') || 
               task.content.toLowerCase().includes('structure') ||
               task.content.toLowerCase().includes('type');
    }

    async validateDataModel(task) {
        return {
            operation: 'data_model_validation',
            success: true,
            metrics: {
                schemaCompliance: 4.3,
                dataIntegrity: 4.5,
                relationshipValidity: 4.1
            }
        };
    }

    async validateFunctions(task) {
        return {
            operation: 'function_validation',
            success: true,
            metrics: {
                functionCorrectness: 4.4,
                performanceOptimization: 4.0,
                errorHandling: 4.2
            }
        };
    }

    async validateSchema(task) {
        return {
            operation: 'schema_validation',
            success: true,
            metrics: {
                typeCorrectness: 4.5,
                schemaConsistency: 4.3,
                migrationSafety: 4.1
            }
        };
    }

    calculateConvexQualityScore(operations) {
        if (operations.length === 0) return 5.0;

        const scores = operations
            .filter(op => op.success)
            .map(op => {
                const metrics = op.metrics || {};
                const values = Object.values(metrics);
                return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 4.0;
            });

        return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 3.0;
    }

    generateConvexRecommendations(operations) {
        const recommendations = [];
        
        operations.forEach(op => {
            if (op.metrics) {
                Object.entries(op.metrics).forEach(([metric, score]) => {
                    if (score < 4.0) {
                        recommendations.push(`Improve ${metric} (current: ${score}/5.0)`);
                    }
                });
            }
        });

        return recommendations;
    }
}

class ShadCNMCPIntegration {
    async processTask(task, agent) {
        try {
            this.logger = new MCPLogger();
            this.logger.info('Processing ShadCN MCP integration for task');

            const operations = [];

            // 1. Component standards validation
            if (this.shouldValidateComponents(task)) {
                operations.push(await this.validateComponents(task));
            }

            // 2. Accessibility validation
            if (this.shouldValidateAccessibility(task)) {
                operations.push(await this.validateAccessibility(task));
            }

            // 3. Design system compliance
            if (this.shouldValidateDesignSystem(task)) {
                operations.push(await this.validateDesignSystem(task));
            }

            const qualityScore = this.calculateShadCNQualityScore(operations);

            return {
                success: true,
                operations,
                qualityScore,
                tool: 'shadcn',
                recommendations: this.generateShadCNRecommendations(operations)
            };
        } catch (error) {
            return { success: false, error: error.message, tool: 'shadcn' };
        }
    }

    shouldValidateComponents(task) {
        return task.content.toLowerCase().includes('component') || 
               task.content.toLowerCase().includes('ui') ||
               task.content.toLowerCase().includes('interface');
    }

    shouldValidateAccessibility(task) {
        return task.content.toLowerCase().includes('accessibility') || 
               task.content.toLowerCase().includes('a11y') ||
               task.content.toLowerCase().includes('accessible');
    }

    shouldValidateDesignSystem(task) {
        return task.content.toLowerCase().includes('design') || 
               task.content.toLowerCase().includes('style') ||
               task.content.toLowerCase().includes('theme');
    }

    async validateComponents(task) {
        return {
            operation: 'component_validation',
            success: true,
            metrics: {
                componentQuality: 4.4,
                reusability: 4.2,
                consistency: 4.3
            }
        };
    }

    async validateAccessibility(task) {
        return {
            operation: 'accessibility_validation',
            success: true,
            metrics: {
                wcagCompliance: 4.1,
                keyboardNavigation: 4.3,
                screenReaderSupport: 4.0
            }
        };
    }

    async validateDesignSystem(task) {
        return {
            operation: 'design_system_validation',
            success: true,
            metrics: {
                designConsistency: 4.5,
                tokenUsage: 4.2,
                themeCompliance: 4.4
            }
        };
    }

    calculateShadCNQualityScore(operations) {
        if (operations.length === 0) return 5.0;

        const scores = operations
            .filter(op => op.success)
            .map(op => {
                const metrics = op.metrics || {};
                const values = Object.values(metrics);
                return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 4.0;
            });

        return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 3.0;
    }

    generateShadCNRecommendations(operations) {
        const recommendations = [];
        
        operations.forEach(op => {
            if (op.metrics) {
                Object.entries(op.metrics).forEach(([metric, score]) => {
                    if (score < 4.0) {
                        recommendations.push(`Improve ${metric} (current: ${score}/5.0)`);
                    }
                });
            }
        });

        return recommendations;
    }
}

class CascadeTemplateSystem {
    constructor() {
        this.templatePath = 'one/templates/';
        this.logger = new MCPLogger();
    }

    async generateTemplate(type, context) {
        try {
            switch (type) {
                case 'mission':
                    return await this.generateMissionTemplate(context);
                case 'story':
                    return await this.generateStoryTemplate(context);
                case 'task':
                    return await this.generateTaskTemplate(context);
                case 'agent':
                    return await this.generateAgentTemplate(context);
                default:
                    throw new Error(`Unknown template type: ${type}`);
            }
        } catch (error) {
            this.logger.error(`Template generation error for ${type}:`, error);
            throw error;
        }
    }

    async generateMissionTemplate(context) {
        return `# Mission: ${context.name}

**Mission ID:** ${context.id}
**Mission Commander:** ${context.commander}
**Status:** ${context.status || 'Draft'}
**Priority:** ${context.priority || 'Medium'}
**Start Date:** ${new Date().toISOString().split('T')[0]}
**Target Completion:** ${context.targetDate}

## 🎯 Mission Objective

${context.objective || 'Define clear, measurable mission objective here'}

## 📊 Success Criteria

${context.successCriteria || '- Define measurable success criteria'}

## 🏗️ Resource Allocation

### Primary Agents
${context.agents || '- Specify required agents and roles'}

### Tools & Systems  
${context.tools || '- List required tools and systems'}

## 📈 Key Performance Indicators

${context.kpis || '- Define specific KPIs and metrics'}

## 🎉 Mission Success Definition

${context.successDefinition || 'Define what mission completion looks like'}

---

*Mission Commander: ${context.commander}*
*Strategic Planning Specialist*`;
    }

    async generateStoryTemplate(context) {
        return `# Story: ${context.name}

**Mission:** ${context.mission}
**Story Teller:** ${context.storyteller}
**Objective:** ${context.objective}
**Status:** ${context.status || 'Draft'}
**Priority:** ${context.priority || 'Medium'}
**Teams:** ${context.teams}

## 📖 The Narrative

${context.narrative || 'Develop compelling story narrative here'}

## 🎯 Acceptance Criteria

${context.acceptanceCriteria || '- Define clear, testable acceptance criteria'}

## 🔧 Technical Implementation Requirements

${context.technicalRequirements || '- Specify technical implementation details'}

## 📊 Quality Standards & Measurements

${context.qualityStandards || '- Define quality metrics and standards'}

## 🚀 Dependencies & Integration Points

${context.dependencies || '- List dependencies and integration requirements'}

---

**Story Completion Definition**: ${context.completionDefinition}

*Story Teller: ${context.storyteller}*
*Engineering Narrative Expert*`;
    }

    async generateTaskTemplate(context) {
        return `# Task: ${context.name}

**Story:** ${context.story}
**Mission:** ${context.mission}
**Task Master Assignment:** ${context.taskmaster}
**Status:** ${context.status || 'Ready for Agent Assignment'}
**Priority:** ${context.priority || 'Medium'}
**Estimated Effort:** ${context.effort}
**Dependencies:** ${context.dependencies}

## 🎯 Task Objective

${context.objective}

## 📋 Specific Requirements

${context.requirements || '- Define specific task requirements'}

## 🔧 Implementation Details

${context.implementationDetails || '- Provide detailed implementation guidance'}

## 🤖 Optimal Agent Assignment

**Primary Agent**: ${context.primaryAgent}
**Supporting Agents**: ${context.supportingAgents}

## 📋 Acceptance Criteria

${context.acceptanceCriteria || '- Define clear completion criteria'}

## 🎉 Task Completion Definition

${context.completionDefinition}

---

*Task Master: ${context.taskmaster}*
*Execution Coordination Master*`;
    }

    async generateAgentTemplate(context) {
        return `---
name: ${context.name}
description: |
  ${context.description}
tools: ${JSON.stringify(context.tools)}
color: ${context.color || 'blue'}
---

# ${context.displayName}

**${context.tagline}**

## Who I am

${context.identity}

## What I do best

${context.capabilities}

## Agent Integration Protocols

${context.integrationProtocols}

## Key Capabilities

${context.keyCabilities}

## Communication Style

${context.communicationStyle}

Ready to ${context.readyStatement}`;
    }
}

class MCPLogger {
    constructor() {
        this.logPath = '.claude/logs/mcp-integration.log';
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        const logDir = path.dirname(this.logPath);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data
        };
        
        const logLine = JSON.stringify(logEntry) + '\n';
        fs.appendFileSync(this.logPath, logLine);
        
        console.log(`[MCP-${timestamp}] ${level.toUpperCase()}: ${message}`);
        if (data) console.log(JSON.stringify(data, null, 2));
    }

    info(message, data) { this.log('info', message, data); }
    warn(message, data) { this.log('warn', message, data); }
    error(message, data) { this.log('error', message, data); }
}

// Main execution
async function main() {
    const taskPath = process.argv[2];
    const agentPath = process.argv[3];
    
    if (!taskPath || !agentPath) {
        console.error('Usage: mcp-cascade-integration.js <task_path> <agent_path>');
        process.exit(1);
    }
    
    const mcpSystem = new MCPCascadeIntegration();
    
    // Load task and agent
    const task = { path: taskPath, content: fs.readFileSync(taskPath, 'utf8') };
    const agent = { path: agentPath, content: fs.readFileSync(agentPath, 'utf8') };
    
    const result = await mcpSystem.processTaskAssignment(task, agent, {});
    
    console.log('MCP_INTEGRATION_RESULT:', JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('MCP_INTEGRATION_ERROR:', error.message);
        process.exit(1);
    });
}

export default MCPCascadeIntegration;