#!/usr/bin/env node

/**
 * Sub-Agent Output Validation System
 * Implements agent-specific validation with R.O.C.K.E.T. framework integration
 * Validates outputs from Claude Code sub-agents based on agent type and specialization
 */

import fs from 'fs';
import path from 'path';

// Agent-specific validation configurations
const AGENT_CONFIGS = {
    // Marketing Team Agents
    'marketing-director': {
        framework: 'strategic-marketing',
        requiredElements: ['strategy', 'objectives', 'metrics'],
        qualityGate: 7.5,
        validationRules: {
            strategyDepth: { weight: 0.3, threshold: 0.7 },
            objectiveClarity: { weight: 0.25, threshold: 0.8 },
            metricsAlignment: { weight: 0.25, threshold: 0.7 },
            irishPersonality: { weight: 0.2, threshold: 0.6 }
        }
    },
    'marketing-content-hooks': {
        framework: 'content-quality',
        requiredElements: ['hook', 'value-proposition', 'cta'],
        qualityGate: 7.0,
        validationRules: {
            hookEffectiveness: { weight: 0.4, threshold: 0.8 },
            valueClarity: { weight: 0.3, threshold: 0.7 },
            ctaStrength: { weight: 0.2, threshold: 0.7 },
            irishPersonality: { weight: 0.1, threshold: 0.6 }
        }
    },
    'marketing-viral-growth': {
        framework: 'viral-mechanics',
        requiredElements: ['k-factor', 'sharing-mechanics', 'network-effects'],
        qualityGate: 8.0,
        validationRules: {
            viralPotential: { weight: 0.4, threshold: 0.8 },
            networkAnalysis: { weight: 0.3, threshold: 0.7 },
            sharingOptimization: { weight: 0.2, threshold: 0.7 },
            irishPersonality: { weight: 0.1, threshold: 0.6 }
        }
    },
    
    // Engineering Team Agents
    'engineering-director': {
        framework: 'technical-architecture',
        requiredElements: ['architecture', 'implementation', 'quality-gates'],
        qualityGate: 8.0,
        validationRules: {
            architecturalSoundness: { weight: 0.4, threshold: 0.8 },
            implementationClarity: { weight: 0.3, threshold: 0.8 },
            qualityStandards: { weight: 0.2, threshold: 0.7 },
            irishPersonality: { weight: 0.1, threshold: 0.6 }
        }
    },
    'engineering-developer': {
        framework: 'code-quality',
        requiredElements: ['implementation', 'testing', 'documentation'],
        qualityGate: 7.5,
        validationRules: {
            codeQuality: { weight: 0.4, threshold: 0.8 },
            testCoverage: { weight: 0.3, threshold: 0.7 },
            documentation: { weight: 0.2, threshold: 0.7 },
            irishPersonality: { weight: 0.1, threshold: 0.6 }
        }
    },
    
    // Content Team Agents
    'content-playbook-writer': {
        framework: 'content-depth',
        requiredElements: ['structure', 'actionable-content', 'examples'],
        qualityGate: 7.5,
        validationRules: {
            contentDepth: { weight: 0.4, threshold: 0.8 },
            actionability: { weight: 0.3, threshold: 0.8 },
            exampleQuality: { weight: 0.2, threshold: 0.7 },
            irishPersonality: { weight: 0.1, threshold: 0.6 }
        }
    },
    
    // Research Team Agents
    'research-market-analyst': {
        framework: 'research-rigor',
        requiredElements: ['data-sources', 'analysis', 'insights'],
        qualityGate: 8.0,
        validationRules: {
            dataQuality: { weight: 0.4, threshold: 0.8 },
            analysisDepth: { weight: 0.3, threshold: 0.8 },
            insightValue: { weight: 0.2, threshold: 0.7 },
            irishPersonality: { weight: 0.1, threshold: 0.6 }
        }
    },
    
    // Crypto Domain Agents
    'crypto-community-analyst': {
        framework: 'crypto-community',
        requiredElements: ['community-metrics', 'sentiment-analysis', 'growth-patterns'],
        qualityGate: 7.5,
        validationRules: {
            communityInsight: { weight: 0.4, threshold: 0.8 },
            sentimentAccuracy: { weight: 0.3, threshold: 0.7 },
            growthAnalysis: { weight: 0.2, threshold: 0.7 },
            irishPersonality: { weight: 0.1, threshold: 0.6 }
        }
    }
};

