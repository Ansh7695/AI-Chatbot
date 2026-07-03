# Cove — Real-Time Ephemeral AI Chatroom

Cove is a real-time, ephemeral chat application built using React and Node.js. It features live messaging over WebSockets and on-demand AI utilities for summarization and natural language search. The application is styled with a tactile "Wet Clay & Glassmorphic" design system, supported by an interactive 3D particle water background.

---

## 1. System Architecture & Workflow

Cove is structured as a decoupled client-server architecture where real-time socket communications and intensive AI requests are isolated from each other.

```
                  WebSocket (Socket.io)
        ┌──────────────────────────────────────┐
        │                                      │
        ▼                                      ▼
┌───────────────┐                      ┌───────────────┐
│               │                      │               │
│ React Client  │                      │ Node Server   │
│               │                      │               │
└───────┬───────┘                      └───────┬───────┘
        │                                      │
        │ HTTP POST (/api/summary, /api/search)│
        └─────────────────────────────────────►│
                                               ├─────────────┐
                                               │             ▼
                                               │      ┌──────────────┐
                                               │      │ MongoDB      │
                                               │      │ (Message Log)│
                                               │      └──────────────┘
                                               │             ▲
                                               │             │
                                               │      ┌──────┴───────┐
                                               │      │ AI Provider  │
                                               │      │ (LLM API)    │
                                               │      └──────────────┘
```

### The Decoupled Request Loop

1. **Nickname Registration & Handshake**: The user enters a nickname on the client. The client emits a `join` event over the WebSocket connection. The server binds this nickname to the specific socket instance, joins the user to the designated room, and sends back the existing chat history.
2. **Real-Time Message Broadcast**: When a user sends a message, it is transmitted via a `send-message` event to the server. The server persists the message in MongoDB and immediately broadcasts a `new-message` event containing the completed document to all active socket clients in the room.
3. **Out-of-Band AI Requests**: When a user clicks the **Summarize Chat** or **Search History** buttons:
   - The client fires a traditional HTTP `POST` request to the backend REST API (`/api/summary` or `/api/search`).
   - The server handles this request independently of the open socket connections, queries the database, formats the payload, calls the active LLM, and sends back the result over HTTP.

> **Design Choice (WebSocket vs. REST for AI)**: 
> Callbacks and LLM operations can be slow and computationally heavy. Handling AI requests through out-of-band HTTP routes rather than WebSockets ensures that long-running AI queries do not block or lag the primary real-time socket thread. If a user runs a complex semantic search, others can continue chatting with sub-millisecond real-time response times.

---

## 2. Core Concepts

