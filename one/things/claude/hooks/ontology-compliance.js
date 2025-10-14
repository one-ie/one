#!/usr/bin/env node

/**
 * Ontology Compliance Hook
 * Ensures all files follow ONE framework ontology and structure principles
 * Part of Mission-1: Elegant File Harmonization
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, basename, dirname, extname } from 'path';
import { execSync } from 'child_process';

const ONTOLOGY_RULES = {
  // Mission-Story-Task-Agent cascade validation
  cascade: {
    mission: {
      required_sections: ['🎯 Mission Objective', '📊 Mission Context', '📋 Mission Stories'],
      quality_gate: '4.0+ stars required',
      pattern: /^mission-\d+.*\.md$/
    },
    story: {
      required_sections: ['**Objective:**', '**Acceptance Criteria:**'],
      quality_gate: '14+/16 points required',
      pattern: /^story-\d+\.\d+.*\.md$/
    },
    task: {
      required_sections: ['## Task Description', '## Implementation Steps'],
      quality_gate: '4.0+ stars required',
      pattern: /^task-.*\.md$/
    },
    agent: {
      required_fields: ['name', 'role', 'expertise', 'tools'],
      quality_gate: '4.0+ stars required',
      pattern: /^[a-z-]+\.md$/
    }
  },

  // Directory organization rules
  directories: {
    '.claude': {
      purpose: 'Claude Code Integration & Execution',
      allowed_subdirs: ['agents', 'commands', 'hooks'],
      file_patterns: ['*.js', '*.json', '*.md']
    },
    '.one': {
      purpose: 'Immutable Platform Foundation',
      allowed_subdirs: ['agents', 'workflows', 'templates', 'tasks', 'checklists', 'tools', 'data', 'playbooks', 'stories', 'teams', 'missions', 'ontology', 'infrastructure', 'hooks'],
      file_patterns: ['*.md', '*.yaml', '*.yml', '*.json']
    },
    'one': {
      purpose: 'Active User Workspace',
      allowed_subdirs: ['missions', 'stories', 'playbooks', 'guides', 'prompts', 'research', 'tests', 'docs', 'architecture', 'brand', 'assets', 'data', 'archive'],
      file_patterns: ['*.md', '*.yaml', '*.yml', '*.json', '*.js', '*.css', '*.html']
    }
  },

  // File naming conventions
  naming: {
    kebab_case: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    version_pattern: /^[a-z0-9-]+-v?\d+(\.\d+)*$/,
    extension_whitelist: ['.md', '.yaml', '.yml', '.json', '.js', '.css', '.html', '.png', '.jpg', '.jpeg', '.gif', '.svg'],
    forbidden_chars: /[A-Z\s_]/,
    max_length: 100
  },

  // Content quality validation
  quality: {
    markdown: {
      required_frontmatter: ['title', 'status'],
      structure_markers: ['#', '##', '###'],
      min_word_count: 50
    },
    yaml: {
      required_root_keys: ['name', 'description'],
      valid_status_values: ['draft', 'active', 'completed', 'archived']
    }
  }
};

/**
 * Validates file against ontology rules
 */
class OntologyValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.fixes = [];
  }

  /**
   * Main validation entry point
   */
  validateFile(filePath) {
    console.log(`🔍 Validating ontology compliance: ${filePath}`);
    
    this.errors = [];
    this.warnings = [];
    this.fixes = [];

    if (!existsSync(filePath)) {
      this.errors.push(`File does not exist: ${filePath}`);
      return this.getValidationResult();
    }

    // Basic file structure validation
    this.validateFileStructure(filePath);
    
    // Content-specific validation
    this.validateFileContent(filePath);
    
    // Cascade validation (if applicable)
    this.validateCascadeCompliance(filePath);
    
    return this.getValidationResult();
  }

  /**
   * Validates basic file structure and naming
   */
  validateFileStructure(filePath) {
    const filename = basename(filePath);
    const directory = dirname(filePath);
    const ext = extname(filename);
    const nameWithoutExt = basename(filename, ext);

    // Validate directory placement
    const trinity = this.determineTrinity(filePath);
    if (!trinity) {
      this.errors.push(`File not in valid trinity structure: ${filePath}`);
      this.fixes.push(`Move to .claude/, .one/, or one/ directory`);
    } else {
      this.validateDirectoryPlacement(filePath, trinity);
    }

    // Validate naming conventions
    if (ONTOLOGY_RULES.naming.forbidden_chars.test(nameWithoutExt)) {
      this.errors.push(`Invalid characters in filename: ${filename}`);
      this.fixes.push(`Use kebab-case: ${nameWithoutExt.toLowerCase().replace(/[_\s]/g, '-')}`);
    }

    if (!ONTOLOGY_RULES.naming.kebab_case.test(nameWithoutExt)) {
      this.warnings.push(`Filename not in kebab-case: ${filename}`);
    }

    if (filename.length > ONTOLOGY_RULES.naming.max_length) {
      this.errors.push(`Filename too long (${filename.length} > ${ONTOLOGY_RULES.naming.max_length}): ${filename}`);
    }

    if (!ONTOLOGY_RULES.naming.extension_whitelist.includes(ext)) {
      this.warnings.push(`Uncommon file extension: ${ext}`);
    }
  }

  /**
   * Validates file content against ontology rules
   */
  validateFileContent(filePath) {
    try {
      const content = readFileSync(filePath, 'utf8');
      const ext = extname(filePath);

      if (ext === '.md') {
        this.validateMarkdownContent(content, filePath);
      } else if (ext === '.yaml' || ext === '.yml') {
        this.validateYamlContent(content, filePath);
      } else if (ext === '.json') {
        this.validateJsonContent(content, filePath);
      }
    } catch (error) {
      this.errors.push(`Cannot read file content: ${error.message}`);
    }
  }

  /**
   * Validates markdown content structure
   */
  validateMarkdownContent(content, filePath) {
    const lines = content.split('\n');
    const filename = basename(filePath);

    // Check for title
    if (!content.includes('# ')) {
      this.warnings.push(`Missing main heading in: ${filename}`);
    }

    // Check minimum word count
    const wordCount = content.split(/\s+/).length;
    if (wordCount < ONTOLOGY_RULES.quality.markdown.min_word_count) {
      this.warnings.push(`Content too short (${wordCount} words) in: ${filename}`);
    }

    // Check for proper heading hierarchy
    const headings = lines.filter(line => line.startsWith('#'));
    if (headings.length === 0) {
      this.warnings.push(`No headings found in: ${filename}`);
    }
  }

  /**
   * Validates YAML content structure
   */
  validateYamlContent(content, filePath) {
    try {
      // Basic YAML parsing validation
      const lines = content.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
      
      if (lines.length === 0) {
        this.warnings.push(`Empty YAML file: ${basename(filePath)}`);
      }

      // Check for required root keys
      ONTOLOGY_RULES.quality.yaml.required_root_keys.forEach(key => {
        if (!content.includes(`${key}:`)) {
          this.warnings.push(`Missing required key '${key}' in: ${basename(filePath)}`);
        }
      });

    } catch (error) {
      this.errors.push(`Invalid YAML syntax: ${error.message}`);
    }
  }

  /**
   * Validates JSON content structure
   */
  validateJsonContent(content, filePath) {
    try {
      JSON.parse(content);
    } catch (error) {
      this.errors.push(`Invalid JSON syntax in ${basename(filePath)}: ${error.message}`);
    }
  }

  /**
   * Validates cascade compliance (Mission-Story-Task-Agent)
   */
  validateCascadeCompliance(filePath) {
    const filename = basename(filePath);
    const content = existsSync(filePath) ? readFileSync(filePath, 'utf8') : '';

    // Mission validation
    if (ONTOLOGY_RULES.cascade.mission.pattern.test(filename)) {
      ONTOLOGY_RULES.cascade.mission.required_sections.forEach(section => {
        if (!content.includes(section)) {
          this.warnings.push(`Mission missing required section: ${section}`);
        }
      });

      if (!content.includes('Status:') && !content.includes('status:')) {
        this.warnings.push(`Mission missing status indicator`);
      }
    }

    // Story validation
    if (ONTOLOGY_RULES.cascade.story.pattern.test(filename)) {
      ONTOLOGY_RULES.cascade.story.required_sections.forEach(section => {
        if (!content.includes(section)) {
          this.warnings.push(`Story missing required section: ${section}`);
        }
      });
    }

    // Task validation
    if (ONTOLOGY_RULES.cascade.task.pattern.test(filename)) {
      ONTOLOGY_RULES.cascade.task.required_sections.forEach(section => {
        if (!content.includes(section)) {
          this.warnings.push(`Task missing required section: ${section}`);
        }
      });
    }
  }

  /**
   * Determines which trinity a file belongs to
   */
  determineTrinity(filePath) {
    if (filePath.startsWith('.claude/')) return 'claude';
    if (filePath.startsWith('.one/')) return 'platform';
    if (filePath.startsWith('one/')) return 'user';
    return null;
  }

  /**
   * Validates directory placement within trinity
   */
  validateDirectoryPlacement(filePath, trinity) {
    const trinityRules = ONTOLOGY_RULES.directories[trinity === 'platform' ? '.one' : trinity === 'claude' ? '.claude' : 'one'];
    const pathSegments = filePath.split('/');
    
    if (pathSegments.length > 2) {
      const subdir = pathSegments[1];
      if (!trinityRules.allowed_subdirs.includes(subdir)) {
        this.warnings.push(`Unusual subdirectory '${subdir}' in ${trinity} trinity`);
        this.fixes.push(`Consider using: ${trinityRules.allowed_subdirs.join(', ')}`);
      }
    }
  }

  /**
   * Returns validation result summary
   */
  getValidationResult() {
    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      fixes: this.fixes,
      score: this.calculateComplianceScore()
    };
  }

  /**
   * Calculates compliance score out of 5.0 stars
   */
  calculateComplianceScore() {
    const totalIssues = this.errors.length + this.warnings.length;
    if (totalIssues === 0) return 5.0;
    if (totalIssues <= 2) return 4.5;
    if (totalIssues <= 4) return 4.0;
    if (totalIssues <= 6) return 3.5;
    if (totalIssues <= 8) return 3.0;
    return 2.5;
  }
}

