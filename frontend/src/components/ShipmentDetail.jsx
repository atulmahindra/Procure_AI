import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function ShipmentDetail({ shipmentId, onChanged }) {
  const [shipment, setShipment] = useState(null);
  const [report, setReport] = useState(null);
  const [reading, setReading] = useState({ temperatureC: "", location: "", sensorId: "SENSOR-001" });
  const [error, setError] = useState(null);
  const [resolutionDraft, setResolutionDraft] = useState({});

  const refresh = async () => {
    try {
      const [s, r] = await Promise.all([api.getShipment(shipmentId), api.getReport(shipmentId)]);
      setShipment(s);
      setReport(r);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (shipmentId) refresh();
  }, [shipmentId]);

  const submitReading = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.recordReading(shipmentId, {
        temperatureC: Number(reading.temperatureC),
        location: reading.location,
        sensorId: reading.sensorId,
      });
      setReading({ ...reading, temperatureC: "", location: "" });
      await refresh();
      onChanged?.();
    } catch (err) {
      setError(err.message);
    }
  };

  const closeDeviation = async (deviationId) => {
    const notes = resolutionDraft[deviationId];
    if (!notes) return;
    try {
      await api.closeDeviation(shipmentId, deviationId, { resolutionNotes: notes, actor: "qa_reviewer" });
      await refresh();
      onChanged?.();
    } catch (err) {
      setError(err.message);
    }
  };

  const setStatus = async (status) => {
    try {
      await api.updateStatus(shipmentId, { status, actor: "qa_reviewer", reason: "Manual override" });
      await refresh();
      onChanged?.();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!shipment) return <div className="card empty-state">Select a shipment to view details.</div>;

  return (
    <div>
      {error && <div className="error">{error}</div>}

      <div className="card">
        <h2>
          {shipment.productName} — {shipment.batchNumber}{" "}
          <span className={`badge ${shipment.status}`}>{shipment.status.replace("_", " ")}</span>
        </h2>
        <p>
          {shipment.origin} → {shipment.destination} · Allowed range: {shipment.tempRangeC[0]}°C to{" "}
          {shipment.tempRangeC[1]}°C
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="secondary" onClick={() => setStatus("released")}>Mark Released</button>
          <button className="secondary" onClick={() => setStatus("rejected")}>Mark Rejected</button>
        </div>
      </div>

      <div className="card">
        <h2>Record Temperature Reading</h2>
        <form className="readings-form" onSubmit={submitReading}>
          <input
            type="number"
            step="0.1"
            placeholder="Temp °C"
            value={reading.temperatureC}
            onChange={(e) => setReading({ ...reading, temperatureC: e.target.value })}
            required
          />
          <input
            placeholder="Location"
            value={reading.location}
            onChange={(e) => setReading({ ...reading, location: e.target.value })}
            required
          />
          <input
            placeholder="Sensor ID"
            value={reading.sensorId}
            onChange={(e) => setReading({ ...reading, sensorId: e.target.value })}
            required
          />
          <button type="submit">Log Reading</button>
        </form>

        <table>
          <thead>
            <tr><th>Time</th><th>Temp (°C)</th><th>Location</th><th>Sensor</th></tr>
          </thead>
          <tbody>
            {shipment.readings.slice().reverse().map((r, i) => (
              <tr key={i}>
                <td>{new Date(r.timestamp).toLocaleTimeString()}</td>
                <td>{r.temperatureC}</td>
                <td>{r.location}</td>
                <td>{r.sensorId}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {shipment.readings.length === 0 && <div className="empty-state">No readings logged yet.</div>}
      </div>

      <div className="card">
        <h2>Deviations</h2>
        {shipment.deviations.length === 0 && <div className="empty-state">No deviations raised.</div>}
        {shipment.deviations.map((d) => (
          <div key={d.deviationId} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #eee" }}>
            <span className={`badge ${d.severity}`}>{d.severity}</span> {d.description}
            <div style={{ fontSize: "0.8rem", color: "#666" }}>
              Status: {d.capaStatus} {d.resolutionNotes && `— ${d.resolutionNotes}`}
            </div>
            {d.capaStatus !== "closed" && (
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <input
                  placeholder="Resolution notes"
                  value={resolutionDraft[d.deviationId] || ""}
                  onChange={(e) => setResolutionDraft({ ...resolutionDraft, [d.deviationId]: e.target.value })}
                  style={{ marginBottom: 0 }}
                />
                <button onClick={() => closeDeviation(d.deviationId)}>Close</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Compliance Report</h2>
        {report && (
          <table>
            <tbody>
              <tr><td>Compliant</td><td>{report.compliant ? "Yes" : "No"}</td></tr>
              <tr><td>Readings recorded</td><td>{report.readingCount}</td></tr>
              <tr><td>Temp range recorded</td><td>{report.tempMinRecorded}°C to {report.tempMaxRecorded}°C</td></tr>
              <tr><td>Open deviations</td><td>{report.openDeviations} / {report.totalDeviations}</td></tr>
              <tr><td>Audit events</td><td>{report.auditEventCount}</td></tr>
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h2>Audit Trail</h2>
        <table>
          <thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Details</th></tr></thead>
          <tbody>
            {shipment.auditTrail.slice().reverse().map((e) => (
              <tr key={e.eventId}>
                <td>{new Date(e.timestamp).toLocaleTimeString()}</td>
                <td>{e.actor}</td>
                <td>{e.action}</td>
                <td>{e.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
