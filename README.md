# Quantum Workbench | Technical Guide

This document outlines the API architecture and frontend implementation logic for the Quantum Workbench SQL Builder.

## 1. System Architecture

The application is built using a **Centralized Context Pattern**. 
- **`WorkbenchContext`**: Acts as the "Brain" of the application. It manages the state for connections, profiles (templates), the canvas layout, and the generated query logic.
- **Graph Engine**: A reactive computation layer inside the context that calculates "Reachable Tables" starting from a user-defined **Root Table** (Anchor) through active **Joins**.
- **Mock Persistence**: All data is stored in an in-memory `mock-store.ts` via Next.js API routes, making the frontend backend-agnostic.

---

## 2. API Endpoints

All endpoints are hosted under `/api/*` and use JSON for requests/responses.

### 2.1 Connections
Manage the database sources the workbench can connect to.
- `GET /api/connections`: List all sources.
- `POST /api/connections`: Register a new source.
- `PUT /api/connections/:id`: Update source metadata.
- `DELETE /api/connections/:id`: Remove a source.
- `POST /api/connections/:id/test`: Simulates an async connectivity test (returns `connected` or `error`).
- `GET /api/connections/:id/schema`: Returns table metadata (columns, types, foreign keys) for a specific connection.

### 2.2 Profiles (Templates)
Profiles store the complete state of a workbench session.
- `GET /api/profiles`: List saved profiles.
- `POST /api/profiles`: Save current canvas (tables, positions, joins, filters).
- `PUT /api/profiles/:id`: Update an existing profile.
- `POST /api/profiles/:id/duplicate`: Clones a profile to a new ID.

### 2.3 Query Execution
- `POST /api/query/execute`: Accepts a structured query object. Returns synthetic result rows, execution metrics (time), and the final SQL string.
- `POST /api/query/validate`: Checks the query graph for validity (e.g., "Are all tables reachable?", "Are required joins active?").

### 2.4 History & Metadata
- `GET /api/history`: List recent query executions.
- `POST /api/history`: Append a new execution record to the logs.
- `GET /api/saved-queries`: Manage named query configurations.
- `GET /api/presets`: Manage parameter value sets for placeholders (e.g., `:userId`).

---

## 3. Implementation Logic

### 3.1 SQL Generation
The SQL is generated reactively. Whenever the `tables`, `joins`, `filters`, or `sorting` state changes, the `WorkbenchContext` performs the following:
1. **Compute Reachability**: Starting from the `rootTableId`, it traverses the `joins` array to find all reachable `TableInstances`.
2. **SELECT Clause**: Maps through `reachableTables` and gathers all `pinnedColumns`.
3. **JOIN Clause**: Filters `joins` for active connections between two reachable tables.
4. **WHERE Clause**: Processes `filters`, handling raw values and operators like `IN` or `IS NULL`.
5. **ORDER/LIMIT**: Appends sorting rules and the global result limit.

### 3.2 Join Management
- **Auto-Join**: When adding a table, the system scans the schema for foreign keys. If the target table is already on the canvas, it automatically creates a `Join` instance.
- **Manual Join**: Users can click the `Link` icon on two different table columns to manually define a relationship.

---

## 4. Mock Data
The `REALISTIC_SCHEMA` provides a production-grade playground with the following entities:
- `customers`, `addresses`, `orders`, `order_items`, `products`, `payments`.
- Fully defined primary and foreign keys to enable the Auto-Join engine.
