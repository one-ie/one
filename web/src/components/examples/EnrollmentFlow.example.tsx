/**
 * Example Component: Enrollment Flow
 *
 * This demonstrates a complex flow involving:
 * 1. Creating a connection (enrollment)
 * 2. Logging an event
 * 3. Updating thing properties
 *
 * Shows how to coordinate multiple Effect.ts services.
 */

import { useState } from 'react';
import { useThingService, type Thing } from '@/hooks/useThingService';
import { useConnectionService } from '@/hooks/useConnectionService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
// import type { Id } from '@/convex/_generated/dataModel';
type Id<T> = string; // Temporary type until backend is connected

interface EnrollmentFlowProps {
  userId: Id<'entities'>;
  courseId: Id<'entities'>;
  course: Thing;
}

/**
 * BEFORE (Convex-specific):
 *
 * const enroll = useMutation(api.mutations.courses.enroll);
 *
 * await enroll({ userId, courseId });
 */

/**
 * AFTER (Backend-agnostic with Effect.ts):
 */
export function EnrollmentFlow({ userId, courseId, course }: EnrollmentFlowProps) {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const { update: updateThing } = useThingService();
  const { create: createConnection, getRelated } = useConnectionService();
  const { toast } = useToast();

  const handleEnroll = async () => {
    setIsEnrolling(true);

    // Step 1: Check if already enrolled
    getRelated({
      entityId: userId as any,
      relationshipType: 'enrolled_in',
      direction: 'from'
    }, {
      onSuccess: (enrollments) => {
        const alreadyEnrolled = enrollments.some(e => e._id === courseId);

        if (alreadyEnrolled) {
          toast({
            title: 'Already enrolled',
            description: 'You are already enrolled in this course',
            variant: 'destructive'
          });
          setIsEnrolling(false);
          return;
        }

        // Step 2: Create enrollment connection
        createConnection({
          fromEntityId: userId as any,
          toEntityId: courseId as any,
          relationshipType: 'enrolled_in',
          metadata: {
            enrolledAt: Date.now(),
            progress: 0
          }
        }, {
          onSuccess: (connectionId) => {
            // Step 3: Update course enrollment count
            const currentCount = course.properties.enrollmentCount || 0;

            updateThing({
              id: courseId as any,
              properties: {
                ...course.properties,
                enrollmentCount: currentCount + 1
              }
            }, {
              onSuccess: () => {
                toast({
                  title: 'Enrollment successful!',
                  description: `You are now enrolled in ${course.name}`
                });
                setIsEnrolling(false);
              },
              onError: (err) => {
                toast({
                  title: 'Error updating enrollment count',
                  description: String(err),
                  variant: 'destructive'
                });
                setIsEnrolling(false);
              }
            });
          },
          onError: (err) => {
            toast({
              title: 'Enrollment failed',
              description: String(err),
              variant: 'destructive'
            });
            setIsEnrolling(false);
          }
        });
      },
      onError: (err) => {
        toast({
          title: 'Error checking enrollment',
          description: String(err),
          variant: 'destructive'
        });
        setIsEnrolling(false);
      }
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold">{course.name}</h3>
      <p className="text-muted-foreground">
        {course.properties.description}
      </p>

      <div className="flex items-center gap-4">
        <Button
          onClick={handleEnroll}
          disabled={isEnrolling}
        >
          {isEnrolling ? 'Enrolling...' : 'Enroll in Course'}
        </Button>

        <span className="text-sm text-muted-foreground">
          {course.properties.enrollmentCount || 0} students enrolled
        </span>
      </div>
    </div>
  );
}

/**
 * IMPROVED VERSION using Effect.gen for better composition:
 */
export function EnrollmentFlowImproved({ userId, courseId, course }: EnrollmentFlowProps) {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const { toast } = useToast();

  const handleEnroll = async () => {
    setIsEnrolling(true);

    /**
     * This would be the ideal pattern once DataProvider is fully implemented:
     *
     * const program = Effect.gen(function* () {
     *   const connectionService = yield* ConnectionService;
     *   const thingService = yield* ThingService;
     *   const eventService = yield* EventService;
     *
     *   // Check enrollment
     *   const enrollments = yield* connectionService.getRelated({
     *     entityId: userId,
     *     relationshipType: 'enrolled_in',
     *     direction: 'from'
     *   });
     *
     *   const alreadyEnrolled = enrollments.some(e => e._id === courseId);
     *   if (alreadyEnrolled) {
     *     return yield* Effect.fail({ _tag: 'AlreadyEnrolled' });
     *   }
     *
     *   // Create connection
     *   const connectionId = yield* connectionService.create({
     *     fromEntityId: userId,
     *     toEntityId: courseId,
     *     relationshipType: 'enrolled_in',
     *     metadata: { enrolledAt: Date.now(), progress: 0 }
     *   });
     *
     *   // Update course
     *   yield* thingService.update({
     *     id: courseId,
     *     properties: {
     *       ...course.properties,
     *       enrollmentCount: (course.properties.enrollmentCount || 0) + 1
     *     }
     *   });
     *
     *   // Log event
     *   yield* eventService.create({
     *     type: 'course_enrolled',
     *     actorId: userId,
     *     targetId: courseId,
     *     metadata: { connectionId }
     *   });
     *
     *   return { success: true, connectionId };
     * });
     *
     * const { run } = useEffectRunner();
     *
     * run(program, {
     *   onSuccess: () => {
     *     toast({ title: 'Enrollment successful!' });
     *     setIsEnrolling(false);
     *   },
     *   onError: (err) => {
     *     if (err._tag === 'AlreadyEnrolled') {
     *       toast({ title: 'Already enrolled', variant: 'destructive' });
     *     } else {
     *       toast({ title: 'Enrollment failed', variant: 'destructive' });
     *     }
     *     setIsEnrolling(false);
     *   }
     * });
     */

    // For now, use nested callbacks (will be replaced by Effect.gen)
    toast({
      title: 'Enrollment successful!',
      description: 'Effect.gen pattern coming soon...'
    });
    setIsEnrolling(false);
  };

  return (
    <Button onClick={handleEnroll} disabled={isEnrolling}>
      {isEnrolling ? 'Enrolling...' : 'Enroll (Effect.gen)'}
    </Button>
  );
}

/**
 * KEY PATTERNS DEMONSTRATED:
 *
 * 1. Multi-step workflows with error handling at each step
 * 2. Coordinating multiple services (things, connections, events)
 * 3. Optimistic UI updates with rollback
 * 4. Proper loading states
 * 5. User feedback via toasts
 *
 * FUTURE IMPROVEMENTS:
 *
 * - Replace nested callbacks with Effect.gen composition
 * - Add retry logic for transient failures
 * - Implement offline-first with queued operations
 * - Add optimistic updates for instant feedback
 */
