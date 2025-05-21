  

You want Telegram to act as an alternative UI, syncing messages from your existing Convex `conversationMessages` table to relevant Telegram chats, and vice-versa.

  

Here's a conceptual plan and code structure. This will be a significant addition.

  

**Core Concepts:**

  

1. **User Linking:** You need to link a Telegram `chatId` (which is unique per user or group chat with the bot) to a `userId` in your Convex `users` table.

2. **Message Syncing (Convex -> Telegram):**

* When a new message is added to `conversationMessages` in Convex where a linked user is a participant, the bot should send that message to the user's Telegram chat.

* This implies a mechanism to detect new messages (e.g., a Convex scheduled function or reacting to mutations). For simplicity and reactivity, we can trigger this from the message creation logic or an `after` scheduler.

3. **Message Syncing (Telegram -> Convex):**

* When a user sends a message to the bot on Telegram, that message needs to be routed to the correct `conversation` in Convex.

* The bot will need to know which Convex `conversationId` the current Telegram chat is "mapped" to. This could be the user's most recent active conversation, or they could select/create one via bot commands.

4. **Authentication/Authorization:** Ensure that Telegram interactions are securely mapped to the correct Convex user. The initial linking is crucial.

  

**Schema Changes (in `convex/schema.ts`):**

  

You'll likely need a new table to store the mapping between Convex users and their Telegram chat IDs.

  

```typescript

// convex/schema.ts

// ... other imports and tables ...

  

export default defineSchema({

// ... your existing tables (users, conversations, conversationMessages, etc.) ...

// ... authTables ...

  

userTelegramLinks: defineTable({

userId: v.id("users"),

telegramChatId: v.number(), // From Telegram message.chat.id

telegramUserId: v.number(), // From Telegram message.from.id (optional, but good for verification)

telegramUsername: v.optional(v.string()), // From Telegram message.from.username

// activeConversationId: v.optional(v.id("conversations")), // Optional: to remember the last active conv for this chat

createdAt: v.number(),

})

.index("by_userId", ["userId"])

.index("by_telegramChatId", ["telegramChatId"])

.index("by_telegramUserId", ["telegramUserId"]),

  

// (Optional) If you store Telegram messages directly for logging/auditing

telegramRawMessages: defineTable({

telegramUpdateId: v.number(),

payload: v.any(), // The raw JSON payload from Telegram

processed: v.boolean(),

direction: v.union(v.literal("incoming"), v.literal("outgoing")),

convexConversationId: v.optional(v.id("conversations")),

convexMessageId: v.optional(v.id("conversationMessages")),

telegramChatId: v.number(),

timestamp: v.number(),

}).index("by_telegramUpdateId", ["telegramUpdateId"]),

// ...

});

```

  

**Implementation Steps:**

  

**Step 1: User Linking Command (Telegram -> Convex)**

  

Users need a way to link their Telegram account to their Convex account.

  

* **In `convex/telegram.ts` (processMessage action):**

Add command handling, e.g., for `/link <your_convex_auth_token_or_code>`.

This is the trickiest part for security. How do you get a temporary, verifiable token from a logged-in Convex user to the Telegram bot?

* **Option A (Simpler, less secure for public bots):** User types `/link myemail@example.com`. Your bot then tries to find that email in your `users` table. If found, it links. This assumes emails are unique and verified in Convex.

* **Option B (More Secure):**

1. User in your web app goes to a "Link Telegram" page.

2. Web app generates a short-lived, unique code (e.g., via a Convex mutation that stores it with `userId`).

3. User types `/link <unique_code>` in Telegram.

4. Bot sends this code to a Convex action.

5. Convex action verifies the code, finds the associated `userId`, and creates the `userTelegramLinks` record.

  

```typescript

// convex/telegram.ts (inside processMessage handler)

  

// ...

if (receivedText.startsWith("/link ")) {

const linkIdentifier = receivedText.substring(6).trim(); // e.g., email or unique code

if (!linkIdentifier) {

await sendTelegramMessage(chatId, "Please provide your email or a link code. Usage: /link your_email@example.com OR /link ABCDEF");

return;

}

  

try {

// Call an internal action to handle the linking process

const linkResult = await ctx.runAction(internal.telegram.linkUserAccount, {

telegramChatId: chatId,

telegramUserId: message.from?.id,

telegramUsername: message.from?.username,

linkIdentifier: linkIdentifier,

});

await sendTelegramMessage(chatId, linkResult.message);

} catch (error) {

console.error("Error during linking:", error);

await sendTelegramMessage(chatId, "Sorry, I couldn't link your account. Please try again or contact support.");

}

return;

}

// ... existing message processing ...

```

  

