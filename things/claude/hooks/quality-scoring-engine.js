#!/usr/bin/env node

/**
 * Real-Time Quality Scoring Engine
 * Implements continuous quality assessment for sub-agent outputs
 * Integrates with R.O.C.K.E.T. framework and provides real-time scoring
 */

import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';

// Quality scoring configuration
const SCORING_CONFIG = {
    CONTENT_TYPES: {
        'mission-plan': {
            weight: 1.0,
            scoringCriteria: {
                strategicClarity: 0.3,
                actionability: 0.25,
                measurability: 0.2,
                resourceAlignment: 0.15,
                riskAssessment: 0.1
            },
            qualityThreshold: 7.5
        },
        'story-creation': {
            weight: 1.0,
            scoringCriteria: {
                narrativeStructure: 0.25,
                acceptanceCriteria: 0.3,
                technicalFeasibility: 0.2,
                businessValue: 0.15,
                testability: 0.1
            },
            qualityThreshold: 7.0
        },
        'technical-specification': {
            weight: 1.0,
            scoringCriteria: {
                technicalAccuracy: 0.35,
                implementationClarity: 0.25,
                architecturalSoundness: 0.2,
                securityConsiderations: 0.15,
                scalabilityPlanning: 0.05
            },
            qualityThreshold: 8.0
        },
        'marketing-content': {
            weight: 1.0,
            scoringCriteria: {
                messageClarity: 0.25,
                audienceAlignment: 0.25,
                brandConsistency: 0.2,
                engagementPotential: 0.2,
                callToAction: 0.1
            },
            qualityThreshold: 7.0
        },
        'research-analysis': {
            weight: 1.0,
            scoringCriteria: {
                dataAccuracy: 0.3,
                analysisDepth: 0.25,
                insightQuality: 0.2,
                sourceCredibility: 0.15,
                actionableFindings: 0.1
            },
            qualityThreshold: 8.0
        }
    },
    
    AGENT_MULTIPLIERS: {
        'marketing-director': 1.1,      // Strategic content gets bonus
        'engineering-director': 1.1,    // Technical leadership bonus
        'research-market-analyst': 1.05, // Research precision bonus
        'marketing-viral-growth': 1.15,  // Innovative content bonus
        'crypto-community-analyst': 1.05 // Specialized domain bonus
    },
    
    QUALITY_BANDS: {
        EXCELLENT: { min: 9.0, label: 'Excellent', color: 'green' },
        GOOD: { min: 7.5, label: 'Good', color: 'blue' },
        ACCEPTABLE: { min: 6.0, label: 'Acceptable', color: 'yellow' },
        NEEDS_IMPROVEMENT: { min: 4.0, label: 'Needs Improvement', color: 'orange' },
        POOR: { min: 0, label: 'Poor', color: 'red' }
    }
};

class QualityScoringEngine extends EventEmitter {
    constructor() {
        super();
        this.scores = new Map(); // outputId -> scoreData
        this.trends = new Map(); // agentType -> trendData
        this.alerts = [];
        this.startTime = Date.now();
        this.processedCount = 0;
        
        // Initialize trend tracking
        this.initializeTrendTracking();
    }

    initializeTrendTracking() {
        // Track quality trends over time for each agent type
        setInterval(() => {
            this.updateQualityTrends();
        }, 60000); // Update trends every minute
    }

