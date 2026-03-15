
# Quantum Workbench | Technical Guide

This document outlines the API architecture and frontend implementation logic for the Quantum Workbench SQL Builder.

## 1. System Architecture

The application is built using a **Centralized Context Pattern**. 
- **`WorkbenchContext`**: Acts as the "Brain" of the application. It manages the state for connections, profiles (templates), the canvas layout, and the generated query logic.
- **Graph Engine**: A reactive computation layer inside the context that calculates "Reachable Tables" starting from a user-defined **Root Table** (Anchor) through active **Joins**.

---

## 2. API Endpoints

All endpoints are hosted under `/api/*` and use JSON for requests/responses.

### 2.1 Connections
- `GET /api/connections`: List all sources.
- `POST /api/connections`: Register a new source.
- `PUT /api/connections/:id`: Update source metadata.
- `DELETE /api/connections/:id`: Remove a source.
- `POST /api/connections/:id/test`: Simulates connectivity test.
- `GET /api/connections/:id/schema`: Returns hierarchical table metadata.

**Response Schema (`GET /api/connections/:id/schema`):**
```json
{
  "tables": [
    {
      "id": "customers",
      "name": "customers",
      "schemaName": "public",
      "columns": [
        { "name": "id", "type": "uuid", "isPrimary": true },
        { "name": "email", "type": "varchar" }
      ],
      "foreignKeys": []
    }
  ]
}
```

### 2.2 Profiles & Templates
- `GET /api/profiles`: List saved profiles.
- `POST /api/profiles`: Save current canvas.
- `GET /api/templates`: List reusable workbench templates.
- `POST /api/templates`: Create template from current state.

### 2.3 Query Execution & Validation
- `POST /api/query/execute`: Executes a structured query.
- `POST /api/query/validate`: Validates graph connectivity.

**Request Body (`POST /api/query/execute`):**
```json
{
  "connectionId": "c1",
  "rootTableId": "orders_123",
  "joins": [
    { "sourceTableId": "orders_123", "targetTableId": "customers_456", "type": "INNER", "active": true }
  ],
  "selectedColumns": [
    { "tableId": "orders_123", "column": "total_amount" }
  ],
  "filters": [
    { "tableId": "orders_123", "column": "status", "operator": "=", "value": "paid" }
  ],
  "limit": 50
}
```

---

## 3. Implementation Logic

### 3.1 Hierarchical Schema Browser
The Left Sidebar uses a `useMemo` hook to group flat table metadata from the API into a `Record<string, TableSchema[]>` keyed by `schemaName`. This enables the multi-level accordion view.

### 3.2 SQL Generation
The SQL is generated reactively. Whenever the `tables`, `joins`, `filters`, or `sorting` state changes, the `WorkbenchContext` performs the following:
1. **Compute Reachability**: Starting from the `rootTableId`, it traverses the `joins` array to find all reachable `TableInstances`.
2. **SELECT Clause**: Maps through `reachableTables` and gathers all `pinnedColumns`.
3. **JOIN Clause**: Filters `joins` for active connections between two reachable tables.
4. **WHERE Clause**: Processes `filters`, handling raw values and operators like `IN` or `IS NULL`.
