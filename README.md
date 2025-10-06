
2.  **Install dependencies:**
    ```bash
    bun install
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

### Environment Variables

The application uses Cloudflare Workers for its backend and requires API keys for AI functionality. For local development, create a `.dev.vars` file in the root directory.

1.  Copy the example file:
    ```bash
    cp wrangler.jsonc .dev.vars.example # (This is a placeholder, you'll need to create the .dev.vars file manually)
    ```

2.  Create and populate `.dev.vars`:
    ```
    CF_AI_BASE_URL="https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai"
    CF_AI_API_KEY="your-cloudflare-api-key"
    ```

> **Important Note on AI Functionality**
>
> This project is configured to use AI models through Cloudflare's AI Gateway. To make the AI features fully functional, you must provide your own `CF_AI_BASE_URL` and `CF_AI_API_KEY`. Due to security constraints, API keys cannot be stored in the repository. You will need to set these up yourself after cloning the project.

## 💻 Development

To start the local development server, which includes both the Vite frontend and the Cloudflare Worker backend, run:

```bash
bun dev
```

This will start the Vite development server (typically on `http://localhost:3000`) and the local `workerd` server. The Vite server is configured to proxy API requests (`/api/*`) to the worker, enabling a seamless development experience.

## 🚀 Deployment

This project is designed for easy deployment to Cloudflare Pages.

1.  **Login to Wrangler:**
    ```bash
    bunx wrangler login
    ```

2.  **Deploy the application:**
    ```bash
    bun run deploy
    ```

This command will build the frontend application and deploy it along with the worker to your Cloudflare account.

You will need to configure your secrets (`CF_AI_API_KEY`) in your Cloudflare dashboard under **Workers & Pages > Your Project > Settings > Environment variables**.

Alternatively, deploy directly from your GitHub repository with a single click:

[cloudflarebutton]

## 📂 Project Structure

-   `src/`: Contains all the frontend React application code.
    -   `components/`: Shared and UI components (including shadcn/ui).
    -   `pages/`: Top-level route components.
    -   `lib/`: Utility functions and mock data.
    -   `store/`: Zustand global state management stores.
-   `worker/`: Contains the Cloudflare Worker backend code.
    -   `agent.ts`: The core `ChatAgent` Durable Object implementation.
    -   `userRoutes.ts`: Hono route definitions for the API.
    -   `chat.ts`: Logic for interacting with AI models.
-   `public/`: Static assets.
-   `wrangler.jsonc`: Configuration file for the Cloudflare Worker.

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.