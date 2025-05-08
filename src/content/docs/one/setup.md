---
title: Features
description: Learn how to set up and start building with the ONE framework
date: 2024-02-02
tags:
  - agents
order: 1
---
# Setup

This guide provides detailed information for developers looking to understand, modify, or contribute to the Agent Inbox codebase. It covers setting up the development environment, project structure, key technologies, and development workflows.

3.1. **Prerequisites**

Before setting up the project, ensure you have the following installed:

*   **Node.js:** Required for the JavaScript runtime environment. (Check `node -v`). It's recommended to use a recent LTS version.
*   **Bun:** The project uses Bun as the package manager and script runner, as indicated in `package.json`. Install it from [https://bun.sh/](https://bun.sh/). (Check `bun -v`). You *might* be able to use `npm` or `yarn`, but scripts and lock files are configured for Bun.
*   **Convex Account:** Agent Inbox relies heavily on Convex for its backend, database, and real-time capabilities. Sign up for a free account at [https://convex.dev](https://convex.dev).
*   **Convex CLI:** Although often installed via `npx`, having it available is useful. Install globally if preferred: `npm install -g convex`.
*   **Git:** For version control. (Check `git --version`).
*   **(Optional) OpenAI API Key:** Required for AI features. Obtain from [https://platform.openai.com/](https://platform.openai.com/).
*   **(Optional) Exa API Key:** Required for the web search tool. Obtain from [https://exa.ai/](https://exa.ai/).
*   **(Optional) Resend API Key:** Required for the email tool. Obtain from [https://resend.com/](https://resend.com/).
*   **(Optional) GitHub Account:** Required if setting up GitHub OAuth for authentication.

3.2. **Local Setup**

Follow these steps to get the project running on your local machine:

1.  **Clone the Repository:**
    ```bash
    git clone <repository_url> # Replace with the actual URL
    cd agent-one # Navigate into the project directory
    ```

2.  **Install Dependencies:** Use Bun to install all necessary packages defined in `package.json`.
    ```bash
    bun install
    ```

3.  **Initialize Convex Project:** Link the codebase to a Convex project (either new or existing). The Convex CLI will guide you through logging in and selecting/creating a project.
    ```bash
    npx convex dev --once # Run once to perform initial setup/linking
    ```
    *   This command also performs an initial push of your schema and functions.
    *   It will output your project's development deployment URL, which you'll need next.

4.  **Configure Frontend Environment:** Create a `.env` file in the project root for frontend-specific variables. Add the Convex URL obtained in the previous step:
    ```plaintext
    # .env
    VITE_CONVEX_URL=https://<your-project-name>.convex.cloud
    ```
    *   Replace `<your-project-name>.convex.cloud` with your actual Convex development URL.
    *   Vite automatically loads variables prefixed with `VITE_` from this file (`src/main.tsx` uses `import.meta.env.VITE_CONVEX_URL`).

5.  **Configure Backend Environment Variables (API Keys):** Set the required API keys for the Convex backend environment using the Convex CLI. These are stored securely in your Convex deployment, not in your codebase.
    ```bash
    # Replace {YOUR_KEY} with your actual API keys
    bun convex env set OPENAI_API_KEY {YOUR_OPENAI_KEY}
    bun convex env set EXA_API_KEY {YOUR_EXA_KEY}
    bun convex env set RESEND_API_KEY {YOUR_RESEND_KEY}
    ```
    *   These keys are accessed via `process.env` within Convex actions (`"use node";`), such as in `convex/ai/tools.ts`.

6.  **Set up Convex Auth:** Run the `convex-dev/auth` setup tool. This will generate necessary auth keys and guide you through configuring providers.
    ```bash
    bunx @convex-dev/auth setup
    ```
    *   Follow the prompts. This will likely involve setting `CONVEX_SITE_URL` (your backend deployment URL, same as `VITE_CONVEX_URL` for local dev) and potentially generate `CONVEX_AUTH_PRIVATE_KEY` and `CONVEX_AUTH_PRIVATE_KEY_ID` environment variables within Convex.
    *   The providers are configured in `convex/auth.config.ts`.

7.  **Configure OAuth Providers (GitHub Example):**
    *   Follow the Convex Auth documentation guide for GitHub: [https://labs.convex.dev/auth/config/oauth/github](https://labs.convex.dev/auth/config/oauth/github).
    *   This typically involves creating a GitHub OAuth App, obtaining the Client ID and Client Secret, and setting them as Convex environment variables:
        ```bash
        bun convex env set AUTH_GITHUB_ID {YOUR_GITHUB_CLIENT_ID}
        bun convex env set AUTH_GITHUB_SECRET {YOUR_GITHUB_CLIENT_SECRET}
        ```
    *   Ensure the callback URL in your GitHub OAuth App settings matches the one provided by the `convex-dev/auth` setup or documentation (usually `https://<your-project-name>.convex.cloud/api/auth/callback/github`).

8.  **Run the Development Server:** Use the script defined in `package.json` to start both the frontend (Vite) and backend (Convex) development servers concurrently.
    ```bash
    bun dev
    ```
    *   This runs `npm-run-all --parallel dev:frontend dev:backend`.
    *   `dev:frontend` (`vite --open`) starts the Vite server (usually on `http://localhost:5173`) and opens it in your browser.
    *   `dev:backend` (`convex dev`) starts the Convex dev server, which watches for changes in the `convex/` directory and pushes them automatically. It also provides logs and status updates in the terminal.
    *   The `predev` script (`convex dev --until-success && convex dashboard`) ensures Convex is ready and optionally opens the Convex dashboard.

You should now have the application running locally, connected to your Convex development backend. Changes to frontend code (`src/`) will trigger Vite's Hot Module Replacement (HMR), and changes to backend code (`convex/`) will be automatically deployed to your dev environment by `convex dev`.