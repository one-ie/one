Integrating n8n (a workflow automation tool) into your Convex system can unlock a vast number of integrations and automate complex processes. Here are several options, ranging from simple to more deeply integrated:

  

**Option 1: Convex Triggers n8n Workflows (via Webhook)**

  

* **How it works:**

1. **n8n:** Create an n8n workflow that starts with a "Webhook" trigger node. This node provides a unique URL.

2. **Convex:** In a Convex `action` (e.g., after a specific mutation, or a scheduled task), make an HTTP POST request (`fetch`) to the n8n Webhook URL, sending relevant data in the JSON body.

3. **n8n:** The n8n workflow receives the data and executes its logic (e.g., update a Google Sheet, send a Slack message, call a third-party API).

* **Pros:**

* Relatively simple to set up for one-way communication (Convex -> n8n).

* Leverages n8n's vast library of pre-built nodes for integrations.

* Keeps complex integration logic out of your Convex codebase.

* **Cons:**

* Primarily one-way. Getting data *back* from n8n into Convex in real-time requires n8n to then call a Convex HTTP endpoint (see Option 2).

* Error handling can be distributed (need to check logs in both Convex and n8n).

* **Convex Code Example (Action):**

```typescript

// convex/myActions.ts

"use node";

import { internalAction } from "./_generated/server";

import { v } from "convex/values";

  

export const triggerN8nWorkflow = internalAction({

args: { eventData: v.any(), n8nWebhookUrl: v.string() }, // Pass n8n webhook URL, store it securely if static

handler: async (ctx, { eventData, n8nWebhookUrl }) => {

// const n8nWebhookUrl = process.env.N8N_MY_WORKFLOW_WEBHOOK_URL; // Store in env vars

if (!n8nWebhookUrl) {

console.error("n8n webhook URL not configured.");

return { success: false, error: "n8n webhook URL not configured." };

}

  

try {

const response = await fetch(n8nWebhookUrl, {

method: "POST",

headers: { "Content-Type": "application/json" },

body: JSON.stringify(eventData),

});

  

if (!response.ok) {

const errorBody = await response.text();

console.error(`n8n webhook call failed: ${response.status} ${errorBody}`);

return { success: false, error: `n8n webhook call failed: ${errorBody}` };

}

const responseData = await response.json();

console.log("n8n workflow triggered successfully:", responseData);

return { success: true, data: responseData }; // n8n webhook node usually responds quickly

} catch (error) {

console.error("Error triggering n8n workflow:", error);

return { success: false, error: (error as Error).message };

}

},

});

```

  

**Option 2: n8n Calls Convex HTTP Endpoints**

  

* **How it works:**

1. **Convex:** Define `httpAction` endpoints in `convex/http.ts` that n8n can call. These endpoints can trigger mutations or other actions. Secure these endpoints (e.g., with a secret API key in the header).

2. **n8n:** In an n8n workflow, use the "HTTP Request" node to call your Convex HTTP endpoint, sending data or fetching information.

* **Pros:**

* Allows n8n to write data back to Convex or query data from Convex.

* Enables two-way communication and more complex orchestrations.

* **Cons:**

* Requires exposing Convex HTTP endpoints, which need to be secured.

* Can be slightly more complex to set up authentication/authorization for these endpoints.

* **Convex Code Example (HTTP Endpoint):**

```typescript

// convex/http.ts

// ...

http.route({

path: "/n8nDataReceiver",

method: "POST",

handler: httpAction(async (ctx, request) => {

const apiKey = request.headers.get("X-API-KEY");

if (apiKey !== process.env.N8N_CONVEX_API_KEY) { // Secure your endpoint

return new Response("Unauthorized", { status: 401 });

}

  

try {

const dataFromN8n = await request.json();

console.log("Received data from n8n:", dataFromN8n);

  

// Process the data, e.g., store it in the database

await ctx.runMutation(internal.myMutations.storeN8nData, { data: dataFromN8n });

  

return new Response(JSON.stringify({ success: true, message: "Data received" }), {

status: 200,

headers: { "Content-Type": "application/json" },

});

} catch (error) {

console.error("Error processing data from n8n:", error);

return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {

status: 500,

headers: { "Content-Type": "application/json" },

});

}

}),

});

// ...

```

You'd also need to set `N8N_CONVEX_API_KEY` in your Convex environment variables.

  

**Option 3: Using n8n's "Execute Command" Node (If n8n is Self-Hosted and Can Access Convex CLI)**

  

* **How it works:**

1. If you self-host n8n and the n8n instance has network access to where you can run the Convex CLI (and has credentials configured).

2. **n8n:** Use the "Execute Command" node to run `npx convex run yourModule:yourFunction --args '{...}'`.

* **Pros:**

* Directly execute Convex functions.

* **Cons:**

* Requires self-hosted n8n with specific environment setup.

* Less secure if not carefully managed, as it involves running shell commands.

* Output parsing from CLI can be clunky.

* Generally not recommended for cloud-based n8n or robust production setups.

  

**Option 4: Custom n8n Node for Convex (Advanced)**

  

* **How it works:**

1. Develop a custom n8n node (requires Node.js/TypeScript knowledge for n8n development) that uses the `convex` JavaScript client library.

2. This node could provide a more user-friendly interface within n8n for selecting Convex functions (queries, mutations, actions) and mapping inputs/outputs.

* **Pros:**

* Most seamless and integrated experience within n8n.