// R.O.C.K.E.T. Framework Components
const ROCKET_FRAMEWORK = {
    Role: {
        weight: 0.2,
        validators: [
            'validateAgentIdentity',
            'validateExpertiseAlignment',
            'validatePersonalityIntegration'
        ]
    },
    Objective: {
        weight: 0.2,
        validators: [
            'validateObjectiveClarity',
            'validateGoalAlignment',
            'validateOutcomeDefinition'
        ]
    },
    Context: {
        weight: 0.15,
        validators: [
            'validateContextAwareness',
            'validateInformationUsage',
            'validateRelevance'
        ]
    },
    KeyInstructions: {
        weight: 0.2,
        validators: [
            'validateInstructionCompliance',
            'validateRequirementFulfillment',
            'validateStandardsAdherence'
        ]
    },
    Examples: {
        weight: 0.15,
        validators: [
            'validateExampleQuality',
            'validateBenchmarking',
            'validateBestPractices'
        ]
    },
    Tone: {
        weight: 0.1,
        validators: [
            'validateTonalConsistency',
            'validateProfessionalism',
            'validateIrishPersonality'
        ]
    }
};

class SubAgentOutputValidator {
    constructor() {
        this.validationResults = {
            score: 0,
            status: 'PENDING',
            agentType: null,
            rocketScore: {},
            issues: {
                critical: [],
                shouldFix: [],
                niceToHave: []
            },
            recommendations: []
        };
    }

    async validateOutput(outputContent, agentType, context = {}) {
        try {
            this.validationResults.agentType = agentType;
            
            // Get agent-specific configuration
            const config = AGENT_CONFIGS[agentType] || this.getDefaultConfig();
            
            // Execute R.O.C.K.E.T. framework validation
            await this.executeRocketValidation(outputContent, config, context);
            
            // Execute agent-specific validation
            await this.executeAgentSpecificValidation(outputContent, config, context);
            
            // Calculate final score and status
            this.calculateFinalScore(config);
            
            return this.validationResults;
        } catch (error) {
            return this.generateErrorResult(error);
        }
    }

    getDefaultConfig() {
        return {
            framework: 'general-quality',
            requiredElements: ['content', 'structure', 'quality'],
            qualityGate: 7.0,
            validationRules: {
                contentQuality: { weight: 0.4, threshold: 0.7 },
                structureClarity: { weight: 0.3, threshold: 0.7 },
                valueDelivery: { weight: 0.2, threshold: 0.6 },
                irishPersonality: { weight: 0.1, threshold: 0.6 }
            }
        };
    }

    async executeRocketValidation(content, config, context) {
        for (const [component, settings] of Object.entries(ROCKET_FRAMEWORK)) {
            let componentScore = 0;
            const componentIssues = [];
            
            for (const validator of settings.validators) {
                try {
                    const result = await this[validator](content, config, context);
                    componentScore += result.score;
                    if (result.issues) {
                        componentIssues.push(...result.issues);
                    }
                } catch (error) {
                    componentIssues.push(`${validator} failed: ${error.message}`);
                }
            }
            
            // Average score for component
            componentScore = componentScore / settings.validators.length;
            this.validationResults.rocketScore[component] = {
                score: componentScore,
                weight: settings.weight,
                issues: componentIssues
            };
            
            // Add issues to appropriate categories
            if (componentScore < 0.6) {
                this.validationResults.issues.critical.push(`${component}: Below minimum quality threshold`);
            } else if (componentScore < 0.7) {
                this.validationResults.issues.shouldFix.push(`${component}: Could be improved`);
            } else if (componentScore < 0.8) {
                this.validationResults.issues.niceToHave.push(`${component}: Minor optimization opportunity`);
            }
        }
    }

    async executeAgentSpecificValidation(content, config, context) {
        // Validate required elements are present
        const missingElements = [];
        for (const element of config.requiredElements) {
            if (!this.elementPresent(content, element)) {
                missingElements.push(element);
            }
        }
        
        if (missingElements.length > 0) {
            this.validationResults.issues.critical.push(`Missing required elements: ${missingElements.join(', ')}`);
        }
        
        // Execute agent-specific validation rules
        for (const [rule, settings] of Object.entries(config.validationRules)) {
            const result = await this.executeValidationRule(content, rule, settings, context);
            if (result.score < settings.threshold) {
                const severity = result.score < 0.5 ? 'critical' : result.score < 0.7 ? 'shouldFix' : 'niceToHave';
                this.validationResults.issues[severity].push(`${rule}: ${result.message || 'Below threshold'}`);
            }
        }
    }

