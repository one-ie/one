#!/usr/bin/env node

/**
 * Startup Optimizer Hook - ONE Framework
 * 
 * Claude Code hook that automatically optimizes startup time by:
 * 1. Integrating with the lazy loading system
 * 2. Preloading critical paths based on user context
 * 3. Optimizing module resolution and caching
 * 4. Monitoring and reporting performance metrics
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class StartupOptimizer {
  constructor() {
    this.LazyLoader = null; // Will be dynamically imported
    this.loader = null;
    this.hookStartTime = Date.now();
    this.enabled = true;
    this.performanceLog = [];
    this.configPath = path.join(__dirname, '../../one/config/performance-config.yaml');
    this.lastOptimization = null;
  }

  /**
   * Main hook entry point - called by Claude Code
   */
  async onStartup(context = {}) {
    if (!this.enabled) return;

    console.log('⚡ Startup Optimizer Hook activated');
    
    try {
      // Initialize lazy loader
      await this.initializeLazyLoader();
      
      // Context-aware preloading
      await this.contextAwarePreload(context);
      
      // Module resolution optimization
      await this.optimizeModuleResolution();
      
      // Performance monitoring setup
      this.setupPerformanceMonitoring();
      
      const hookTime = Date.now() - this.hookStartTime;
      console.log(`⚡ Startup optimization completed in ${hookTime}ms`);
      
      return {
        success: true,
        optimizationTime: hookTime,
        loader: this.loader
      };
      
    } catch (error) {
      console.error('❌ Startup optimization failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Initialize the lazy loader system
   */
  async initializeLazyLoader() {
    try {
      // Dynamic import to avoid circular dependencies
      const { default: LazyLoader } = await import('../../.one/tools/lazy-loader.js');
      this.LazyLoader = LazyLoader;
      this.loader = new this.LazyLoader();
      
      // Initialize with performance tracking
      const initStart = Date.now();
      await this.loader.initialize();
      const initTime = Date.now() - initStart;
      
      this.logPerformance('lazy_loader_init', initTime);
      
      console.log(`✅ Lazy Loader initialized in ${initTime}ms`);
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize Lazy Loader:', error);
      throw error;
    }
  }

  /**
   * Context-aware preloading based on user's likely needs
   */
  async contextAwarePreload(context) {
    const preloadStart = Date.now();
    
    // Determine user context and preload accordingly
    const userContext = await this.analyzeUserContext(context);
    const preloadPaths = this.getContextualPreloadPaths(userContext);
    
    console.log(`🎯 Context: ${userContext.primary} - Preloading ${preloadPaths.length} files`);
    
    // Preload contextual files
    const preloadPromises = preloadPaths.map(async (filePath) => {
      try {
        if (this.loader) {
          return await this.loader.getFile(filePath);
        }
      } catch (error) {
        console.warn(`⚠️ Preload failed: ${filePath}`);
        return null;
      }
    });

    const results = await Promise.allSettled(preloadPromises);
    const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
    
    const preloadTime = Date.now() - preloadStart;
    this.logPerformance('contextual_preload', preloadTime);
    
    console.log(`✅ Preloaded ${successful}/${preloadPaths.length} contextual files in ${preloadTime}ms`);
  }

  /**
   * Analyze user context to determine what to preload
   */
  async analyzeUserContext(context) {
    const userContext = {
      primary: 'general',
      secondary: [],
      confidence: 0.5
    };

    try {
      // Check recent git activity
      const gitContext = await this.analyzeGitContext();
      
      // Check current directory contents
      const dirContext = await this.analyzeDirectoryContext();
      
      // Check Claude Code context if provided
      const claudeContext = this.analyzeClaudeContext(context);
      
      // Combine contexts with weights
      const contexts = [
        { type: 'git', data: gitContext, weight: 0.4 },
        { type: 'directory', data: dirContext, weight: 0.3 },
        { type: 'claude', data: claudeContext, weight: 0.3 }
      ];

      // Determine primary context
      const contextScores = {};
      for (const ctx of contexts) {
        for (const [key, score] of Object.entries(ctx.data)) {
          contextScores[key] = (contextScores[key] || 0) + (score * ctx.weight);
        }
      }

      // Get highest scoring context
      const sortedContexts = Object.entries(contextScores)
        .sort(([,a], [,b]) => b - a);

      if (sortedContexts.length > 0) {
        userContext.primary = sortedContexts[0][0];
        userContext.confidence = sortedContexts[0][1];
        userContext.secondary = sortedContexts.slice(1, 3).map(([key]) => key);
      }

    } catch (error) {
      console.warn('⚠️ Context analysis failed, using defaults');
    }

    return userContext;
  }

  /**
   * Analyze recent git activity for context clues
   */
  async analyzeGitContext() {
    const contexts = {};
    
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      // Get recent commit messages
      const { stdout } = await execAsync('git log --oneline -10 2>/dev/null || echo ""');
      const commits = stdout.toLowerCase();

      // Score based on commit content
      if (commits.includes('mission')) contexts.mission = 0.8;
      if (commits.includes('story')) contexts.story = 0.7;
      if (commits.includes('agent')) contexts.agent = 0.6;
      if (commits.includes('task')) contexts.task = 0.5;
      if (commits.includes('playbook')) contexts.playbook = 0.4;
      if (commits.includes('optimization') || commits.includes('performance')) contexts.optimization = 0.9;

    } catch (error) {
      // Git not available or no commits
    }

    return contexts;
  }

  /**
   * Analyze current directory for context
   */
  async analyzeDirectoryContext() {
    const contexts = {};
    
    try {
      // Check for recent file activity
      const recentFiles = await this.getRecentFiles();
      
      for (const file of recentFiles) {
        if (file.includes('/missions/')) contexts.mission = 0.7;
        if (file.includes('/stories/')) contexts.story = 0.6;
        if (file.includes('/agents/')) contexts.agent = 0.8;
        if (file.includes('/playbooks/')) contexts.playbook = 0.5;
        if (file.includes('/tasks/')) contexts.task = 0.4;
        if (file.includes('performance') || file.includes('optimization')) contexts.optimization = 0.9;
      }

    } catch (error) {
      // Directory analysis failed
    }

    return contexts;
  }

  /**
   * Analyze Claude Code context
   */
  analyzeClaudeContext(context) {
    const contexts = {};
    
    if (context.command) {
      const cmd = context.command.toLowerCase();
      if (cmd.includes('mission')) contexts.mission = 0.9;
      if (cmd.includes('story')) contexts.story = 0.8;
      if (cmd.includes('agent')) contexts.agent = 0.7;
      if (cmd.includes('task')) contexts.task = 0.6;
      if (cmd.includes('one')) contexts.general = 0.5;
    }

    if (context.workingDirectory) {
      const wd = context.workingDirectory.toLowerCase();
      if (wd.includes('mission')) contexts.mission = 0.6;
      if (wd.includes('story')) contexts.story = 0.5;
    }

    return contexts;
  }

  /**
   * Get contextual files to preload based on user context
   */
  getContextualPreloadPaths(userContext) {
    const basePaths = [
      '.claude/agents/mission-commander.md',
      '.claude/commands/one.md',
      'one/config/core-config.yaml'
    ];

    const contextPaths = {
      mission: [
        '.claude/agents/mission-commander.md',
        '.one/workflows/mission-workflow.yaml',
        '.one/templates/mission-tmpl.yaml',
        'one/missions/'
      ],
      story: [
        '.claude/agents/story-teller.md',
        '.one/workflows/story-workflow.yaml', 
        '.one/templates/story-tmpl.yaml',
        'one/stories/'
      ],
      agent: [
        '.claude/agents/',
        '.claude/commands/',
        '.one/workflows/agent-coordination.yaml'
      ],
      task: [
        '.claude/agents/task-master.md',
        '.one/workflows/task-workflow.yaml',
        'one/tasks/'
      ],
      playbook: [
        'one/playbooks/',
        '.one/templates/playbook-tmpl.yaml'
      ],
      optimization: [
        '.one/tools/lazy-loader.js',
        'one/config/performance-config.yaml',
        '.claude/hooks/startup-optimizer.js'
      ]
    };

    let paths = [...basePaths];
    
    // Add primary context paths
    if (contextPaths[userContext.primary]) {
      paths.push(...contextPaths[userContext.primary]);
    }
    
    // Add secondary context paths (with lower priority)
    for (const secondary of userContext.secondary) {
      if (contextPaths[secondary]) {
        paths.push(...contextPaths[secondary].slice(0, 2)); // Only top 2
      }
    }

    // Remove duplicates and expand directories
    return [...new Set(paths)];
  }

  /**
   * Optimize Node.js module resolution
   */
  async optimizeModuleResolution() {
    const optimizeStart = Date.now();
    
    try {
      // Cache commonly used modules
      const commonModules = [
        'fs', 'path', 'crypto', 'util', 'child_process',
        'yaml', 'markdown-it', 'glob'
      ];

      for (const moduleName of commonModules) {
        try {
          await import(moduleName);
        } catch (error) {
          // Module not available, skip
        }
      }

      // Set up module cache optimization
      await this.warmupRequireCache();

    } catch (error) {
      console.warn('⚠️ Module resolution optimization failed:', error.message);
    }

    const optimizeTime = Date.now() - optimizeStart;
    this.logPerformance('module_optimization', optimizeTime);
    console.log(`⚡ Module resolution optimized in ${optimizeTime}ms`);
  }

  /**
   * Warm up Node.js require cache
   */
  async warmupRequireCache() {
    // Pre-cache essential internal modules
    const essentialModules = [
      'events', 'stream', 'url', 'querystring', 'os',
      'assert', 'buffer', 'timers', 'process'
    ];

    for (const mod of essentialModules) {
      try {
        await import(mod);
      } catch (error) {
        // Skip if not available
      }
    }
  }

  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor file access patterns
    this.setupFileAccessMonitoring();
    
    // Monitor memory usage
    this.setupMemoryMonitoring();
    
    // Monitor startup times
    this.setupStartupTimeMonitoring();

    console.log('📊 Performance monitoring active');
  }

  /**
   * Monitor file access patterns for optimization
   */
  setupFileAccessMonitoring() {
    if (!this.loader) return;

    // Override getFile to track access patterns
    const originalGetFile = this.loader.getFile.bind(this.loader);
    this.loader.getFile = async (filePath) => {
      const start = Date.now();
      try {
        const result = await originalGetFile(filePath);
        const accessTime = Date.now() - start;
        this.logFileAccess(filePath, accessTime, true);
        return result;
      } catch (error) {
        const accessTime = Date.now() - start;
        this.logFileAccess(filePath, accessTime, false);
        throw error;
      }
    };
  }

  /**
   * Monitor memory usage
   */
  setupMemoryMonitoring() {
    // Log memory usage periodically
    setInterval(() => {
      const usage = process.memoryUsage();
      this.logPerformance('memory_usage', usage.heapUsed / 1024 / 1024); // MB
    }, 30000); // Every 30 seconds
  }

  /**
   * Monitor startup times
   */
  setupStartupTimeMonitoring() {
    const totalStartup = Date.now() - this.hookStartTime;
    this.logPerformance('total_startup', totalStartup);
  }

  /**
   * Get recent files based on modification time
   */
  async getRecentFiles(hours = 24) {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    const recentFiles = [];

    try {
      const directories = ['.claude', '.one', 'one'];
      
      for (const dir of directories) {
        try {
          const files = await this.getFilesRecursive(dir);
          for (const file of files) {
            try {
              const stats = await fs.stat(file);
              if (stats.mtime.getTime() > cutoff) {
                recentFiles.push(file);
              }
            } catch (error) {
              // Skip files we can't stat
            }
          }
        } catch (error) {
          // Skip directories we can't read
        }
      }
    } catch (error) {
      console.warn('⚠️ Could not analyze recent files');
    }

    return recentFiles;
  }

  /**
   * Get all files in a directory recursively
   */
  async getFilesRecursive(dir) {
    const files = [];
    
    try {
      const items = await fs.readdir(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory() && !item.name.startsWith('.git')) {
          const subFiles = await this.getFilesRecursive(fullPath);
          files.push(...subFiles);
        } else if (item.isFile() && item.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory not accessible
    }
    
    return files;
  }

  /**
   * Performance logging
   */
  logPerformance(metric, value, metadata = {}) {
    const entry = {
      timestamp: Date.now(),
      metric,
      value,
      metadata
    };
    
    this.performanceLog.push(entry);
    
    // Keep only last 1000 entries to prevent memory bloat
    if (this.performanceLog.length > 1000) {
      this.performanceLog = this.performanceLog.slice(-1000);
    }
  }

  /**
   * Log file access for optimization analysis
   */
  logFileAccess(filePath, accessTime, success) {
    this.logPerformance('file_access', accessTime, {
      filePath,
      success,
      fileType: this.getFileType(filePath)
    });
  }

  /**
   * Get file type for categorization
   */
  getFileType(filePath) {
    if (filePath.includes('/.claude/agents/')) return 'agent';
    if (filePath.includes('/.claude/commands/')) return 'command';
    if (filePath.includes('/.one/workflows/')) return 'workflow';
    if (filePath.includes('/one/missions/')) return 'mission';
    if (filePath.includes('/one/stories/')) return 'story';
    return 'other';
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    if (this.performanceLog.length === 0) return {};

    const stats = {};
    const metrics = [...new Set(this.performanceLog.map(entry => entry.metric))];

    for (const metric of metrics) {
      const entries = this.performanceLog.filter(entry => entry.metric === metric);
      const values = entries.map(entry => entry.value);
      
      stats[metric] = {
        count: values.length,
        avg: values.reduce((sum, val) => sum + val, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        latest: entries[entries.length - 1]?.value
      };
    }

    return stats;
  }

  /**
   * Generate optimization report
   */
  generateOptimizationReport() {
    const stats = this.getPerformanceStats();
    const loaderStats = this.loader ? this.loader.getStats() : {};
    
    return {
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.hookStartTime,
      performance: stats,
      loader: loaderStats,
      optimization: {
        enabled: this.enabled,
        lastRun: this.lastOptimization
      }
    };
  }

  /**
   * Hook lifecycle methods
   */
  async onShutdown() {
    console.log('⚡ Startup Optimizer shutting down...');
    
    // Save performance data
    await this.savePerformanceData();
    
    // Clear caches
    if (this.loader) {
      this.loader.clearCache();
    }
  }

  /**
   * Save performance data for analysis
   */
  async savePerformanceData() {
    try {
      const report = this.generateOptimizationReport();
      const reportPath = path.join(__dirname, '../../one/cache/performance-report.json');
      
      await fs.mkdir(path.dirname(reportPath), { recursive: true });
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      
      console.log(`📊 Performance report saved: ${reportPath}`);
    } catch (error) {
      console.warn('⚠️ Could not save performance data:', error.message);
    }
  }
}

// Export for Claude Code integration
export default StartupOptimizer;

// CLI usage for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const optimizer = new StartupOptimizer();
  
  optimizer.onStartup().then(result => {
    if (result.success) {
      console.log('\n📊 Startup Optimization Report:');
      console.log(JSON.stringify(optimizer.generateOptimizationReport(), null, 2));
    } else {
      console.error('❌ Optimization failed:', result.error);
      process.exit(1);
    }
  });
}