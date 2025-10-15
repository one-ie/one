#!/usr/bin/env node

/**
 * Cascade Integration Hooks - Complete Mission → Story → Task → Agent System
 * Integrates quality gates, workflow orchestration, and performance tracking
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration for cascade system
const CASCADE_CONFIG = {
    QUALITY_THRESHOLDS: {
        MISSION: 4.0,
        STORY: 4.0,
        TASK: 4.0,
        AGENT: 4.0
    },
    PROCESSING_TIMEOUTS: {
        MISSION_GATE: 300000, // 5 minutes
        STORY_GATE: 300000,   // 5 minutes
        TASK_GATE: 180000,    // 3 minutes
        AGENT_GATE: 900000    // 15 minutes
    },
    PATHS: {
        MISSIONS: 'one/missions/',
        STORIES: 'one/stories/',
        TASKS: 'one/tasks/',
        WORKFLOWS: '.one/workflows/',
        CHECKLISTS: '.one/checklists/',
        AGENTS: '.claude/agents/',
        LOGS: '.claude/logs/'
    }
};

class CascadeIntegrationSystem {
    constructor() {
        this.logger = new CascadeLogger();
        this.qualityGates = new QualityGateSystem();
        this.orchestrator = new WorkflowOrchestrator();
        this.analytics = new CascadeAnalytics();
    }

    // Main hook entry point
    async processFileChange(filePath, changeType) {
        try {
            const cascadeLevel = this.identifyCascadeLevel(filePath);
            if (!cascadeLevel) return null;

            this.logger.info(`Processing ${cascadeLevel} file change: ${filePath} (${changeType})`);

            const result = await this.processLevelChange(cascadeLevel, filePath, changeType);
            await this.updateCascadeMetrics(cascadeLevel, result);
            
            return result;
        } catch (error) {
            this.logger.error('Cascade integration error:', error);
            return { success: false, error: error.message };
        }
    }

    identifyCascadeLevel(filePath) {
        if (filePath.includes('/missions/')) return 'mission';
        if (filePath.includes('/stories/')) return 'story';
        if (filePath.includes('/tasks/')) return 'task';
        if (filePath.includes('/agents/')) return 'agent';
        return null;
    }

    async processLevelChange(level, filePath, changeType) {
        switch (level) {
            case 'mission':
                return await this.processMissionChange(filePath, changeType);
            case 'story':
                return await this.processStoryChange(filePath, changeType);
            case 'task':
                return await this.processTaskChange(filePath, changeType);
            case 'agent':
                return await this.processAgentChange(filePath, changeType);
            default:
                return null;
        }
    }

    async processMissionChange(filePath, changeType) {
        const mission = await this.loadFile(filePath);
        
        // Run mission quality gate
        const qualityResult = await this.qualityGates.validateMission(mission, filePath);
        
        if (qualityResult.passed) {
            // Mission quality gate passed - check for story spawning
            const storySpawning = await this.orchestrator.checkStorySpawning(mission);
            
            if (storySpawning.shouldSpawn) {
                this.logger.info(`Mission quality gate passed - triggering story spawning`);
                await this.orchestrator.triggerStorySpawning(mission, filePath);
            }
        } else {
            this.logger.warn(`Mission quality gate failed: ${qualityResult.issues.join(', ')}`);
        }

        return {
            level: 'mission',
            qualityResult,
            actions: qualityResult.passed ? ['story_spawning_triggered'] : ['revision_required']
        };
    }

    async processStoryChange(filePath, changeType) {
        const story = await this.loadFile(filePath);
        
        // Run story quality gate with enhanced validation
        const qualityResult = await this.qualityGates.validateStory(story, filePath);
        
        if (qualityResult.passed) {
            // Story quality gate passed - check for task breakdown
            const taskBreakdown = await this.orchestrator.checkTaskBreakdown(story);
            
            if (taskBreakdown.shouldBreakdown) {
                this.logger.info(`Story quality gate passed - triggering task breakdown`);
                await this.orchestrator.triggerTaskBreakdown(story, filePath);
            }
        } else {
            this.logger.warn(`Story quality gate failed: ${qualityResult.issues.join(', ')}`);
        }

        return {
            level: 'story',
            qualityResult,
            actions: qualityResult.passed ? ['task_breakdown_triggered'] : ['revision_required']
        };
    }

    async processTaskChange(filePath, changeType) {
        const task = await this.loadFile(filePath);
        
        // Run task quality gate
        const qualityResult = await this.qualityGates.validateTask(task, filePath);
        
        if (qualityResult.passed) {
            // Task quality gate passed - check for agent assignment
            const agentAssignment = await this.orchestrator.checkAgentAssignment(task);
            
            if (agentAssignment.shouldAssign) {
                this.logger.info(`Task quality gate passed - triggering agent assignment`);
                await this.orchestrator.triggerAgentAssignment(task, filePath);
            }
        } else {
            this.logger.warn(`Task quality gate failed: ${qualityResult.issues.join(', ')}`);
        }

        return {
            level: 'task',
            qualityResult,
            actions: qualityResult.passed ? ['agent_assignment_triggered'] : ['revision_required']
        };
    }

    async processAgentChange(filePath, changeType) {
        // Agent-level changes trigger performance tracking
        const agent = await this.loadFile(filePath);
        
        // Track agent performance and capability updates
        await this.analytics.updateAgentMetrics(agent, filePath);
        
        return {
            level: 'agent',
            actions: ['performance_metrics_updated']
        };
    }

    async loadFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            return {
                path: filePath,
                content,
                lastModified: fs.statSync(filePath).mtime
            };
        } catch (error) {
            throw new Error(`Failed to load file ${filePath}: ${error.message}`);
        }
    }

    async updateCascadeMetrics(level, result) {
        await this.analytics.updateCascadeMetrics(level, result);
    }
}

class QualityGateSystem {
    async validateMission(mission, filePath) {
        try {
            // Load mission quality checklist
            const checklist = await this.loadChecklist('mission-quality-checklist.md');
            
            // Execute validation
            const validation = await this.executeMissionValidation(mission, checklist);
            
            return {
                passed: validation.score >= CASCADE_CONFIG.QUALITY_THRESHOLDS.MISSION,
                score: validation.score,
                issues: validation.issues,
                recommendations: validation.recommendations
            };
        } catch (error) {
            return {
                passed: false,
                score: 0,
                issues: [`Validation error: ${error.message}`],
                recommendations: ['Fix validation errors and retry']
            };
        }
    }

    async validateStory(story, filePath) {
        try {
            // Use existing story validation engine
            const StoryValidationEngine = await import('./story-validation-engine.js');
            const engine = new StoryValidationEngine.default(filePath);
            const result = await engine.validate();
            
            // Enhanced validation for cascade integration
            const cascadeValidation = await this.executeCascadeStoryValidation(story);
            
            // Combine results
            const combinedScore = (parseFloat(result.score) + cascadeValidation.score) / 2;
            
            return {
                passed: combinedScore >= CASCADE_CONFIG.QUALITY_THRESHOLDS.STORY,
                score: combinedScore,
                issues: [...(result.issues?.critical || []), ...cascadeValidation.issues],
                recommendations: [result.recommendation, ...cascadeValidation.recommendations],
                storyValidation: result,
                cascadeValidation
            };
        } catch (error) {
            return {
                passed: false,
                score: 0,
                issues: [`Story validation error: ${error.message}`],
                recommendations: ['Fix validation errors and retry']
            };
        }
    }

    async validateTask(task, filePath) {
        try {
            const checklist = await this.loadChecklist('task-quality-checklist.md');
            const validation = await this.executeTaskValidation(task, checklist);
            
            return {
                passed: validation.score >= CASCADE_CONFIG.QUALITY_THRESHOLDS.TASK,
                score: validation.score,
                issues: validation.issues,
                recommendations: validation.recommendations
            };
        } catch (error) {
            return {
                passed: false,
                score: 0,
                issues: [`Task validation error: ${error.message}`],
                recommendations: ['Fix validation errors and retry']
            };
        }
    }

    async loadChecklist(checklistName) {
        const checklistPath = path.join(CASCADE_CONFIG.PATHS.CHECKLISTS, checklistName);
        if (fs.existsSync(checklistPath)) {
            return fs.readFileSync(checklistPath, 'utf8');
        }
        throw new Error(`Checklist not found: ${checklistName}`);
    }

    async executeMissionValidation(mission, checklist) {
        // Parse mission content for quality criteria
        const content = mission.content;
        let score = 5.0; // Start with perfect score
        const issues = [];
        const recommendations = [];

        // Strategic Clarity Assessment (25% weight)
        if (!this.validateStrategicClarity(content)) {
            score -= 1.0;
            issues.push('Strategic clarity needs improvement');
            recommendations.push('Define SMART objectives and measurable outcomes');
        }

        // Resource Allocation Check (20% weight)
        if (!this.validateResourceAllocation(content)) {
            score -= 0.8;
            issues.push('Resource allocation unclear');
            recommendations.push('Specify required agents, tools, and timeline');
        }

        // Success Criteria Definition (25% weight)
        if (!this.validateSuccessCriteria(content)) {
            score -= 1.0;
            issues.push('Success criteria not well defined');
            recommendations.push('Define clear, measurable success metrics');
        }

        // Stakeholder Alignment (15% weight)
        if (!this.validateStakeholderAlignment(content)) {
            score -= 0.6;
            issues.push('Stakeholder alignment not evident');
            recommendations.push('Document stakeholder commitment and understanding');
        }

        // Story Readiness (15% weight)
        if (!this.validateStoryReadiness(content)) {
            score -= 0.6;
            issues.push('Story spawning readiness unclear');
            recommendations.push('Structure mission for effective story breakdown');
        }

        return { score: Math.max(0, score), issues, recommendations };
    }

    async executeCascadeStoryValidation(story) {
        const content = story.content;
        let score = 5.0;
        const issues = [];
        const recommendations = [];

        // Mission Alignment (30% weight)
        if (!this.validateMissionAlignment(content)) {
            score -= 1.5;
            issues.push('Mission alignment not clear');
            recommendations.push('Strengthen connection to parent mission objectives');
        }

        // Narrative Coherence (25% weight)
        if (!this.validateNarrativeCoherence(content)) {
            score -= 1.25;
            issues.push('Narrative structure needs improvement');
            recommendations.push('Develop clear beginning, middle, end with compelling flow');
        }

        // Task Readiness (15% weight)
        if (!this.validateTaskReadiness(content)) {
            score -= 0.75;
            issues.push('Task breakdown readiness unclear');
            recommendations.push('Structure story for effective task decomposition');
        }

        return { score: Math.max(0, score), issues, recommendations };
    }

    async executeTaskValidation(task, checklist) {
        const content = task.content;
        let score = 5.0;
        const issues = [];
        const recommendations = [];

        // Story Context Preservation (25% weight)
        if (!this.validateStoryContext(content)) {
            score -= 1.25;
            issues.push('Story context not well preserved');
            recommendations.push('Maintain clear connection to parent story narrative');
        }

        // Execution Clarity (30% weight)
        if (!this.validateExecutionClarity(content)) {
            score -= 1.5;
            issues.push('Execution instructions unclear');
            recommendations.push('Provide unambiguous, complete instructions and resource specifications');
        }

        // Agent Matching (20% weight)
        if (!this.validateAgentMatching(content)) {
            score -= 1.0;
            issues.push('Agent matching optimization needed');
            recommendations.push('Specify required skills and optimal agent characteristics');
        }

        return { score: Math.max(0, score), issues, recommendations };
    }

    // Validation helper methods
    validateStrategicClarity(content) {
        const smartKeywords = ['specific', 'measurable', 'achievable', 'relevant', 'time-bound'];
        const objectivePatterns = /objective|goal|purpose|mission/i;
        return objectivePatterns.test(content) && smartKeywords.some(keyword => 
            content.toLowerCase().includes(keyword)
        );
    }

    validateResourceAllocation(content) {
        const resourcePatterns = /agent|tool|resource|timeline|capacity/i;
        return resourcePatterns.test(content);
    }

    validateSuccessCriteria(content) {
        const criteriaPatterns = /success criteria|metrics|kpi|measurement/i;
        return criteriaPatterns.test(content);
    }

    validateStakeholderAlignment(content) {
        const alignmentPatterns = /stakeholder|team|commitment|alignment/i;
        return alignmentPatterns.test(content);
    }

    validateStoryReadiness(content) {
        const readinessPatterns = /story|narrative|breakdown|spawning/i;
        return readinessPatterns.test(content);
    }

    validateMissionAlignment(content) {
        const alignmentPatterns = /mission|objective|contribut|support/i;
        return alignmentPatterns.test(content);
    }

    validateNarrativeCoherence(content) {
        const narrativePatterns = /story|narrative|beginning|middle|end|journey/i;
        return narrativePatterns.test(content) && content.length > 500; // Minimum content length
    }

    validateTaskReadiness(content) {
        const taskPatterns = /task|breakdown|decomposition|executable/i;
        return taskPatterns.test(content);
    }

    validateStoryContext(content) {
        const contextPatterns = /story|narrative|context|background/i;
        return contextPatterns.test(content);
    }

    validateExecutionClarity(content) {
        const clarityPatterns = /instruction|step|requirement|specification/i;
        const hasSteps = /\d+\.|step \d+|1\./i.test(content);
        return clarityPatterns.test(content) && hasSteps;
    }

    validateAgentMatching(content) {
        const agentPatterns = /agent|specialist|skill|capability|assignment/i;
        return agentPatterns.test(content);
    }
}

class WorkflowOrchestrator {
    async checkStorySpawning(mission) {
        // Check if mission is ready for story spawning
        const content = mission.content;
        const hasSpawningReadiness = /story|narrative|breakdown/i.test(content);
        const hasStatus = /status.*active|status.*ready/i.test(content);
        
        return {
            shouldSpawn: hasSpawningReadiness && hasStatus,
            readiness: hasSpawningReadiness,
            status: hasStatus
        };
    }

    async triggerStorySpawning(mission, missionPath) {
        // This would trigger the Mission Commander to create stories
        this.logger.info(`Triggering story spawning for mission: ${missionPath}`);
        
        // In a real implementation, this would:
        // 1. Notify Mission Commander
        // 2. Generate story specifications
        // 3. Create story file templates
        // 4. Update mission status
        
        return { triggered: true, timestamp: new Date().toISOString() };
    }

    async checkTaskBreakdown(story) {
        const content = story.content;
        const hasTaskSection = /task|subtask|breakdown/i.test(content);
        const hasAcceptanceCriteria = /acceptance criteria/i.test(content);
        
        return {
            shouldBreakdown: hasTaskSection && hasAcceptanceCriteria,
            taskSection: hasTaskSection,
            acceptanceCriteria: hasAcceptanceCriteria
        };
    }

    async triggerTaskBreakdown(story, storyPath) {
        this.logger.info(`Triggering task breakdown for story: ${storyPath}`);
        
        // In a real implementation, this would:
        // 1. Notify Story Teller
        // 2. Generate task specifications
        // 3. Create task file templates
        // 4. Update story status
        
        return { triggered: true, timestamp: new Date().toISOString() };
    }

    async checkAgentAssignment(task) {
        const content = task.content;
        const hasAgentRequirements = /agent|specialist|assignment/i.test(content);
        const hasExecutionCriteria = /completion criteria|done definition/i.test(content);
        
        return {
            shouldAssign: hasAgentRequirements && hasExecutionCriteria,
            agentRequirements: hasAgentRequirements,
            executionCriteria: hasExecutionCriteria
        };
    }

    async triggerAgentAssignment(task, taskPath) {
        this.logger.info(`Triggering agent assignment for task: ${taskPath}`);
        
        // In a real implementation, this would:
        // 1. Notify Task Master
        // 2. Match optimal agent
        // 3. Assign task to agent
        // 4. Update task status
        
        return { triggered: true, timestamp: new Date().toISOString() };
    }
}

class CascadeAnalytics {
    constructor() {
        this.metricsPath = path.join(CASCADE_CONFIG.PATHS.LOGS, 'cascade-metrics.json');
        this.initializeMetrics();
    }

    initializeMetrics() {
        if (!fs.existsSync(this.metricsPath)) {
            const initialMetrics = {
                cascade_efficiency: {
                    mission_processing_time: [],
                    story_processing_time: [],
                    task_processing_time: [],
                    agent_processing_time: []
                },
                quality_scores: {
                    missions: [],
                    stories: [],
                    tasks: [],
                    agents: []
                },
                quality_gate_performance: {
                    mission_pass_rate: 0,
                    story_pass_rate: 0,
                    task_pass_rate: 0,
                    agent_pass_rate: 0
                },
                last_updated: new Date().toISOString()
            };
            
            fs.writeFileSync(this.metricsPath, JSON.stringify(initialMetrics, null, 2));
        }
    }

    async updateCascadeMetrics(level, result) {
        const metrics = JSON.parse(fs.readFileSync(this.metricsPath, 'utf8'));
        
        // Update quality scores
        if (result.qualityResult && result.qualityResult.score) {
            metrics.quality_scores[`${level}s`].push({
                score: result.qualityResult.score,
                timestamp: new Date().toISOString(),
                passed: result.qualityResult.passed
            });
        }
        
        // Update processing time if available
        if (result.processingTime) {
            metrics.cascade_efficiency[`${level}_processing_time`].push({
                time: result.processingTime,
                timestamp: new Date().toISOString()
            });
        }
        
        metrics.last_updated = new Date().toISOString();
        fs.writeFileSync(this.metricsPath, JSON.stringify(metrics, null, 2));
    }

    async updateAgentMetrics(agent, filePath) {
        // Track agent performance and capabilities
        this.logger.info(`Updating agent metrics for: ${filePath}`);
    }
}

class CascadeLogger {
    constructor() {
        this.logPath = path.join(CASCADE_CONFIG.PATHS.LOGS, 'cascade-integration.log');
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
        
        // Also log to console for immediate feedback
        console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
        if (data) console.log(JSON.stringify(data, null, 2));
    }

    info(message, data) { this.log('info', message, data); }
    warn(message, data) { this.log('warn', message, data); }
    error(message, data) { this.log('error', message, data); }
}

// Main execution for hook integration
async function main() {
    const filePath = process.argv[2];
    const changeType = process.argv[3] || 'modified';
    
    if (!filePath) {
        console.error('Usage: cascade-integration-hooks.js <file_path> [change_type]');
        process.exit(1);
    }
    
    const cascadeSystem = new CascadeIntegrationSystem();
    const result = await cascadeSystem.processFileChange(filePath, changeType);
    
    if (result) {
        console.log('CASCADE_INTEGRATION_RESULT:', JSON.stringify(result, null, 2));
        process.exit(result.success !== false ? 0 : 1);
    } else {
        console.log('CASCADE_INTEGRATION_RESULT: No action required');
        process.exit(0);
    }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('CASCADE_INTEGRATION_ERROR:', error.message);
        process.exit(1);
    });
}

export default CascadeIntegrationSystem;