* **New action in `convex/telegram.ts`:**

```typescript

// convex/telegram.ts

export const linkUserAccount = internalAction({

args: {

telegramChatId: v.number(),

telegramUserId: v.optional(v.number()), // Telegram user ID

telegramUsername: v.optional(v.string()),

linkIdentifier: v.string(), // This could be an email or a special code

},

handler: async (ctx, args) => {

// Option A: Link by email (ensure emails are unique and verified in your system)

const userByEmail = await ctx.runQuery(api.users.queries.findByEmail, { email: args.linkIdentifier }); // You'll need to create this query

  

if (userByEmail) {

// Check if this telegramChatId or telegramUserId is already linked

const existingLink = await ctx.runQuery(internal.telegram.findUserLinkByTelegramIds, {

telegramChatId: args.telegramChatId,

telegramUserId: args.telegramUserId,

});

if (existingLink && existingLink.userId === userByEmail._id) {

return { success: true, message: "Your Telegram account is already linked to this Convex user." };

}

if (existingLink && existingLink.userId !== userByEmail._id) {

return { success: false, message: "This Telegram account is already linked to a different Convex user." };

}

  

await ctx.runMutation(internal.telegram.createUserLink, {

userId: userByEmail._id,

telegramChatId: args.telegramChatId,

telegramUserId: args.telegramUserId,

telegramUsername: args.telegramUsername,

});

return { success: true, message: `Successfully linked Telegram to Convex user: ${userByEmail.name || userByEmail.email}!` };

}

  

// Option B: Link by unique code (you'd need a table to store these codes temporarily)

// const userByCode = await ctx.runQuery(api.users.queries.findUserByLinkCode, { code: args.linkIdentifier });

// if (userByCode) { ... similar logic ... }

  

return { success: false, message: "Could not find a matching Convex account. Please check your identifier or generate a new link code from the web app." };

},

});

  

export const createUserLink = internalMutation({

args: {

userId: v.id("users"),

telegramChatId: v.number(),

telegramUserId: v.optional(v.number()),

telegramUsername: v.optional(v.string()),

},

handler: async (ctx, args) => {

// Remove any old links for this telegramChatId to prevent duplicates with different users

const oldLinks = await ctx.db.query("userTelegramLinks")

.withIndex("by_telegramChatId", q => q.eq("telegramChatId", args.telegramChatId))

.collect();

for (const link of oldLinks) {

await ctx.db.delete(link._id);

}

// Remove any old links for this userId if you want one TG per Convex user

const oldUserLinks = await ctx.db.query("userTelegramLinks")

.withIndex("by_userId", q => q.eq("userId", args.userId))

.collect();

for (const link of oldUserLinks) {

await ctx.db.delete(link._id);

}

  

return await ctx.db.insert("userTelegramLinks", {

userId: args.userId,

telegramChatId: args.telegramChatId,

telegramUserId: args.telegramUserId!, // Assuming it will be present

telegramUsername: args.telegramUsername,

createdAt: Date.now(),

});

},

});

  

// Query to find user by email (you need to create this in users/queries.ts)

// Example: convex/users/queries.ts

// export const findByEmail = query({

// args: { email: v.string() },

// handler: async (ctx, args) => {

// return await ctx.db.query("users").withIndex("email", q => q.eq("email", args.email)).unique();

// },

// });

  

// Query to find existing link

export const findUserLinkByTelegramIds = internalQuery({

args: {

telegramChatId: v.number(),

telegramUserId: v.optional(v.number())

},

handler: async (ctx, args) => {

if (args.telegramUserId) {

const byUserId = await ctx.db.query("userTelegramLinks")

.withIndex("by_telegramUserId", q => q.eq("telegramUserId", args.telegramUserId))

.first();

if (byUserId) return byUserId;

}

return await ctx.db.query("userTelegramLinks")

.withIndex("by_telegramChatId", q => q.eq("telegramChatId", args.telegramChatId))

.first();

}

});

```

**Note:** You'll need to add an index `by_telegramUserId` to `userTelegramLinks` and a `findByEmail` query to `convex/users/queries.ts`.

  

**Step 2: Syncing Messages from Convex to Telegram**

  

When a message is created in Convex, if any participant is linked to Telegram, send it.

  

* Modify `convex/conversationMessages/model.ts` (or where new messages are finalized):

  