/**
 * Main hook execution
 */
function main() {
  const filesToValidate = process.env.CHANGED_FILES?.split('\n').filter(Boolean) || [];
  
  if (filesToValidate.length === 0) {
    console.log('ℹ️  No files to validate for ontology compliance');
    return;
  }

  console.log('🎯 Ontology Compliance Hook Activated');
  console.log(`📊 Validating ${filesToValidate.length} files`);

  const validator = new OntologyValidator();
  let totalErrors = 0;
  let totalWarnings = 0;
  let totalScore = 0;

  filesToValidate.forEach(filePath => {
    const result = validator.validateFile(filePath);
    
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
    totalScore += result.score;

    if (result.errors.length > 0) {
      console.log(`❌ ${filePath}: ${result.errors.length} errors`);
      result.errors.forEach(error => console.log(`   ${error}`));
    }

    if (result.warnings.length > 0) {
      console.log(`⚠️  ${filePath}: ${result.warnings.length} warnings`);
      result.warnings.forEach(warning => console.log(`   ${warning}`));
    }

    if (result.valid) {
      console.log(`✅ ${filePath}: ⭐${result.score.toFixed(1)} Ontology compliant`);
    }

    if (result.fixes.length > 0) {
      console.log(`💡 Suggested fixes for ${filePath}:`);
      result.fixes.forEach(fix => console.log(`   ${fix}`));
    }
  });

  // Summary report
  const averageScore = totalScore / filesToValidate.length;
  console.log(`\n📊 Ontology Compliance Summary:`);
  console.log(`⭐ Average Score: ${averageScore.toFixed(1)}/5.0 stars`);
  console.log(`❌ Total Errors: ${totalErrors}`);
  console.log(`⚠️  Total Warnings: ${totalWarnings}`);

  if (totalErrors > 0) {
    console.log('\n🚨 Ontology compliance issues detected');
    console.log('📖 See one/docs/harmonized-structure-design.md for guidance');
    process.exit(1);
  } else {
    console.log('\n🎉 All files meet ontology compliance standards!');
    console.log(`🏆 Mission-1 quality maintained at ${averageScore.toFixed(1)} stars`);
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { OntologyValidator };