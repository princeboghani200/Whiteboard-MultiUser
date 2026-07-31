# Multi-User Collaborative Whiteboard — Project Documentation

## 1. Project Overview

**What we're building:** A real-time collaborative whiteboard application where multiple users can join a shared "room" and draw, add shapes/text, and see each other's actions (including live cursors) instantly — similar in spirit to Excalidraw or Miro, but scoped down to a buildable, resume-worthy MERN project.

**Why this project (resume framing):**
- Demonstrates real-time systems thinking, not just CRUD
- Forces you to solve state synchronization and conflict handling — concepts that show up in real engineering roles
- Visually demoable (a live GIF/video of two cursors drawing together is far more compelling than screenshots of a form)

---

## 2. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React (Vite) | Fast dev server, component-based UI |
| Canvas engine | Fabric.js | Handles object model, selection, transform, serialization out of the box — writing a canvas engine from scratch is not a good use of your 2 weeks |
| Real-time layer | Socket.io | Built-in "rooms" concept maps directly to whiteboard "boards"; handles reconnection/fallback automatically |
| Backend | Node.js + Express | REST API for auth/board management, hosts the Socket.io server |
| Database | MongoDB (Atlas) | Flexible schema fits a board's "array of elements" structure well; easy to iterate on element shape as you add features |
| Auth | JWT (access + refresh tokens) | Standard, resume-expected; refresh tokens show you understand token expiry properly, not just "login works" |
| Deployment | Vercel (frontend) + Render/Railway (backend) + Atlas (DB) | Free tier friendly, standard MERN deployment pattern |
| State management (frontend) | React Context or Zustand | Redux is overkill for this scope; don't add complexity that isn't earning its keep |

**Optional/stretch:**
- Redis — only if you get to horizontal scaling discussion (see Section 4); not needed for MVP
- html2canvas or Fabric's built-in export — for "export board as image"

---

## 3. Core Features (Priority Order)

Build top-down. If you run low on time, cut from the bottom, not the top.

