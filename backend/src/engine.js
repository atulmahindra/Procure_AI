/**
 * GDPComplianceEngine
 * --------------------
 * Core business logic for GDP (Good Distribution Practice) process automation:
 *   - Shipment lifecycle tracking
 *   - Temperature/humidity excursion detection
 *   - Deviation + CAPA (Corrective/Preventive Action) workflow
 *   - Immutable-style audit trail per shipment
 *   - Compliance report generation
 *
 * NOTE: In-memory store for demo purposes. Swap `this.shipments` for a real
 * database (Postgres/Mongo) before production use, and add authentication,
 * e-signatures, and access control for 21 CFR Part 11 / Annex 11 alignment.
 */

import { v4 as uuidv4 } from "uuid";

export const ShipmentStatus = Object.freeze({
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  QUARANTINED: "quarantined",
  RELEASED: "released",
  REJECTED: "rejected",
});

export const DeviationSeverity = Object.freeze({
  MINOR: "minor",
  MAJOR: "major",
  CRITICAL: "critical",
});

const DEMO_SHIPMENTS = [
  {
    shipmentId: "SHP-DEMO0001",
    productName: "Demo Cold-Chain Vaccine",
    batchNumber: "DEMO-2026-001",
    origin: "Copenhagen Distribution Center",
    destination: "Aarhus Regional Clinic",
    tempRangeC: [2, 8],
  },
  {
    shipmentId: "SHP-DEMO0002",
    productName: "Demo Insulin",
    batchNumber: "DEMO-2026-002",
    origin: "Berlin Distribution Hub",
    destination: "Hamburg Medical Center",
    tempRangeC: [2, 8],
  },
  {
    shipmentId: "SHP-DEMO0003",
    productName: "Demo Biologic Therapy",
    batchNumber: "DEMO-2026-003",
    origin: "Amsterdam Pharma Warehouse",
    destination: "Rotterdam University Hospital",
    tempRangeC: [2, 8],
  },
];

function classifySeverity(excursionMagnitude) {
  if (excursionMagnitude <= 1.0) return DeviationSeverity.MINOR;
  if (excursionMagnitude <= 5.0) return DeviationSeverity.MAJOR;
  return DeviationSeverity.CRITICAL;
}

export class GDPComplianceEngine {
  constructor() {
    /** @type {Map<string, object>} */
    this.shipments = new Map();

    for (const demo of DEMO_SHIPMENTS) {
      const shipment = {
        ...demo,
        tempRangeC: [...demo.tempRangeC],
        status: ShipmentStatus.IN_TRANSIT,
        readings: [],
        deviations: [],
        auditTrail: [],
        createdAt: new Date().toISOString(),
      };
      this._logAudit(shipment, "demo_seed", "SHIPMENT_CREATED", `Seeded demo batch ${demo.batchNumber}`);
      this.shipments.set(shipment.shipmentId, shipment);
    }
  }

  // ---- Shipment lifecycle -------------------------------------------------

  createShipment({ productName, batchNumber, origin, destination, tempRangeC, actor }) {
    const shipmentId = `SHP-${uuidv4().slice(0, 8).toUpperCase()}`;
    const shipment = {
      shipmentId,
      productName,
      batchNumber,
      origin,
      destination,
      tempRangeC, // [min, max]
      status: ShipmentStatus.IN_TRANSIT,
      readings: [],
      deviations: [],
      auditTrail: [],
      createdAt: new Date().toISOString(),
    };

    this._logAudit(shipment, actor, "SHIPMENT_CREATED",
      `Batch ${batchNumber} of ${productName} from ${origin} to ${destination}`);

    this.shipments.set(shipmentId, shipment);
    return shipment;
  }

  listShipments() {
    return Array.from(this.shipments.values());
  }

  getShipment(shipmentId) {
    const shipment = this.shipments.get(shipmentId);
    if (!shipment) {
      const err = new Error(`Unknown shipment_id: ${shipmentId}`);
      err.statusCode = 404;
      throw err;
    }
    return shipment;
  }

