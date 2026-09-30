import { useEffect, useState } from "react";
import { api } from "./api.js";
import CreateShipmentForm from "./components/CreateShipmentForm.jsx";
import ShipmentList from "./components/ShipmentList.jsx";
import ShipmentDetail from "./components/ShipmentDetail.jsx";

export default function App() {
  const [shipments, setShipments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = async () => {
    try {
      setError(null);
      const list = await api.listShipments();
      setShipments(list);
      setSelectedId((currentId) =>
        list.some((shipment) => shipment.shipmentId === currentId)
          ? currentId
          : list[0]?.shipmentId ?? null
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreated = async (shipment) => {
    await refresh();
    setSelectedId(shipment.shipmentId);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand-lockup">
          <div className="title-row">
            <div className="brand-logo" aria-label="Medical operations logo">+</div>
            <h1>GDP Process Automation</h1>
          </div>
          <p className="subtitle">Cold-chain visibility with compliance built into every handoff.</p>
        </div>
        <div className="header-status"><span className="status-dot" /> System operational</div>
      </header>

      <section className="metric-grid" aria-label="Shipment overview">
        <div className="metric-card"><span className="metric-label">Active shipments</span><strong>{shipments.filter((s) => s.status === "in_transit").length}</strong><span className="metric-note">In transit now</span></div>
        <div className="metric-card"><span className="metric-label">Needs attention</span><strong>{shipments.filter((s) => s.status === "quarantined").length}</strong><span className="metric-note">Quarantined batches</span></div>
        <div className="metric-card"><span className="metric-label">Total tracked</span><strong>{shipments.length}</strong><span className="metric-note">Across all routes</span></div>
      </section>

      {error && <div className="alert error" role="alert">{error}</div>}

      <div className="layout">
        <div>
          <CreateShipmentForm onCreated={handleCreated} />
          <ShipmentList shipments={shipments} selectedId={selectedId} onSelect={setSelectedId} loading={loading} />
        </div>
        <main>
          <ShipmentDetail shipmentId={selectedId} onChanged={refresh} />
        </main>
      </div>
    </div>
  );
}