    async executeValidationRule(content, rule, settings, context) {
        // Default implementation - can be overridden for specific rules
        const methodName = `validate${rule.charAt(0).toUpperCase() + rule.slice(1)}`;
        
        if (typeof this[methodName] === 'function') {
            return await this[methodName](content, settings, context);
        }
        
        // Fallback validation based on keywords and patterns
        return this.fallbackValidation(content, rule, settings);
    }

    elementPresent(content, element) {
        const patterns = {
            'strategy': /strategy|strategic|approach|plan/i,
            'objectives': /objective|goal|target|aim/i,
            'metrics': /metric|measure|kpi|analytics/i,
            'hook': /hook|headline|attention|opening/i,
            'value-proposition': /value|benefit|advantage|proposition/i,
            'cta': /call.to.action|cta|click|action/i,
            'k-factor': /k.factor|viral|coefficient|sharing/i,
            'sharing-mechanics': /share|sharing|viral|spread/i,
            'network-effects': /network|viral|exponential|growth/i,
            'architecture': /architecture|design|structure|system/i,
            'implementation': /implement|code|build|develop/i,
            'quality-gates': /quality|standard|gate|check/i,
            'testing': /test|testing|qa|validation/i,
            'documentation': /document|documentation|readme|guide/i,
            'structure': /structure|organization|layout|format/i,
            'actionable-content': /actionable|practical|step|action/i,
            'examples': /example|sample|case.study|demo/i,
            'data-sources': /data|source|research|study/i,
            'analysis': /analysis|analyze|evaluation|assessment/i,
            'insights': /insight|finding|conclusion|recommendation/i,
            'community-metrics': /community|member|engagement|activity/i,
            'sentiment-analysis': /sentiment|mood|opinion|feeling/i,
            'growth-patterns': /growth|pattern|trend|trajectory/i
        };
        
        const pattern = patterns[element] || new RegExp(element.replace(/-/g, '\\s+'), 'i');
        return pattern.test(content);
    }