```typescript

// convex/conversationMessages/model.ts

// ... (in your function that creates/saves a new message, e.g., addMessageToConversationFromUserOrAgent)

// After successfully inserting the message:

// const messageId = await ctx.db.insert("conversationMessages", { ... });

  

// Schedule an action to notify Telegram users

await ctx.scheduler.runAfter(0, internal.telegram.notifyTelegramUsersAboutNewMessage, {

messageId: messageId, // The ID of the newly created Convex message

conversationId: args.conversationId,

authorParticipantId: args.authorParticipantId, // The participant who sent this message

});

// ...

```

  

* New action in `convex/telegram.ts`:

  

```typescript

// convex/telegram.ts

export const notifyTelegramUsersAboutNewMessage = internalAction({

args: {

messageId: v.id("conversationMessages"),

conversationId: v.id("conversations"),

authorParticipantId: v.id("conversationParticipants"), // Participant who sent the message

},

handler: async (ctx, args) => {

const message = await ctx.runQuery(api.someModule.getMessageById, { messageId: args.messageId }); // You need a query to get message details

if (!message || message.kind === "system") return; // Don't send system messages or if message not found

  

const conversationParticipants = await ctx.runQuery(api.conversationParticipants.queries.listForMe, { // Or an internal query

conversationId: args.conversationId,

});

  

const authorDetails = await ctx.runQuery(internal.conversationParticipants.internalQueries.getParticipantUserOrAgent, {

participantId: message.authorParticipantId,

});

let authorName = "Unknown User";

if (authorDetails.kind === "user") authorName = authorDetails.user.name ?? "User";

if (authorDetails.kind === "agent") authorName = authorDetails.agent.name;

  
  

for (const participant of conversationParticipants) {

if (participant._id === args.authorParticipantId) continue; // Don't send to the author

  

if (participant.kind === "user" && participant.userId) {

const link = await ctx.runQuery(internal.telegram.findUserLinkByUserId, { userId: participant.userId }); // Query to find link by userId

if (link && link.telegramChatId) {

const conversation = await ctx.runQuery(api.conversations.queries.getConversationById, { conversationId: args.conversationId });

const title = conversation?.title ?? "Conversation";

const textToSend = `📢 New message in "${title}" from ${authorName}:\n\n${message.content}`;

try {

await sendTelegramMessage(link.telegramChatId, textToSend);

} catch (error) {

console.error(`Failed to send message to Telegram user ${participant.userId} (chatId: ${link.telegramChatId}):`, error);

}

}

}

}

},

});

  

// Query to get message by ID (create this in conversationMessages/queries.ts or internalQueries.ts)

// Example:

// export const getMessageById = internalQuery({

// args: { messageId: v.id("conversationMessages") },

// handler: async (ctx, args) => ctx.db.get(args.messageId),

// });

  

// Query to find link by userId

export const findUserLinkByUserId = internalQuery({

args: { userId: v.id("users") },

handler: async (ctx, args) => {

return await ctx.db.query("userTelegramLinks")

.withIndex("by_userId", q => q.eq("userId", args.userId))

.first();

}

});

```

  

**Step 3: Syncing Messages from Telegram to Convex**

  

When a user messages the bot:

  

* **In `convex/telegram.ts` (processMessage action):**

After linking, if the message is not a command:

```typescript

// convex/telegram.ts (inside processMessage handler, after command checks)

  

// Check if user is linked

const userLink = await ctx.runQuery(internal.telegram.findUserLinkByTelegramIds, {

telegramChatId: chatId,

telegramUserId: message.from?.id,

});

  

if (!userLink) {

await sendTelegramMessage(chatId, "Your Telegram account is not linked. Please use the /link command.");

return;

}

  

// Now `userLink.userId` is the Convex userId.

// Determine which Convex conversation to send this message to.

// This is a complex part. For simplicity, let's assume a command to set active conversation or use the latest one.

// For now, let's assume we can get a targetConversationId.

// You'll need logic for this (e.g., /set_active_conversation <id>, or query user's latest).

  

let targetConversationId: string | null = null; // Placeholder

  

// --- Simplified: find user's first conversation or create one ---

const userConversations = await ctx.runQuery(api.conversations.queries.listForUser, {}); // This fetches for the authenticated user IN THE ACTION'S CONTEXT if any.

// This won't work directly as the action isn't authenticated as a specific Convex user.

// We need to query conversations for userLink.userId

const specificUserConversations = await ctx.runQuery(internal.telegram.listConversationsForUserViaLink, { userId: userLink.userId });

  
  

if (specificUserConversations.length > 0) {

targetConversationId = specificUserConversations[0]._id; // Send to their most recent/first conversation

// You might want to allow user to select or create via bot commands like /newchat or /replyto <conversation_title_or_id>

} else {

// Or create a new conversation for them if they have none

const newConvId = await ctx.runAction(internal.telegram.createConversationForTelegramUser, {

userId: userLink.userId,

initialMessage: receivedText,

telegramChatId: chatId, // Pass chatId to potentially name the conversation

});

if (newConvId) {

await sendTelegramMessage(chatId, `Started a new conversation for you in ONE: "${receivedText.substring(0,30)}..."`);

// No need to send the message again to Convex, createConversationForTelegramUser handles it.

return; // Message handled by creation flow

} else {

await sendTelegramMessage(chatId, "Could not start a new conversation for you. Please try again.");

return;

}

}

  

if (!targetConversationId) {

await sendTelegramMessage(chatId, "I couldn't determine which conversation to send your message to. Try linking your account or using a command like /active_conversation <ID>.");

return;

}

// --- End simplified conversation selection ---

  

try {

// Send the message to the Convex conversation

await ctx.runMutation(api.conversationMessages.mutations.sendFromMeViaTelegram, { // You'll need a new mutation

conversationId: targetConversationId as Id<"conversations">,

content: receivedText,

telegramUserIdToMapToConvexUserId: userLink.userId, // Pass the linked Convex userId

});

// Optional: send confirmation back to Telegram

// await sendTelegramMessage(chatId, "Message sent to ONE conversation!");

} catch (error) {

console.error("Error sending Telegram message to Convex:", error);

await sendTelegramMessage(chatId, "Sorry, I couldn't send your message to the ONE conversation.");

}

```

  