    async scoreOutput(content, metadata = {}) {
        try {
            const outputId = this.generateOutputId(metadata);
            const startTime = Date.now();
            
            // Detect content type
            const contentType = this.detectContentType(content, metadata);
            
            // Get scoring configuration
            const config = SCORING_CONFIG.CONTENT_TYPES[contentType] || 
                          SCORING_CONFIG.CONTENT_TYPES['story-creation'];
            
            // Execute quality assessment
            const qualityScores = await this.assessQuality(content, config, metadata);
            
            // Calculate weighted final score
            const finalScore = this.calculateWeightedScore(qualityScores, config);
            
            // Apply agent multiplier if applicable
            const adjustedScore = this.applyAgentMultiplier(finalScore, metadata.agentType);
            
            // Determine quality band
            const qualityBand = this.getQualityBand(adjustedScore);
            
            // Create score record
            const scoreData = {
                outputId,
                timestamp: new Date().toISOString(),
                contentType,
                agentType: metadata.agentType,
                baseScore: finalScore,
                adjustedScore,
                qualityBand,
                qualityScores,
                metadata,
                processingTime: Date.now() - startTime
            };
            
            // Store score
            this.scores.set(outputId, scoreData);
            
            // Update trends
            this.updateAgentTrend(metadata.agentType, adjustedScore);
            
            // Check for alerts
            this.checkQualityAlerts(scoreData);
            
            // Emit scoring event
            this.emit('scored', scoreData);
            
            this.processedCount++;
            return scoreData;
            
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    detectContentType(content, metadata) {
        // Use metadata first
        if (metadata.contentType && SCORING_CONFIG.CONTENT_TYPES[metadata.contentType]) {
            return metadata.contentType;
        }
        
        // Pattern-based detection
        const typePatterns = {
            'mission-plan': [
                /mission.*objective/i,
                /strategic.*plan/i,
                /goals?.*objectives?/i,
                /mission.*success/i
            ],
            'story-creation': [
                /user story/i,
                /acceptance criteria/i,
                /as a.*i want.*so that/i,
                /story.*epic/i
            ],
            'technical-specification': [
                /architecture/i,
                /technical.*design/i,
                /implementation.*plan/i,
                /api.*specification/i,
                /system.*requirements/i
            ],
            'marketing-content': [
                /marketing.*strategy/i,
                /campaign/i,
                /brand.*messaging/i,
                /audience.*targeting/i,
                /conversion.*optimization/i
            ],
            'research-analysis': [
                /research.*findings/i,
                /market.*analysis/i,
                /data.*insights/i,
                /competitive.*analysis/i,
                /trend.*analysis/i
            ]
        };
        
        for (const [type, patterns] of Object.entries(typePatterns)) {
            if (patterns.some(pattern => pattern.test(content))) {
                return type;
            }
        }
        
        // Default to story creation
        return 'story-creation';
    }

    async assessQuality(content, config, metadata) {
        const qualityScores = {};
        
        for (const [criterion, weight] of Object.entries(config.scoringCriteria)) {
            const score = await this.evaluateCriterion(content, criterion, metadata);
            qualityScores[criterion] = {
                score: Math.min(10, Math.max(0, score)),
                weight,
                weightedScore: score * weight
            };
        }
        
        return qualityScores;
    }

    async evaluateCriterion(content, criterion, metadata) {
        const evaluatorMethod = `evaluate${this.capitalize(criterion)}`;
        
        if (typeof this[evaluatorMethod] === 'function') {
            return await this[evaluatorMethod](content, metadata);
        }
        
        // Fallback evaluation
        return this.fallbackEvaluation(content, criterion);
    }

    // Quality Criterion Evaluators
    async evaluateStrategicClarity(content, metadata) {
        const clarityIndicators = [
            /clear.*strategy/i,
            /strategic.*direction/i,
            /specific.*goals?/i,
            /measurable.*objectives?/i,
            /timeline/i,
            /milestones?/i
        ];
        
        const matches = clarityIndicators.filter(pattern => pattern.test(content)).length;
        return Math.min(10, (matches / clarityIndicators.length) * 12);
    }

    async evaluateActionability(content, metadata) {
        const actionableElements = [
            /action.*items?/i,
            /next steps?/i,
            /implementation/i,
            /execute/i,
            /deliver/i,
            /checklist/i,
            /tasks?/i
        ];
        
        const matches = actionableElements.filter(pattern => pattern.test(content)).length;
        const hasCheckboxes = (content.match(/- \[ \]/g) || []).length;
        
        return Math.min(10, ((matches / actionableElements.length) * 8) + (hasCheckboxes * 0.2));
    }

    async evaluateMeasurability(content, metadata) {
        const measurabilityPatterns = [
            /metrics?/i,
            /kpis?/i,
            /measure/i,
            /quantify/i,
            /analytics/i,
            /tracking/i,
            /\d+%/,
            /\$\d+/,
            /\d+\s+(users?|customers?|conversions?)/i
        ];
        
        const matches = measurabilityPatterns.filter(pattern => pattern.test(content)).length;
        return Math.min(10, (matches / measurabilityPatterns.length) * 15);
    }

    async evaluateResourceAlignment(content, metadata) {
        const resourceElements = [
            /budget/i,
            /resources?/i,
            /team/i,
            /timeline/i,
            /capacity/i,
            /skills?/i,
            /tools?/i
        ];
        
        const matches = resourceElements.filter(pattern => pattern.test(content)).length;
        return Math.min(10, (matches / resourceElements.length) * 10);
    }

    async evaluateRiskAssessment(content, metadata) {
        const riskElements = [
            /risks?/i,
            /challenges?/i,
            /mitigation/i,
            /contingency/i,
            /obstacles?/i,
            /assumptions?/i
        ];
        
        const matches = riskElements.filter(pattern => pattern.test(content)).length;
        return Math.min(10, (matches / riskElements.length) * 12);
    }

    async evaluateNarrativeStructure(content, metadata) {
        const structureElements = [
            /##\s+/g,     // Headers
            /\*\*.*\*\*/g, // Bold text
            /- \[ \]/g,   // Checkboxes
            /\d+\./g      // Numbered lists
        ];
        
        const structureScore = structureElements.reduce((score, pattern) => {
            const matches = (content.match(pattern) || []).length;
            return score + Math.min(2, matches * 0.5);
        }, 0);
        
        return Math.min(10, structureScore);
    }

    async evaluateAcceptanceCriteria(content, metadata) {
        const acPattern = /acceptance criteria/i;
        const numberedCriteria = content.match(/\d+\.\s+/g) || [];
        const testableLanguage = [
            /should be able to/i,
            /must/i,
            /verify/i,
            /validate/i,
            /ensure/i
        ];
        
        let score = 0;
        if (acPattern.test(content)) score += 3;
        score += Math.min(4, numberedCriteria.length * 0.5);
        
        const testableMatches = testableLanguage.filter(pattern => pattern.test(content)).length;
        score += Math.min(3, testableMatches);
        
        return Math.min(10, score);
    }

    async evaluateTechnicalFeasibility(content, metadata) {
        const technicalElements = [
            /implementation/i,
            /technology/i,
            /architecture/i,
            /framework/i,
            /api/i,
            /database/i,
            /scalability/i
        ];
        
        const matches = technicalElements.filter(pattern => pattern.test(content)).length;
        return Math.min(10, (matches / technicalElements.length) * 12);
    }

    async evaluateBusinessValue(content, metadata) {
        const valueElements = [
            /business.*value/i,
            /roi/i,
            /revenue/i,
            /cost.*savings?/i,
            /efficiency/i,
            /productivity/i,
            /competitive.*advantage/i
        ];
        
        const matches = valueElements.filter(pattern => pattern.test(content)).length;
        return Math.min(10, (matches / valueElements.length) * 10);
    }

    async evaluateTestability(content, metadata) {
        const testElements = [
            /test/i,
            /validation/i,
            /verification/i,
            /qa/i,
            /quality.*assurance/i,
            /acceptance.*test/i
        ];
        
        const matches = testElements.filter(pattern => pattern.test(content)).length;
        return Math.min(10, (matches / testElements.length) * 10);
    }

    async evaluateTechnicalAccuracy(content, metadata) {
        // This would need domain-specific validation
        // For now, check for technical terminology consistency
        const score = 7.5; // Default good score
        return score;
    }

    async evaluateImplementationClarity(content, metadata) {
        const clarityElements = [
            /step.*by.*step/i,
            /implementation.*plan/i,
            /detailed.*approach/i,
            /specific.*instructions/i
        ];
        
        const matches = clarityElements.filter(pattern => pattern.test(content)).length;
        return Math.min(10, 6 + (matches * 1.5));
    }

    async evaluateArchitecturalSoundness(content, metadata) {
        const architectureElements = [
            /architecture/i,
            /design.*pattern/i,
            /scalability/i,
            /performance/i,
            /security/i,
            /maintainability/i
        ];
        
        const matches = architectureElements.filter(pattern => pattern.test(content)).length;
        return Math.min(10, (matches / architectureElements.length) * 12);
    }

    async evaluateSecurityConsiderations(content, metadata) {
        const securityElements = [
            /security/i,
            /authentication/i,
            /authorization/i,
            /encryption/i,
            /validation/i,
            /sanitization/i
        ];
        
        const matches = securityElements.filter(pattern => pattern.test(content)).length;
        return Math.min(10, (matches / securityElements.length) * 10);
    }

    async evaluateScalabilityPlanning(content, metadata) {
        const scalabilityElements = [
            /scalability/i,
            /scale/i,
            /performance/i,
            /load/i,
            /capacity/i
        ];
        
        const matches = scalabilityElements.filter(pattern => pattern.test(content)).length;
        return Math.min(10, (matches / scalabilityElements.length) * 8);
    }

    async evaluateMessageClarity(content, metadata) {
        const clarityScore = content.length > 100 ? 
                           Math.min(10, 6 + (content.split('.').length * 0.5)) : 
                           4;
        return clarityScore;
    }

    async evaluateAudienceAlignment(content, metadata) {
        const audienceElements = [
            /target.*audience/i,
            /customer/i,
            /user/i,
            /persona/i,
            /demographic/i
        ];
        
        const matches = audienceElements.filter(pattern => pattern.test(content)).length;
        return Math.min(10, 5 + (matches * 1.5));
    }

    async evaluateBrandConsistency(content, metadata) {
        // Check for brand elements and Irish personality
        const brandElements = [
            /brand/i,
            /identity/i,
            /personality/i,
            /tone/i,
            /voice/i
        ];
        
        const irishElements = [
            /\b[A-Z]['O][A-Z][a-z]+\b/, // Irish surnames
            /céad míle fáilte/i,
            /sláinte/i,
            /grand/i
        ];
        
        const brandMatches = brandElements.filter(pattern => pattern.test(content)).length;
        const irishMatches = irishElements.filter(pattern => pattern.test(content)).length;
        
        return Math.min(10, 5 + (brandMatches * 1) + (irishMatches * 0.5));
    }

    async evaluateEngagementPotential(content, metadata) {
        const engagementElements = [
            /engaging/i,
            /compelling/i,
            /interactive/i,
            /call.*to.*action/i,
            /cta/i,
            /\?/g, // Questions
            /!/g   // Exclamations
        ];
        
        let score = 5; // Base score
        engagementElements.forEach(pattern => {
            const matches = (content.match(pattern) || []).length;
            score += Math.min(1, matches * 0.3);
        });
        
        return Math.min(10, score);
    }

    async evaluateCallToAction(content, metadata) {
        const ctaElements = [
            /call.*to.*action/i,
            /cta/i,
            /click/i,
            /sign.*up/i,
            /subscribe/i,
            /download/i,
            /contact/i,
            /learn.*more/i
        ];
        
        const matches = ctaElements.filter(pattern => pattern.test(content)).length;
        return Math.min(10, matches > 0 ? 8 : 4);
    }

    async evaluateDataAccuracy(content, metadata) {
        // Check for data sources and citations
        const dataElements = [
            /source/i,
            /research/i,
            /study/i,
            /survey/i,
            /data/i,
            /statistics?/i,
            /\d+%/g,
            /citation/i
        ];
        
        const matches = dataElements.filter(pattern => pattern.test(content)).length;
        return Math.min(10, (matches / dataElements.length) * 12);
    }

    async evaluateAnalysisDepth(content, metadata) {
        const depthIndicators = [
            /analysis/i,
            /insight/i,
            /conclusion/i,
            /implications?/i,
            /correlation/i,
            /trend/i,
            /pattern/i
        ];
        
        const matches = depthIndicators.filter(pattern => pattern.test(content)).length;
        const wordCount = content.split(/\s+/).length;
        
        return Math.min(10, ((matches / depthIndicators.length) * 8) + (wordCount > 500 ? 2 : 0));
    }

    async evaluateInsightQuality(content, metadata) {
        const insightElements = [
            /insight/i,
            /recommendation/i,
            /implication/i,
            /opportunity/i,
            /actionable/i,
            /strategic/i
        ];
        
        const matches = insightElements.filter(pattern => pattern.test(content)).length;
        return Math.min(10, (matches / insightElements.length) * 10);
    }

    async evaluateSourceCredibility(content, metadata) {
        const credibilityElements = [
            /source/i,
            /reference/i,
            /study/i,
            /research/i,
            /published/i,
            /peer.*review/i
        ];
        
        const matches = credibilityElements.filter(pattern => pattern.test(content)).length;
        return Math.min(10, 6 + (matches * 0.8));
    }

    async evaluateActionableFindings(content, metadata) {
        const actionableElements = [
            /recommend/i,
            /suggest/i,
            /action/i,
            /next.*step/i,
            /implement/i,
            /strategy/i
        ];
        
        const matches = actionableElements.filter(pattern => pattern.test(content)).length;
        return Math.min(10, (matches / actionableElements.length) * 8);
    }

    fallbackEvaluation(content, criterion) {
        // Generic evaluation based on content length and structure
        const wordCount = content.split(/\s+/).length;
        const hasStructure = /##|###|\*\*/.test(content);
        
        let score = 5; // Base score
        if (wordCount > 100) score += 1;
        if (wordCount > 300) score += 1;
        if (hasStructure) score += 1;
        
        return Math.min(10, score);
    }

    calculateWeightedScore(qualityScores, config) {
        let totalWeightedScore = 0;
        let totalWeight = 0;
        
        for (const [criterion, scoreData] of Object.entries(qualityScores)) {
            totalWeightedScore += scoreData.weightedScore;
            totalWeight += scoreData.weight;
        }
        
        return totalWeightedScore; // Already weighted
    }

    applyAgentMultiplier(score, agentType) {
        const multiplier = SCORING_CONFIG.AGENT_MULTIPLIERS[agentType] || 1.0;
        return Math.min(10, score * multiplier);
    }

    getQualityBand(score) {
        for (const [band, config] of Object.entries(SCORING_CONFIG.QUALITY_BANDS)) {
            if (score >= config.min) {
                return { band, ...config };
            }
        }
        return SCORING_CONFIG.QUALITY_BANDS.POOR;
    }

    generateOutputId(metadata) {
        const timestamp = Date.now();
        const agentType = metadata.agentType || 'unknown';
        const hash = Math.random().toString(36).substring(7);
        return `${agentType}-${timestamp}-${hash}`;
    }

    updateAgentTrend(agentType, score) {
        if (!this.trends.has(agentType)) {
            this.trends.set(agentType, {
                scores: [],
                average: 0,
                trend: 'stable',
                lastUpdate: Date.now()
            });
        }
        
        const trendData = this.trends.get(agentType);
        trendData.scores.push({ score, timestamp: Date.now() });
        
        // Keep only last 20 scores
        if (trendData.scores.length > 20) {
            trendData.scores = trendData.scores.slice(-20);
        }
        
        // Calculate average
        trendData.average = trendData.scores.reduce((sum, s) => sum + s.score, 0) / trendData.scores.length;
        
        // Determine trend
        if (trendData.scores.length >= 5) {
            const recent = trendData.scores.slice(-5).map(s => s.score);
            const older = trendData.scores.slice(-10, -5).map(s => s.score);
            
            if (older.length >= 5) {
                const recentAvg = recent.reduce((sum, s) => sum + s, 0) / recent.length;
                const olderAvg = older.reduce((sum, s) => sum + s, 0) / older.length;
                
                if (recentAvg > olderAvg + 0.5) {
                    trendData.trend = 'improving';
                } else if (recentAvg < olderAvg - 0.5) {
                    trendData.trend = 'declining';
                } else {
                    trendData.trend = 'stable';
                }
            }
        }
        
        trendData.lastUpdate = Date.now();
    }

    updateQualityTrends() {
        // Periodic trend analysis and alerting
        for (const [agentType, trendData] of this.trends.entries()) {
            if (trendData.trend === 'declining' && trendData.average < 6.0) {
                this.alerts.push({
                    type: 'quality_decline',
                    agentType,
                    average: trendData.average,
                    timestamp: new Date().toISOString(),
                    message: `Quality declining for ${agentType}: ${trendData.average.toFixed(1)}/10`
                });
            }
        }
        
        // Keep only recent alerts (last 100)
        if (this.alerts.length > 100) {
            this.alerts = this.alerts.slice(-100);
        }
    }

    checkQualityAlerts(scoreData) {
        const config = SCORING_CONFIG.CONTENT_TYPES[scoreData.contentType];
        
        if (scoreData.adjustedScore < config.qualityThreshold) {
            this.alerts.push({
                type: 'quality_threshold',
                outputId: scoreData.outputId,
                agentType: scoreData.agentType,
                score: scoreData.adjustedScore,
                threshold: config.qualityThreshold,
                timestamp: scoreData.timestamp,
                message: `Output below quality threshold: ${scoreData.adjustedScore.toFixed(1)} < ${config.qualityThreshold}`
            });
            
            this.emit('alert', this.alerts[this.alerts.length - 1]);
        }
    }

    getScoringSummary() {
        const summary = {
            totalProcessed: this.processedCount,
            averageScore: 0,
            qualityDistribution: {},
            agentPerformance: {},
            recentAlerts: this.alerts.slice(-10),
            uptime: Date.now() - this.startTime
        };
        
        if (this.scores.size > 0) {
            const allScores = Array.from(this.scores.values());
            summary.averageScore = allScores.reduce((sum, s) => sum + s.adjustedScore, 0) / allScores.length;
            
            // Quality distribution
            for (const band of Object.keys(SCORING_CONFIG.QUALITY_BANDS)) {
                summary.qualityDistribution[band] = 0;
            }
            
            allScores.forEach(scoreData => {
                summary.qualityDistribution[scoreData.qualityBand.band]++;
            });
            
            // Agent performance
            for (const [agentType, trendData] of this.trends.entries()) {
                summary.agentPerformance[agentType] = {
                    average: trendData.average,
                    trend: trendData.trend,
                    scoreCount: trendData.scores.length
                };
            }
        }
        
        return summary;
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).replace(/([A-Z])/g, (match, p1, offset) => {
            return offset > 0 ? p1 : p1;
        });
    }
}

// Main execution for CLI usage
async function main() {
    const content = process.argv[2];
    const agentType = process.argv[3];
    const contentType = process.argv[4];
    
    if (!content) {
        console.error('Usage: quality-scoring-engine.js <content> [agent_type] [content_type]');
        process.exit(1);
    }
    
    try {
        const engine = new QualityScoringEngine();
        const metadata = { agentType, contentType };
        const result = await engine.scoreOutput(content, metadata);
        
        console.log(`SCORE: ${result.adjustedScore.toFixed(1)}`);
        console.log(`QUALITY_BAND: ${result.qualityBand.label}`);
        console.log(`CONTENT_TYPE: ${result.contentType}`);
        console.log(`AGENT_TYPE: ${result.agentType || 'unknown'}`);
        
        // Output detailed scores
        for (const [criterion, scoreData] of Object.entries(result.qualityScores)) {
            console.log(`${criterion.toUpperCase()}: ${scoreData.score.toFixed(1)} (weight: ${scoreData.weight})`);
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('SCORING_ERROR:', error.message);
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

export default QualityScoringEngine;