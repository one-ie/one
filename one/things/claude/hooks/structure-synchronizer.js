#!/usr/bin/env node

/**
 * Structure Synchronizer Hook
 * Maintains harmonized organization across .claude, .one, and one/ directories
 * Part of Mission-1: Elegant File Harmonization
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, basename, extname, join } from 'path';
import { execSync } from 'child_process';

const TRINITY_ROOTS = {
  claude: '.claude',
  platform: '.one', 
  user: 'one'
};

const DIRECTORY_MAPPING = {
  agents: ['agents'],
  workflows: ['workflows'],
  templates: ['templates'],
  tasks: ['tasks'],
  checklists: ['checklists'],
  tools: ['tools'],
  data: ['data'],
  playbooks: ['playbooks'],
  stories: ['stories'],
  teams: ['teams'],
  missions: ['missions'],
  guides: ['guides'],
  prompts: ['prompts'],
  research: ['research'],
  tests: ['tests'],
  docs: ['docs'],
  architecture: ['architecture'],
  brand: ['brand'],
  assets: ['assets']
};

/**
 * Validates file placement according to trinity architecture
 */
function validateFilePlacement(filePath) {
  const normalized = filePath.replace(/^\.\//, '');
  const segments = normalized.split('/');
  
  // Determine which trinity this belongs to
  const trinity = segments[0];
  const directory = segments[1];
  const filename = segments[segments.length - 1];
  
  console.log(`🔍 Validating: ${filePath}`);
  console.log(`📁 Trinity: ${trinity}, Directory: ${directory}, File: ${filename}`);
  
  // Validate trinity structure
  if (!Object.values(TRINITY_ROOTS).includes(trinity)) {
    return {
      valid: false,
      reason: `File not in trinity structure (${trinity})`,
      suggestion: `Move to appropriate trinity: ${Object.values(TRINITY_ROOTS).join(', ')}`
    };
  }
  
  // Validate directory mapping
  if (directory && !DIRECTORY_MAPPING[directory]) {
    return {
      valid: false,
      reason: `Directory '${directory}' not in harmonized structure`,
      suggestion: `Use one of: ${Object.keys(DIRECTORY_MAPPING).join(', ')}`
    };
  }
  
  return { valid: true, trinity, directory, filename };
}

/**
 * Ensures beautiful naming conventions
 */
function validateNaming(filename) {
  const rules = [
    {
      test: /^[a-z0-9-]+(\.[a-z0-9]+)*\.(md|yaml|js|json|css|html)$/i,
      message: 'Use kebab-case with valid extensions'
    },
    {
      test: /^(?!.*--).*$/,
      message: 'Avoid double dashes'
    },
    {
      test: /^(?!-|.*-$).*$/,
      message: 'No leading or trailing dashes'
    }
  ];
  
  for (const rule of rules) {
    if (!rule.test.test(filename)) {
      return {
        valid: false,
        reason: rule.message,
        suggestion: `Rename '${filename}' to follow naming conventions`
      };
    }
  }
  
  return { valid: true };
}

/**
 * Checks if directories exist across trinity, creates if needed
 */
function ensureDirectoryHarmony(directory) {
  const paths = Object.values(TRINITY_ROOTS).map(root => 
    join(process.cwd(), root, directory)
  );
  
  paths.forEach(path => {
    if (!existsSync(path)) {
      console.log(`📁 Creating missing directory: ${path}`);
      mkdirSync(path, { recursive: true });
    }
  });
}

/**
 * Main hook execution
 */
function main() {
  const changedFiles = process.env.CHANGED_FILES?.split('\n').filter(Boolean) || [];
  
  if (changedFiles.length === 0) {
    console.log('ℹ️  No files to validate');
    return;
  }
  
  console.log('🔄 Structure Synchronizer Hook Activated');
  console.log(`📊 Validating ${changedFiles.length} files`);
  
  let errors = [];
  let warnings = [];
  
  changedFiles.forEach(filePath => {
    // Validate file placement
    const placement = validateFilePlacement(filePath);
    if (!placement.valid) {
      errors.push(`❌ ${filePath}: ${placement.reason}`);
      if (placement.suggestion) {
        warnings.push(`💡 ${placement.suggestion}`);
      }
      return;
    }
    
    // Validate naming
    const naming = validateNaming(placement.filename);
    if (!naming.valid) {
      errors.push(`❌ ${filePath}: ${naming.reason}`);
      if (naming.suggestion) {
        warnings.push(`💡 ${naming.suggestion}`);
      }
      return;
    }
    
    // Ensure directory harmony
    if (placement.directory) {
      ensureDirectoryHarmony(placement.directory);
    }
    
    console.log(`✅ ${filePath}: Harmonized`);
  });
  
  // Report results
  if (errors.length > 0) {
    console.log('\n🚨 Structure Validation Errors:');
    errors.forEach(error => console.log(error));
    
    if (warnings.length > 0) {
      console.log('\n💡 Suggestions:');
      warnings.forEach(warning => console.log(warning));
    }
    
    console.log('\n📖 See one/docs/harmonized-structure-design.md for guidance');
    process.exit(1);
  } else {
    console.log('\n🎯 All files perfectly harmonized!');
    console.log('📁 Trinity structure maintained with elegance');
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateFilePlacement, validateNaming, ensureDirectoryHarmony };