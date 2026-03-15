# Quantum Workbench | Technical Guide

This document outlines the API architecture and frontend implementation logic for the Quantum Workbench SQL Builder.

## 1. External API Configuration

To point the workbench to your own backend, set the following environment variable:

`NEXT_PUBLIC_API_URL=https://your-backend-api.com`

If this variable is not set, the application will attempt to call local `/api` routes (which have been deactivated in this version).

## 2. API Endpoints Specification

All endpoints are expected to follow JSON standards.

### 2.1 Connections
- `GET /connections`: List all sources.
- `POST /connections`: Register a new source.
- `PUT /connections/:id`: Update source metadata.
- `DELETE /connections/:id`: Remove a source.
- `POST /connections/:id/test`: Connectivity test. Returns `{ "status": "connected" | "error", "message": "string" }`.
- `GET /connections/:id/schema`: Returns hierarchical table metadata.

**Response Schema (`GET /connections/:id/schema`):**
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
      ]
    }
  ]
}
```

### 2.2 Profiles
- `GET /profiles`: List saved workbench profiles.
- `POST /profiles`: Save current canvas state.

### 2.3 Query Execution
- `POST /query/execute`: Executes a structured query.
- `POST /query/validate`: Validates graph connectivity.

**Request Body (`POST /query/execute`):**
```json
{
  "connectionId": "c1",
  "rootTableId": "orders_123",
  "joins": [...],
  "selectedColumns": [...],
  "filters": [...],
  "limit": 50
}
```

---

## 3. Implementation Logic

### 3.1 Graph Engine
The application manages state through `WorkbenchContext`. It calculates table reachability reactively. If a table is added but not connected to the "Root Table" (Anchor), it is excluded from SQL generation.

### 3.2 SQL Generation
The SQL is built dynamically based on the current canvas state:
1. **SELECT**: Gathers all pinned columns from reachable tables.
2. **JOIN**: Iterates through active joins between reachable tables.
3. **WHERE**: Processes filters (supports `=`, `>`, `LIKE`, `IN`, `IS NULL`, etc.).
