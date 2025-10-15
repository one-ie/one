#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class OntologyValidator {
  constructor(ontologyPath) {
    this.ontologyPath = ontologyPath;
    this.ontologyContent = fs.readFileSync(ontologyPath, 'utf8');
    this.rules = this.extractRules();
  }
  
  extractRules() {
    // Parse ontology.md to extract validation rules
    return {
      directoryStructure: this.extractDirectoryRules(),
      namingConventions: this.extractNamingRules(),
      agentStructure: this.extractAgentRules(),
      teamComposition: this.extractTeamRules(),
      viralIntegration: this.extractViralRules()
    };
  }
  
  extractDirectoryRules() {
    // Extract required directory structure from ontology
    const dirPattern = /```\s*ONE System Root\s*([\s\S]*?)```/;
    const match = this.ontologyContent.match(dirPattern);
    
    if (match) {
      const structure = match[1];
      return {
        required: ['one/', 'one/agents/', 'one/agent-teams/', 'one/workflows/'],
        forbidden: ['deprecated/', 'old/', 'backup/'],
        maxDepth: 5
      };
    }
    
    return { required: [], forbidden: [], maxDepth: 5 };
  }
  
  extractNamingRules() {
    // Extract naming conventions from ontology
    // These patterns are based on the ontology file structure definitions
    return {
      agent: /^[a-z-]+\.md$/,
      team: /^team-[a-z-]+\.yaml$/,
      workflow: /^[a-z-]+-workflow\.yaml$/,
      template: /^[a-z-]+-tmpl\.yaml$/,
      story: /^story-\d+\.md$/,
      task: /^[a-z-]+\.md$/,
      checklist: /^[a-z-]+\.md$/
    };
  }
  
  extractAgentRules() {
    return {
      requiredSections: ['persona', 'role', 'whenToUse', 'capabilities'],
      viralIntegration: ['content_multiplication', 'share_optimization'],
      orchestratorRelationships: true
    };
  }
  
  extractTeamRules() {
    return {
      minAgents: 3,
      maxAgents: 12,
      requiresOrchestrator: true,
      crossFunctionAllowed: true
    };
  }
  
  extractViralRules() {
    // Extract viral growth requirements
    return {
      requiredKeywords: [
        'viral', 'multiplication', 'k_factor', 'amplification',
        'sharing', 'network_effect', 'exponential'
      ],
      viralMetrics: ['k_factor_target', 'viral_cycle_target', 'amplification_target']
    };
  }
  
  validateFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return {
        valid: false,
        violations: [{
          type: 'file_existence',
          severity: 'critical',
          message: `File does not exist: ${filePath}`,
          suggestion: 'Ensure file path is correct'
        }],
        score: 0,
        recommendations: ['Check file path']
      };
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const fileType = this.classifyFile(filePath);
    const violations = [];
    
    // Validate directory structure
    const dirViolation = this.validateDirectory(filePath);
    if (dirViolation) violations.push(dirViolation);
    
    // Validate naming convention
    const nameViolation = this.validateNaming(filePath, fileType);
    if (nameViolation) violations.push(nameViolation);
    
    // Validate content structure
    const contentViolations = this.validateContent(content, fileType);
    violations.push(...contentViolations);
    
    // Validate viral integration
    const viralViolation = this.validateViralIntegration(content, fileType);
    if (viralViolation) violations.push(viralViolation);
    
    return {
      valid: violations.length === 0,
      violations: violations,
      score: this.calculateScore(violations),
      recommendations: this.generateRecommendations(violations)
    };
  }
  
  classifyFile(filePath) {
    if (filePath.includes('/agents/')) return 'agent';
    if (filePath.includes('/agent-teams/')) return 'team';
    if (filePath.includes('/workflows/')) return 'workflow';
    if (filePath.includes('/templates/')) return 'template';
    if (filePath.includes('/stories/')) return 'story';
    if (filePath.includes('/tasks/')) return 'task';
    if (filePath.includes('/checklists/')) return 'checklist';
    if (filePath.includes('/data/')) return 'data';
    if (filePath.includes('config')) return 'config';
    return 'unknown';
  }
  
  validateDirectory(filePath) {
    const allowedPaths = [
      /^one\//,
      /^\.one\//,
      /^one\/agents\//,
      /^one\/agent-teams\//,
      /^one\/workflows\//,
      /^one\/templates\//,
      /^one\/tasks\//,
      /^one\/checklists\//,
      /^one\/data\//,
      /^one\/tools\//,
      /^one\/tests\//,
      /^one\/stories\//,
      /^\.claude\//,
      /^tools\//,
      /^book\//,
      /^prompts\//,
      /^docs\//
    ];
    
    // Normalize path for comparison
    const normalizedPath = filePath.replace(/^.*\/one-code\//, '');
    const isValid = allowedPaths.some(pattern => pattern.test(normalizedPath));
    
    if (!isValid) {
      return {
        type: 'directory',
        severity: 'critical',
        message: `File in unauthorized directory: ${normalizedPath}`,
        suggestion: 'Move file to appropriate ontology-defined directory'
      };
    }
    
    return null;
  }
  
  validateNaming(filePath, fileType) {
    const fileName = path.basename(filePath);
    const pattern = this.rules.namingConventions[fileType];
    
    if (pattern && !pattern.test(fileName)) {
      return {
        type: 'naming',
        severity: 'medium',
        message: `File name "${fileName}" doesn't match pattern for ${fileType}`,
        suggestion: `Rename to match pattern: ${pattern.source}`
      };
    }
    
    return null;
  }
  
  validateContent(content, fileType) {
    const violations = [];
    
    if (fileType === 'story') {
      const requiredSections = ['## Status', '## Story', '## Acceptance Criteria', '## Tasks / Subtasks'];
      const missingSections = requiredSections.filter(section => !content.includes(section));
      
      if (missingSections.length > 0) {
        violations.push({
          type: 'content_structure',
          severity: 'high',
          message: `Missing required sections: ${missingSections.join(', ')}`,
          suggestion: 'Add missing sections to story file'
        });
      }
    }
    
    if (fileType === 'agent') {
      const requiredSections = ['# ', 'persona:', 'role:', 'whenToUse:'];
      const missingSections = requiredSections.filter(section => !content.includes(section));
      
      if (missingSections.length > 0) {
        violations.push({
          type: 'content_structure',
          severity: 'high',
          message: `Missing required agent sections: ${missingSections.join(', ')}`,
          suggestion: 'Add missing sections to agent definition'
        });
      }
    }
    
    return violations;
  }
  
  validateViralIntegration(content, fileType) {
    if (fileType === 'agent' || fileType === 'team') {
      const hasViralKeywords = this.rules.viralIntegration.requiredKeywords.some(
        keyword => content.toLowerCase().includes(keyword)
      );
      
      if (!hasViralKeywords) {
        return {
          type: 'viral_integration',
          severity: 'high',
          message: 'Missing viral growth integration patterns',
          suggestion: 'Add viral growth capabilities to definition (keywords: viral, multiplication, k_factor, amplification, sharing, network_effect, exponential)'
        };
      }
    }
    
    return null;
  }
  
  calculateScore(violations) {
    const weights = { critical: 20, high: 10, medium: 5, low: 2 };
    const totalDeductions = violations.reduce((sum, v) => sum + weights[v.severity], 0);
    return Math.max(0, 100 - totalDeductions);
  }
  
  generateRecommendations(violations) {
    const recommendations = [];
    
    violations.forEach(violation => {
      if (violation.suggestion) {
        recommendations.push(violation.suggestion);
      }
    });
    
    if (violations.some(v => v.type === 'viral_integration')) {
      recommendations.push('Review ontology.md viral growth patterns for integration guidance');
    }
    
    if (violations.some(v => v.type === 'directory')) {
      recommendations.push('Consult ontology.md directory structure requirements');
    }
    
    return [...new Set(recommendations)]; // Remove duplicates
  }
}

// Main execution
function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node ontology-validation-engine.js <file-path>');
    process.exit(1);
  }
  
  try {
    const ontologyPath = path.join(__dirname, '../../one/ontology.md');
    const validator = new OntologyValidator(ontologyPath);
    const result = validator.validateFile(filePath);
    
    if (result.valid) {
      console.log(`✅ ${filePath}: PASSED (Score: ${result.score}/100)`);
      process.exit(0);
    } else {
      console.log(`❌ ${filePath}: FAILED (Score: ${result.score}/100)`);
      result.violations.forEach(v => {
        console.log(`  ${v.severity.toUpperCase()}: ${v.message}`);
        if (v.suggestion) console.log(`    💡 ${v.suggestion}`);
      });
      
      if (result.recommendations.length > 0) {
        console.log('\n📋 Recommendations:');
        result.recommendations.forEach(rec => console.log(`  • ${rec}`));
      }
      
      const hasCritical = result.violations.some(v => v.severity === 'critical');
      process.exit(hasCritical ? 1 : 0);
    }
  } catch (error) {
    console.error(`Error validating ${filePath}:`, error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { OntologyValidator };