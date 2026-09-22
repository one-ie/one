---
name: classroom-session
title: Classroom Session
description: Course delivery via ONE video — checkout triggers room creation, all enrolled students receive join links, session is recorded, and completion is marked after the call.
trigger: checkout:completed
category: education
tags: [video, classroom, course, lifecycle]
---

# Classroom Session Workflow

Delivers a live course session: a checkout (course purchase or enrolment) triggers a classroom room, all students get tracked join links, the session records, and completion is logged to the contact.

## Steps

1. **trigger** — `checkout:completed`
   - Fires when a course purchase completes with `video_enabled: true`
   - Input: `{ checkoutId, workspace, actorId, courseId, scheduledAt }`

2. **tool** — `video:create-room`
   - Creates a classroom room for the session
   - Input: `{ workspace, roomSlug: "class-{courseId}-{timestamp}", name: "{courseName}", type: "classroom" }`
   - Output: `{ room: { hmsRoomId, url } }`

3. **tool** — `video:invite`
   - Generates a tracked join link for the enrolled student
   - Input: `{ workspace, roomSlug, actorId }`
   - Output: `{ goUrl }` — student's tracked join link

4. **tool** — `chat:send` (enrolment confirmation)
   - Sends the join link to the student
   - Input: `{ group: threadId, text: "You're enrolled in {courseName}. [Join the classroom]({goUrl}) at {scheduledAt}." }`

5. **delay** — 15 minutes before `scheduledAt`
   - Suspends until 15 minutes before the session

6. **tool** — `human:notify` (reminder)
   - Sends a session reminder
   - Input: `{ actorId, message: "Your class starts in 15 minutes.", channel: "email", data: { roomUrl: goUrl } }`

7. **human** — session in progress (suspend)
   - Suspends until `session.close.success` from HMS webhook resumes this step

8. **tool** — `video:summary` (automatic via HMS webhook)
   - Transcript + AI summary appended to the room thread automatically

9. **tool** — `entity:tag`
   - Marks the student as having completed the session
   - Input: `{ id: actorId, add: ["lifecycle:engaged", "course:completed:{courseId}"], source: "video" }`

10. **tool** — `world:update-contact`
    - Updates the student's record with completion status
    - Input: `{ workspace, actorId, notes: "Completed classroom session for {courseName}." }`

## Notes

- `type: "classroom"` rooms render with ONE's design system (VideoRoomCustom) once C8 ships; until then, `HMSPrebuilt` renders
- Multiple students: repeat steps 3–4 for each enrolled actorId in a parallel loop
- `entity:tag` with `course:completed:{courseId}` enables tag-based filtering in the CRM Sessions tab
- Recording is started by the host via HostPanel; transcript summary fires automatically when recording completes
