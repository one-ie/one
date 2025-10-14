#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class OntologyHookManager {
  constructor() {
    this.hookConfigPath = path.join(__dirname, '../claude-code-hooks.json');
    this.feedbackLogPath = path.join(__dirname, '../ontology-feedback.log');
  }
  
  getHookStatus() {
    try {
      const config = JSON.parse(fs.readFileSync(this.hookConfigPath, 'utf8'));
      const ontologyCategory = config.config.categories['ontology-organization'];
      
      const fileOrgOnOpen = config.hooks.PreToolUse?.find(hook => 
        hook.hooks?.some(h => h.name === 'file-organization-on-open')
      )?.hooks?.[0];
      
      const fileOrgOnClose = config.hooks.PostToolUse?.find(hook => 
        hook.hooks?.some(h => h.name === 'file-organization-on-close')
      )?.hooks?.[0];
      
      return {
        category_enabled: ontologyCategory?.enabled || false,
        open_hook: {
          enabled: fileOrgOnOpen?.enabled || false,
          command: fileOrgOnOpen?.command || 'not configured'
        },
        close_hook: {
          enabled: fileOrgOnClose?.enabled || false,
          command: fileOrgOnClose?.command || 'not configured'
        }
      };
    } catch (error) {
      return {
        error: `Failed to read hook configuration: ${error.message}`
      };
    }
  }
  
  enableHooks() {
    try {
      const config = JSON.parse(fs.readFileSync(this.hookConfigPath, 'utf8'));
      
      // Enable category
      if (config.config.categories['ontology-organization']) {
        config.config.categories['ontology-organization'].enabled = true;
      }
      
      // Enable individual hooks
      config.hooks.PreToolUse?.forEach(hookGroup => {
        hookGroup.hooks?.forEach(hook => {
          if (hook.name === 'file-organization-on-open') {
            hook.enabled = true;
          }
        });
      });
      
      config.hooks.PostToolUse?.forEach(hookGroup => {
        hookGroup.hooks?.forEach(hook => {
          if (hook.name === 'file-organization-on-close') {
            hook.enabled = true;
          }
        });
      });
      
      fs.writeFileSync(this.hookConfigPath, JSON.stringify(config, null, 2));
      return { success: true, message: 'Ontology hooks enabled successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  
  disableHooks() {
    try {
      const config = JSON.parse(fs.readFileSync(this.hookConfigPath, 'utf8'));
      
      // Disable category
      if (config.config.categories['ontology-organization']) {
        config.config.categories['ontology-organization'].enabled = false;
      }
      
      // Disable individual hooks
      config.hooks.PreToolUse?.forEach(hookGroup => {
        hookGroup.hooks?.forEach(hook => {
          if (hook.name === 'file-organization-on-open') {
            hook.enabled = false;
          }
        });
      });
      
      config.hooks.PostToolUse?.forEach(hookGroup => {
        hookGroup.hooks?.forEach(hook => {
          if (hook.name === 'file-organization-on-close') {
            hook.enabled = false;
          }
        });
      });
      
      fs.writeFileSync(this.hookConfigPath, JSON.stringify(config, null, 2));
      return { success: true, message: 'Ontology hooks disabled successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  
  getOntologyFeedback(lines = 20) {
    try {
      if (!fs.existsSync(this.feedbackLogPath)) {
        return { feedback: [], message: 'No ontology feedback log found' };
      }
      
      const content = fs.readFileSync(this.feedbackLogPath, 'utf8');
      const allLines = content.trim().split('\n');
      const recentLines = allLines.slice(-lines);
      
      const feedback = recentLines.map(line => {
        try {
          const [timestamp, ...dataParts] = line.split('] ');
          const data = dataParts.join('] ');
          
          if (data.startsWith('ONTOLOGY_REPORT:')) {
            const reportData = JSON.parse(data.replace('ONTOLOGY_REPORT: ', ''));
            return {
              timestamp: timestamp.replace('[', ''),
              type: 'report',
              data: reportData
            };
          }
          
          return {
            timestamp: timestamp?.replace('[', '') || 'unknown',
            type: 'message',
            data: data || line
          };
        } catch (error) {
          return {
            timestamp: 'unknown',
            type: 'raw',
            data: line
          };
        }
      });
      
      return { feedback, message: `Retrieved ${feedback.length} recent feedback entries` };
    } catch (error) {
      return { feedback: [], message: error.message };
    }
  }
  
  generateOntologyHealthReport() {
    const feedbackResult = this.getOntologyFeedback(100);
    
    if (feedbackResult.feedback.length === 0) {
      return {
        health: 'unknown',
        summary: {
          files_analyzed: 0,
          avg_confidence: 0,
          gaps_identified: 0,
          improvements_suggested: 0
        },
        recommendations: ['No data available - start using the system to generate reports']
      };
    }
    
    const reports = feedbackResult.feedback.filter(f => f.type === 'report');
    
    if (reports.length === 0) {
      return {
        health: 'unknown',
        summary: {
          files_analyzed: 0,
          avg_confidence: 0,
          gaps_identified: 0,
          improvements_suggested: 0
        },
        recommendations: ['No ontology reports found']
      };
    }
    
    const totalConfidence = reports.reduce((sum, r) => 
      sum + (r.data.ontology_health?.coverage || 0), 0
    );
    const avgConfidence = totalConfidence / reports.length;
    
    const totalGaps = reports.reduce((sum, r) => 
      sum + (r.data.gaps?.length || 0), 0
    );
    
    const totalImprovements = reports.reduce((sum, r) => 
      sum + (r.data.improvements?.length || 0), 0
    );
    
    const statusCounts = {};
    reports.forEach(r => {
      const status = r.data.ontology_status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    const dominantStatus = Object.entries(statusCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown';
    
    // Generate recommendations
    const recommendations = [];
    if (avgConfidence < 70) {
      recommendations.push('Consider updating ontology patterns to improve file classification');
    }
    if (totalGaps > reports.length * 0.5) {
      recommendations.push('High number of ontology gaps detected - review and expand ontology');
    }
    if (totalImprovements > reports.length * 0.3) {
      recommendations.push('Multiple improvement opportunities identified - prioritize ontology updates');
    }
    if (recommendations.length === 0) {
      recommendations.push('Ontology is performing well - continue monitoring');
    }
    
    return {
      health: dominantStatus,
      summary: {
        files_analyzed: reports.length,
        avg_confidence: Math.round(avgConfidence * 100) / 100,
        gaps_identified: totalGaps,
        improvements_suggested: totalImprovements,
        status_distribution: statusCounts
      },
      recommendations
    };
  }
}

// CLI Interface
function main() {
  const manager = new OntologyHookManager();
  const command = process.argv[2];
  
  switch (command) {
    case 'status':
      console.log('🔍 Ontology Hook Status:');
      console.log(JSON.stringify(manager.getHookStatus(), null, 2));
      break;
      
    case 'enable':
      const enableResult = manager.enableHooks();
      console.log(enableResult.success ? '✅' : '❌', enableResult.message);
      break;
      
    case 'disable':
      const disableResult = manager.disableHooks();
      console.log(disableResult.success ? '✅' : '❌', disableResult.message);
      break;
      
    case 'feedback':
      const lines = parseInt(process.argv[3]) || 10;
      const feedbackResult = manager.getOntologyFeedback(lines);
      console.log(`📋 Recent Ontology Feedback (${lines} entries):`);
      feedbackResult.feedback.forEach(entry => {
        if (entry.type === 'report') {
          console.log(`[${entry.timestamp}] ${entry.data.file} - ${entry.data.ontology_status} (${entry.data.ontology_health.coverage}%)`);
          if (entry.data.gaps.length > 0) {
            console.log(`  Gaps: ${entry.data.gaps.length}`);
          }
          if (entry.data.improvements.length > 0) {
            console.log(`  Improvements: ${entry.data.improvements.length}`);
          }
        }
      });
      break;
      
    case 'health':
      const health = manager.generateOntologyHealthReport();
      console.log('🏥 Ontology Health Report:');
      console.log(`Overall Health: ${health.health.toUpperCase()}`);
      console.log(`Files Analyzed: ${health.summary.files_analyzed}`);
      console.log(`Average Confidence: ${health.summary.avg_confidence}%`);
      console.log(`Gaps Identified: ${health.summary.gaps_identified}`);
      console.log(`Improvements Suggested: ${health.summary.improvements_suggested}`);
      console.log('');
      console.log('📊 Status Distribution:');
      Object.entries(health.summary.status_distribution || {}).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
      console.log('');
      console.log('💡 Recommendations:');
      health.recommendations.forEach(rec => console.log(`  • ${rec}`));
      break;
      
    default:
      console.log('🛠️  Ontology Hook Manager');
      console.log('');
      console.log('Usage: node ontology-hook-manager.js <command>');
      console.log('');
      console.log('Commands:');
      console.log('  status   - Show current hook status');
      console.log('  enable   - Enable ontology hooks');
      console.log('  disable  - Disable ontology hooks');
      console.log('  feedback [lines] - Show recent ontology feedback');
      console.log('  health   - Generate ontology health report');
      console.log('');
      console.log('🧠 Ontology hooks help maintain beautiful file organization');
      console.log('   and evolve the ONE framework ontology intelligently.');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { OntologyHookManager };