* **New Query in `convex/telegram.ts` (or a relevant conversations module):**

```typescript

// convex/telegram.ts

export const listConversationsForUserViaLink = internalQuery({

args: { userId: v.id("users") },

handler: async (ctx, args) => {

// This is a simplified version. In a real app, you'd filter by participant status etc.

const participations = await ctx.db.query("conversationParticipants")

.withIndex("by_userId", q => q.eq("userId", args.userId))

.filter(q => q.eq(q.field("kind"), "user"))

.filter(q => q.eq(q.field("isRemoved"), false))

.collect();

  

if (participations.length === 0) return [];

  

const convIds = participations.map(p => p.conversationId);

const conversations = await Promise.all(convIds.map(id => ctx.db.get(id)));

return conversations.filter(c => c !== null).sort((a,b) => (b!.lastMessageTime ?? b!._creationTime) - (a!.lastMessageTime ?? a!._creationTime)) as Doc<"conversations">[];

}

});

  

export const createConversationForTelegramUser = internalAction({

args: { userId: v.id("users"), initialMessage: v.string(), telegramChatId: v.number() },

handler: async (ctx, args) => {

// This action needs to impersonate or act on behalf of the user

// This is complex. A simpler way is a mutation that takes userId.

const conversationId = await ctx.runMutation(internal.telegram.internalCreateConversation, {

actingUserId: args.userId,

title: `Telegram Chat (${args.telegramChatId}) - ${args.initialMessage.substring(0,20)}...`

});

  

// Now send the initial message to this new conversation

await ctx.runMutation(api.conversationMessages.mutations.sendFromMeViaTelegram, { // Or a dedicated internal mutation

conversationId,

content: args.initialMessage,

telegramUserIdToMapToConvexUserId: args.userId,

});

return conversationId;

}

});

  

export const internalCreateConversation = internalMutation({

args: { actingUserId: v.id("users"), title: v.string()},

handler: async (ctx, args) => {

// This mutation creates a conversation and adds the actingUserId as a participant

const conversationId = await ctx.db.insert("conversations", {

title: args.title,

createdBy: args.actingUserId,

createdAt: Date.now(),

lastMessageTime: Date.now(),

});

await ctx.db.insert("conversationParticipants", {

conversationId,

userId: args.actingUserId,

kind: "user",

status: "inactive", // Or "active" if they just sent a message

isRemoved: false,

addedAt: Date.now(),

});

return conversationId;

}

});

```

  

* **New Mutation in `convex/conversationMessages/mutations.ts` (or similar):**

