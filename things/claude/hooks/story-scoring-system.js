#!/usr/bin/env node

/**
 * Story Scoring System - Quality Assessment and Metrics
 * Provides detailed scoring analysis and improvement recommendations
 */

import fs from 'fs';
import path from 'path';

class StoryScoringSystem {
    constructor() {
        this.metrics = {
            templateCompliance: 0,
            acceptanceCriteria: 0,
            technicalFeasibility: 0,
            taskStructure: 0,
            securityConsiderations: 0,
            testability: 0,
            claritySpecificity: 0,
            businessValue: 0,
            implementationReadiness: 0,
            qualityAssurance: 0
        };
        
        this.weightings = {
            templateCompliance: 0.15,
            acceptanceCriteria: 0.15,
            technicalFeasibility: 0.15,
            taskStructure: 0.10,
            securityConsiderations: 0.10,
            testability: 0.10,
            claritySpecificity: 0.10,
            businessValue: 0.05,
            implementationReadiness: 0.05,
            qualityAssurance: 0.05
        };
        
        this.recommendations = [];
        this.insights = [];
    }

    analyzeStory(storyContent, validationResult) {
        this.scoreTemplateCompliance(storyContent);
        this.scoreAcceptanceCriteria(storyContent);
        this.scoreTechnicalFeasibility(storyContent);
        this.scoreTaskStructure(storyContent);
        this.scoreSecurityConsiderations(storyContent);
        this.scoreTestability(storyContent);
        this.scoreClaritySpecificity(storyContent);
        this.scoreBusinessValue(storyContent);
        this.scoreImplementationReadiness(storyContent);
        this.scoreQualityAssurance(storyContent, validationResult);
        
        return this.generateScoringReport();
    }

    scoreTemplateCompliance(content) {
        const requiredSections = [
            'Status', 'Story', 'Acceptance Criteria', 'Tasks / Subtasks',
            'Dev Notes', 'Change Log', 'Dev Agent Record'
        ];
        
        let presentSections = 0;
        requiredSections.forEach(section => {
            if (new RegExp(`^##\\s+${section}`, 'm').test(content)) {
                presentSections++;
            }
        });
        
        this.metrics.templateCompliance = (presentSections / requiredSections.length) * 10;
        
        if (this.metrics.templateCompliance < 8) {
            this.recommendations.push('Ensure all required template sections are present and properly formatted');
        }
    }

    scoreAcceptanceCriteria(content) {
        const acSection = this.extractSection(content, 'Acceptance Criteria');
        if (!acSection) {
            this.metrics.acceptanceCriteria = 0;
            this.recommendations.push('Add detailed acceptance criteria with measurable outcomes');
            return;
        }
        
        const criteria = acSection.split('\n').filter(line => line.trim().match(/^\d+\./));
        const criteriaCount = criteria.length;
        
        // Check for SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound)
        let smartScore = 0;
        criteria.forEach(criterion => {
            if (this.isMeasurable(criterion)) smartScore += 0.3;
            if (this.isSpecific(criterion)) smartScore += 0.3;
            if (this.isActionable(criterion)) smartScore += 0.4;
        });
        
        this.metrics.acceptanceCriteria = Math.min(10, (criteriaCount * 2) + smartScore);
        
        if (this.metrics.acceptanceCriteria < 7) {
            this.recommendations.push('Improve acceptance criteria specificity and measurability');
        }
    }

    scoreTechnicalFeasibility(content) {
        let feasibilityScore = 5; // Base score
        
        // Check for technical architecture details
        if (/technical architecture|system design|implementation approach/i.test(content)) {
            feasibilityScore += 2;
        }
        
        // Check for dependency analysis
        if (/dependencies|prerequisite|requirement/i.test(content)) {
            feasibilityScore += 1;
        }
        
        // Check for complexity assessment
        if (/complexity|effort|timeline|estimation/i.test(content)) {
            feasibilityScore += 1;
        }
        
        // Check for risk assessment
        if (/risk|challenge|blocker|limitation/i.test(content)) {
            feasibilityScore += 1;
        }
        
        this.metrics.technicalFeasibility = Math.min(10, feasibilityScore);
        
        if (this.metrics.technicalFeasibility < 6) {
            this.recommendations.push('Add more technical feasibility analysis and risk assessment');
        }
    }

