#!/usr/bin/env node

/**
 * Claude Code Hook Performance Report
 * Analyzes hook execution logs for performance metrics
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const LOG_FILE = path.join(__dirname, 'hooks.log');

async function analyzePerformance() {
  if (!fs.existsSync(LOG_FILE)) {
    console.log('No log file found. Hooks have not been executed yet.');
    return;
  }

  const fileStream = fs.createReadStream(LOG_FILE);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const metrics = {
    totalExecutions: 0,
    hooks: {},
    errors: 0,
    warnings: 0,
    slowExecutions: []
  };

  let currentHook = null;
  let currentDuration = null;

  for await (const line of rl) {
    // Parse hook name
    if (line.includes('[INFO] Hook:')) {
      currentHook = line.split('Hook:')[1].trim();
    }
    
    // Parse duration
    if (line.includes('[INFO] Duration:')) {
      const duration = parseInt(line.match(/Duration: (\d+)ms/)[1]);
      currentDuration = duration;
      
      if (currentHook) {
        if (!metrics.hooks[currentHook]) {
          metrics.hooks[currentHook] = {
            executions: 0,
            totalDuration: 0,
            minDuration: Infinity,
            maxDuration: 0,
            avgDuration: 0
          };
        }
        
        const hook = metrics.hooks[currentHook];
        hook.executions++;
        hook.totalDuration += duration;
        hook.minDuration = Math.min(hook.minDuration, duration);
        hook.maxDuration = Math.max(hook.maxDuration, duration);
        
        metrics.totalExecutions++;
        
        if (duration > 5000) {
          metrics.slowExecutions.push({
            hook: currentHook,
            duration: duration,
            timestamp: line.match(/\[(.*?)\]/)[1]
          });
        }
      }
    }
    
    // Count errors and warnings
    if (line.includes('[ERROR]')) metrics.errors++;
    if (line.includes('[WARN]')) metrics.warnings++;
  }

  // Calculate averages
  Object.keys(metrics.hooks).forEach(hookName => {
    const hook = metrics.hooks[hookName];
    hook.avgDuration = Math.round(hook.totalDuration / hook.executions);
  });

  // Display report
  console.log('\n=== Claude Code Hooks Performance Report ===\n');
  console.log(`Total Executions: ${metrics.totalExecutions}`);
  console.log(`Errors: ${metrics.errors}`);
  console.log(`Warnings: ${metrics.warnings}`);
  
  console.log('\nHook Performance Summary:');
  console.log('─'.repeat(80));
  console.log('Hook Name'.padEnd(30) + 'Exec'.padEnd(8) + 'Avg(ms)'.padEnd(10) + 'Min(ms)'.padEnd(10) + 'Max(ms)'.padEnd(10));
  console.log('─'.repeat(80));
  
  Object.entries(metrics.hooks).forEach(([name, stats]) => {
    console.log(
      name.padEnd(30) +
      stats.executions.toString().padEnd(8) +
      stats.avgDuration.toString().padEnd(10) +
      stats.minDuration.toString().padEnd(10) +
      stats.maxDuration.toString().padEnd(10)
    );
  });
  
  if (metrics.slowExecutions.length > 0) {
    console.log('\n⚠️  Slow Executions (>5000ms):');
    metrics.slowExecutions.forEach(exec => {
      console.log(`  - ${exec.hook}: ${exec.duration}ms at ${exec.timestamp}`);
    });
  }
  
  console.log('\n');
}

// Run the analysis
analyzePerformance().catch(console.error);