  recordTemperature({ shipmentId, temperatureC, location, sensorId, timestamp }) {
    const shipment = this.getShipment(shipmentId);
    const reading = {
      timestamp: timestamp || new Date().toISOString(),
      temperatureC,
      location,
      sensorId,
    };
    shipment.readings.push(reading);
    this._logAudit(shipment, "SYSTEM", "TEMP_READING_RECORDED",
      `${temperatureC}°C at ${location} (sensor ${sensorId})`);

    const [minTemp, maxTemp] = shipment.tempRangeC;
    if (temperatureC < minTemp || temperatureC > maxTemp) {
      return this._raiseExcursionDeviation(shipment, reading, minTemp, maxTemp);
    }
    return null;
  }

  updateStatus({ shipmentId, status, actor, reason = "" }) {
    const shipment = this.getShipment(shipmentId);
    if (!Object.values(ShipmentStatus).includes(status)) {
      const err = new Error(`Invalid status: ${status}`);
      err.statusCode = 400;
      throw err;
    }
    shipment.status = status;
    this._logAudit(shipment, actor, "STATUS_CHANGED", `New status: ${status}. ${reason}`.trim());
    return shipment;
  }

  // ---- Deviation / CAPA handling -------------------------------------------

  _raiseExcursionDeviation(shipment, reading, minTemp, maxTemp) {
    const excursion = Math.min(
      Math.abs(reading.temperatureC - minTemp),
      Math.abs(reading.temperatureC - maxTemp)
    );
    const severity = classifySeverity(excursion);
    const capaRequired = severity === DeviationSeverity.MAJOR || severity === DeviationSeverity.CRITICAL;

    const deviation = {
      deviationId: `DEV-${uuidv4().slice(0, 8).toUpperCase()}`,
      shipmentId: shipment.shipmentId,
      description: `Temperature excursion: ${reading.temperatureC}°C recorded at ` +
        `${reading.location}, outside allowed range ${minTemp}-${maxTemp}°C`,
      severity,
      detectedAt: reading.timestamp,
      capaRequired,
      capaStatus: "open",
      resolutionNotes: null,
    };

    shipment.deviations.push(deviation);

    if (capaRequired) {
      shipment.status = ShipmentStatus.QUARANTINED;
    }

    this._logAudit(shipment, "SYSTEM", "DEVIATION_RAISED",
      `${deviation.deviationId} (${severity}) — shipment quarantined: ${capaRequired}`);

    return deviation;
  }

  closeDeviation({ shipmentId, deviationId, resolutionNotes, actor }) {
    const shipment = this.getShipment(shipmentId);
    const deviation = shipment.deviations.find((d) => d.deviationId === deviationId);
    if (!deviation) {
      const err = new Error(`Deviation ${deviationId} not found for shipment ${shipmentId}`);
      err.statusCode = 404;
      throw err;
    }
    deviation.capaStatus = "closed";
    deviation.resolutionNotes = resolutionNotes;
    this._logAudit(shipment, actor, "DEVIATION_CLOSED", `${deviationId} closed: ${resolutionNotes}`);
    return deviation;
  }

  // ---- Reporting ------------------------------------------------------------

  generateComplianceReport(shipmentId) {
    const shipment = this.getShipment(shipmentId);
    const openDeviations = shipment.deviations.filter((d) => d.capaStatus !== "closed");
    const temps = shipment.readings.map((r) => r.temperatureC);

    return {
      shipmentId: shipment.shipmentId,
      productName: shipment.productName,
      batchNumber: shipment.batchNumber,
      route: `${shipment.origin} -> ${shipment.destination}`,
      status: shipment.status,
      allowedTempRangeC: shipment.tempRangeC,
      readingCount: shipment.readings.length,
      tempMinRecorded: temps.length ? Math.min(...temps) : null,
      tempMaxRecorded: temps.length ? Math.max(...temps) : null,
      totalDeviations: shipment.deviations.length,
      openDeviations: openDeviations.length,
      compliant: openDeviations.length === 0,
      auditEventCount: shipment.auditTrail.length,
      generatedAt: new Date().toISOString(),
    };
  }

  // ---- Internal helpers -------------------------------------------------

  _logAudit(shipment, actor, action, details) {
    shipment.auditTrail.push({
      eventId: uuidv4(),
      timestamp: new Date().toISOString(),
      actor,
      action,
      details,
    });
  }
}