    scoreTaskStructure(content) {
        const tasksSection = this.extractSection(content, 'Tasks / Subtasks');
        if (!tasksSection) {
            this.metrics.taskStructure = 0;
            this.recommendations.push('Add comprehensive task breakdown with subtasks');
            return;
        }
        
        const tasks = tasksSection.match(/- \[ \]/g);
        const taskCount = tasks ? tasks.length : 0;
        
        // Check for hierarchical structure
        const hasPhases = /### Phase|## Phase/i.test(tasksSection);
        const hasSubtasks = /  - \[ \]/g.test(tasksSection);
        
        let structureScore = Math.min(5, taskCount * 0.5);
        if (hasPhases) structureScore += 2;
        if (hasSubtasks) structureScore += 2;
        if (taskCount >= 10) structureScore += 1;
        
        this.metrics.taskStructure = Math.min(10, structureScore);
        
        if (this.metrics.taskStructure < 6) {
            this.recommendations.push('Improve task structure with clear phases and subtasks');
        }
    }

    scoreSecurityConsiderations(content) {
        const securityKeywords = [
            'security', 'authentication', 'authorization', 'validation', 
            'sanitization', 'encryption', 'access control', 'audit'
        ];
        
        let securityScore = 3; // Base score for basic consideration
        
        securityKeywords.forEach(keyword => {
            if (content.toLowerCase().includes(keyword)) {
                securityScore += 0.5;
            }
        });
        
        // Check for security section
        if (/security consideration|security requirement|security note/i.test(content)) {
            securityScore += 2;
        }
        
        this.metrics.securityConsiderations = Math.min(10, securityScore);
        
        if (this.metrics.securityConsiderations < 5) {
            this.recommendations.push('Consider security implications and add security requirements');
        }
    }

    scoreTestability(content) {
        let testabilityScore = 2; // Base score
        
        // Check for testing strategy
        if (/testing strategy|test plan|testing approach/i.test(content)) {
            testabilityScore += 3;
        }
        
        // Check for test types mentioned
        const testTypes = ['unit test', 'integration test', 'end-to-end', 'performance test'];
        testTypes.forEach(type => {
            if (content.toLowerCase().includes(type)) {
                testabilityScore += 1;
            }
        });
        
        // Check for testable acceptance criteria
        const acSection = this.extractSection(content, 'Acceptance Criteria');
        if (acSection && this.hasTestableElements(acSection)) {
            testabilityScore += 2;
        }
        
        this.metrics.testability = Math.min(10, testabilityScore);
        
        if (this.metrics.testability < 6) {
            this.recommendations.push('Add comprehensive testing strategy and testable criteria');
        }
    }

    scoreClaritySpecificity(content) {
        let clarityScore = 5; // Base score
        
        // Check for clear user story format
        if (/\*\*As a\*\*.*\*\*I want\*\*.*\*\*so that\*\*/i.test(content)) {
            clarityScore += 2;
        }
        
        // Check for specific terminology vs vague language
        const vague = ['improve', 'enhance', 'optimize', 'better', 'good'];
        const specific = ['implement', 'create', 'add', 'remove', 'update', 'integrate'];
        
        let vagueCount = 0;
        let specificCount = 0;
        
        vague.forEach(word => {
            vagueCount += (content.toLowerCase().match(new RegExp(word, 'g')) || []).length;
        });
        
        specific.forEach(word => {
            specificCount += (content.toLowerCase().match(new RegExp(word, 'g')) || []).length;
        });
        
        if (specificCount > vagueCount) clarityScore += 2;
        if (vagueCount > specificCount * 2) clarityScore -= 1;
        
        this.metrics.claritySpecificity = Math.min(10, clarityScore);
        
        if (this.metrics.claritySpecificity < 6) {
            this.recommendations.push('Use more specific language and reduce vague terminology');
        }
    }

    scoreBusinessValue(content) {
        let valueScore = 3; // Base score
        
        // Check for business value articulation
        if (/business value|benefit|impact|roi|return on investment/i.test(content)) {
            valueScore += 2;
        }
        
        // Check for user benefit in story format
        if (/so that.*\b(can|will|able to|improve|increase|reduce|save)\b/i.test(content)) {
            valueScore += 2;
        }
        
        // Check for success metrics
        if (/metric|measure|kpi|success|target|goal/i.test(content)) {
            valueScore += 2;
        }
        
        this.metrics.businessValue = Math.min(10, valueScore);
        
        if (this.metrics.businessValue < 5) {
            this.recommendations.push('Clarify business value and success metrics');
        }
    }