```typescript

// convex/conversationMessages/mutations.ts

// ...

export const sendFromMeViaTelegram = mutation({

args: {

conversationId: v.id("conversations"),

content: v.string(),

telegramUserIdToMapToConvexUserId: v.id("users"), // The Convex User ID linked to the Telegram sender

},

handler: async (ctx, args) => {

// Find the participant record for this Convex User in this Conversation

const participant = await ctx.db.query("conversationParticipants")

.withIndex("by_conversationId_kind_userId", q => // You'll need this index

q.eq("conversationId", args.conversationId)

.eq("kind", "user")

.eq("userId", args.telegramUserIdToMapToConvexUserId)

)

.filter(q => q.eq(q.field("isRemoved"), false))

.first();

  

if (!participant) {

// This shouldn't happen if conversation selection logic is correct,

// but as a fallback, add them.

const newParticipantId = await ctx.db.insert("conversationParticipants", {

conversationId: args.conversationId,

userId: args.telegramUserIdToMapToConvexUserId,

kind: "user",

status: "active", // Or "inactive"

isRemoved: false,

addedAt: Date.now(),

});

// Now use newParticipantId for authorParticipantId

return Messages.addMessageToConversationFromUserOrAgent(ctx, { // Assuming this is your core message adding function

conversationId: args.conversationId,

content: args.content,

authorParticipantId: newParticipantId,

});

}

  

return Messages.addMessageToConversationFromUserOrAgent(ctx, { // Assuming this is your core message adding function

conversationId: args.conversationId,

content: args.content,

authorParticipantId: participant._id,

});

},

});

```

You will need the `by_conversationId_kind_userId` index on `conversationParticipants`.

  

**Step 4: Bot Commands (Optional but Recommended)**

  

Implement commands in `convex/telegram.ts` for users to manage their experience:

* `/help`: Show available commands.

* `/link <email_or_code>`: Link account.

* `/unlink`: Unlink account.

* `/active_conversation <id_or_search_term>`: Set the default Convex conversation for this Telegram chat.

* `/my_conversations`: List recent Convex conversations.

* `/new_conversation <title>`: Create a new ONE conversation from Telegram.

  

**Security & UX Considerations:**

  

* **Rate Limiting:** Implement rate limiting for Telegram API calls and incoming webhooks.

* **Error Handling:** Robust error handling on both sides.

* **User Experience:** Clear instructions for linking, selecting conversations, etc.

* **Message Formatting:** Telegram supports Markdown/HTML. You might want to convert message content between formats if your Convex messages use a different style (e.g., your ReactMarkdown).

* **Duplicate Messages:** Be careful to avoid echoing messages back to the original sender if they are also on Telegram. The `authorParticipantId` check in `notifyTelegramUsersAboutNewMessage` helps.

* **Group Chats:** This plan focuses on 1-on-1 bot chats. Supporting Telegram group chats mapping to Convex conversations adds another layer of complexity (linking group chat IDs, handling multiple users from one Telegram group).

* **Authentication for `listConversationsForUserViaLink`:** This internal query is fine as is, but if it were public, it would need auth to ensure only the correct user's data is fetched. Internal queries/actions run with admin privileges.

  

This is a substantial feature. Start with user linking and one-way sync (e.g., Convex to Telegram for notifications) and then build out the other direction. Test thoroughly!

  
  
  

Integrating multiple messaging channels (Telegram, WhatsApp, Facebook Messenger, SMS, etc.) into a unified backend like Convex, where they all act as alternative UIs to your core `conversationMessages` system, is a powerful but complex undertaking.

  

The core principles remain similar to the Telegram integration, but you'll need a more abstracted and scalable approach.

  

**Key Architectural Considerations for Multi-Channel Integration:**

  

1. **Channel Abstraction Layer:**

* You'll need a way to interact with each channel's API without littering your core business logic with channel-specific code.

* Create a set of "channel adapter" actions or modules. Each adapter would know how to:

* Send a message to that channel.

* Receive and parse incoming messages/webhooks from that channel.

* Handle channel-specific authentication or user identification.

  

2. **Unified User Identity & Linking:**

* Your `users` table in Convex is the central source of truth for user identity.

* You'll need a more generic "channel links" table instead of just `userTelegramLinks`.

```typescript

// convex/schema.ts

channelLinks: defineTable({

userId: v.id("users"), // Convex User ID

channelType: v.union( // e.g., "telegram", "whatsapp", "messenger", "sms"

v.literal("telegram"),

v.literal("whatsapp"),

v.literal("messenger"),

v.literal("sms")

// ... add more as needed

),

channelUserId: v.string(), // User's ID on that specific channel (e.g., Telegram chat_id, WhatsApp phone number, Messenger PSID)

channelUsername: v.optional(v.string()), // Optional: username on that channel

// metadata: v.optional(v.any()), // Store channel-specific info if needed (e.g., WhatsApp message template consent)

createdAt: v.number(),

})

.index("by_userId_and_channelType", ["userId", "channelType"]) // For finding all channels a user is linked to

.index("by_channelType_and_channelUserId", ["channelType", "channelUserId"]), // For finding Convex user from incoming channel message

```

  

3. **Webhook Handling:**