* **Ephemerality**: Cove operates as a lightweight, transient chatroom. Nicknames are attached to active socket sessions and are not stored in a persistent user table. While message history is stored in a MongoDB collection to allow AI queries and joining history, the room presence list is computed dynamically from active socket connections.
* **Rate Limiting**: To prevent API abuse and control API costs associated with the LLM providers, a strict rate limiter is configured via the [server/src/middleware/rateLimiter.ts](file:///c:/Users/hp/OneDrive/Desktop/Prodios%20Labs%20Pvt.%20Ltd/server/src/middleware/rateLimiter.ts) middleware. It restricts AI endpoint requests to a maximum of 15 queries per 15 minutes per IP.
* **Claymorphic & Glassmorphic UI**: The frontend matches modern visual styles. It features a drifting 3D water surface using React Three Fiber, custom CSS clay-morphism on active component cards, and glassmorphic panels that adapt to mobile layouts.

---

## 3. Socket Connection Management & Cleanup

WebSocket connections are vulnerable to memory leaks and duplicate message execution. This happens when hot reloads or state mutations re-register event handlers without detaching old ones. Cove uses a strict registration and cleanup workflow.

### Client-Side Cleanup

Inside the [client/src/context/ChatContext.tsx](file:///c:/Users/hp/OneDrive/Desktop/Prodios%20Labs%20Pvt.%20Ltd/client/src/context/ChatContext.tsx) file, subscriptions are set up inside a `useEffect` block. When the component updates or unmounts, a cleanup function runs to detach all listeners:

```typescript
useEffect(() => {
  if (!socket || !connected) return;

  // 1. Define event listeners
  const onChatHistory = (history: Message[]) => { /* ... */ };
  const onNewMessage = (message: Message) => { /* ... */ };
  const onPresenceUpdate = (list: string[]) => { /* ... */ };
  const onError = (msg: string) => { /* ... */ };

  // 2. Attach listeners to the socket instance
  socket.on('chat-history', onChatHistory);
  socket.on('new-message', onNewMessage);
  socket.on('presence-update', onPresenceUpdate);
  socket.on('error-message', onError);

  // 3. Return explicit cleanup function to prevent memory leaks
  return () => {
    socket.off('chat-history', onChatHistory);
    socket.off('new-message', onNewMessage);
    socket.off('presence-update', onPresenceUpdate);
    socket.off('error-message', onError);
  };
}, [socket, connected]);
```

### Server-Side Cleanup

Inside the [server/src/sockets/index.ts](file:///c:/Users/hp/OneDrive/Desktop/Prodios%20Labs%20Pvt.%20Ltd/server/src/sockets/index.ts) file, the server monitors disconnects. Once a client disconnects, the server releases references to its specific callback functions and runs cleanups:

```typescript
export const initSockets = (io: Server): void => {
  io.on('connection', (socket) => {
    
    const onJoin = async (data: unknown) => {
      await handleJoin(io, socket, data);
    };

    const onSendMessage = async (data: unknown) => {
      await handleMessage(io, socket, data);
    };

    socket.on('join', onJoin);
    socket.on('send-message', onSendMessage);

    socket.on('disconnect', async () => {
      // Remove event listeners explicitly to avoid duplicate execution
      socket.off('join', onJoin);
      socket.off('send-message', onSendMessage);

      // Recalculate and broadcast room presence lists
      await handleDisconnect(io, socket);
    });
  });
};
```

---

## 4. State Management Approach

Cove breaks state into three logical boundaries to optimize rendering and enforce separation of concerns:

1. **Connection State (`SocketContext`)**: Managed in [client/src/context/SocketContext.tsx](file:///c:/Users/hp/OneDrive/Desktop/Prodios%20Labs%20Pvt.%20Ltd/client/src/context/SocketContext.tsx). It uses a React `useRef` to store the active socket connection instance. This prevents the socket from reconnecting when context components re-render. It exposes only the connection status (`connected: boolean`) and the socket instance.
2. **Room & Chat State (`ChatContext`)**: Managed in [client/src/context/ChatContext.tsx](file:///c:/Users/hp/OneDrive/Desktop/Prodios%20Labs%20Pvt.%20Ltd/client/src/context/ChatContext.tsx). It holds state for active room messages, active nicknames, room ID, joining status (`joined: boolean`), presence list, and room-level errors. This context keeps the entire chat interface synchronized.
3. **Transient Component State**: States related to query loaders, AI summary strings, search answer structures, and input search boxes are kept local to the [client/src/components/AIPanel](file:///c:/Users/hp/OneDrive/Desktop/Prodios%20Labs%20Pvt.%20Ltd/client/src/components/AIPanel) component. Because these values do not affect other components or real-time message routing, isolating them locally prevents unnecessary re-renders of the main chat container.

---

## 5. AI Prompt Engineering & Integration

All prompt building and model selections are grouped inside [server/src/services/aiService.ts](file:///c:/Users/hp/OneDrive/Desktop/Prodios%20Labs%20Pvt.%20Ltd/server/src/services/aiService.ts).

### Provider Fallback Priority
The backend automatically resolves which client library to use based on available environment variables. It tries to initialize and query the providers in this priority:
1. **Google GenAI** (`gemini-2.5-flash`)
2. **OpenAI** (`gpt-4o-mini`)
3. **Groq** (`llama-3.3-70b-versatile`)

### Summarization Prompt Structure
For summaries, the backend reads the last 30 messages from the database, formats them into a structured log string, and issues this prompt:

```
You are summarizing a live group chat. Below are the last {{count}} messages.
Write a concise 3-5 sentence summary capturing key topics, decisions, and who said what if relevant.
Do not invent information not present in the messages.

Messages:
{{formatted_messages}}
```

### Search Prompt Structure
For history search, the backend reads the last 100 messages to establish context. It instructs the LLM to output a JSON string, which is then parsed by the server. This format allows the client to highlight matching messages in the history log:

```
You are answering a question about a group chat's history using only the messages provided below.
Messages (numbered, with nickname, ID, and timestamp):
{{formatted_messages}}

Question: "{{query}}"

Respond in JSON matching this exact structure:
{
  "answer": "<direct answer to the question, referencing who said what>",
  "relevantMessageIds": ["<id1>", "<id2>", ...]
}
If nothing in the messages is relevant to the question, say so honestly in the "answer" field and return an empty array in "relevantMessageIds".
```

---

## 6. Local Setup & Execution

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (A local database running on `mongodb://localhost:27017` or a MongoDB Atlas URI)
- **AI API Keys** (At least one of `GEMINI_API_KEY`, `OPENAI_API_KEY`, or `GROQ_API_KEY` configured in the backend environment)

### Environment Configurations
Create a `.env` file in your `server` directory matching this structure:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/cove-chat
GEMINI_API_KEY=your_gemini_api_key_here
# Optional fallbacks
OPENAI_API_KEY=
GROQ_API_KEY=
```

### Step 1: Run the Backend Server
```bash
cd server
npm install
npm run dev
```
The backend will launch on [http://localhost:5000](http://localhost:5000).

### Step 2: Run the Frontend Client
```bash
cd client
npm install
npm run dev
```
The client will start on [http://localhost:5173](http://localhost:5173).

---

## 7. AI Usage Disclosure (Mandatory)

During the development of this codebase, AI coding tools were utilized in a limited capacity under the following guidelines:

* **Which AI tool(s) were used**:
  - Gemini and Claude.

* **What tasks they assisted with**:
  - **Documentation (Maximum Assistance)**: Writing inline code documentation, formatting local setup instructions, and drafting structural markdown documentation.
  - **Debugging (Good Use)**: Investigating strict TypeScript compiler flags, verifying that socket event handlers are detached correctly to prevent memory leaks, and validating routes signatures.
  - **Code Suggestions (Little Use)**: Suggesting basic boilerplate skeletons for config parameters and small helper utilities. (Note: No UI generation or architectural planning tasks were performed using AI).

* **Which parts of the final codebase were primarily AI-generated**:
  - No core logic, visual components, state management contexts, or socket event handlers were AI-generated.
  - AI code generation was limited to text-only items, such as descriptive JSDoc comments, document headers, and standard template configurations (like tsconfig options).

* **Significant modifications made to AI-generated code**:
  - Recommended config templates were updated to conform to strict type-safety requirements.
  - Boilerplate utilities were modified to format response payloads to match the rest of the application's REST API error structures.

---