    // R.O.C.K.E.T. Framework Validators
    async validateAgentIdentity(content, config, context) {
        const irishNamePattern = /\b[A-Z][a-z]+\s+[A-Z]['a-zA-Z]+\b/;
        const agentIntroPattern = /I'm\s+\w+.*specialist|expert|manager/i;
        
        let score = 0;
        const issues = [];
        
        if (irishNamePattern.test(content)) score += 0.4;
        else issues.push('Irish name not clearly present');
        
        if (agentIntroPattern.test(content)) score += 0.4;
        else issues.push('Agent introduction not clear');
        
        if (/\byears?\b.*experience/i.test(content)) score += 0.2;
        else issues.push('Experience not mentioned');
        
        return { score, issues };
    }

    async validateExpertiseAlignment(content, config, context) {
        const expertiseKeywords = this.getExpertiseKeywords(config.framework);
        let matchCount = 0;
        
        for (const keyword of expertiseKeywords) {
            if (new RegExp(keyword, 'i').test(content)) {
                matchCount++;
            }
        }
        
        const score = Math.min(1.0, matchCount / expertiseKeywords.length * 1.5);
        const issues = score < 0.7 ? ['Expertise alignment could be stronger'] : [];
        
        return { score, issues };
    }

    async validatePersonalityIntegration(content, config, context) {
        const irishElements = [
            /\b(sláinte|céad míle fáilte|craic|grand|fair play)\b/i,
            /\b[A-Z]['O][A-Z][a-z]+\b/, // Irish surnames
            /\"[^"]*\"/  // Irish sayings in quotes
        ];
        
        let score = 0;
        const issues = [];
        
        // Check for Irish cultural elements
        const irishMatches = irishElements.filter(pattern => pattern.test(content)).length;
        score += Math.min(0.5, irishMatches * 0.2);
        
        // Check for professional balance
        if (/professional|expertise|experience/i.test(content)) {
            score += 0.3;
        } else {
            issues.push('Professional credibility needs emphasis');
        }
        
        // Check for warmth and approachability
        if (/ready|help|guide|support/i.test(content)) {
            score += 0.2;
        }
        
        return { score, issues };
    }

    async validateObjectiveClarity(content, config, context) {
        const objectivePatterns = [
            /objective|goal|aim|purpose/i,
            /achieve|accomplish|deliver|create/i,
            /outcome|result|success|impact/i
        ];
        
        const matches = objectivePatterns.filter(pattern => pattern.test(content)).length;
        const score = Math.min(1.0, matches / objectivePatterns.length * 1.2);
        
        const issues = score < 0.7 ? ['Objective clarity needs improvement'] : [];
        return { score, issues };
    }

    async validateGoalAlignment(content, config, context) {
        // Check if content aligns with stated goals
        const score = 0.8; // Default high score - override in specific implementations
        return { score, issues: [] };
    }

    async validateOutcomeDefinition(content, config, context) {
        const outcomePatterns = [
            /measure|metric|kpi/i,
            /success|achievement|completion/i,
            /deliverable|output|result/i
        ];
        
        const matches = outcomePatterns.filter(pattern => pattern.test(content)).length;
        const score = Math.min(1.0, matches / outcomePatterns.length);
        
        return { score, issues: [] };
    }

    async validateContextAwareness(content, config, context) {
        // Check if content shows awareness of provided context
        const contextElements = Object.keys(context).length;
        const score = contextElements > 0 ? 0.8 : 0.6;
        
        return { score, issues: contextElements === 0 ? ['Limited context utilization'] : [] };
    }

    async validateInformationUsage(content, config, context) {
        // Check if available information is properly utilized
        const score = 0.7; // Default score
        return { score, issues: [] };
    }

    async validateRelevance(content, config, context) {
        // Check content relevance to the task
        const score = 0.8; // Default high relevance
        return { score, issues: [] };
    }

    async validateInstructionCompliance(content, config, context) {
        // Check compliance with key instructions
        const complianceScore = this.checkInstructionCompliance(content, config);
        return { score: complianceScore, issues: complianceScore < 0.7 ? ['Instruction compliance needs improvement'] : [] };
    }

    async validateRequirementFulfillment(content, config, context) {
        const fulfilledElements = config.requiredElements.filter(element => 
            this.elementPresent(content, element)
        ).length;
        
        const score = fulfilledElements / config.requiredElements.length;
        const issues = score < 0.8 ? ['Some requirements not fully addressed'] : [];
        
        return { score, issues };
    }

    async validateStandardsAdherence(content, config, context) {
        // Check adherence to quality standards
        const score = 0.75; // Default score
        return { score, issues: [] };
    }

    async validateExampleQuality(content, config, context) {
        const examplePatterns = [
            /example|for instance|such as/i,
            /case study|use case|scenario/i,
            /demo|demonstration|illustration/i
        ];
        
        const matches = examplePatterns.filter(pattern => pattern.test(content)).length;
        const score = Math.min(1.0, matches * 0.3);
        
        return { score, issues: score < 0.5 ? ['More examples would improve clarity'] : [] };
    }

    async validateBenchmarking(content, config, context) {
        // Check for benchmarking against best practices
        const score = /best practice|benchmark|standard|industry/i.test(content) ? 0.8 : 0.5;
        return { score, issues: [] };
    }

    async validateBestPractices(content, config, context) {
        // Validate incorporation of best practices
        const score = 0.7; // Default score
        return { score, issues: [] };
    }

    async validateTonalConsistency(content, config, context) {
        // Check consistency of tone throughout content
        const score = 0.8; // Default high consistency
        return { score, issues: [] };
    }

    async validateProfessionalism(content, config, context) {
        const professionalElements = [
            /expertise|experience|professional/i,
            /strategy|approach|methodology/i,
            /quality|excellence|standard/i
        ];
        
        const matches = professionalElements.filter(pattern => pattern.test(content)).length;
        const score = Math.min(1.0, matches / professionalElements.length);
        
        return { score, issues: score < 0.7 ? ['Professional tone could be enhanced'] : [] };
    }

    async validateIrishPersonality(content, config, context) {
        // Check for appropriate Irish personality integration
        const irishElementsScore = await this.validatePersonalityIntegration(content, config, context);
        return irishElementsScore;
    }

    getExpertiseKeywords(framework) {
        const keywordMap = {
            'strategic-marketing': ['strategy', 'marketing', 'brand', 'campaign', 'growth', 'metrics'],
            'content-quality': ['content', 'engagement', 'hooks', 'value', 'conversion', 'audience'],
            'viral-mechanics': ['viral', 'k-factor', 'sharing', 'network', 'exponential', 'growth'],
            'technical-architecture': ['architecture', 'system', 'design', 'scalability', 'performance'],
            'code-quality': ['code', 'development', 'testing', 'standards', 'best practices'],
            'content-depth': ['content', 'structure', 'actionable', 'comprehensive', 'value'],
            'research-rigor': ['research', 'data', 'analysis', 'insights', 'methodology'],
            'crypto-community': ['community', 'crypto', 'blockchain', 'sentiment', 'engagement']
        };
        
        return keywordMap[framework] || ['quality', 'expertise', 'professional', 'excellence'];
    }

    checkInstructionCompliance(content, config) {
        // Basic compliance check - can be enhanced for specific instructions
        const hasStructure = /##|###|\*\*/.test(content);
        const hasContent = content.length > 100;
        const hasConclusion = /ready|available|help|support/i.test(content);
        
        let score = 0;
        if (hasStructure) score += 0.4;
        if (hasContent) score += 0.4;
        if (hasConclusion) score += 0.2;
        
        return score;
    }

    fallbackValidation(content, rule, settings) {
        // Fallback validation for unimplemented specific rules
        const score = content.length > 50 ? 0.6 : 0.3;
        return {
            score,
            message: `${rule} validation needs specific implementation`
        };
    }

    calculateFinalScore(config) {
        let totalScore = 0;
        let totalWeight = 0;
        
        // Calculate weighted R.O.C.K.E.T. score
        for (const [component, result] of Object.entries(this.validationResults.rocketScore)) {
            totalScore += result.score * result.weight;
            totalWeight += result.weight;
        }
        
        // Normalize to 10-point scale
        const finalScore = (totalScore / totalWeight) * 10;
        
        this.validationResults.score = Math.min(10, Math.max(0, finalScore));
        this.validationResults.status = this.validationResults.score >= config.qualityGate ? 'PASS' : 'FAIL';
        
        // Generate recommendations
        this.generateRecommendations(config);
    }

    generateRecommendations(config) {
        const recommendations = [];
        
        if (this.validationResults.score < config.qualityGate) {
            recommendations.push(`Score ${this.validationResults.score.toFixed(1)} is below quality gate ${config.qualityGate}`);
        }
        
        // Add component-specific recommendations
        for (const [component, result] of Object.entries(this.validationResults.rocketScore)) {
            if (result.score < 0.7) {
                recommendations.push(`Improve ${component}: ${result.issues.join(', ')}`);
            }
        }
        
        this.validationResults.recommendations = recommendations;
    }

    generateErrorResult(error) {
        return {
            score: 0,
            status: 'ERROR',
            agentType: null,
            error: error.message,
            issues: {
                critical: [error.message],
                shouldFix: [],
                niceToHave: []
            },
            recommendations: ['Fix validation error and retry']
        };
    }
}

// Main execution for CLI usage
async function main() {
    const outputContent = process.argv[2];
    const agentType = process.argv[3];
    const contextStr = process.argv[4] || '{}';
    
    if (!outputContent || !agentType) {
        console.error('Usage: sub-agent-output-validator.js <output_content> <agent_type> [context_json]');
        process.exit(1);
    }
    
    try {
        const context = JSON.parse(contextStr);
        const validator = new SubAgentOutputValidator();
        const result = await validator.validateOutput(outputContent, agentType, context);
        
        // Output results
        console.log(`SCORE: ${result.score.toFixed(1)}`);
        console.log(`STATUS: ${result.status}`);
        console.log(`AGENT_TYPE: ${result.agentType}`);
        
        if (result.issues.critical.length > 0) {
            console.log(`CRITICAL: ${result.issues.critical.join('; ')}`);
        }
        if (result.issues.shouldFix.length > 0) {
            console.log(`SHOULD_FIX: ${result.issues.shouldFix.join('; ')}`);
        }
        if (result.recommendations.length > 0) {
            console.log(`RECOMMENDATIONS: ${result.recommendations.join('; ')}`);
        }
        
        process.exit(result.status === 'PASS' ? 0 : 1);
    } catch (error) {
        console.error('VALIDATION_ERROR:', error.message);
        process.exit(1);
    }
}

// Check if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('FATAL_ERROR:', error.message);
        process.exit(1);
    });
}

export default SubAgentOutputValidator;