* Can leverage full power of the Convex client (optimistic updates, reactivity if applicable in n8n's context, though less common).

* Type safety if you can share types.

* **Cons:**

* Significant development effort to build and maintain the custom n8n node.

* Requires understanding n8n's node development process.

* **Example Snippet (Conceptual, inside a custom n8n node):**

```typescript

// Inside a custom n8n node's execute method

// import { ConvexHttpClient } from "convex/browser"; // Or ConvexReactClient if in a context that supports it

// const convex = new ConvexHttpClient(credentials.convexUrl); // Get URL from node credentials

  

// const result = await convex.mutation(api.myModule.myMutation, args);

// or

// const result = await convex.action(api.myModule.myAction, args);

```

  

**Option 5: Agent-Driven n8n Interaction (via Tools)**

  

* **How it works:**

1. **Convex Agent Tool:** Create a new agent tool in `convex/ai/tools.ts` called, for example, `triggerN8nWorkflowByName`.

2. **Tool Parameters:** The tool would take `workflowNameOrId: string` and `payload: any` as parameters.

3. **Tool Implementation:**

* The tool's `execute` function would look up a pre-configured n8n webhook URL associated with `workflowNameOrId` (e.g., from a new `n8nWorkflowConfigs` table in Convex or environment variables).

* It then makes an HTTP POST request to that n8n webhook with the `payload`.

4. **Agent Prompt:** Instruct your Convex agents that they can use this tool to trigger specific n8n workflows. For example: `"@MyAgent please run the 'customerOnboarding' n8n workflow with this data: {email: 'new@example.com', name: 'Test User'}"`.

5. **n8n:** The n8n workflow receives the data and proceeds. If it needs to send data back, it would call a Convex HTTP endpoint (Option 2).

* **Pros:**

* Leverages your existing agent infrastructure.

* Abstracts the n8n interaction behind a natural language interface for users (via agents).

* Centralizes n8n webhook URLs within Convex, making them easier to manage.

* **Cons:**

* Still relies on webhooks (Convex -> n8n) and potentially Convex HTTP endpoints (n8n -> Convex) for full two-way interaction.

* **Convex Code Example (New Tool in `convex/ai/tools.ts`):**

```typescript

// convex/ai/tools.ts

// ... existing tool definitions ...

  

// Add to toolDefinitions

// webSearch: { /* ... */ },

// triggerN8nWorkflowByName: { // NEW TOOL

// name: "triggerN8nWorkflowByName",

// description: "Triggers a specific pre-configured n8n workflow with the given payload.",

// parameters: z.object({

// workflowIdentifier: z.string().describe("The unique name or ID of the n8n workflow to trigger (e.g., 'customerOnboarding', 'dailyReport')."),

// payload: z.any().describe("The JSON data to send to the n8n workflow."),

// }),

// },

// ...

  

// In createTools function:

// [toolDefinitions.triggerN8nWorkflowByName.name]: tool({

// description: toolDefinitions.triggerN8nWorkflowByName.description,

// parameters: toolDefinitions.triggerN8nWorkflowByName.parameters,

// execute: async ({ workflowIdentifier, payload }) => {

// await sendSystemMessageToConversation(ctx, { /* ... */ }); // Inform about tool use

  

// // Fetch webhook URL based on workflowIdentifier

// // Option 1: From environment variables (e.g., N8N_WEBHOOK_customerOnboarding)

// const webhookUrl = process.env[`N8N_WEBHOOK_${workflowIdentifier.toUpperCase()}`];

  

// // Option 2: From a Convex table (e.g., n8nWorkflowConfigs)

// // const config = await ctx.runQuery(api.n8nConfigs.getByName, { name: workflowIdentifier });

// // const webhookUrl = config?.webhookUrl;

  

// if (!webhookUrl) {

// return { success: false, error: `No n8n webhook URL configured for workflow: ${workflowIdentifier}` };

// }

  

// try {

// const response = await fetch(webhookUrl, {

// method: "POST",

// headers: { "Content-Type": "application/json" },

// body: JSON.stringify(payload),

// });

// if (!response.ok) throw new Error(`n8n call failed: ${response.status}`);

// return { success: true, details: `n8n workflow '${workflowIdentifier}' triggered.` };

// } catch (e) {

// console.error("Error triggering n8n from tool:", e);

// return { success: false, error: (e as Error).message };

// }

// },

// }),

```

You'd need to define `N8N_WEBHOOK_CUSTOMERONBOARDING`, etc., in your Convex env vars, or create and query an `n8nWorkflowConfigs` table.

  

**Choosing the Right Option:**

  

* **For simple, one-way "fire and forget" tasks from Convex to n8n:** **Option 1 (Convex triggers n8n Webhook)** is often sufficient and easy.

* **For n8n to update or fetch data from Convex:** **Option 2 (n8n calls Convex HTTP Endpoints)** is necessary. You'll likely combine this with Option 1 for full loops.

* **For agent-driven automation where n8n handles the "how":** **Option 5 (Agent Tool)** is very powerful as it allows natural language to initiate complex backend processes via n8n. This is probably the most aligned with your "agent-augmented" system.

* **Custom n8n Node (Option 4):** Most powerful but most effort. Consider if you have many complex, recurring Convex interactions from n8n.

  

**Recommendation for your "use all the integrations" goal:**

  

A combination of **Option 5 (Agent Tool for Convex -> n8n)** and **Option 2 (Convex HTTP Endpoints for n8n -> Convex)** will provide the most flexible and powerful two-way integration.

  

1. Agents in Convex can be instructed to trigger n8n workflows for specific tasks (e.g., "Add this lead to Salesforce and send them a welcome email sequence" -> agent uses `triggerN8nWorkflowByName` tool).

2. The n8n workflow performs these actions using its Salesforce and email nodes.

3. If the n8n workflow needs to update the status in Convex (e.g., "Lead added, email sequence started"), it calls a secure Convex HTTP endpoint.

  

This approach keeps your Convex code focused on its core logic while n8n handles the external integration details. Remember to manage security for webhooks and HTTP endpoints (API keys, validating payloads).