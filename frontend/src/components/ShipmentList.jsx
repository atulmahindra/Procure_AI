export default function ShipmentList({ shipments, selectedId, onSelect, loading }) {
  return (
    <div className="card">
      <h2>Shipments <span className="metric-label">{shipments.length} tracked</span></h2>
      {loading && <><div className="skeleton" /><div className="skeleton" /><div className="skeleton" /></>}
      {shipments.length === 0 && <div className="empty-state">No shipments yet.</div>}
      {!loading && shipments.map((s) => (
        <div
          key={s.shipmentId}
          className={`shipment-item ${s.shipmentId === selectedId ? "active" : ""}`}
          onClick={() => onSelect(s.shipmentId)}
          onKeyDown={(e) => e.key === "Enter" && onSelect(s.shipmentId)}
          role="button"
          tabIndex="0"
        >
          <div className="shipment-title"><span>{s.productName}</span><span className={`badge ${s.status}`}>{s.status.replace("_", " ")}</span></div>
          <div className="shipment-meta">{s.batchNumber} · {s.origin} to {s.destination}</div>
        </div>
      ))}
    </div>
  );
}
