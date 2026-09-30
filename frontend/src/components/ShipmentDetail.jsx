import { useEffect, useState } from "react";
import { api } from "../api.js";

function getProgress(shipment, report) {
  if (!shipment || !report) return 0;
  const hasReadings = shipment.readings.length > 0;
  const deviationsClosed = shipment.deviations.length === 0 || shipment.deviations.every((d) => d.capaStatus === "closed");
  const terminal = ["delivered", "released"].includes(shipment.status);
  const steps = [true, hasReadings, deviationsClosed, terminal];
  return Math.round((steps.filter(Boolean).length / steps.length) * 100);
}

export default function ShipmentDetail({ shipmentId, onChanged }) {
  const [shipment, setShipment] = useState(null);
  const [report, setReport] = useState(null);
  const [reading, setReading] = useState({ temperatureC: "", location: "", sensorId: "SENSOR-001" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resolutionDraft, setResolutionDraft] = useState({});

  const refresh = async () => {
    try {
      setLoading(true);
      const [s, r] = await Promise.all([api.getShipment(shipmentId), api.getReport(shipmentId)]);
      setShipment(s);
      setReport(r);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  if (!shipment) return <div className="card empty-state">{loading ? "Loading shipment details..." : "Select a shipment to view details."}</div>;

  const progress = getProgress(shipment, report);
  const hasReadings = shipment.readings.length > 0;
  const deviationsClosed = shipment.deviations.length === 0 || shipment.deviations.every((d) => d.capaStatus === "closed");
  const terminal = ["delivered", "released"].includes(shipment.status);

  return (
    <div>
      {error && <div className="error">{error}</div>}

      <div className="card">
        <div className="detail-heading">
          <div><div className="eyebrow">Shipment overview</div><h2>{shipment.productName} <span className={`badge ${shipment.status}`}>{shipment.status.replace("_", " ")}</span></h2><p className="route">{shipment.origin} to {shipment.destination} · Batch {shipment.batchNumber}</p></div>
          <span className="metric-label">{shipment.tempRangeC[0]} to {shipment.tempRangeC[1]}°C target</span>
        </div>
        <div className="progress-wrap"><div className="progress-label"><span>Workflow completion</span><strong>{progress}%</strong></div><div className="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100"><div className="progress-fill" style={{ width: `${progress}%` }} /></div></div>
        <div className="workflow" aria-label="Shipment workflow">
          <div className="workflow-step done">Created</div><div className={`workflow-step ${hasReadings ? "done" : "current"}`}>Monitoring</div><div className={`workflow-step ${deviationsClosed ? "done" : "current"}`}>Review</div><div className={`workflow-step ${terminal ? "done" : "current"}`}>Release</div>
        </div>
        <div className="button-row">
          <button className="secondary" onClick={() => setStatus("released")}>Mark Released</button>
          <button className="secondary" onClick={() => setStatus("rejected")}>Mark Rejected</button>
        </div>
      </div>

      <div className="card">
        <h2>Record Temperature Reading</h2>
        <form className="readings-form" onSubmit={submitReading}>
          <input aria-label="Temperature in Celsius"
            type="number"
            step="0.1"
            placeholder="Temp °C"
            value={reading.temperatureC}
            onChange={(e) => setReading({ ...reading, temperatureC: e.target.value })}
            required
          />
          <input aria-label="Reading location"
            placeholder="Location"
            value={reading.location}
            onChange={(e) => setReading({ ...reading, location: e.target.value })}
            required
          />
          <input aria-label="Sensor ID"
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
          <div key={d.deviationId} className="deviation">
            <span className={`badge ${d.severity}`}>{d.severity}</span> {d.description}
            <div className="deviation-meta">
              Status: {d.capaStatus} {d.resolutionNotes && `— ${d.resolutionNotes}`}
            </div>
            {d.capaStatus !== "closed" && (
              <div className="deviation-controls">
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
