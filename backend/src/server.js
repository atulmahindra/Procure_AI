import express from "express";
import cors from "cors";
import { GDPComplianceEngine } from "./engine.js";

const app = express();
const engine = new GDPComplianceEngine();

app.use(cors());
app.use(express.json());

// Simple request logger — replace with a real logger (pino/winston) in production
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ---- Shipments -------------------------------------------------------------

app.post("/api/shipments", (req, res, next) => {
  try {
    const { productName, batchNumber, origin, destination, tempMinC, tempMaxC, actor } = req.body;
    if (!productName || !batchNumber || !origin || !destination || tempMinC == null || tempMaxC == null) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const shipment = engine.createShipment({
      productName,
      batchNumber,
      origin,
      destination,
      tempRangeC: [Number(tempMinC), Number(tempMaxC)],
      actor: actor || "unknown",
    });
    res.status(201).json(shipment);
  } catch (err) {
    next(err);
  }
});

app.get("/api/shipments", (_req, res) => {
  res.json(engine.listShipments());
});

app.get("/api/shipments/:id", (req, res, next) => {
  try {
    res.json(engine.getShipment(req.params.id));
  } catch (err) {
    next(err);
  }
});

app.patch("/api/shipments/:id/status", (req, res, next) => {
  try {
    const { status, actor, reason } = req.body;
    const shipment = engine.updateStatus({
      shipmentId: req.params.id,
      status,
      actor: actor || "unknown",
      reason,
    });
    res.json(shipment);
  } catch (err) {
    next(err);
  }
});

// ---- Temperature readings ---------------------------------------------------

app.post("/api/shipments/:id/readings", (req, res, next) => {
  try {
    const { temperatureC, location, sensorId } = req.body;
    if (temperatureC == null || !location || !sensorId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const deviation = engine.recordTemperature({
      shipmentId: req.params.id,
      temperatureC: Number(temperatureC),
      location,
      sensorId,
    });
    res.status(201).json({ shipment: engine.getShipment(req.params.id), deviation });
  } catch (err) {
    next(err);
  }
});

// ---- Deviations / CAPA -------------------------------------------------------

app.post("/api/shipments/:id/deviations/:deviationId/close", (req, res, next) => {
  try {
    const { resolutionNotes, actor } = req.body;
    if (!resolutionNotes) {
      return res.status(400).json({ error: "resolutionNotes is required" });
    }
    const deviation = engine.closeDeviation({
      shipmentId: req.params.id,
      deviationId: req.params.deviationId,
      resolutionNotes,
      actor: actor || "unknown",
    });
    res.json(deviation);
  } catch (err) {
    next(err);
  }
});

// ---- Reporting ----------------------------------------------------------------

app.get("/api/shipments/:id/report", (req, res, next) => {
  try {
    res.json(engine.generateComplianceReport(req.params.id));
  } catch (err) {
    next(err);
  }
});

app.get("/api/shipments/:id/audit-trail", (req, res, next) => {
  try {
    res.json(engine.getShipment(req.params.id).auditTrail);
  } catch (err) {
    next(err);
  }
});

// ---- Error handling -------------------------------------------------------------

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`GDP automation API listening on http://localhost:${PORT}`);
});
