import { useState } from "react";
import { api } from "../api.js";

export default function CreateShipmentForm({ onCreated }) {
  const [form, setForm] = useState({
    productName: "",
    batchNumber: "",
    origin: "",
    destination: "",
    tempMinC: 2,
    tempMaxC: 8,
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const shipment = await api.createShipment({ ...form, actor: "warehouse_ops" });
      onCreated(shipment);
      setForm({ productName: "", batchNumber: "", origin: "", destination: "", tempMinC: 2, tempMaxC: 8 });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card new-shipment-card">
      <h2>New Shipment</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={submit}>
        <label className="form-field">Product name<input placeholder="e.g. Insulin" value={form.productName} onChange={update("productName")} required /></label>
        <label className="form-field">Batch number<input placeholder="e.g. BATCH-2026-04" value={form.batchNumber} onChange={update("batchNumber")} required /></label>
        <label className="form-field">Origin<input placeholder="Distribution center" value={form.origin} onChange={update("origin")} required /></label>
        <label className="form-field">Destination<input placeholder="Receiving clinic" value={form.destination} onChange={update("destination")} required /></label>
        <div className="button-row">
          <label className="form-field">Min °C<input type="number" step="0.1" value={form.tempMinC} onChange={update("tempMinC")} required /></label>
          <label className="form-field">Max °C<input type="number" step="0.1" value={form.tempMaxC} onChange={update("tempMaxC")} required /></label>
        </div>
        <button className="create-button" type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Shipment"}
        </button>
      </form>
    </div>
  );
}
