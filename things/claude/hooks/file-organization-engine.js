#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OntologyValidator } from './ontology-validation-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FileOrganizer {
  constructor(ontologyPath) {
    this.ontologyPath = ontologyPath;
    this.validator = new OntologyValidator(ontologyPath);
    this.organizationRules = this.extractOrganizationRules();
    this.ontologyFeedbackLog = path.join(__dirname, '../../.claude/ontology-feedback.log');
  }
  
  extractOrganizationRules() {
    return {
      // File type to directory mapping
      agents: 'one/agents/',
      teams: 'one/agent-teams/',
      workflows: 'one/workflows/',
      templates: 'one/templates/',
      stories: 'one/stories/',
      tasks: 'one/tasks/',
      checklists: 'one/checklists/',
      data: 'one/data/',
      missions: 'one/missions/',
      guides: 'one/guides/',
      tools: 'one/tools/',
      tests: 'one/tests/',
      playbooks: 'one/playbooks/',
      archive: 'one/archive/',
      assets: 'one/assets/',
      
      // File patterns to type mapping
      patterns: {
        '**/*-agent.md': 'agents',
        '**/team-*.yaml': 'teams',
        '**/*-workflow.yaml': 'workflows',
        '**/*-tmpl.yaml': 'templates',
        '**/story-*.md': 'stories',
        '**/task-*.md': 'tasks',
        '**/*-checklist.md': 'checklists',
        '**/mission-*.md': 'missions',
        '**/*.py': 'tools',
        '**/*.js': 'tools',
        '**/*.sh': 'tools',
        '**/README-*.md': 'guides',
        '**/*-guide.md': 'guides',
        '**/*.test.js': 'tests',
        '**/test-*.js': 'tests',
        '**/*-playbook.md': 'playbooks',
        '**/*-playbook.html': 'playbooks',
        '**/bull-character-*.md': 'playbooks',
        '**/bull-character-*.pdf': 'playbooks',
        '**/bullstamp-*.html': 'playbooks',
        '**/Updates.md': 'archive',
        '**/Updates.pdf': 'archive',
        '**/*.png': 'assets',
        '**/*.jpg': 'assets',
        '**/*.jpeg': 'assets',
        '**/*.gif': 'assets',
        '**/*.svg': 'assets'
      }
    };
  }
  
  analyzeFile(filePath) {
    const fileName = path.basename(filePath);
    const fileExt = path.extname(filePath);
    const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
    
    // Determine file type based on patterns and content
    let suggestedType = 'unknown';
    
    // Check filename patterns
    for (const [pattern, type] of Object.entries(this.organizationRules.patterns)) {
      if (this.matchesPattern(fileName, pattern)) {
        suggestedType = type;
        break;
      }
    }
    
    // Content-based analysis for better accuracy
    if (suggestedType === 'unknown' && fileExt === '.md') {
      if (content.includes('persona:') && content.includes('role:')) {
        suggestedType = 'agents';
      } else if (content.includes('## Story') && content.includes('## Acceptance Criteria')) {
        suggestedType = 'stories';
      } else if (content.includes('## Mission') || content.includes('# Mission')) {
        suggestedType = 'missions';
      } else if (content.includes('checklist') || content.includes('validation')) {
        suggestedType = 'checklists';
      } else if (content.includes('# Task') || content.includes('## Task')) {
        suggestedType = 'tasks';
      } else if (content.includes('guide') || content.includes('documentation')) {
        suggestedType = 'guides';
      }
    }
    
    if (suggestedType === 'unknown' && fileExt === '.yaml') {
      if (content.includes('agents:') && content.includes('team')) {
        suggestedType = 'teams';
      } else if (content.includes('workflow') || content.includes('phases:')) {
        suggestedType = 'workflows';
      } else if (fileName.includes('tmpl') || content.includes('template')) {
        suggestedType = 'templates';
      }
    }
    
    return {
      type: suggestedType,
      currentLocation: filePath,
      suggestedLocation: suggestedType !== 'unknown' ? 
        path.join(this.organizationRules[suggestedType], fileName) : null,
      confidence: this.calculateConfidence(fileName, content, suggestedType)
    };
  }
  
  matchesPattern(fileName, pattern) {
    // Simple pattern matching - convert glob-like patterns to regex
    const regexPattern = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '[^/]');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(fileName);
  }
  
  calculateConfidence(fileName, content, suggestedType) {
    let confidence = 0;
    
    // Filename pattern match
    if (suggestedType !== 'unknown') confidence += 40;
    
    // Content analysis
    if (content.length > 100) confidence += 20;
    
    // Specific content markers
    const typeMarkers = {
      agents: ['persona:', 'role:', 'whenToUse:'],
      stories: ['## Story', '## Acceptance Criteria', '## Tasks'],
      missions: ['## Mission', 'objective:', 'goal:'],
      workflows: ['phases:', 'steps:', 'workflow'],
      templates: ['template', 'placeholder', '{{'],
      checklists: ['checklist', '- [ ]', 'validation']
    };
    
    const markers = typeMarkers[suggestedType] || [];
    const markerMatches = markers.filter(marker => content.includes(marker)).length;
    confidence += (markerMatches / markers.length) * 40;
    
    return Math.min(100, confidence);
  }
  
  logOntologyFeedback(feedback) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${feedback}\n`;
    fs.appendFileSync(this.ontologyFeedbackLog, logEntry);
  }
  
  analyzeOntologyGaps(filePath, analysis) {
    const gaps = [];
    
    // Check if this represents a new pattern not covered by ontology
    if (analysis.confidence < 60 && analysis.type === 'unknown') {
      gaps.push({
        type: 'missing_pattern',
        file: filePath,
        suggestion: `Consider adding pattern for files like ${path.basename(filePath)} to ontology`,
        priority: 'medium'
      });
    }
    
    // Check for new file types
    const fileExt = path.extname(filePath);
    const supportedExts = ['.md', '.yaml', '.js', '.py', '.sh', '.html', '.pdf', '.png', '.jpg'];
    if (!supportedExts.includes(fileExt) && fileExt) {
      gaps.push({
        type: 'new_file_type',
        file: filePath,
        extension: fileExt,
        suggestion: `Consider adding support for ${fileExt} files to ontology`,
        priority: 'low'
      });
    }
    
    // Check for naming convention evolution
    const fileName = path.basename(filePath);
    if (analysis.type !== 'unknown' && analysis.confidence < 80) {
      gaps.push({
        type: 'naming_evolution',
        file: filePath,
        suggestion: `Naming pattern for ${fileName} might need refinement in ontology`,
        priority: 'low'
      });
    }
    
    return gaps;
  }
  
  suggestOntologyImprovements(analysis, gaps) {
    const improvements = [];
    
    // Suggest new directory structures
    if (gaps.some(g => g.type === 'missing_pattern')) {
      improvements.push({
        category: 'directory_structure',
        suggestion: 'Consider adding new directory categories to accommodate emerging file patterns',
        example: `one/${analysis.type || 'new-category'}/`,
        impact: 'medium'
      });
    }
    
    // Suggest naming convention updates
    if (gaps.some(g => g.type === 'naming_evolution')) {
      improvements.push({
        category: 'naming_conventions',
        suggestion: 'Naming patterns may need updates to handle new file variations',
        example: 'Update regex patterns in ontology.md',
        impact: 'low'
      });
    }
    
    // Suggest new file type support
    const newTypes = gaps.filter(g => g.type === 'new_file_type');
    if (newTypes.length > 0) {
      improvements.push({
        category: 'file_type_support',
        suggestion: `Add support for new file types: ${newTypes.map(t => t.extension).join(', ')}`,
        example: 'Update file pattern mappings in ontology',
        impact: 'low'
      });
    }
    
    return improvements;
  }
  
  generateOntologyReport(filePath, analysis, gaps, improvements) {
    const report = {
      timestamp: new Date().toISOString(),
      file: filePath,
      analysis,
      ontology_health: {
        coverage: analysis.confidence,
        gaps: gaps.length,
        improvements_suggested: improvements.length
      },
      gaps,
      improvements,
      ontology_status: this.assessOntologyStatus(analysis.confidence, gaps.length)
    };
    
    // Log feedback for ontology development
    this.logOntologyFeedback(`ONTOLOGY_REPORT: ${JSON.stringify(report, null, 2)}`);
    
    return report;
  }
  
  assessOntologyStatus(confidence, gapCount) {
    if (confidence >= 90 && gapCount === 0) return 'excellent';
    if (confidence >= 80 && gapCount <= 1) return 'good';
    if (confidence >= 60 && gapCount <= 3) return 'adequate';
    return 'needs_attention';
  }

  async organizeFile(filePath, operation = 'close', autoMove = true) {
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        reason: 'file_not_found',
        message: `File does not exist: ${filePath}`
      };
    }
    
    const analysis = this.analyzeFile(filePath);
    
    // Generate ontology development feedback
    const gaps = this.analyzeOntologyGaps(filePath, analysis);
    const improvements = this.suggestOntologyImprovements(analysis, gaps);
    const ontologyReport = this.generateOntologyReport(filePath, analysis, gaps, improvements);
    
    // Skip if already in correct location
    if (analysis.currentLocation.startsWith('one/') || analysis.currentLocation.startsWith('.one/')) {
      return {
        success: true,
        reason: 'already_organized',
        message: `File already in correct location: ${filePath}`,
        analysis,
        ontologyReport
      };
    }
    
    // Skip if confidence is too low
    if (analysis.confidence < 60) {
      return {
        success: true,
        reason: 'low_confidence',
        message: `Confidence too low (${analysis.confidence}%) to auto-organize: ${filePath}`,
        analysis,
        ontologyReport,
        suggestion: `Consider manually moving to: ${analysis.suggestedLocation || 'appropriate directory'}`
      };
    }
    
    // Auto-move if enabled and high confidence
    if (autoMove && analysis.suggestedLocation && analysis.confidence >= 80) {
      try {
        const targetPath = analysis.suggestedLocation;
        const targetDir = path.dirname(targetPath);
        
        // Ensure target directory exists
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        
        // Move the file
        fs.renameSync(filePath, targetPath);
        
        return {
          success: true,
          reason: 'auto_organized',
          message: `File automatically moved: ${filePath} → ${targetPath}`,
          analysis,
          ontologyReport,
          oldPath: filePath,
          newPath: targetPath
        };
      } catch (error) {
        return {
          success: false,
          reason: 'move_failed',
          message: `Failed to move file: ${error.message}`,
          analysis,
          ontologyReport
        };
      }
    }
    
    // High confidence but not auto-moving (operation is 'open')
    if (analysis.suggestedLocation && analysis.confidence >= 70) {
      return {
        success: true,
        reason: 'suggestion_only',
        message: `File should be organized. Suggested location: ${analysis.suggestedLocation}`,
        analysis,
        ontologyReport,
        suggestion: `Move ${filePath} to ${analysis.suggestedLocation}`
      };
    }
    
    return {
      success: true,
      reason: 'no_action',
      message: `No organization action needed for: ${filePath}`,
      analysis,
      ontologyReport
    };
  }
}

// Main execution
async function main() {
  const filePath = process.argv[2];
  const operation = process.argv.find(arg => arg.startsWith('--operation='))?.split('=')[1] || 'close';
  const autoMove = operation === 'close'; // Only auto-move on file close
  
  if (!filePath) {
    console.error('Usage: node file-organization-engine.js <file-path> [--operation=open|close]');
    process.exit(1);
  }
  
  try {
    const ontologyPath = path.join(__dirname, '../../one/ontology.md');
    const organizer = new FileOrganizer(ontologyPath);
    const result = await organizer.organizeFile(filePath, operation, autoMove);
    
    if (result.success) {
      console.log(result.message);
      if (result.suggestion) {
        console.log(`💡 Suggestion: ${result.suggestion}`);
      }
      
      // Display ontology feedback
      if (result.ontologyReport) {
        const report = result.ontologyReport;
        console.log(`🧠 Ontology Status: ${report.ontology_status} (Coverage: ${report.ontology_health.coverage}%)`);
        
        if (report.gaps.length > 0) {
          console.log(`📋 Ontology Gaps Found (${report.gaps.length}):`);
          report.gaps.forEach(gap => {
            console.log(`  • ${gap.suggestion} [${gap.priority}]`);
          });
        }
        
        if (report.improvements.length > 0) {
          console.log(`🚀 Ontology Improvements Suggested (${report.improvements.length}):`);
          report.improvements.forEach(imp => {
            console.log(`  • ${imp.suggestion} [${imp.impact} impact]`);
          });
        }
      }
      
      // Exit code 2 indicates file was moved
      process.exit(result.reason === 'auto_organized' ? 2 : 0);
    } else {
      console.error(result.message);
      if (result.ontologyReport) {
        console.log(`🧠 Ontology feedback logged for analysis`);
      }
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error organizing ${filePath}:`, error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { FileOrganizer };