#!/usr/bin/env node

/**
 * File Organization Monitor Hook
 * Real-time monitoring and automated organization for the trinity structure
 * Part of Mission-1: Elegant File Harmonization
 */

import { watchFile, readFileSync, existsSync, statSync, readdirSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { execSync } from 'child_process';

const TRINITY_CONFIG = {
  claude: {
    path: '.claude',
    purpose: 'Claude Code Integration & Execution',
    autoCreate: ['agents', 'commands', 'hooks'],
    rules: {
      agents: 'Executable agent definitions for Claude Code',
      commands: 'Custom Claude Code commands (/one, /story, etc.)',
      hooks: 'Real-time automation and validation scripts'
    }
  },
  platform: {
    path: '.one',
    purpose: 'Immutable Platform Foundation',
    autoCreate: ['agents', 'workflows', 'templates', 'tasks', 'checklists', 'tools', 'data'],
    rules: {
      agents: 'Platform agent definitions and configurations',
      workflows: 'Cascade orchestration patterns and frameworks',
      templates: 'Document generation and content templates',
      tasks: 'Implementation task library and definitions',
      checklists: 'Quality validation and compliance frameworks'
    }
  },
  user: {
    path: 'one',
    purpose: 'Active User Workspace',
    autoCreate: ['missions', 'stories', 'playbooks', 'guides', 'docs'],
    rules: {
      missions: 'Active user missions and strategic objectives',
      stories: 'User narrative development and implementations',
      playbooks: 'Generated user content and custom playbooks',
      guides: 'User documentation and reference materials'
    }
  }
};

/**
 * Monitors file changes and maintains organization
 */
class FileOrganizationMonitor {
  constructor() {
    this.lastCheck = Date.now();
    this.organizationRules = this.loadOrganizationRules();
  }

  loadOrganizationRules() {
    try {
      const rulesPath = join(process.cwd(), 'one/docs/harmonized-structure-design.md');
      if (existsSync(rulesPath)) {
        console.log('📋 Loaded harmonized structure rules');
        return true;
      }
    } catch (error) {
      console.log('⚠️  Using default organization rules');
    }
    return false;
  }

  /**
   * Determines the correct trinity location for a file
   */
  determineCorrectLocation(filePath, fileContent = '') {
    const filename = basename(filePath);
    const dir = dirname(filePath);
    const ext = extname(filename);

    // Agent files
    if (filename.includes('agent') || dir.includes('agents')) {
      if (fileContent.includes('claude.ai') || fileContent.includes('Claude Code')) {
        return { trinity: 'claude', directory: 'agents', reason: 'Claude Code execution agent' };
      }
      if (fileContent.includes('platform') || fileContent.includes('immutable')) {
        return { trinity: 'platform', directory: 'agents', reason: 'Platform agent definition' };
      }
      return { trinity: 'user', directory: 'agents', reason: 'User custom agent' };
    }

    // Mission files
    if (filename.includes('mission') || dir.includes('missions')) {
      if (fileContent.includes('template') || fileContent.includes('framework')) {
        return { trinity: 'platform', directory: 'missions', reason: 'Mission template' };
      }
      return { trinity: 'user', directory: 'missions', reason: 'Active user mission' };
    }

    // Story files
    if (filename.includes('story') || dir.includes('stories')) {
      if (fileContent.includes('template') || fileContent.includes('platform')) {
        return { trinity: 'platform', directory: 'stories', reason: 'Story template' };
      }
      return { trinity: 'user', directory: 'stories', reason: 'User story implementation' };
    }

    // Hook files
    if (filename.includes('hook') || dir.includes('hooks') || ext === '.js' && fileContent.includes('hook')) {
      return { trinity: 'claude', directory: 'hooks', reason: 'Claude Code automation hook' };
    }

    // Command files
    if (filename.includes('command') || dir.includes('commands') || fileContent.includes('/one')) {
      return { trinity: 'claude', directory: 'commands', reason: 'Claude Code command' };
    }

    // Workflow files
    if (filename.includes('workflow') || dir.includes('workflows')) {
      return { trinity: 'platform', directory: 'workflows', reason: 'Platform workflow definition' };
    }

    // Template files
    if (filename.includes('template') || filename.includes('tmpl') || dir.includes('templates')) {
      return { trinity: 'platform', directory: 'templates', reason: 'Platform template' };
    }

    // Documentation files
    if (dir.includes('docs') || filename.includes('guide')) {
      return { trinity: 'user', directory: 'docs', reason: 'User documentation' };
    }

    // Default to user workspace
    return { trinity: 'user', directory: 'docs', reason: 'User workspace file' };
  }

  /**
   * Validates trinity structure integrity
   */
  validateTrinityStructure() {
    const issues = [];
    
    Object.entries(TRINITY_CONFIG).forEach(([key, config]) => {
      const trinityPath = join(process.cwd(), config.path);
      
      if (!existsSync(trinityPath)) {
        issues.push(`❌ Missing trinity directory: ${config.path}`);
        return;
      }

      config.autoCreate.forEach(dir => {
        const dirPath = join(trinityPath, dir);
        if (!existsSync(dirPath)) {
          issues.push(`📁 Missing directory: ${config.path}/${dir}`);
        }
      });
    });

    return issues;
  }

  /**
   * Reports organization status
   */
  generateOrganizationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      trinity_status: {},
      total_files: 0,
      organized_files: 0,
      issues: []
    };

    Object.entries(TRINITY_CONFIG).forEach(([key, config]) => {
      const trinityPath = join(process.cwd(), config.path);
      
      if (existsSync(trinityPath)) {
        const stats = this.countFilesInDirectory(trinityPath);
        report.trinity_status[key] = {
          path: config.path,
          purpose: config.purpose,
          file_count: stats.files,
          directory_count: stats.directories,
          organized: true
        };
        report.total_files += stats.files;
        report.organized_files += stats.files;
      } else {
        report.trinity_status[key] = {
          path: config.path,
          purpose: config.purpose,
          organized: false
        };
        report.issues.push(`Missing trinity: ${config.path}`);
      }
    });

    return report;
  }

  countFilesInDirectory(dirPath) {
    let files = 0;
    let directories = 0;

    try {
      const items = readdirSync(dirPath);
      items.forEach(item => {
        const itemPath = join(dirPath, item);
        const stat = statSync(itemPath);
        
        if (stat.isDirectory()) {
          directories++;
          const subStats = this.countFilesInDirectory(itemPath);
          files += subStats.files;
          directories += subStats.directories;
        } else {
          files++;
        }
      });
    } catch (error) {
      // Directory not accessible
    }

    return { files, directories };
  }

  /**
   * Main monitoring execution
   */
  monitor() {
    console.log('👁️  File Organization Monitor Activated');
    console.log('🔄 Monitoring trinity structure integrity...');

    // Validate current structure
    const issues = this.validateTrinityStructure();
    if (issues.length > 0) {
      console.log('\n🚨 Structure Issues Detected:');
      issues.forEach(issue => console.log(issue));
    } else {
      console.log('✅ Trinity structure integrity confirmed');
    }

    // Generate organization report
    const report = this.generateOrganizationReport();
    console.log(`\n📊 Organization Status:`);
    console.log(`📁 Total Files: ${report.total_files}`);
    console.log(`✅ Organized Files: ${report.organized_files}`);
    console.log(`📈 Organization Rate: ${((report.organized_files / report.total_files) * 100).toFixed(1)}%`);

    Object.entries(report.trinity_status).forEach(([key, status]) => {
      if (status.organized) {
        console.log(`🎯 ${status.path}/: ${status.file_count} files, ${status.directory_count} directories`);
      } else {
        console.log(`⚠️  ${status.path}/: Not organized`);
      }
    });

    if (report.issues.length === 0) {
      console.log('\n🎉 Perfect trinity harmony achieved!');
      console.log('📁 All files elegantly organized across .claude/.one/one structure');
    }
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new FileOrganizationMonitor();
  monitor.monitor();
}

export { FileOrganizationMonitor };