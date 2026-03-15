# Quantum Workbench | Technical Guide

This document outlines the API architecture and frontend implementation logic for the Quantum Workbench SQL Builder.

## 1. External API Configuration

To point the workbench to your own backend, set the following environment variable in your `.env.local` file:

`NEXT_PUBLIC_API_URL=https://your-backend-api.com/api`

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

### 2.2 Profiles & Templates
- `GET /profiles`: List saved workbench profiles.
- `POST /profiles`: Save current canvas state.
- `GET /templates`: List reusable graph templates.

### 2.3 Query Execution
- `POST /query/execute`: Executes a structured query.
- `POST /query/validate`: Validates graph connectivity.

**Request Body (`POST /query/execute`):**
```json
{
  "connectionId": "c1",
  "rootTableId": "orders_123",
  "joins": [
    {
      "id": "j1",
      "sourceTableId": "orders_123",
      "sourceColumn": "customer_id",
      "targetTableId": "cust_456",
      "targetColumn": "id",
      "type": "INNER",
      "active": true
    }
  ],
  "selectedColumns": [
    { "tableId": "orders_123", "column": "total" }
  ],
  "filters": [
    { "tableId": "orders_123", "column": "status", "operator": "=", "value": "PAID" }
  ],
  "limit": 50,
  "params": { "customerId": "uuid" }
}
```

---

## 3. Implementation Logic

### 3.1 Graph Engine
The application manages state through `WorkbenchContext`. It calculates table reachability reactively. If a table is added but not connected to the "Root Table" (Anchor), it is excluded from SQL generation and marked as "Unreachable" in the UI.

### 3.2 SQL Generation
The SQL is built dynamically based on the current canvas state:
1. **SELECT**: Gathers all pinned columns from reachable tables.
2. **JOIN**: Iterates through active joins between reachable tables.
3. **WHERE**: Processes filters (supports `=`, `>`, `LIKE`, `IN`, `IS NULL`, etc.).
4. **ORDER BY**: Applies sorting rules.
5. **LIMIT**: Finalizes the result set size.