    scoreImplementationReadiness(content) {
        let readinessScore = 4; // Base score
        
        // Check for implementation details
        if (/implementation|approach|technical details|architecture/i.test(content)) {
            readinessScore += 2;
        }
        
        // Check for file structure or code examples
        if (/```|file structure|directory|component|class|function/i.test(content)) {
            readinessScore += 2;
        }
        
        // Check for dependency identification
        if (/dependency|prerequisite|library|framework|tool/i.test(content)) {
            readinessScore += 1;
        }
        
        this.metrics.implementationReadiness = Math.min(10, readinessScore);
        
        if (this.metrics.implementationReadiness < 6) {
            this.recommendations.push('Add more implementation details and technical specifications');
        }
    }

    scoreQualityAssurance(content, validationResult) {
        let qaScore = 5; // Base score
        
        // Factor in validation result
        if (validationResult) {
            if (validationResult.issues.critical.length === 0) qaScore += 2;
            if (validationResult.issues.shouldFix.length <= 2) qaScore += 1;
            if (validationResult.issues.niceToHave.length <= 3) qaScore += 1;
        }
        
        // Check for QA considerations
        if (/quality|review|validation|verification/i.test(content)) {
            qaScore += 1;
        }
        
        this.metrics.qualityAssurance = Math.min(10, qaScore);
        
        if (this.metrics.qualityAssurance < 6) {
            this.recommendations.push('Address validation issues and improve quality considerations');
        }
    }

    calculateWeightedScore() {
        let totalScore = 0;
        Object.keys(this.metrics).forEach(metric => {
            totalScore += this.metrics[metric] * this.weightings[metric];
        });
        return totalScore;
    }

    generateScoringReport() {
        const weightedScore = this.calculateWeightedScore();
        
        return {
            overallScore: weightedScore.toFixed(1),
            detailedMetrics: this.metrics,
            recommendations: this.recommendations,
            insights: this.generateInsights(),
            readinessLevel: this.getReadinessLevel(weightedScore),
            improvementPriorities: this.getImprovementPriorities()
        };
    }

    generateInsights() {
        const insights = [];
        
        const topMetrics = Object.entries(this.metrics)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3);
            
        const bottomMetrics = Object.entries(this.metrics)
            .sort(([,a], [,b]) => a - b)
            .slice(0, 3);
        
        insights.push(`Strongest areas: ${topMetrics.map(([name]) => name).join(', ')}`);
        insights.push(`Areas for improvement: ${bottomMetrics.map(([name]) => name).join(', ')}`);
        
        return insights;
    }

    getReadinessLevel(score) {
        if (score >= 9) return 'Excellent - Ready for immediate implementation';
        if (score >= 8) return 'Good - Minor refinements recommended';
        if (score >= 7) return 'Acceptable - Some improvements needed';
        if (score >= 6) return 'Needs Work - Significant improvements required';
        if (score >= 5) return 'Poor - Major revision needed';
        return 'Critical - Complete rewrite recommended';
    }

    getImprovementPriorities() {
        return Object.entries(this.metrics)
            .filter(([, score]) => score < 6)
            .sort(([,a], [,b]) => a - b)
            .map(([name]) => name);
    }

    // Helper methods
    extractSection(content, sectionName) {
        const sectionPattern = new RegExp(`^##\\s+${sectionName}\\s*$`, 'm');
        const match = content.match(sectionPattern);
        
        if (!match) return null;
        
        const sectionStart = match.index + match[0].length;
        const nextSectionPattern = /^##\s+/m;
        const remainingContent = content.slice(sectionStart);
        const nextSectionMatch = remainingContent.match(nextSectionPattern);
        
        const sectionEnd = nextSectionMatch ? sectionStart + nextSectionMatch.index : content.length;
        return content.slice(sectionStart, sectionEnd).trim();
    }

    isMeasurable(criterion) {
        return /\d+|percent|%|measure|metric|count|number|score|rate|time|duration/i.test(criterion);
    }

    isSpecific(criterion) {
        return !/vague|general|improve|enhance|better|good|bad/i.test(criterion);
    }

    isActionable(criterion) {
        return /implement|create|add|remove|update|build|deploy|configure|test|validate/i.test(criterion);
    }

    hasTestableElements(content) {
        return /verify|validate|test|measure|check|confirm|ensure/i.test(content);
    }
}

// Main execution for CLI usage
async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error('Usage: story-scoring-system.js <story_file_path> [validation_result_json]');
        process.exit(1);
    }
    
    const storyPath = args[0];
    const validationResultPath = args[1];
    
    if (!fs.existsSync(storyPath)) {
        console.error(`Story file not found: ${storyPath}`);
        process.exit(1);
    }
    
    const storyContent = fs.readFileSync(storyPath, 'utf8');
    let validationResult = null;
    
    if (validationResultPath && fs.existsSync(validationResultPath)) {
        validationResult = JSON.parse(fs.readFileSync(validationResultPath, 'utf8'));
    }
    
    const scoringSystem = new StoryScoringSystem();
    const report = scoringSystem.analyzeStory(storyContent, validationResult);
    
    console.log(JSON.stringify(report, null, 2));
}

// Check if this is the main module (ES module equivalent of require.main === module)
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('Scoring error:', error.message);
        process.exit(1);
    });
}

export default StoryScoringSystem;