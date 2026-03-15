# Firebase Studio

This is a Next.js starter in Firebase Studio.

To get started, take a look at `src/app/page.tsx`.
object 
---

## Backend API Endpoints (for server implementation)

The app expects the following REST API endpoints to drive its mocked workbench behavior. The current Next.js app includes a mock implementation under `src/app/api/*`. When you replace that with a real backend, keep the same routes + request/response shapes.

> All endpoints use **JSON** (`Content-Type: application/json`) and return standard HTTP status codes (200/201/400/404/500).

---

## 1) Schema / metadata

### `GET /api/connections/:id/schema`

**Description:** Returns schema metadata for a specific connection (primary keys, foreign keys, nullability, etc.).

**Response** (`200`):

```json
{
  "tables": [
    {
      "id": "orders",
      "name": "orders",
      "columns": [
        { "name": "id", "type": "uuid", "isPrimary": true, "isNullable": false },
        { "name": "customer_id", "type": "uuid", "isForeignKey": true, "isNullable": false },
        { "name": "status", "type": "varchar", "isNullable": false }
      ],
      "foreignKeys": [
        {
          "column": "customer_id",
          "referencesTable": "customers",
          "referencesColumn": "id"
        }
      ]
    }
  ]
}
```

> `Table` objects are expected to be stable (same `id` for same table) so the UI can keep node selections stable.

---

## 2) Connections

A `Connection` represents a target database that the workbench can query.

### `GET /api/connections`

**Description:** List all configured database connections.

**Response** (`200`): `Connection[]`

### `POST /api/connections`

**Description:** Create a new database connection.

**Request body**:

```json
{
  "name": "Staging_Replica",
  "type": "MySQL",
  "host": "db.staging.internal",
  "port": 3306,
  "databaseName": "staging",
  "username": "developer",
  "password": "..."
}
```

**Response** (`201`): created `Connection` (includes `id` and `status`).

### `PUT /api/connections/:id`

**Description:** Update connection metadata.

**Request body:** Partial `Connection`.

### `DELETE /api/connections/:id`

**Description:** Remove a connection.

**Response** (`200`):

```json
{ "success": true }
```

### `POST /api/connections/:id/test`

**Description:** Validate the connection (credentials + reachability).

**Response** (`200`):

```json
{ "status": "connected" }
```

or

```json
{ "status": "error", "message": "Invalid credentials" }
```

---

## 3) Profiles (workbench templates)

A `Profile` stores a saved workbench state (tables, joins, filters, etc.) that users can reuse.

### `GET /api/profiles`

**Description:** List all saved profiles.

**Response** (`200`): `Profile[]`

### `POST /api/profiles`

**Description:** Create a new profile.

**Request body**:

```json
{
  "name": "Sales Overview",
  "connectionId": "c1",
  "rootTableId": "orders",
  "tables": [
    {
      "tableId": "orders",
      "position": { "x": 120, "y": 80 },
      "pinnedColumns": ["id", "status"]
    },
    {
      "tableId": "customers",
      "position": { "x": 400, "y": 80 },
      "pinnedColumns": ["id", "email"]
    }
  ],
  "joins": [
    {
      "id": "j1",
      "leftTableId": "orders",
      "leftColumn": "customer_id",
      "rightTableId": "customers",
      "rightColumn": "id",
      "joinType": "INNER",
      "active": true,
      "required": true,
      "source": "auto"
    }
  ],
  "selectedColumns": [],
  "filters": [],
  "sorting": [],
  "limit": 50
}
```

**Response** (`201`): created `Profile` (includes `id` and `createdAt`).

### `PUT /api/profiles/:id`

**Description:** Update an existing profile.

**Request body:** Partial `Profile`.

### `DELETE /api/profiles/:id`

**Description:** Delete a profile.

**Response** (`200`):

```json
{ "success": true }
```

### `POST /api/profiles/:id/duplicate` (optional)

**Description:** Duplicate a profile.

**Response** (`200`): duplicated `Profile`.

---

## 4) Templates (reusable join graphs)

A `Template` is a variant of a profile intended to be reused as a workspace template.

### `GET /api/templates`

**Description:** List all templates.

**Response** (`200`): `Template[]`

### `POST /api/templates`

**Description:** Create a new template.

**Request body**:

```json
{
  "name": "Order Funnel",
  "connectionId": "c1",
  "rootTableId": "orders",
  "tables": [
    {
      "tableId": "orders",
      "position": { "x": 120, "y": 80 },
      "pinnedColumns": ["id", "status"]
    }
  ],
  "joins": [
    {
      "id": "j1",
      "sourceTableId": "orders",
      "sourceColumn": "customer_id",
      "targetTableId": "customers",
      "targetColumn": "id",
      "type": "INNER",
      "active": true,
      "required": true,
      "source": "auto"
    }
  ],
  "selectedColumns": [],
  "filters": [],
  "sorting": [],
  "limit": 50,
  "schemaSnapshotVersion": "v-20260314"
}
```

**Response** (`201`): created `Template`.

### `PUT /api/templates/:id`

**Description:** Update a template.

**Request body:** Partial `Template`.

### `DELETE /api/templates/:id`

**Description:** Delete a template.

**Response** (`200`):

```json
{ "success": true }
```

---

## 5) Saved Queries

Saved queries store raw SQL with optional metadata for quick access.

### `GET /api/saved-queries`

**Description:** List all saved queries.

**Response** (`200`): `SavedQuery[]`

### `POST /api/saved-queries`

**Description:** Create a new saved query.

**Request body**:

```json
{
  "name": "Recent Orders",
  "connectionId": "c1",
  "sql": "SELECT * FROM orders WHERE created_at > NOW() - INTERVAL '7 days'",
  "description": "Last 7 days of orders"
}
```

**Response** (`201`): created `SavedQuery`.

### `PUT /api/saved-queries/:id`

**Description:** Update an existing saved query.

**Request body:** Partial `SavedQuery`.

### `DELETE /api/saved-queries/:id`

**Description:** Delete a saved query.

**Response** (`200`):

```json
{ "success": true }
```

---

## 6) Presets (parameter presets)

Presets store reusable parameter sets for query execution.

### `GET /api/presets`

**Description:** List all parameter presets.

**Response** (`200`): `Preset[]`

### `POST /api/presets`

**Description:** Create a new preset.

**Request body**:

```json
{
  "name": "Last 30 Days",
  "queryId": "q1",
  "params": { "startDate": "2026-02-12", "endDate": "2026-03-14" },
  "tags": ["analytics"],
  "notes": "Monthly report preset"
}
```

**Response** (`201`): created `Preset`.

### `PUT /api/presets/:id`

**Description:** Update an existing preset.

**Request body:** Partial `Preset`.

### `DELETE /api/presets/:id`

**Description:** Delete a preset.

**Response** (`200`):

```json
{ "success": true }
```

---

## 7) Query execution

### `POST /api/query/execute`

**Description:** Execute a query against a connection and return a synthetic result.

**Request body**:

```json
{
  "sql": "SELECT customers.id, customers.email FROM customers",
  "limit": 50,
  "connectionId": "c1"
}
```

**Response** (`200`):

```json
{
  "sql": "SELECT customers.id, customers.email FROM customers",
  "columns": [
    { "name": "id", "type": "uuid" },
    { "name": "email", "type": "varchar" }
  ],
  "rows": [
    { "id": 1, "email": "value_1" },
    { "id": 2, "email": "value_2" }
  ],
  "executionTimeMs": 123,
  "rowCount": 2
}
```

**Error Response** (`400`/`500`):

```json
{ "message": "Limit must be positive" }
```
---
## 4.1) Query validation (optional)

### `POST /api/query/validate`

**Description:** Validate a structured query payload before execution. This service is optional but helps the UI highlight invalid queries (disconnected joins, unreachable tables, required joins disabled, etc.).

**Request body:** Same payload as `/api/query/execute`.

**Response** (`200`):

```json
{
  "valid": true,
  "errors": [],
  "warnings": [],
  "unreachableTables": []
}
```

---
## 8) Execution history

### `GET /api/history`

**Description:** Returns recent query execution records.

**Response** (`200`): `ExecutionHistoryItem[]`

### `POST /api/history`

**Description:** Append a new history entry.

**Request body**:

```json
{
  "timestamp": "2026-03-14T12:34:56.789Z",
  "connectionId": "c1",
  "sql": "SELECT ...",
  "params": { "startDate": "2026-02-12", "endDate": "2026-03-14" },
  "metrics": { "time": 123, "rows": 5 },
  "status": "success",
  "errorMessage": null
}
```

---

## 9) Optional: Workbench state persistence

These endpoints are optional and not required for the basic workbench behavior.

### `GET /api/workbench` (or `/api/workbench/:id`)
### `POST /api/workbench`
### `PUT /api/workbench/:id`

---

## Mock API Implementation

The mock implementation of these endpoints lives in `src/app/api/*` and uses in-memory stores (`src/lib/mock-store.ts`) to simulate backend behavior. This makes it easy to swap in a real backend later without changing the frontend request logic.