* You'll need a separate HTTP endpoint (or a single endpoint with routing logic) for each channel, as their webhook payload structures and verification methods will differ.

* `convex/http.ts` would manage these routes. Each route would call a channel-specific processing action.

  

4. **Message Normalization:**

* Incoming messages from different channels will have different formats (text, attachments, buttons, etc.). You'll need to normalize these into a common internal format before creating a `conversationMessages` record in Convex.

* Similarly, when sending messages from Convex to a channel, you might need to adapt your rich message format (if any) to what that channel supports (e.g., plain text for SMS, Markdown for Telegram, structured messages for Messenger).

  

5. **Outbound Message Routing:**

* When a new message appears in a Convex `conversationMessages` that needs to be synced, your system must:

1. Identify all participants in that Convex conversation.

2. For each participant, check their `channelLinks` to see which external channels they are linked to.

3. Use the appropriate "channel adapter" to send the message to each linked external channel.

  

4. **Conversation Mapping & Context:**

* How does an incoming message from WhatsApp know which Convex `conversationId` it belongs to?

* **Implicit (Recent):** Default to the user's most recent active Convex conversation. Risky if users have many.

* **Explicit (Session/Thread ID):** Some channels might support passing metadata or a thread ID that you can map back.

* **User Commands:** Users might need to use commands like `/reply_to_convex_thread <ID>` or `/start_new_convex_chat`.

* **Contextual Cues:** If the incoming message is a reply to a message *sent by your bot*, you might have embedded some context.

* This is often the most challenging part of a multi-channel system.

  

7. **Authentication & Security:**

* The linking process for each channel needs to be secure. For channels like WhatsApp (via Twilio, Vonage, etc.) or SMS, the phone number itself is often the primary identifier.

* Messenger uses Page-Scoped User IDs (PSIDs).

  

**Detailed Steps & Code Structure (High-Level):**

  

**1. Environment Variables:**

Store API keys/tokens/secrets for each channel in Convex environment variables (e.g., `WHATSAPP_API_KEY`, `MESSENGER_PAGE_ACCESS_TOKEN`).

  

**2. Channel Adapters (e.g., `convex/channels/whatsappAdapter.ts`, `convex/channels/messengerAdapter.ts`):**

  

* `sendMessageToWhatsapp(recipientPhoneNumber: string, messageContent: string, convexMessageId?: Id<"conversationMessages">)`

* `sendMessageToMessenger(psid: string, messageContent: object | string, convexMessageId?: Id<"conversationMessages">)`

* These would use `fetch` or official SDKs for each platform.

  

**3. HTTP Endpoints (`convex/http.ts`):**

  

```typescript

// convex/http.ts

// ...

http.route({

path: "/whatsappWebhook",

method: "POST",

handler: httpAction(async (ctx, request) => {

const payload = await request.json(); // Or parse based on WhatsApp's format

// Verify WhatsApp signature/token

await ctx.runAction(internal.channels.whatsappAdapter.processIncomingMessage, { payload });

return new Response("OK");

}),

});

  

http.route({

path: "/messengerWebhook",

method: "POST", // Usually GET for verification, POST for messages

handler: httpAction(async (ctx, request) => {

// Messenger webhook verification (GET request with hub.challenge)

if (request.method === "GET") {

const queryParams = new URL(request.url).searchParams;

const mode = queryParams.get("hub.mode");

const token = queryParams.get("hub.verify_token");

const challenge = queryParams.get("hub.challenge");

if (mode === "subscribe" && token === process.env.MESSENGER_VERIFY_TOKEN) {

return new Response(challenge, { status: 200 });

}

return new Response("Failed validation", { status: 403 });

}

// Actual message (POST request)

const payload = await request.json();

await ctx.runAction(internal.channels.messengerAdapter.processIncomingMessage, { payload });

return new Response("EVENT_RECEIVED");

}),

});

// ...

```

  

**4. Channel-Specific Processing Actions (e.g., in `convex/channels/whatsappAdapter.ts`):**

  

