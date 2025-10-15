#!/usr/bin/env node

/**
 * Trinity Validation System
 * Comprehensive validation and maintenance for the .claude/.one/one trinity structure
 * Part of Mission-1: Trinity Harmonization
 */

import { readFileSync, existsSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, basename, dirname, extname, relative } from 'path';
import { execSync } from 'child_process';

const TRINITY_VALIDATION_CONFIG = {
  structure: {
    claude: {
      path: '.claude',
      required_dirs: ['agents', 'commands', 'hooks'],
      optional_dirs: [],
      file_types: ['.js', '.json', '.md'],
      purpose: 'Claude Code Integration & Execution'
    },
    platform: {
      path: '.one',
      required_dirs: ['agents', 'workflows', 'templates', 'tasks', 'checklists', 'tools', 'data'],
      optional_dirs: ['playbooks', 'stories', 'teams', 'missions', 'ontology', 'infrastructure', 'hooks'],
      file_types: ['.md', '.yaml', '.yml', '.json'],
      purpose: 'Immutable Platform Foundation'
    },
    user: {
      path: 'one',
      required_dirs: ['missions', 'stories'],
      optional_dirs: ['playbooks', 'guides', 'prompts', 'research', 'tests', 'docs', 'architecture', 'brand', 'assets', 'data', 'archive'],
      file_types: ['.md', '.yaml', '.yml', '.json', '.js', '.css', '.html', '.png', '.jpg', '.jpeg', '.gif', '.svg'],
      purpose: 'Active User Workspace'
    }
  },

  quality_gates: {
    file_organization: {
      max_misplaced_files: 0,
      required_compliance_score: 4.0,
      naming_convention_adherence: 0.95
    },
    structure_integrity: {
      required_directories_present: 1.0,
      directory_purpose_alignment: 1.0,
      cross_trinity_harmony: 0.98
    },
    automation_health: {
      hook_functionality: 1.0,
      real_time_monitoring: true,
      auto_correction_rate: 0.95
    }
  }
};

/**
 * Comprehensive Trinity Validation System
 */
class TrinityValidationSystem {
  constructor() {
    this.validationResults = {
      claude: { score: 0, issues: [], files: 0 },
      platform: { score: 0, issues: [], files: 0 },
      user: { score: 0, issues: [], files: 0 },
      overall: { score: 0, total_files: 0, organized_files: 0 }
    };
  }

  /**
   * Main validation execution
   */
  async validateTrinityStructure() {
    console.log('🎯 Trinity Validation System Activated');
    console.log('📊 Comprehensive validation of .claude/.one/one structure...\n');

    // Validate each trinity
    await this.validateTrinity('claude');
    await this.validateTrinity('platform');  
    await this.validateTrinity('user');

    // Cross-trinity harmony analysis
    this.validateCrossTrinityHarmony();

    // Generate comprehensive report
    this.generateValidationReport();

    return this.validationResults;
  }

  /**
   * Validates individual trinity structure
   */
  async validateTrinity(trinityKey) {
    const config = TRINITY_VALIDATION_CONFIG.structure[trinityKey];
    const trinityPath = join(process.cwd(), config.path);

    console.log(`🔍 Validating ${config.path}/ - ${config.purpose}`);

    if (!existsSync(trinityPath)) {
      this.validationResults[trinityKey].issues.push(`❌ Missing trinity directory: ${config.path}/`);
      this.validationResults[trinityKey].score = 0;
      return;
    }

    // Validate required directories
    const missingDirs = this.validateRequiredDirectories(trinityPath, config);
    if (missingDirs.length > 0) {
      this.validationResults[trinityKey].issues.push(`📁 Missing directories: ${missingDirs.join(', ')}`);
    }

    // Validate file organization
    const orgResults = this.validateFileOrganization(trinityPath, config);
    this.validationResults[trinityKey].files = orgResults.total_files;
    this.validationResults[trinityKey].issues.push(...orgResults.issues);

    // Calculate trinity score
    this.validationResults[trinityKey].score = this.calculateTrinityScore(trinityKey);

    console.log(`✅ ${config.path}/: ${this.validationResults[trinityKey].score.toFixed(1)}/5.0 stars`);
    console.log(`📁 Files: ${this.validationResults[trinityKey].files}`);
    
    if (this.validationResults[trinityKey].issues.length > 0) {
      console.log(`⚠️  Issues: ${this.validationResults[trinityKey].issues.length}`);
    }
    console.log('');
  }

  /**
   * Validates required directories exist
   */
  validateRequiredDirectories(trinityPath, config) {
    const missingDirs = [];
    
    config.required_dirs.forEach(dir => {
      const dirPath = join(trinityPath, dir);
      if (!existsSync(dirPath)) {
        missingDirs.push(dir);
      }
    });

    return missingDirs;
  }

  /**
   * Validates file organization within trinity
   */
  validateFileOrganization(trinityPath, config) {
    const results = {
      total_files: 0,
      organized_files: 0,
      issues: []
    };

    try {
      const items = this.getAllFiles(trinityPath);
      results.total_files = items.length;

      items.forEach(filePath => {
        const relativePath = relative(trinityPath, filePath);
        const ext = extname(filePath);
        
        // Validate file type
        if (!config.file_types.includes(ext)) {
          results.issues.push(`🚫 Unexpected file type '${ext}' in ${relativePath}`);
        } else {
          results.organized_files++;
        }

        // Validate naming convention
        const filename = basename(filePath, ext);
        if (!this.validateFilename(filename)) {
          results.issues.push(`📝 Non-standard naming: ${relativePath}`);
        }
      });

    } catch (error) {
      results.issues.push(`❌ Error scanning directory: ${error.message}`);
    }

    return results;
  }

