/**
 * Example Component: Course List
 *
 * This file demonstrates the migration from Convex-specific hooks
 * to backend-agnostic Effect.ts services.
 *
 * BEFORE: Tightly coupled to Convex
 * AFTER: Works with any backend (Convex, WordPress, Supabase, etc.)
 */

import { useEffect, useState } from 'react';
import { useThingService, type Thing } from '@/hooks/useThingService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

/**
 * BEFORE (Convex-specific):
 *
 * import { useQuery, useMutation } from "convex/react";
 * import { api } from "@/convex/_generated/api";
 *
 * export function CourseList() {
 *   const courses = useQuery(api.queries.things.list, {
 *     type: "course",
 *     status: "published"
 *   });
 *   const createCourse = useMutation(api.mutations.things.create);
 *
 *   if (courses === undefined) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       {courses.map(course => (
 *         <CourseCard key={course._id} course={course} />
 *       ))}
 *     </div>
 *   );
 * }
 */

/**
 * AFTER (Backend-agnostic):
 */
export function CourseList() {
  const [courses, setCourses] = useState<Thing[]>([]);
  const { list, create, loading, error } = useThingService();
  const { toast } = useToast();

  // Load courses on mount
  useEffect(() => {
    list({ type: 'course', status: 'published' }, {
      onSuccess: (data) => {
        setCourses(data);
      },
      onError: (err) => {
        toast({
          title: 'Error loading courses',
          description: String(err),
          variant: 'destructive'
        });
      }
    });
  }, []);

  // Create a new course
  const handleCreateCourse = () => {
    create({
      type: 'course',
      name: 'New Course',
      properties: {
        description: 'A brand new course',
        duration: '4 weeks'
      },
      status: 'draft'
    }, {
      onSuccess: (courseId) => {
        toast({
          title: 'Course created!',
          description: `Course ID: ${courseId}`
        });
        // Refresh list
        list({ type: 'course', status: 'published' }, {
          onSuccess: setCourses
        });
      },
      onError: (err) => {
        toast({
          title: 'Error creating course',
          description: String(err),
          variant: 'destructive'
        });
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-destructive">Error: {String(error)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Courses</h2>
        <Button onClick={handleCreateCourse}>
          Create Course
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map(course => (
          <Card key={course._id}>
            <CardHeader>
              <CardTitle>{course.name}</CardTitle>
              <CardDescription>
                {course.properties.description || 'No description'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Duration: {course.properties.duration || 'Not specified'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center text-muted-foreground p-8">
          No courses found. Create your first course!
        </div>
      )}
    </div>
  );
}

/**
 * KEY DIFFERENCES:
 *
 * 1. IMPORTS:
 *    - BEFORE: import { useQuery, useMutation } from "convex/react"
 *    - AFTER: import { useThingService } from "@/hooks/useThingService"
 *
 * 2. DATA FETCHING:
 *    - BEFORE: const courses = useQuery(api.queries.things.list, args)
 *    - AFTER: useEffect(() => list(args, { onSuccess: setCourses }), [])
 *
 * 3. MUTATIONS:
 *    - BEFORE: const create = useMutation(api.mutations.things.create)
 *    - AFTER: const { create } = useThingService()
 *
 * 4. ERROR HANDLING:
 *    - BEFORE: try/catch around mutation calls
 *    - AFTER: onSuccess/onError callbacks
 *
 * 5. LOADING STATES:
 *    - BEFORE: courses === undefined check
 *    - AFTER: loading boolean from hook
 *
 * BENEFITS:
 *
 * - ✅ Backend-agnostic (works with any provider)
 * - ✅ Explicit error handling
 * - ✅ Type-safe with TypeScript
 * - ✅ Testable (can mock services)
 * - ✅ Consistent patterns across all components
 */