```typescript

// convex/channels/whatsappAdapter.ts

"use node";

import { internalAction } from "../_generated/server";

import { v } from "convex/values";

import { api, internal }_generated/api";

  

export const processIncomingMessage = internalAction({

args: { payload: v.any() },

handler: async (ctx, { payload }) => {

// 1. Extract relevant info: senderPhoneNumber, messageText, mediaUrls, etc.

const senderPhoneNumber = payload.messages?.[0]?.from; // Example structure

const messageText = payload.messages?.[0]?.text?.body; // Example

  

if (!senderPhoneNumber || !messageText) return;

  

// 2. Find linked Convex user

const channelLink = await ctx.runQuery(internal.users.findChannelLink, {

channelType: "whatsapp",

channelUserId: senderPhoneNumber,

});

  

if (!channelLink) {

// Handle unlinked user: maybe send a "please link your account" message

// await sendMessageToWhatsapp(senderPhoneNumber, "Please link your ONE account first: https://yourapp.com/link");

return;

}

const convexUserId = channelLink.userId;

  

// 3. Determine target Convex conversationId (complex part - see "Conversation Mapping")

// For now, let's assume we get it from a helper or user's active setting

const targetConversationId = await ctx.runQuery(internal.conversations.getActiveConversationForUser, { userId: convexUserId });

  

if (!targetConversationId) {

// Create new conversation or prompt user

const newConvId = await ctx.runAction(internal.channels.shared.createConversationForChannelUser, {

userId: convexUserId,

initialMessage: messageText,

channelType: "whatsapp",

channelUserId: senderPhoneNumber

});

// ... (logic to send initial message to this new conv)

return;

}

  

// 4. Create message in Convex conversationMessages

await ctx.runMutation(api.conversationMessages.mutations.sendFromExternalChannel, {

conversationId: targetConversationId,

content: messageText,

authorConvexUserId: convexUserId,

channelInfo: { type: "whatsapp", id: senderPhoneNumber },

});

},

});

// ... (sendMessageToWhatsapp function) ...

```

You'd have similar `processIncomingMessage` for Messenger, parsing its specific payload.

  

**5. Generic User/Channel Linking Logic (e.g., `convex/users.ts` or `convex/channels/shared.ts`):**

  

```typescript

// convex/users.ts (or a new convex/channels/shared.ts)

// ...

export const findChannelLink = internalQuery({

args: {

channelType: v.string(), // "telegram", "whatsapp", etc.

channelUserId: v.string(),

},

handler: async (ctx, args) => {

return await ctx.db

.query("channelLinks")

.withIndex("by_channelType_and_channelUserId", (q) =>

q.eq("channelType", args.channelType).eq("channelUserId", args.channelUserId)

)

.first();

},

});

  

export const createOrUpdateChannelLink = internalMutation({

args: {

userId: v.id("users"),

channelType: v.string(),

channelUserId: v.string(),

channelUsername: v.optional(v.string()),

},

handler: async (ctx, args) => {

const existing = await ctx.db.query("channelLinks")

.withIndex("by_channelType_and_channelUserId", q =>

q.eq("channelType", args.channelType).eq("channelUserId", args.channelUserId)

).first();

  

if (existing) {

if (existing.userId === args.userId) return existing._id; // Already linked correctly

// If linked to a different user, you might want to deny or handle carefully

throw new Error(`This ${args.channelType} account is already linked to a different ONE user.`);

}

// Remove old links for this Convex user on this channel type to enforce 1-to-1 if desired

const oldUserLinks = await ctx.db.query("channelLinks")

.withIndex("by_userId_and_channelType", q => q.eq("userId", args.userId).eq("channelType", args.channelType))

.collect();

for(const link of oldUserLinks) {

await ctx.db.delete(link._id);

}

  

return await ctx.db.insert("channelLinks", {

userId: args.userId,

channelType: args.channelType,

channelUserId: args.channelUserId,

channelUsername: args.channelUsername,

createdAt: Date.now(),

});

},

});

```

  

**6. Outbound Syncing (Convex -> Channels):**

  

Modify your `notifyTelegramUsersAboutNewMessage` to be more generic:

`notifyChannelUsersAboutNewMessage`

  

