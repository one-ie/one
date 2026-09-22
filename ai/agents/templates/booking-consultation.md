---
name: booking-consultation
title: Booking Consultation
description: Sales or service consultation booked via ONE — host + guest join links generated, call recorded, transcript summarised, contact advanced in lifecycle.
trigger: booking:confirmed
category: sales
tags: [video, booking, lifecycle, crm]
---

# Booking Consultation Workflow

A full sales or service consultation flow: booking confirmation triggers room creation, the contact receives a tracked join link, the call is recorded, and the lifecycle stage advances after the session.

## Steps

1. **trigger** — `booking:confirmed`
   - Fires when a booking is created with `video_enabled: true`
   - Input: `{ bookingId, workspace, actorId, scheduledAt }`

2. **tool** — `video:create-session`
   - Creates a meeting room tied to the booking
   - Input: `{ workspace, roomSlug: "booking-{bookingId}", name: "Consultation", type: "meeting", guestActorId: actorId, scheduledAt }`
   - Output: `{ hostJoinUrl, guestJoinUrl, room }`

3. **tool** — `chat:send` (to contact)
   - Sends the tracked guest join link to the contact
   - Input: `{ group: threadId, text: "Your consultation is booked. [Join the call]({guestJoinUrl}) at your scheduled time." }`

4. **delay** — 15 minutes before `scheduledAt`
   - Suspends the run until 15 minutes before the call

5. **tool** — `human:notify` (reminder)
   - Sends a reminder to both host and guest
   - Input: `{ actorId, message: "Your video consultation starts in 15 minutes.", channel: "email" }`

6. **human** — call in progress (suspend)
   - Suspends until the call ends (HMS webhook fires `session.close.success` → `video:session-ended` signal resumes this step)

7. **tool** — `video:summary` (automatic via HMS webhook)
   - Transcript summarised into the room thread — this fires automatically from the webhook; no explicit step needed

8. **tool** — `entity:tag`
   - Advances contact lifecycle after a completed session
   - Input: `{ id: actorId, add: ["lifecycle:sql"], source: "video" }`

9. **tool** — `world:update-contact`
   - Writes last_contacted timestamp and session note to the contact record
   - Input: `{ workspace, actorId, notes: "Video consultation completed." }`

## Notes

- `video:create-session` creates host + guest tracked go-links (analytics from first click)
- HMS webhook fires `recording.success` → `video:summary` automatically when recording completes
- Lifecycle advance from mql → sql requires a completed session (step 8); partial sessions advance to mql only (wired in the HMS webhook handler)
- No-show guard: if `human` step times out without `session.close.success`, send a follow-up via `chat:send`
