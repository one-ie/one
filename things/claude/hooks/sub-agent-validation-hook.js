#!/usr/bin/env node

/**
 * Sub-Agent Validation Hook
 * Validates outputs from Claude Code sub-agents using R.O.C.K.E.T. framework
 * Integrates with existing quality validation while adapting for agent-specific requirements
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Agent-specific validation rules
const AGENT_VALIDATION_RULES = {
    'marketing-director': {
        framework: 'strategic-marketing',
        qualityGate: 7.0,
        requiredElements: ['Foundation', 'Strategy', 'Metrics'],
        irishPersonality: true
    },
    'engineering-director': {
        framework: 'technical-architecture',
        qualityGate: 8.0,
        requiredElements: ['Architecture', 'Implementation', 'Testing'],
        irishPersonality: true
    },
    'marketing-content-hooks': {
        framework: 'content-engagement',
        qualityGate: 7.5,
        requiredElements: ['Hook', 'Value', 'Call-to-Action'],
        irishPersonality: true
    },
    'marketing-viral-growth': {
        framework: 'viral-mechanics',
        qualityGate: 7.5,
        requiredElements: ['K-Factor', 'Share-Triggers', 'Network-Effects'],
        irishPersonality: true
    },
    'engineering-developer': {
        framework: 'code-quality',
        qualityGate: 8.0,
        requiredElements: ['Implementation', 'Testing', 'Documentation'],
        irishPersonality: true
    }
};

// R.O.C.K.E.T. Framework validation components
const ROCKET_COMPONENTS = {
    Role: 'Agent identity and capabilities clearly demonstrated',
    Objective: 'Output aligned with stated goals and agent purpose',
    Context: 'Appropriate use of available information and frameworks',
    KeyInstructions: 'Compliance with agent-specific guidelines and standards',
    Examples: 'Quality benchmarking against established patterns',
    Tone: 'Professional expertise with authentic Irish personality integration'
};

class SubAgentValidator {
    constructor() {
        this.logFile = path.join(__dirname, 'validation.log');
        this.initializeLogger();
    }

    initializeLogger() {
        if (!fs.existsSync(this.logFile)) {
            fs.writeFileSync(this.logFile, '');
        }
    }

    log(level, message, agentName = 'unknown') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level.toUpperCase()}] [${agentName}] ${message}\n`;
        fs.appendFileSync(this.logFile, logEntry);
        
        if (level === 'error' || level === 'warn') {
            console.error(logEntry.trim());
        } else {
            console.log(logEntry.trim());
        }
    }

    detectAgentFromContext(content, context = {}) {
        // Try to identify agent from various sources
        if (context.agentName) {
            return context.agentName;
        }

        // Look for agent signatures in content
        const agentSignatures = Object.keys(AGENT_VALIDATION_RULES);
        for (const agentName of agentSignatures) {
            if (content.includes(agentName) || content.includes(agentName.replace('-', ' '))) {
                return agentName;
            }
        }

        // Look for Irish names that might indicate specific agents
        const irishNamePatterns = [
            'Siobhan O\'Brien', 'Declan Murphy', 'Cormac Byrne', 'Róisín Kelly'
        ];

        for (const name of irishNamePatterns) {
            if (content.includes(name)) {
                // Map names to agents (simplified mapping)
                if (name.includes('Siobhan')) return 'marketing-director';
                if (name.includes('Declan')) return 'engineering-director';
                if (name.includes('Cormac')) return 'marketing-content-hooks';
                if (name.includes('Róisín')) return 'marketing-viral-growth';
            }
        }

        return 'generic-agent';
    }

    validateROCKETFramework(content, agentName) {
        const validationResults = {};
        let totalScore = 10; // Start with perfect score

        // Role validation
        const hasRoleClarity = content.includes('I\'m ') || content.includes('I am ') || 
                              content.includes('specialist') || content.includes('expert');
        validationResults.Role = {
            passed: hasRoleClarity,
            score: hasRoleClarity ? 1.0 : 0.5,
            message: hasRoleClarity ? 'Agent role clearly defined' : 'Role clarity could be improved'
        };

        // Objective validation
        const hasObjective = content.includes('specialize') || content.includes('focus') ||
                            content.includes('objective') || content.includes('goal');
        validationResults.Objective = {
            passed: hasObjective,
            score: hasObjective ? 1.0 : 0.6,
            message: hasObjective ? 'Clear objectives present' : 'Objectives could be more explicit'
        };

        // Context validation
        const hasContext = content.includes('experience') || content.includes('expertise') ||
                          content.includes('approach') || content.includes('methodology');
        validationResults.Context = {
            passed: hasContext,
            score: hasContext ? 1.0 : 0.7,
            message: hasContext ? 'Good contextual information' : 'More context would improve quality'
        };

        // Key Instructions validation (agent-specific)
        const agentRules = AGENT_VALIDATION_RULES[agentName] || AGENT_VALIDATION_RULES['generic-agent'];
        const hasKeyInstructions = agentRules?.requiredElements?.some(element => 
            content.toLowerCase().includes(element.toLowerCase())
        ) || true; // Default to true for unknown agents

        validationResults.KeyInstructions = {
            passed: hasKeyInstructions,
            score: hasKeyInstructions ? 1.0 : 0.4,
            message: hasKeyInstructions ? 'Key instructions followed' : 'Missing key required elements'
        };

        // Examples validation
        const hasExamples = content.includes('example') || content.includes('such as') ||
                          content.includes('including') || content.includes('like');
        validationResults.Examples = {
            passed: hasExamples,
            score: hasExamples ? 1.0 : 0.8,
            message: hasExamples ? 'Good use of examples' : 'Examples would enhance clarity'
        };

        // Tone validation (Irish personality + professionalism)
        const hasIrishElements = content.includes('Irish') || 
                                content.match(/[ÁÉÍÓÚáéíóú]/) || // Irish characters
                                content.includes('Dublin') || content.includes('Ireland');
        const isProfessional = !content.includes('slang') && 
                              (content.includes('expertise') || content.includes('professional'));

        validationResults.Tone = {
            passed: hasIrishElements && isProfessional,
            score: (hasIrishElements && isProfessional) ? 1.0 : 0.7,
            message: (hasIrishElements && isProfessional) ? 
                    'Excellent Irish professional tone' : 
                    'Tone could better balance Irish personality with professionalism'
        };

        // Calculate overall score
        const componentScores = Object.values(validationResults).map(r => r.score);
        const averageScore = componentScores.reduce((a, b) => a + b, 0) / componentScores.length;
        const finalScore = Math.round(averageScore * 10 * 100) / 100; // Scale to 10 and round

        return {
            agentName,
            score: finalScore,
            components: validationResults,
            passed: finalScore >= (agentRules?.qualityGate || 6.0),
            qualityGate: agentRules?.qualityGate || 6.0
        };
    }

    validateAntiHallucination(content, agentName) {
        // Check for common hallucination patterns
        const hallucinationWarnings = [];

        // Check for fake URLs or references
        const urlPattern = /https?:\/\/[^\s]+/g;
        const urls = content.match(urlPattern) || [];
        for (const url of urls) {
            if (!url.includes('claude.ai') && !url.includes('anthropic.com') && 
                !url.includes('github.com') && !url.includes('one.ie')) {
                hallucinationWarnings.push(`External URL detected: ${url}`);
            }
        }

        // Check for specific technical claims that should be verified
        const technicalClaims = [
            'API endpoint', 'database schema', 'specific version numbers',
            'exact statistics', 'precise dates'
        ];

        for (const claim of technicalClaims) {
            if (content.toLowerCase().includes(claim.toLowerCase())) {
                hallucinationWarnings.push(`Technical claim requires verification: ${claim}`);
            }
        }

        return {
            passed: hallucinationWarnings.length === 0,
            warnings: hallucinationWarnings,
            riskLevel: hallucinationWarnings.length > 2 ? 'high' : 
                      hallucinationWarnings.length > 0 ? 'medium' : 'low'
        };
    }

    async validateOutput(content, context = {}) {
        try {
            const agentName = this.detectAgentFromContext(content, context);
            this.log('info', `Starting validation for agent: ${agentName}`, agentName);

            // R.O.C.K.E.T. Framework validation
            const rocketValidation = this.validateROCKETFramework(content, agentName);
            
            // Anti-hallucination detection
            const hallucinationCheck = this.validateAntiHallucination(content, agentName);

            // Content quality checks
            const wordCount = content.split(/\s+/).length;
            const hasStructure = content.includes('#') || content.includes('##') || 
                               content.includes('- ') || content.includes('1. ');

            const qualityMetrics = {
                wordCount,
                hasStructure,
                readability: wordCount > 50 && hasStructure ? 'good' : 'needs-improvement',
                completeness: wordCount > 100 ? 'complete' : 'brief'
            };

            // Overall assessment
            const overallScore = rocketValidation.score;
            const qualityGate = AGENT_VALIDATION_RULES[agentName]?.qualityGate || 6.0;
            const passed = overallScore >= qualityGate && hallucinationCheck.passed;

            const result = {
                agentName,
                timestamp: new Date().toISOString(),
                overallScore,
                qualityGate,
                passed,
                rocketValidation,
                hallucinationCheck,
                qualityMetrics,
                recommendations: this.generateRecommendations(rocketValidation, hallucinationCheck, qualityMetrics)
            };

            this.log(passed ? 'info' : 'warn', 
                    `Validation ${passed ? 'PASSED' : 'FAILED'} - Score: ${overallScore}/${qualityGate}`, 
                    agentName);

            return result;

        } catch (error) {
            this.log('error', `Validation error: ${error.message}`, 'system');
            return {
                agentName: 'unknown',
                passed: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    generateRecommendations(rocketValidation, hallucinationCheck, qualityMetrics) {
        const recommendations = [];

        // R.O.C.K.E.T. specific recommendations
        Object.entries(rocketValidation.components).forEach(([component, result]) => {
            if (result.score < 0.8) {
                recommendations.push(`Improve ${component}: ${result.message}`);
            }
        });

        // Hallucination warnings
        if (hallucinationCheck.warnings.length > 0) {
            recommendations.push('Verify technical claims and external references');
        }

        // Quality improvements
        if (qualityMetrics.wordCount < 100) {
            recommendations.push('Consider expanding content for better completeness');
        }

        if (!qualityMetrics.hasStructure) {
            recommendations.push('Add structure with headers, lists, or bullet points');
        }

        return recommendations;
    }
}

// Main execution
async function main() {
    if (process.argv.length < 3) {
        console.error('Usage: sub-agent-validation-hook.js <content> [agent-name]');
        process.exit(1);
    }

    const content = process.argv[2];
    const agentName = process.argv[3];

    const validator = new SubAgentValidator();
    const result = await validator.validateOutput(content, { agentName });

    // Output results
    console.log(JSON.stringify(result, null, 2));

    // Exit with appropriate code
    process.exit(result.passed ? 0 : 2);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

export { SubAgentValidator };