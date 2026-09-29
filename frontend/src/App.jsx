import { useEffect, useState } from "react";
import { api } from "./api.js";
import CreateShipmentForm from "./components/CreateShipmentForm.jsx";
import ShipmentList from "./components/ShipmentList.jsx";
import ShipmentDetail from "./components/ShipmentDetail.jsx";

export default function App() {
  const [shipments, setShipments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const refresh = async () => {
    const list = await api.listShipments();
    setShipments(list);
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
      <h1>GDP Process Automation</h1>
      <p className="subtitle">Cold-chain monitoring · deviation/CAPA workflow · audit trail · compliance reporting</p>

      <div className="layout">
        <div>
          <CreateShipmentForm onCreated={handleCreated} />
          <ShipmentList shipments={shipments} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <div>
          <ShipmentDetail shipmentId={selectedId} onChanged={refresh} />
        </div>
      </div>
    </div>
  );
}
