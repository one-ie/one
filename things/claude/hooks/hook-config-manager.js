#!/usr/bin/env node

/**
 * Claude Code Hook Configuration Manager
 * Utility to manage hook enable/disable states and configurations
 */

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, 'claude-code-hooks.json');
const CONFIG_BACKUP = path.join(__dirname, 'claude-code-hooks.backup.json');

// Load configuration
function loadConfig() {
  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading configuration:', error.message);
    process.exit(1);
  }
}

// Save configuration
function saveConfig(config) {
  try {
    // Create backup
    if (fs.existsSync(CONFIG_FILE)) {
      fs.copyFileSync(CONFIG_FILE, CONFIG_BACKUP);
    }
    
    // Save new config
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    console.log('Configuration saved successfully');
  } catch (error) {
    console.error('Error saving configuration:', error.message);
    process.exit(1);
  }
}

// Toggle hook by name
function toggleHook(hookName, enabled) {
  const config = loadConfig();
  let found = false;
  
  // Search through all hook types
  Object.keys(config.hooks).forEach(hookType => {
    if (Array.isArray(config.hooks[hookType])) {
      config.hooks[hookType].forEach(group => {
        if (group.hooks && Array.isArray(group.hooks)) {
          group.hooks.forEach(hook => {
            if (hook.name === hookName) {
              hook.enabled = enabled;
              found = true;
            }
          });
        }
      });
    }
  });
  
  if (found) {
    saveConfig(config);
    console.log(`Hook '${hookName}' ${enabled ? 'enabled' : 'disabled'}`);
  } else {
    console.error(`Hook '${hookName}' not found`);
    process.exit(1);
  }
}

// Toggle category
function toggleCategory(category, enabled) {
  const config = loadConfig();
  
  if (config.config && config.config.categories && config.config.categories[category]) {
    config.config.categories[category].enabled = enabled;
    saveConfig(config);
    console.log(`Category '${category}' ${enabled ? 'enabled' : 'disabled'}`);
  } else {
    console.error(`Category '${category}' not found`);
    process.exit(1);
  }
}

// List all hooks
function listHooks() {
  const config = loadConfig();
  
  console.log('\nCategories:');
  if (config.config && config.config.categories) {
    Object.entries(config.config.categories).forEach(([name, cat]) => {
      console.log(`  ${name}: ${cat.enabled ? '✓' : '✗'} - ${cat.description}`);
    });
  }
  
  console.log('\nHooks:');
  Object.entries(config.hooks).forEach(([hookType, groups]) => {
    console.log(`\n  ${hookType}:`);
    if (Array.isArray(groups)) {
      groups.forEach(group => {
        if (group.hooks && Array.isArray(group.hooks)) {
          group.hooks.forEach(hook => {
            const status = hook.enabled ? '✓' : '✗';
            const timeout = hook.timeout ? ` (timeout: ${hook.timeout}ms)` : '';
            console.log(`    ${status} ${hook.name}${timeout}`);
          });
        }
      });
    }
  });
}

// Set timeout for a hook
function setTimeout(hookName, timeout) {
  const config = loadConfig();
  let found = false;
  
  Object.keys(config.hooks).forEach(hookType => {
    if (Array.isArray(config.hooks[hookType])) {
      config.hooks[hookType].forEach(group => {
        if (group.hooks && Array.isArray(group.hooks)) {
          group.hooks.forEach(hook => {
            if (hook.name === hookName) {
              hook.timeout = parseInt(timeout);
              found = true;
            }
          });
        }
      });
    }
  });
  
  if (found) {
    saveConfig(config);
    console.log(`Timeout for hook '${hookName}' set to ${timeout}ms`);
  } else {
    console.error(`Hook '${hookName}' not found`);
    process.exit(1);
  }
}

// Main CLI
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'enable':
    if (args[1]) {
      toggleHook(args[1], true);
    } else {
      console.error('Usage: hook-config-manager.js enable <hook-name>');
    }
    break;
    
  case 'disable':
    if (args[1]) {
      toggleHook(args[1], false);
    } else {
      console.error('Usage: hook-config-manager.js disable <hook-name>');
    }
    break;
    
  case 'enable-category':
    if (args[1]) {
      toggleCategory(args[1], true);
    } else {
      console.error('Usage: hook-config-manager.js enable-category <category>');
    }
    break;
    
  case 'disable-category':
    if (args[1]) {
      toggleCategory(args[1], false);
    } else {
      console.error('Usage: hook-config-manager.js disable-category <category>');
    }
    break;
    
  case 'set-timeout':
    if (args[1] && args[2]) {
      setTimeout(args[1], args[2]);
    } else {
      console.error('Usage: hook-config-manager.js set-timeout <hook-name> <milliseconds>');
    }
    break;
    
  case 'list':
    listHooks();
    break;
    
  default:
    console.log('Claude Code Hook Configuration Manager');
    console.log('\nUsage:');
    console.log('  hook-config-manager.js enable <hook-name>');
    console.log('  hook-config-manager.js disable <hook-name>');
    console.log('  hook-config-manager.js enable-category <category>');
    console.log('  hook-config-manager.js disable-category <category>');
    console.log('  hook-config-manager.js set-timeout <hook-name> <milliseconds>');
    console.log('  hook-config-manager.js list');
    console.log('\nCategories: formatting, testing, security, notifications');
}