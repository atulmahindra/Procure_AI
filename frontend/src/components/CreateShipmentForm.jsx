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
    <div className="card">
      <h2>New Shipment</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={submit}>
        <input placeholder="Product name" value={form.productName} onChange={update("productName")} required />
        <input placeholder="Batch number" value={form.batchNumber} onChange={update("batchNumber")} required />
        <input placeholder="Origin" value={form.origin} onChange={update("origin")} required />
        <input placeholder="Destination" value={form.destination} onChange={update("destination")} required />
        <div style={{ display: "flex", gap: 8 }}>
          <input type="number" step="0.1" placeholder="Min °C" value={form.tempMinC} onChange={update("tempMinC")} required />
          <input type="number" step="0.1" placeholder="Max °C" value={form.tempMaxC} onChange={update("tempMaxC")} required />
        </div>
        <button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Shipment"}
        </button>
      </form>
    </div>
  );
}