  /**
   * Gets all files recursively from directory
   */
  getAllFiles(dirPath, files = []) {
    try {
      const items = readdirSync(dirPath);
      
      items.forEach(item => {
        const fullPath = join(dirPath, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          this.getAllFiles(fullPath, files);
        } else {
          files.push(fullPath);
        }
      });
    } catch (error) {
      // Directory not accessible
    }

    return files;
  }

  /**
   * Validates filename against naming conventions
   */
  validateFilename(filename) {
    // Kebab-case validation
    const kebabCase = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    return kebabCase.test(filename);
  }

  /**
   * Validates cross-trinity harmony
   */
  validateCrossTrinityHarmony() {
    console.log('🔄 Validating Cross-Trinity Harmony...');

    // Check for consistent directory structures
    const claudeDirs = this.getDirectories('.claude');
    const platformDirs = this.getDirectories('.one');
    const userDirs = this.getDirectories('one');

    // Find common directories
    const commonDirs = claudeDirs.filter(dir => 
      platformDirs.includes(dir) || userDirs.includes(dir)
    );

    if (commonDirs.length === 0) {
      this.validationResults.overall.issues = this.validationResults.overall.issues || [];
      this.validationResults.overall.issues.push('⚠️  No common directory patterns found across trinity');
    } else {
      console.log(`✅ Common directories: ${commonDirs.join(', ')}`);
    }

    // Validate synchronized structure patterns
    const structureScore = this.calculateStructureHarmonyScore();
    console.log(`🎯 Structure Harmony: ${structureScore.toFixed(1)}/5.0 stars\n`);
  }

  /**
   * Gets directories in a path
   */
  getDirectories(path) {
    try {
      if (!existsSync(path)) return [];
      
      return readdirSync(path).filter(item => {
        const itemPath = join(path, item);
        return statSync(itemPath).isDirectory();
      });
    } catch (error) {
      return [];
    }
  }

  /**
   * Calculates structure harmony score
   */
  calculateStructureHarmonyScore() {
    const totalIssues = Object.values(this.validationResults)
      .reduce((sum, result) => sum + (result.issues?.length || 0), 0);

    if (totalIssues === 0) return 5.0;
    if (totalIssues <= 3) return 4.5;
    if (totalIssues <= 6) return 4.0;
    if (totalIssues <= 10) return 3.5;
    return 3.0;
  }

  /**
   * Calculates individual trinity score
   */
  calculateTrinityScore(trinityKey) {
    const result = this.validationResults[trinityKey];
    const issues = result.issues.length;
    
    if (issues === 0) return 5.0;
    if (issues <= 2) return 4.5;
    if (issues <= 4) return 4.0;
    if (issues <= 6) return 3.5;
    return 3.0;
  }

  /**
   * Generates comprehensive validation report
   */
  generateValidationReport() {
    console.log('📊 Trinity Validation Report');
    console.log('═'.repeat(50));

    // Trinity scores
    Object.entries(this.validationResults).forEach(([key, result]) => {
      if (key === 'overall') return;
      
      const config = TRINITY_VALIDATION_CONFIG.structure[key];
      console.log(`${config.path.padEnd(8)} │ ⭐${result.score.toFixed(1)} │ 📁${result.files.toString().padStart(3)} files │ ${config.purpose}`);
      
      if (result.issues.length > 0) {
        result.issues.slice(0, 3).forEach(issue => {
          console.log(`         │      │        │ ${issue}`);
        });
        if (result.issues.length > 3) {
          console.log(`         │      │        │ ...and ${result.issues.length - 3} more`);
        }
      }
    });

    // Overall statistics
    const totalFiles = Object.values(this.validationResults)
      .reduce((sum, result) => sum + (result.files || 0), 0);
    
    const avgScore = Object.entries(this.validationResults)
      .filter(([key]) => key !== 'overall')
      .reduce((sum, [, result]) => sum + result.score, 0) / 3;

    const totalIssues = Object.values(this.validationResults)
      .reduce((sum, result) => sum + (result.issues?.length || 0), 0);

    console.log('─'.repeat(50));
    console.log(`📈 Overall Score: ⭐${avgScore.toFixed(1)}/5.0 stars`);
    console.log(`📁 Total Files: ${totalFiles}`);
    console.log(`🎯 Issues Found: ${totalIssues}`);
    
    if (avgScore >= 4.0) {
      console.log('\n🎉 Trinity structure harmony achieved!');
      console.log('✨ Beautiful organization maintained across all directories');
    } else {
      console.log('\n🔧 Trinity structure needs attention');
      console.log('📖 See one/docs/harmonized-structure-design.md for guidance');
    }

    // Update overall results
    this.validationResults.overall = {
      score: avgScore,
      total_files: totalFiles,
      issues_count: totalIssues,
      harmony_achieved: avgScore >= 4.0
    };
  }

  /**
   * Exports validation results for monitoring
   */
  exportValidationResults() {
    const reportPath = join(process.cwd(), 'one/docs/trinity-validation-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      mission: 'Mission-1: Trinity Harmonization',
      results: this.validationResults,
      quality_gates: TRINITY_VALIDATION_CONFIG.quality_gates,
      next_validation: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    try {
      writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📄 Validation report saved: ${reportPath}`);
    } catch (error) {
      console.log(`⚠️  Could not save validation report: ${error.message}`);
    }

    return report;
  }
}

/**
 * Main execution
 */
async function main() {
  const validator = new TrinityValidationSystem();
  const results = await validator.validateTrinityStructure();
  const report = validator.exportValidationResults();

  // Exit with appropriate code
  if (results.overall.harmony_achieved) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { TrinityValidationSystem };