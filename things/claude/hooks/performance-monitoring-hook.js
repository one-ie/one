#!/usr/bin/env node

/**
 * Performance Monitoring Hook for Sub-Agents
 * Monitors resource usage, response times, and coordination efficiency
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PerformanceMonitor {
    constructor() {
        this.metricsFile = path.join(__dirname, 'performance-metrics.json');
        this.logFile = path.join(__dirname, 'performance.log');
        this.initializeMetrics();
    }

    initializeMetrics() {
        if (!fs.existsSync(this.metricsFile)) {
            const initialMetrics = {
                sessionStart: new Date().toISOString(),
                agentMetrics: {},
                systemMetrics: {
                    totalRequests: 0,
                    averageResponseTime: 0,
                    errorRate: 0,
                    peakConcurrency: 0
                },
                alerts: []
            };
            fs.writeFileSync(this.metricsFile, JSON.stringify(initialMetrics, null, 2));
        }
    }

    loadMetrics() {
        try {
            return JSON.parse(fs.readFileSync(this.metricsFile, 'utf8'));
        } catch (error) {
            console.error('Error loading metrics:', error);
            return null;
        }
    }

    saveMetrics(metrics) {
        try {
            fs.writeFileSync(this.metricsFile, JSON.stringify(metrics, null, 2));
        } catch (error) {
            console.error('Error saving metrics:', error);
        }
    }

    log(level, message, agentName = 'system') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level.toUpperCase()}] [${agentName}] ${message}\n`;
        
        try {
            fs.appendFileSync(this.logFile, logEntry);
        } catch (error) {
            console.error('Error writing to log:', error);
        }
        
        if (level === 'error' || level === 'warn') {
            console.error(logEntry.trim());
        } else if (process.env.DEBUG) {
            console.log(logEntry.trim());
        }
    }

    recordAgentMetrics(agentName, metrics) {
        const currentMetrics = this.loadMetrics();
        if (!currentMetrics) return;

        // Initialize agent metrics if not exists
        if (!currentMetrics.agentMetrics[agentName]) {
            currentMetrics.agentMetrics[agentName] = {
                requestCount: 0,
                totalResponseTime: 0,
                averageResponseTime: 0,
                errorCount: 0,
                lastUsed: null,
                performance: 'good',
                qualityScores: [],
                averageQuality: 0,
                qualityTrend: 'stable',
                toolUsage: {},
                delegationEfficiency: 1.0
            };
        }

        const agentMetrics = currentMetrics.agentMetrics[agentName];
        
        // Update metrics
        agentMetrics.requestCount++;
        agentMetrics.totalResponseTime += metrics.responseTime || 0;
        agentMetrics.averageResponseTime = agentMetrics.totalResponseTime / agentMetrics.requestCount;
        agentMetrics.lastUsed = new Date().toISOString();

        if (metrics.error) {
            agentMetrics.errorCount++;
        }

        // Track quality scores if provided
        if (metrics.qualityScore) {
            agentMetrics.qualityScores.push({
                score: metrics.qualityScore,
                timestamp: new Date().toISOString()
            });
            
            // Keep only last 20 quality scores
            if (agentMetrics.qualityScores.length > 20) {
                agentMetrics.qualityScores = agentMetrics.qualityScores.slice(-20);
            }
            
            // Update average quality
            agentMetrics.averageQuality = agentMetrics.qualityScores.reduce((sum, q) => sum + q.score, 0) / agentMetrics.qualityScores.length;
            
            // Calculate quality trend
            agentMetrics.qualityTrend = this.calculateQualityTrend(agentMetrics.qualityScores);
        }
        
        // Track tool usage
        if (metrics.toolUsed) {
            agentMetrics.toolUsage[metrics.toolUsed] = (agentMetrics.toolUsage[metrics.toolUsed] || 0) + 1;
        }
        
        // Track delegation efficiency (if sub-agent was delegated to)
        if (metrics.delegated) {
            const delegationTime = metrics.delegationTime || 0;
            const baseTime = metrics.responseTime || 0;
            agentMetrics.delegationEfficiency = delegationTime > 0 ? baseTime / delegationTime : 1.0;
        }

        // Calculate performance rating
        agentMetrics.performance = this.calculatePerformanceRating(agentMetrics);

        // Update system metrics
        currentMetrics.systemMetrics.totalRequests++;
        this.updateSystemAverages(currentMetrics);

        // Check for performance alerts
        this.checkPerformanceAlerts(agentName, agentMetrics, currentMetrics);

        this.saveMetrics(currentMetrics);
        this.log('info', `Metrics recorded - Response time: ${metrics.responseTime}ms`, agentName);
    }

    calculatePerformanceRating(agentMetrics) {
        const errorRate = agentMetrics.errorCount / agentMetrics.requestCount;
        const avgResponseTime = agentMetrics.averageResponseTime;
        const avgQuality = agentMetrics.averageQuality || 7.0;

        // Include quality score in performance rating
        if (errorRate > 0.1 || avgResponseTime > 5000 || avgQuality < 5.0) {
            return 'poor';
        } else if (errorRate > 0.05 || avgResponseTime > 2000 || avgQuality < 7.0) {
            return 'fair';
        } else if (avgResponseTime < 1000 && avgQuality >= 8.5) {
            return 'excellent';
        } else {
            return 'good';
        }
    }

    calculateQualityTrend(qualityScores) {
        if (qualityScores.length < 5) {
            return 'stable';
        }
        
        const recent = qualityScores.slice(-5).map(q => q.score);
        const older = qualityScores.slice(-10, -5).map(q => q.score);
        
        if (older.length >= 5) {
            const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length;
            const olderAvg = older.reduce((sum, score) => sum + score, 0) / older.length;
            
            if (recentAvg > olderAvg + 0.5) {
                return 'improving';
            } else if (recentAvg < olderAvg - 0.5) {
                return 'declining';
            }
        }
        
        return 'stable';
    }

    updateSystemAverages(metrics) {
        const allAgentMetrics = Object.values(metrics.agentMetrics);
        if (allAgentMetrics.length === 0) return;

        const totalResponses = allAgentMetrics.reduce((sum, agent) => sum + agent.requestCount, 0);
        const totalResponseTime = allAgentMetrics.reduce((sum, agent) => sum + agent.totalResponseTime, 0);
        const totalErrors = allAgentMetrics.reduce((sum, agent) => sum + agent.errorCount, 0);

        metrics.systemMetrics.averageResponseTime = totalResponseTime / totalResponses;
        metrics.systemMetrics.errorRate = totalErrors / totalResponses;
    }

    checkPerformanceAlerts(agentName, agentMetrics, systemMetrics) {
        const alerts = [];

        // High response time alert
        if (agentMetrics.averageResponseTime > 3000) {
            alerts.push({
                type: 'high_response_time',
                agent: agentName,
                value: agentMetrics.averageResponseTime,
                threshold: 3000,
                severity: 'warning'
            });
        }

        // High error rate alert
        const errorRate = agentMetrics.errorCount / agentMetrics.requestCount;
        if (errorRate > 0.1) {
            alerts.push({
                type: 'high_error_rate',
                agent: agentName,
                value: errorRate,
                threshold: 0.1,
                severity: 'critical'
            });
        }

        // Quality decline alert
        if (agentMetrics.averageQuality > 0 && agentMetrics.averageQuality < 6.0) {
            alerts.push({
                type: 'quality_decline',
                agent: agentName,
                value: agentMetrics.averageQuality,
                threshold: 6.0,
                severity: 'warning'
            });
        }

        // Quality trend alert
        if (agentMetrics.qualityTrend === 'declining' && agentMetrics.averageQuality < 7.0) {
            alerts.push({
                type: 'declining_quality_trend',
                agent: agentName,
                trend: agentMetrics.qualityTrend,
                currentQuality: agentMetrics.averageQuality,
                severity: 'warning'
            });
        }

        // Performance-quality correlation alert
        if (agentMetrics.averageResponseTime > 3000 && agentMetrics.averageQuality < 7.0) {
            alerts.push({
                type: 'performance_quality_correlation',
                agent: agentName,
                responseTime: agentMetrics.averageResponseTime,
                quality: agentMetrics.averageQuality,
                severity: 'critical'
            });
        }

        // Add alerts to system metrics
        alerts.forEach(alert => {
            alert.timestamp = new Date().toISOString();
            systemMetrics.alerts.push(alert);
            
            this.log('warn', `Performance Alert: ${alert.type} for ${alert.agent} - ${alert.value}`, agentName);
        });

        // Keep only recent alerts (last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        systemMetrics.alerts = systemMetrics.alerts.filter(alert => 
            new Date(alert.timestamp) > oneDayAgo
        );
    }

    generatePerformanceReport() {
        const metrics = this.loadMetrics();
        if (!metrics) return null;

        const report = {
            generatedAt: new Date().toISOString(),
            sessionDuration: this.calculateSessionDuration(metrics.sessionStart),
            systemOverview: {
                totalRequests: metrics.systemMetrics.totalRequests,
                averageResponseTime: Math.round(metrics.systemMetrics.averageResponseTime),
                errorRate: Math.round(metrics.systemMetrics.errorRate * 100) / 100,
                activeAgents: Object.keys(metrics.agentMetrics).length
            },
            agentPerformance: {},
            topPerformers: [],
            concerningAgents: [],
            recommendations: []
        };

        // Analyze agent performance
        Object.entries(metrics.agentMetrics).forEach(([agentName, agentMetrics]) => {
            report.agentPerformance[agentName] = {
                requestCount: agentMetrics.requestCount,
                averageResponseTime: Math.round(agentMetrics.averageResponseTime),
                errorRate: Math.round((agentMetrics.errorCount / agentMetrics.requestCount) * 100) / 100,
                performance: agentMetrics.performance,
                lastUsed: agentMetrics.lastUsed
            };

            // Categorize agents
            if (agentMetrics.performance === 'excellent' || agentMetrics.performance === 'good') {
                report.topPerformers.push(agentName);
            } else if (agentMetrics.performance === 'poor') {
                report.concerningAgents.push(agentName);
            }
        });

        // Generate recommendations
        report.recommendations = this.generateRecommendations(metrics);

        return report;
    }

    calculateSessionDuration(sessionStart) {
        const start = new Date(sessionStart);
        const now = new Date();
        const durationMs = now - start;
        
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes}m`;
    }

    generateRecommendations(metrics) {
        const recommendations = [];

        // System-level recommendations
        if (metrics.systemMetrics.errorRate > 0.05) {
            recommendations.push('System error rate is elevated. Review agent configurations and error handling.');
        }

        if (metrics.systemMetrics.averageResponseTime > 2000) {
            recommendations.push('Average response time is high. Consider optimizing agent workflows or resource allocation.');
        }

        // Agent-specific recommendations
        Object.entries(metrics.agentMetrics).forEach(([agentName, agentMetrics]) => {
            if (agentMetrics.performance === 'poor') {
                recommendations.push(`Agent ${agentName} showing poor performance. Review recent changes and optimize workflows.`);
            }

            if (agentMetrics.requestCount > 100 && agentMetrics.averageResponseTime > 3000) {
                recommendations.push(`Agent ${agentName} frequently used but slow. Consider caching or preprocessing optimizations.`);
            }
        });

        return recommendations;
    }

    monitorResourceUsage() {
        // Basic system resource monitoring
        if (typeof process !== 'undefined') {
            const usage = process.memoryUsage();
            const cpuUsage = process.cpuUsage();

            return {
                memory: {
                    rss: Math.round(usage.rss / 1024 / 1024), // MB
                    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
                    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
                    external: Math.round(usage.external / 1024 / 1024) // MB
                },
                cpu: {
                    user: cpuUsage.user,
                    system: cpuUsage.system
                },
                uptime: Math.round(process.uptime())
            };
        }

        return null;
    }
}

// CLI interface
async function main() {
    const monitor = new PerformanceMonitor();
    const command = process.argv[2];

    switch (command) {
        case 'record':
            const agentName = process.argv[3];
            const responseTime = parseFloat(process.argv[4]) || 0;
            const error = process.argv[5] === 'true';
            
            monitor.recordAgentMetrics(agentName, { responseTime, error });
            console.log(`Metrics recorded for ${agentName}`);
            break;

        case 'report':
            const report = monitor.generatePerformanceReport();
            console.log(JSON.stringify(report, null, 2));
            break;

        case 'resources':
            const resources = monitor.monitorResourceUsage();
            console.log(JSON.stringify(resources, null, 2));
            break;

        default:
            console.log('Usage: performance-monitoring-hook.js <record|report|resources> [args...]');
            console.log('  record <agent-name> <response-time> [error]');
            console.log('  report');
            console.log('  resources');
            process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
}

export { PerformanceMonitor };