1. Room creation/joining (shareable link or room code)
2. Real-time drawing sync (freehand, shapes, text) across all users in a room
3. Live cursor presence (see others' cursors + names moving in real time)
4. Persistence (board state saved to MongoDB; reload/rejoin shows current state, not blank canvas)
5. Undo/redo
6. Auth + "my boards" dashboard
7. Nice-to-haves: stroke color/width picker, eraser, export as image, user avatars on cursors

---

## 4. Architecture & Data Flow

### 4.1 High-Level Flow
1. User authenticates → gets JWT
2. User creates or joins a board → establishes a Socket.io connection, joins a "room" named by `boardId`
3. On join, server sends the current full board state (`board-sync` event) so the user isn't starting from blank
4. Every draw action emits an event to the server (`element-add`, `element-update`, `element-delete`)
5. Server broadcasts that event to everyone else in the room AND persists it to MongoDB (debounced/throttled — not on every single mouse-move)
6. Cursor position is broadcast-only (never persisted — no reason to store transient cursor positions)

### 4.2 Schema Design

```
User {
  _id, name, email, passwordHash, createdAt
}

Board {
  _id,
  name,
  ownerId,
  collaborators: [userId],
  elements: [
    {
      id: string,          // client-generated UUID, not Mongo _id — important, see Section 5
      type: "path" | "rect" | "circle" | "text",
      data: object,         // Fabric.js object JSON
      createdBy: userId,
      updatedAt: timestamp
    }
  ],
  createdAt
}
```

### 4.3 Socket Events

| Event | Direction | Persisted? | Notes |
|---|---|---|---|
| `join-room` | client → server | — | joins Socket.io room by boardId |
| `board-sync` | server → client | — | sent once on join, full current state |
| `cursor-move` | client → server → broadcast | No | throttle to ~20-30 emits/sec max |
| `element-add` | client → server → broadcast | Yes | |
| `element-update` | client → server → broadcast | Yes | e.g., moving/resizing a shape |
| `element-delete` | client → server → broadcast | Yes | |
| `leave-room` | client → server | — | cleanup presence list |

---

## 5. Anticipated Problems & How to Handle Them

This section matters most for your documentation — being able to name the problems *before* you hit them (and explain your solution) is exactly what separates "I followed a tutorial" from "I engineered a system."

### Problem 1: Conflicting simultaneous edits
**Scenario:** Two users move/resize the same shape at the same time.
**Solution for this scope:** Last-write-wins based on server-received timestamp. Simpler than Operational Transform (which is genuinely complex and overkill here).
**Interview-ready explanation:** "I chose last-write-wins because whiteboard elements are typically owned/edited by one user at a time in practice; true OT is warranted for text (character-level merges) but is disproportionate complexity for discrete shape objects."

### Problem 2: Flooding the server with cursor/draw events
**Scenario:** Freehand drawing or cursor movement fires dozens of events per second per user; with multiple users this can overwhelm the socket connection and DB writes.
**Solution:** Throttle/debounce on the client before emitting (e.g., emit cursor position at most every 30-50ms). For freehand paths, batch points and send as one `element-add` on mouse-up rather than streaming every point live (or stream for live *preview* but only persist the final path).

### Problem 3: Client-generated IDs vs MongoDB `_id`
**Scenario:** If you rely on MongoDB's `_id` for element identity, you get race conditions and awkward round-trips waiting for the server to assign an ID before the other users can reference it.
**Solution:** Generate a UUID client-side for each element at creation time. This ID is used consistently across all clients and the DB, decoupling "is this saved yet" from "does this element have an identity."

### Problem 4: Late joiners seeing an incorrect/incomplete board
**Scenario:** A user joins mid-session; if you only rely on live broadcast events, they'll see nothing until someone draws something new.
**Solution:** `board-sync` event — server fetches the full board document from MongoDB and sends it to the newly joined client immediately after `join-room`.

### Problem 5: Reconnection handling
**Scenario:** User's wifi drops for 5 seconds; Socket.io reconnects automatically, but your app might not re-join the room or re-sync state.
**Solution:** On the `connect` event (which also fires on reconnect), re-emit `join-room` and re-request `board-sync`. Don't assume connection state is stable — build for reconnection from day one, not as an afterthought.

### Problem 6: Authorization on board access
**Scenario:** Anyone with a room ID could theoretically join and edit — is that acceptable, or do you need permission checks?
**Decision to make explicitly:** For MVP, "anyone with the link can edit" (like early Google Docs sharing) is a reasonable, defensible scope decision. Document it as a conscious choice, not an oversight. Stretch goal: view-only vs edit permissions per collaborator.

### Problem 7: Scaling beyond one server instance (mention, don't build)
**Scenario:** If you deploy multiple backend instances, Socket.io rooms don't automatically sync across instances — a user connected to server A won't see broadcasts happening on server B.
**Solution (know this, don't need to build it):** Redis adapter for Socket.io (`socket.io-redis`) enables pub/sub across instances. You won't need this for a single free-tier deployment, but knowing the answer to "how would this scale?" in an interview is valuable.

---

## 6. Build Order (10-12 Day Plan)

| Days | Focus |
|---|---|
| 1-2 | Backend setup: Express, MongoDB schema, JWT auth, Socket.io room joining |
| 3-5 | Canvas drawing — get Fabric.js working **locally/solo** before adding any sync |
| 6-8 | Real-time sync: draw events, cursor presence, `board-sync` on join (hardest part — budget the most time here) |
| 9-10 | Persistence, "my boards" dashboard, polish (colors, undo/redo) |
| 11-12 | Deploy (Vercel + Render + Atlas), write README explaining sync architecture and tradeoffs, buffer for the inevitable deployment/env-var/CORS issue |

---

## 7. What to Emphasize in the README / Interview

- The conflict-resolution decision (last-write-wins) and why it's appropriate here vs. OT
- The client-generated UUID approach and why it avoids round-trip identity issues
- Throttling strategy for high-frequency events
- Conscious scope decisions (e.g., anyone-with-link-can-edit) — framed as decisions, not gaps
- What you'd do differently at scale (Redis adapter, permission system)

