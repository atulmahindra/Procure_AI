# GDP Process Automation — Node.js + React

A working example of GDP (Good Distribution Practice) process automation:
cold-chain temperature monitoring, automatic deviation/CAPA workflow,
audit trail logging, and compliance reporting.

**Stack:** Node.js/Express REST API (backend) + React/Vite SPA (frontend).

> ⚠️ This is a demo/starting scaffold, not a validated GxP system. Before any
> production use you'd need: a real database instead of in-memory storage,
> authentication + role-based access control, e-signatures and tamper-evident
> logging for 21 CFR Part 11 / EU Annex 11 alignment, and formal
> validation (IQ/OQ/PQ) per your quality system.

## Structure

```
gdp-automation-app/
├── backend/          Node.js + Express API
│   ├── src/
│   │   ├── engine.js    Core business logic (shipments, deviations, audit trail)
│   │   └── server.js    REST API routes
│   └── package.json
└── frontend/         React + Vite SPA
    ├── src/
    │   ├── App.jsx
    │   ├── api.js         API client
    │   └── components/    ShipmentList, ShipmentDetail, CreateShipmentForm
    └── package.json
```

## Running it

### 1. Backend

```bash
cd backend
npm install
npm run dev        # starts on http://localhost:4000
```

### 2. Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev         # starts on http://localhost:5173
```

The Vite dev server proxies `/api/*` requests to the backend on port 4000
(see `frontend/vite.config.js`), so just open http://localhost:5173.

## What it does

1. **Create a shipment** with a product, batch number, route, and allowed
   temperature range (e.g., 2–8°C for a cold-chain vaccine).
2. **Log temperature readings** as they come in from transport/sensors.
   Any reading outside the allowed range automatically raises a
   **deviation** and — for major/critical excursions — quarantines the
   shipment.
3. **Investigate and close deviations** with resolution notes (a lightweight
   CAPA record).
4. **View the compliance report** — open vs. closed deviations, recorded
   temperature range, and overall compliant/non-compliant status.
5. **Review the audit trail** — every action (creation, readings, status
   changes, deviation closure) is timestamped and attributed to an actor.

## API reference

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/shipments` | Create a shipment |
| GET | `/api/shipments` | List all shipments |
| GET | `/api/shipments/:id` | Get one shipment |
| PATCH | `/api/shipments/:id/status` | Update shipment status |
| POST | `/api/shipments/:id/readings` | Log a temperature reading (auto-checks for excursions) |
| POST | `/api/shipments/:id/deviations/:deviationId/close` | Close a deviation with resolution notes |
| GET | `/api/shipments/:id/report` | Get compliance report |
| GET | `/api/shipments/:id/audit-trail` | Get full audit trail |

## Extending toward production

- **Database:** swap the `Map` in `engine.js` for Postgres/Mongo with an ORM
  (Prisma/Sequelize/Mongoose).
- **Auth:** add JWT or session-based auth, and tie `actor` fields to
  authenticated users rather than free-text strings.
- **Real sensors:** replace manual reading entry with an ingestion endpoint
  or MQTT/webhook listener for IoT cold-chain sensors.
- **Notifications:** hook deviation creation into email/Slack/Teams alerts
  for QA on-call.
- **Angular instead of React:** the backend API is framework-agnostic —
  you'd only need to rebuild `frontend/` as an Angular app using
  `HttpClient` in place of `api.js`'s `fetch` calls; the REST contract
  stays the same.
