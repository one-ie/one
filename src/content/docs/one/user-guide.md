---
title: Features
description: Learn how to set up and start building with the ONE framework
date: 2024-02-02
tags:
  - agents
order: 1
---
# 2. User Guide

This section guides you through using the Agent Inbox application, from signing in to managing conversations and agents.

2.1. **Accessing Agent Inbox**

To start using Agent Inbox, simply navigate to the application URL in your web browser:
[https://agents.one.ie](https://agents.one.ie)

2.2. **Authentication**

Agent Inbox requires you to sign in to access its features.

*   **Signing In/Up:**
    *   **GitHub:** Click the "Sign in with GitHub" button on the initial screen (`SignInWithGithub.tsx`). You will be redirected to GitHub to authorize the application.
    *   **Email/Password:**
        1.  Click the "Continue with Email" button (`UnauthenticatedContent.tsx`).
        2.  The view will slide to the email/password form (`SignInWithPassword.tsx`).
        3.  Enter your email and password.
        4.  Choose either "Sign in" or "Sign up" based on whether you have an existing account. The form will toggle between these modes.
*   **Signing Out:** Once logged in, you can sign out at any time by clicking the "Sign out" button located within your user profile section at the bottom of the sidebar (`SignOutButton.tsx`).

2.3. **Interface Overview**

The Agent Inbox interface is divided into two main sections:

*   **Sidebar (`Sidebar.tsx`):** Located on the left side.
    *   **Header:** Displays the application logo.
    *   **Tabs:** Allows switching between "Conversations" and "Agents" views.
    *   **List Area:** Dynamically shows either your list of conversations or your list of created agents, depending on the active tab.
    *   **User Profile (`UserProfile.tsx`):** Located at the bottom, displays your avatar, name, email, and contains the "Sign out" button.
*   **Main Area:** Occupies the rest of the screen to the right of the sidebar.
    *   **Welcome Screen:** Displayed when you first log in or when no specific conversation or agent is selected. Prompts you to select or create an item.
    *   **Chat Area (`ChatArea.tsx`):** Displayed when a conversation is selected. Contains the conversation header, message history, and message input field.
    *   **Agent Profile View (`AgentProfile.tsx`):** Displayed when an agent is selected from the "Agents" tab in the sidebar. Shows agent details and allows editing.

2.4. **Managing Conversations**

*   **Creating a New Conversation:** Click the "+ New Conversation" button in the "Conversations" tab of the sidebar (`ConversationList.tsx`). A new conversation titled "New Conversation" will be created and automatically selected.
*   **Selecting a Conversation:** Click on any conversation item in the sidebar list to open its chat view in the main area. The selected conversation will be highlighted (`ConversationItem.tsx`).
*   **Viewing Conversation Header (`ConversationHeader.tsx`):**
    *   **Title:** The current title of the conversation is displayed at the top.
    *   **Settings:** Click the conversation title (or the wrench icon next to it) to open the settings dialog.
        *   **Rename:** Modify the conversation title in the input field and click "Save Changes".
        *   **Delete:** Click the "Delete Conversation" button (Trash icon) and confirm the deletion in the subsequent prompt (`Confirm.tsx`). *Warning: This action is irreversible and deletes all messages within the conversation.*
    *   **Participants:** Avatars of participants are shown on the right side of the header (`ConversationParticipants.tsx`). Clicking these avatars opens the Participants Dialog.
*   **Managing Participants (`ParticipantsDialog.tsx`):**
    *   **Viewing:** See lists of users and agents currently in the conversation. Creators are marked. System agents (like Triage) cannot be removed.
    *   **Adding Agents:** Click the "Add Agent" button (UserPlus icon) to open a dropdown (`AgentSelector.tsx`) listing your available agents (those not already in the conversation). Select an agent to add them.
    *   **Removing Participants:** Hover over a user or a non-system agent and click the Trash icon to remove them from the conversation. A system message will appear in the chat indicating they have left.

2.5. **Managing Agents**

*   **Viewing Agent List:** Select the "Agents" tab in the sidebar to see a list of all agents you have created (`AgentList.tsx`). Each item shows the agent's avatar, name, and description.
*   **Creating a New Agent:** Click the "+ New Agent" button in the "Agents" tab. A new agent based on a random predefined template (`shared/predefinedAgents.ts`) will be created, and you will be navigated to its profile view.
*   **Selecting an Agent:** Click on any agent in the list to view their detailed profile in the main area (`AgentProfile.tsx`).
*   **Editing Agent Details (`AgentProfile.tsx`):**
    *   **Avatar:** Click the Shuffle icon button near the avatar to randomly generate a new avatar (`AgentAvatar.tsx`).
    *   **Name:** Click the Pencil icon next to the name to enter edit mode. Type the new name and press Enter or click the Check icon to save. Press Escape to cancel.
    *   **Description:** In the "About" card, click the Pencil icon or the text itself to edit the description using the text area (`AgentDescription.tsx`, `EditableText.tsx`). Click "Save" to confirm changes or "Cancel" to discard.
    *   **Personality:** Similar to Description, edit the agent's personality in the "Personality" card (`AgentPersonality.tsx`).
    *   **Tools:** In the "Tools" card (`AgentTools.tsx`), click the Pencil icon to enter edit mode.
        *   Click the 'X' icon next to a tool badge to remove it.
        *   Click the "+ Add Tool" button to open a dropdown of available (user-choosable and not already added) tools. Select a tool to add it.
        *   Click the Pencil icon again to exit edit mode.
*   **Deleting an Agent:** On the Agent Profile screen, click the "Delete Agent" button at the bottom and confirm the deletion (`Confirm.tsx`). *Warning: This action is irreversible.*

2.6. **Chatting**

*   **Sending Messages:** Type your message in the input field at the bottom of the Chat Area (`ChatInput.tsx`) and press Enter (without Shift) or click the "Send" button.
*   **Mentioning Agents/Users:**
    *   Type `@` to trigger the suggestions popup (`react-mentions`).
    *   Start typing a name to filter the list of available agents and users in the current conversation.
    *   Select a user or agent from the list using arrow keys and Enter, or by clicking.
    *   The input will auto-complete with the mention syntax (e.g., `@[Agent Name](agent:ID)`).
    *   Messages with mentions are directed towards the mentioned participant(s). Messages without mentions are handled by the Triage agent.
    *   Mentions appear as formatted badges in the chat (`AgentMention.tsx`, `UserMention.tsx`). Agent mentions include their avatar; clicking an agent mention navigates to their profile.
*   **Replying to Agent Messages:** Hover over an agent's message bubble. A Reply icon will appear to the right (`ParticipantMessage.tsx`). Click it to automatically insert a mention of that agent into your chat input field, ready for you to type your reply (`ChatContext.tsx`).
*   **Understanding Message Types:**
    *   **Your Messages:** Appear aligned to the right, typically with a primary color background (`ParticipantMessage.tsx`).
    *   **Agent Messages:** Appear aligned to the left, typically with a muted background, showing the agent's name above the content (`ParticipantMessage.tsx`).
    *   **System Messages:** Appear centered, often with an icon (e.g., Info icon), indicating events like participant joins/leaves, tool usage, or errors (`SystemMessage.tsx`). Some system messages may have expandable details.
*   **Thinking Indicator (`ThinkingIndicator.tsx`):** When an agent is processing a request or generating a response (e.g., after being mentioned or using a tool), an indicator with their avatar and a "thinking" message will appear temporarily at the bottom of the chat.
*   **Markdown Support:** Messages support basic Markdown formatting (like bold, italics, links, lists) which will be rendered appropriately (`ReactMarkdown`, `remark-gfm`). Links automatically open in a new tab.

---