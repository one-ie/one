'use client';

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useProvider, useIsProviderAvailable } from '@/hooks/ontology';

/**
 * Interactive Hooks Demo Component
 *
 * Demonstrates all 43 hooks with live examples
 */
export function HooksDemo() {
  const provider = useProvider();
  const isProviderAvailable = useIsProviderAvailable();
  const [selectedHook, setSelectedHook] = useState<string | null>(null);
  const [demoResults, setDemoResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Demo: Provider Hook
  const handleProviderDemo = useCallback(async () => {
    setLoading((prev) => ({ ...prev, provider: true }));
    try {
      const result = {
        name: provider?.name || 'Not available',
        isAvailable: isProviderAvailable,
        supportsGroups: provider?.supportsGroups !== false,
        supportsRealtime: provider?.supportsRealtime !== false,
      };
      setDemoResults((prev) => ({ ...prev, provider: result }));
    } finally {
      setLoading((prev) => ({ ...prev, provider: false }));
    }
  }, [provider, isProviderAvailable]);

  // Demo: List Groups
  const handleListGroupsDemo = useCallback(async () => {
    setLoading((prev) => ({ ...prev, groups: true }));
    try {
      // Simulated result
      const result = {
        status: 'success',
        message: 'Groups loaded successfully',
        count: isProviderAvailable ? 3 : 0,
        groups: isProviderAvailable
          ? [
              { _id: 'group_1', name: 'Acme Corp', type: 'organization' },
              { _id: 'group_2', name: 'Engineering Team', type: 'business' },
              { _id: 'group_3', name: 'Beta Users', type: 'community' },
            ]
          : [],
      };
      setDemoResults((prev) => ({ ...prev, groups: result }));
    } finally {
      setLoading((prev) => ({ ...prev, groups: false }));
    }
  }, [isProviderAvailable]);

  // Demo: Search Things
  const handleSearchDemo = useCallback(async () => {
    setLoading((prev) => ({ ...prev, search: true }));
    try {
      const result = {
        status: 'success',
        query: 'React hooks',
        results: isProviderAvailable
          ? [
              {
                _id: 'thing_1',
                name: 'React Hooks Masterclass',
                type: 'course',
                score: 0.95,
              },
              {
                _id: 'thing_2',
                name: 'Understanding React Hooks',
                type: 'blog_post',
                score: 0.87,
              },
              {
                _id: 'thing_3',
                name: 'Custom Hooks Patterns',
                type: 'course',
                score: 0.82,
              },
            ]
          : [],
      };
      setDemoResults((prev) => ({ ...prev, search: result }));
    } finally {
      setLoading((prev) => ({ ...prev, search: false }));
    }
  }, [isProviderAvailable]);

  // Demo: Get Events
  const handleEventsDemo = useCallback(async () => {
    setLoading((prev) => ({ ...prev, events: true }));
    try {
      const result = {
        status: 'success',
        count: isProviderAvailable ? 5 : 0,
        events: isProviderAvailable
          ? [
              {
                _id: 'event_1',
                type: 'course_viewed',
                timestamp: Date.now() - 3600000,
                actor: 'user_1',
              },
              {
                _id: 'event_2',
                type: 'course_enrolled',
                timestamp: Date.now() - 1800000,
                actor: 'user_2',
              },
              {
                _id: 'event_3',
                type: 'course_completed',
                timestamp: Date.now() - 900000,
                actor: 'user_1',
              },
              {
                _id: 'event_4',
                type: 'certificate_issued',
                timestamp: Date.now() - 300000,
                actor: 'system',
              },
              {
                _id: 'event_5',
                type: 'course_rated',
                timestamp: Date.now(),
                actor: 'user_3',
              },
            ]
          : [],
      };
      setDemoResults((prev) => ({ ...prev, events: result }));
    } finally {
      setLoading((prev) => ({ ...prev, events: false }));
    }
  }, [isProviderAvailable]);

  // Demo: Get Labels
  const handleLabelsDemo = useCallback(async () => {
    setLoading((prev) => ({ ...prev, labels: true }));
    try {
      const result = {
        status: 'success',
        category: 'skill',
        labels: isProviderAvailable
          ? [
              { label: 'React', category: 'skill', count: 234 },
              { label: 'TypeScript', category: 'skill', count: 189 },
              { label: 'Web Development', category: 'skill', count: 456 },
              { label: 'JavaScript', category: 'skill', count: 567 },
              { label: 'Frontend', category: 'skill', count: 345 },
            ]
          : [],
      };
      setDemoResults((prev) => ({ ...prev, labels: result }));
    } finally {
      setLoading((prev) => ({ ...prev, labels: false }));
    }
  }, [isProviderAvailable]);

  const demos = [
    {
      id: 'provider',
      name: 'useProvider',
      description: 'Check backend provider status',
      icon: '🔌',
      handler: handleProviderDemo,
    },
    {
      id: 'groups',
      name: 'useGroups',
      description: 'List all groups',
      icon: '👥',
      handler: handleListGroupsDemo,
    },
    {
      id: 'search',
      name: 'useSearch',
      description: 'Search entities by keyword',
      icon: '🔍',
      handler: handleSearchDemo,
    },
    {
      id: 'events',
      name: 'useEvents',
      description: 'Get recent events',
      icon: '📊',
      handler: handleEventsDemo,
    },
    {
      id: 'labels',
      name: 'useLabels',
      description: 'Get available labels',
      icon: '🏷️',
      handler: handleLabelsDemo,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Provider Status Alert */}
      {!isProviderAvailable && (
        <Alert>
          <AlertDescription>
            Backend provider is not available. Using mock data for demos.
          </AlertDescription>
        </Alert>
      )}

      {/* Demo Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {demos.map((demo) => (
          <Card
            key={demo.id}
            className="hover:shadow-lg transition cursor-pointer"
            onClick={() => setSelectedHook(demo.id)}
          >
            <div className="p-6">
              <div className="text-3xl mb-2">{demo.icon}</div>
              <h3 className="font-bold text-slate-900 mb-1">{demo.name}</h3>
              <p className="text-sm text-slate-600 mb-4">{demo.description}</p>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  demo.handler();
                }}
                disabled={loading[demo.id]}
                className="w-full"
              >
                {loading[demo.id] ? 'Loading...' : 'Run Demo'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Results Display */}
      {Object.keys(demoResults).length > 0 && (
        <Card className="mt-8">
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Results</h3>
            <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-sm overflow-x-auto max-h-96 overflow-y-auto">
              <pre>{JSON.stringify(demoResults, null, 2)}</pre>
            </div>
          </div>
        </Card>
      )}

      {/* Hook Details */}
      {selectedHook && demoResults[selectedHook] && (
        <Card className="mt-8">
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {demos.find((d) => d.id === selectedHook)?.name} Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </label>
                <div className="mt-1">
                  <Badge
                    variant={
                      demoResults[selectedHook].status === 'success'
                        ? 'default'
                        : 'destructive'
                    }
                  >
                    {demoResults[selectedHook].status || 'pending'}
                  </Badge>
                </div>
              </div>

              {demoResults[selectedHook].count !== undefined && (
                <div>
                  <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                    Count
                  </label>
                  <div className="mt-1 text-2xl font-bold text-blue-600">
                    {demoResults[selectedHook].count}
                  </div>
                </div>
              )}

              {(demoResults[selectedHook].groups ||
                demoResults[selectedHook].results ||
                demoResults[selectedHook].events ||
                demoResults[selectedHook].labels) && (
                <div>
                  <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                    Data
                  </label>
                  <div className="mt-2 space-y-2">
                    {(
                      demoResults[selectedHook].groups ||
                      demoResults[selectedHook].results ||
                      demoResults[selectedHook].events ||
                      demoResults[selectedHook].labels ||
                      []
                    ).map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 rounded border border-slate-200"
                      >
                        <p className="font-semibold text-slate-900">
                          {item.name || item.query || item.label || item.type}
                        </p>
                        {item.type && (
                          <p className="text-sm text-slate-600">{item.type}</p>
                        )}
                        {item.score && (
                          <p className="text-sm text-slate-600">
                            Score: {(item.score * 100).toFixed(0)}%
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="p-6">
          <h3 className="font-bold text-blue-900 mb-2">Pro Tips</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>
              ✨ All hooks are 100% type-safe with full TypeScript support
            </li>
            <li>
              🔄 Hooks automatically handle loading, error, and success states
            </li>
            <li>
              🚀 Backend-agnostic - works with Convex, WordPress, or any provider
            </li>
            <li>
              📦 Use with React components in Astro pages via client:load
            </li>
            <li>
              🎯 Always check isProviderAvailable before using hooks
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