```typescript

// convex/channels/shared.ts (or your telegram.ts refactored)

"use node";

import { internalAction, internalQuery } from "../_generated/server";

import { v } from "convex/values";

import { api, internal } from "../_generated/api";

import { Id } from "../_generated/dataModel";

// Import your channel adapter functions

// import { sendMessageToTelegram } from "./telegramAdapter";

// import { sendMessageToWhatsapp } from "./whatsappAdapter";

// import { sendMessageToMessenger } from "./messengerAdapter";

  

// Placeholder for actual send functions

async function sendMessageToTelegram(chatId: number, text: string) { /* ... */ }

async function sendMessageToWhatsapp(phone: string, text: string) { /* ... */ }

async function sendMessageToMessenger(psid: string, text: string) { /* ... */ }

  
  

export const notifyChannelUsersAboutNewMessage = internalAction({

args: {

messageId: v.id("conversationMessages"),

conversationId: v.id("conversations"),

authorConvexUserId: v.id("users"), // The Convex User ID of the original sender

},

handler: async (ctx, args) => {

const message = await ctx.runQuery(api.conversationMessages.queries.getById, { id: args.messageId }); // Assume this query exists

if (!message) return;

  

const author = await ctx.runQuery(api.users.queries.getUserById, { userId: args.authorConvexUserId });

const authorName = author?.name ?? "A user";

  

const participants = await ctx.runQuery(api.conversationParticipants.queries.getActiveUsersInConversation, { // Query to get user participants

conversationId: args.conversationId

});

  

for (const participant of participants) {

if (participant.userId === args.authorConvexUserId) continue; // Don't send back to author

  

const channelLinks = await ctx.runQuery(internal.users.getChannelLinksForUser, { userId: participant.userId }); // Query to get all links for a user

  

for (const link of channelLinks) {

const textToSend = `New message in ONE from ${authorName}: ${message.content}`;

try {

switch (link.channelType) {

case "telegram":

await sendMessageToTelegram(parseInt(link.channelUserId), textToSend); // Ensure channelUserId is number for TG

break;

case "whatsapp":

await sendMessageToWhatsapp(link.channelUserId, textToSend);

break;

case "messenger":

await sendMessageToMessenger(link.channelUserId, textToSend);

break;

// Add cases for other channels

}

} catch (error) {

console.error(`Failed to send to ${link.channelType} user ${link.userId} (channelId: ${link.channelUserId}):`, error);

}

}

}

},

});

  

// You'll need these queries:

// convex/conversationMessages/queries.ts

// export const getById = query({ args: { id: v.id("conversationMessages") }, handler: async (ctx, args) => ctx.db.get(args.id) });

  

// convex/conversationParticipants/queries.ts

// export const getActiveUsersInConversation = query({ ... }) - fetches user participants for a conversation

  

// convex/users.ts or convex/channels/shared.ts

// export const getChannelLinksForUser = internalQuery({

// args: { userId: v.id("users") },

// handler: async (ctx, args) => {

// return await ctx.db.query("channelLinks").withIndex("by_userId_and_channelType", q => q.eq("userId", args.userId)).collect();

// }

// });

```

Your `addMessageToConversationFromUserOrAgent` in `convex/conversationMessages/model.ts` would then call this new `notifyChannelUsersAboutNewMessage` action, passing the `authorConvexUserId`.

  

**7. New Mutation for Incoming Channel Messages:**

In `convex/conversationMessages/mutations.ts`:

```typescript

export const sendFromExternalChannel = mutation({

args: {

conversationId: v.id("conversations"),

content: v.string(),

authorConvexUserId: v.id("users"), // Convex User ID linked to the channel sender

channelInfo: v.object({ type: v.string(), id: v.string() }), // e.g. { type: "whatsapp", id: "phoneNumber" }

},

handler: async (ctx, args) => {

const participant = await ctx.db.query("conversationParticipants")

.withIndex("by_conversationId_kind_userId", q =>

q.eq("conversationId", args.conversationId)

.eq("kind", "user")

.eq("userId", args.authorConvexUserId)

)

.filter(q => q.eq(q.field("isRemoved"), false))

.first();

  

if (!participant) {

// This would be unusual if targetConversationId logic is robust

// Or if it's a new conversation just created for them

const newParticipantId = await ctx.db.insert("conversationParticipants", {

conversationId: args.conversationId,

userId: args.authorConvexUserId,

kind: "user", status: "active", isRemoved: false, addedAt: Date.now(),

});

// Use your core message adding function

return await addMessageToConversationFromUserOrAgent(ctx, { // This is your existing function

conversationId: args.conversationId,

content: args.content, // Potentially add "(via ${args.channelInfo.type})" to content

authorParticipantId: newParticipantId,

});

}

// Use your core message adding function

return await addMessageToConversationFromUserOrAgent(ctx, { // This is your existing function

conversationId: args.conversationId,

content: args.content, // Potentially add "(via ${args.channelInfo.type})" to content

authorParticipantId: participant._id,

});

},

});

```

  

**Challenges & Considerations:**

  

* **API Costs & Rate Limits:** Each channel has its own API pricing and rate limits.

* **Message Features:** Supporting rich messages (buttons, carousels, media) consistently across channels is hard. You might default to text or implement per-channel formatting.

* **Session Management for Bots:** Some channels (like Messenger) have short-lived sessions or require specific user actions to re-engage.

* **Initial User Linking:** This is often the biggest UX hurdle. Make it as smooth as possible. QR codes, deep links, or simple commands are common.

* **Error Handling & Retries:** Network issues or API errors are common.

* **Testing:** You'll need accounts and test setups for each channel.