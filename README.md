# Real-Time Collaborative Whiteboard

A multi-user whiteboard app where people can join a shared board and draw together in real time — think a scaled-down Excalidraw. I built this as my main portfolio project to go deeper into real-time systems than a typical CRUD app usually requires.

**Live demo:** whiteboard-multi-user.vercel.app
**Backend:** https://whiteboard-backend-nfzb.onrender.com



## What it does

* Create a board or join someone else's using a shareable board ID
* Draw freehand, or add rectangles, circles, and text — all synced live across everyone on the board
* Move and resize existing shapes, with changes reflected instantly for other users
* See other people's cursors moving in real time, labeled with their name
* See who's currently active on a board (presence avatars), plus a join notification
* Everything persists — reload the page or come back the next day and the board is exactly as you left it
* JWT-based auth with access + refresh tokens, so boards are tied to real accounts
* A dashboard that separates boards you own from boards you've joined
* 

## Tech stack

The frontend is React with Vite, styled with Tailwind. For the canvas itself I used Fabric.js instead of working directly with the HTML5 Canvas API — it already handles object selection, resizing, and serializing shapes to JSON, and writing that from scratch wouldn't have taught me anything I couldn't learn some other way. It would've just eaten the time I wanted to spend on the actual hard part: the real-time sync.

For real-time, I went with Socket.io over raw WebSockets mainly because of its built-in "rooms" concept — it maps almost one-to-one onto how a whiteboard board works (everyone viewing the same board joins the same room), and it handles reconnection and transport fallback for you instead of making me reinvent that.

The backend is Node and Express, with the same server also hosting the Socket.io instance — no separate real-time service, just one Express app doing both REST routes and the socket layer. Data lives in MongoDB, via Mongoose. I liked Mongo for this specifically because a board is naturally "a document with an array of elements," and that maps cleanly onto a flexible schema — I didn't want to fight a rigid relational structure while I was still figuring out what an "element" even needed to look like.

Auth is JWT-based, with both an access token and a refresh token rather than just one long-lived token. It's a small extra layer of complexity, but it's the standard approach for a reason, and it was worth doing properly rather than cutting the corner.

It's deployed on Vercel (frontend), Render (backend), and MongoDB Atlas (database) — all free tiers, which is the usual pattern for a project like this.



## Architecture notes

A few decisions that are worth explaining, since they came from actually hitting the problem rather than reading about it beforehand:

**Client-generated element IDs.** Every shape gets a UUID assigned on the client the moment it's created, rather than waiting for MongoDB to assign an `\_id`. If two people draw at the same time, they each need their own element's ID immediately — there's no time to round-trip to the server first. This also made syncing move/resize updates much simpler later, since every element already has a stable ID that both the client and server agree on.

**Last-write-wins for conflicting edits.** If two people move the same shape at the same time, whichever update the server processes last wins. I considered Operational Transform (what tools like Google Docs use for text), but that's solving a harder problem than this app actually has — OT matters when you need to merge character-level text edits, not when you're moving a whole rectangle. Last-write-wins is a fine tradeoff here, and it's a much smaller amount of code to reason about and debug.

**Cursor updates are throttled, not persisted.** A raw mouse move event fires far more often than the UI or the network needs — I throttle cursor broadcasts to roughly 20 updates per second on the client before emitting. Cursor positions also never touch the database; they're meaningless the moment you refresh, so there's no reason to store them.

**Presence and freehand strokes are separate problems.** Freehand drawing gets batched into a single path on mouse-up rather than streaming every point as its own event — otherwise a single stroke could generate dozens of database writes. Presence (who's online, whose cursor is whose) is tracked in memory on the server, keyed by board ID, and cleaned up on disconnect.

**Known limitation:** boards are currently "anyone with the link can edit," with no view-only or permission tiers. That was a conscious scope decision, not an oversight — I'd add role-based permissions (owner / editor / viewer) as the next real feature if I kept building this out.



## Running it locally

You'll need Node.js and a MongoDB connection (either local or a free Atlas cluster).

**Backend**

```bash
cd backend
npm install
```

Create a `.env` file (see `.env.example` for the full list) with your Mongo URI and JWT secrets, then:

```bash
npm run dev
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

The app expects the backend on `http://localhost:5000` and the frontend on `http://localhost:5173` by default — update the URLs in `src/api/axios.js` and `src/socket.js` if you're running them elsewhere.