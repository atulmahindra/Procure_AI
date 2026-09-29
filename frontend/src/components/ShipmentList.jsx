export default function ShipmentList({ shipments, selectedId, onSelect }) {
  return (
    <div className="card">
      <h2>Shipments</h2>
      {shipments.length === 0 && <div className="empty-state">No shipments yet.</div>}
      {shipments.map((s) => (
        <div
          key={s.shipmentId}
          className={`shipment-item ${s.shipmentId === selectedId ? "active" : ""}`}
          onClick={() => onSelect(s.shipmentId)}
        >
          <strong>{s.productName}</strong> — {s.batchNumber}
          <div>
            <span className={`badge ${s.status}`}>{s.status.replace("_", " ")}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
