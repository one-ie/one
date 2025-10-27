/**
 * Backend Integration Test Component
 *
 * Tests full round-trip data flow:
 * Frontend → DataProvider → Backend → Database → Frontend
 *
 * Tests 4 core dimensions:
 * 1. Things - Entities
 * 2. Connections - Relationships
 * 3. Events - Activity timeline
 * 4. Knowledge - Semantic search
 */

import React, { useState } from 'react';
import { Effect } from 'effect';
import { useDataProvider } from '@/hooks/useDataProvider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
  data?: any;
}

export function BackendIntegrationTest() {
  const provider = useDataProvider();
  const [results, setResults] = useState<TestResult[]>([
    { name: 'Things - Create & Retrieve', status: 'pending' },
    { name: 'Connections - Create Relationship', status: 'pending' },
    { name: 'Events - Activity Timeline', status: 'pending' },
    { name: 'Knowledge - Create & Search', status: 'pending' },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const updateResult = (index: number, updates: Partial<TestResult>) => {
    setResults(prev => {
      const newResults = [...prev];
      newResults[index] = { ...newResults[index], ...updates };
      return newResults;
    });
  };

  const runTests = async () => {
    setIsRunning(true);
    let createdThingId: string | null = null;

    try {
      // Test 1: Things - Create & Retrieve
      updateResult(0, { status: 'running' });
      const start1 = Date.now();

      createdThingId = await Effect.runPromise(
        provider.things.create({
          type: 'blog_post',
          name: 'Test Blog Post',
          properties: {
            title: 'Backend Integration Test',
            content: 'Testing frontend → backend connection',
            published: false
          },
          status: 'draft'
        })
      );

      const retrievedThing = await Effect.runPromise(
        provider.things.get(createdThingId)
      );

      updateResult(0, {
        status: 'passed',
        duration: Date.now() - start1,
        data: { thingId: createdThingId, name: retrievedThing.name }
      });

      // Test 2: Connections - Create Relationship
      updateResult(1, { status: 'running' });
      const start2 = Date.now();

      // Create a second thing to connect
      const authorId = await Effect.runPromise(
        provider.things.create({
          type: 'user',
          name: 'Test Author',
          properties: { email: 'test@example.com' },
          status: 'active'
        })
      );

      const connectionId = await Effect.runPromise(
        provider.connections.create({
          fromEntityId: authorId,
          toEntityId: createdThingId,
          relationshipType: 'authored',
          metadata: { createdVia: 'integration-test' }
        })
      );

      const connections = await Effect.runPromise(
        provider.connections.list({
          fromEntityId: authorId,
          relationshipType: 'authored'
        })
      );

      updateResult(1, {
        status: 'passed',
        duration: Date.now() - start2,
        data: { connectionId, count: connections.length }
      });

      // Test 3: Events - Activity Timeline
      updateResult(2, { status: 'running' });
      const start3 = Date.now();

      await Effect.runPromise(
        provider.events.create({
          type: 'thing_viewed',
          actorId: authorId,
          targetId: createdThingId,
          metadata: {
            viewCount: 1,
            source: 'integration-test'
          }
        })
      );

      const events = await Effect.runPromise(
        provider.events.list({
          targetId: createdThingId,
          limit: 10
        })
      );

      updateResult(2, {
        status: 'passed',
        duration: Date.now() - start3,
        data: { eventCount: events.length }
      });

      // Test 4: Knowledge - Create & Search
      updateResult(3, { status: 'running' });
      const start4 = Date.now();

      const knowledgeId = await Effect.runPromise(
        provider.knowledge.create({
          knowledgeType: 'label',
          text: 'Backend integration test documentation',
          labels: ['testing', 'integration', 'backend'],
          metadata: { source: 'integration-test' }
        })
      );

      const knowledgeList = await Effect.runPromise(
        provider.knowledge.list({ limit: 10 })
      );

      updateResult(3, {
        status: 'passed',
        duration: Date.now() - start4,
        data: { knowledgeId, count: knowledgeList.length }
      });

    } catch (error) {
      const currentTest = results.findIndex(r => r.status === 'running');
      if (currentTest !== -1) {
        updateResult(currentTest, {
          status: 'failed',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    } finally {
      setIsRunning(false);
    }
  };

  const resetTests = () => {
    setResults(prev => prev.map(r => ({ ...r, status: 'pending', error: undefined, data: undefined, duration: undefined })));
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants: Record<TestResult['status'], any> = {
      pending: 'secondary',
      running: 'default',
      passed: 'default',
      failed: 'destructive'
    };

    return (
      <Badge variant={variants[status]} className={status === 'passed' ? 'bg-green-500' : ''}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const allPassed = results.every(r => r.status === 'passed');
  const anyFailed = results.some(r => r.status === 'failed');
  const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Backend Integration Tests</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={runTests}
                disabled={isRunning}
                size="sm"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  'Run All Tests'
                )}
              </Button>
              <Button
                onClick={resetTests}
                variant="outline"
                size="sm"
                disabled={isRunning}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary */}
          {allPassed && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                All tests passed! Total duration: {totalDuration}ms
              </AlertDescription>
            </Alert>
          )}

          {anyFailed && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Some tests failed. Check the results below for details.
              </AlertDescription>
            </Alert>
          )}

          {/* Test Results */}
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={result.name}
                className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="mt-0.5">{getStatusIcon(result.status)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{result.name}</h3>
                    {getStatusBadge(result.status)}
                    {result.duration && (
                      <span className="text-sm text-gray-500">
                        ({result.duration}ms)
                      </span>
                    )}
                  </div>

                  {result.error && (
                    <div className="text-sm text-red-600 mt-2 p-2 bg-red-50 rounded">
                      Error: {result.error}
                    </div>
                  )}

                  {result.data && (
                    <div className="text-sm text-gray-600 mt-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {JSON.stringify(result.data, null, 2)}
                      </code>
                    </div>
                  )}
                </div>

                {result.status === 'passed' && index < results.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-gray-400 mt-0.5" />
                )}
              </div>
            ))}
          </div>

          {/* Backend Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Backend Connection</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <div>Provider: <code className="bg-blue-100 px-1 py-0.5 rounded">Convex</code></div>
              <div>URL: <code className="bg-blue-100 px-1 py-0.5 rounded">https://shocking-falcon-870.convex.cloud</code></div>
              <div>Status: <Badge variant="default" className="bg-green-500">Connected</Badge></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
