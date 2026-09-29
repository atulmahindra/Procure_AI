const BASE = (import.meta.env.VITE_API_BASE_URL || "https://gdp-automation-app-mn7d.vercel.app/api").replace(/\/+$/, "");

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data;
}

export const api = {
  listShipments: () => request("/shipments"),
  getShipment: (id) => request(`/shipments/${id}`),
  createShipment: (payload) =>
    request("/shipments", { method: "POST", body: JSON.stringify(payload) }),
  updateStatus: (id, payload) =>
    request(`/shipments/${id}/status`, { method: "PATCH", body: JSON.stringify(payload) }),
  recordReading: (id, payload) =>
    request(`/shipments/${id}/readings`, { method: "POST", body: JSON.stringify(payload) }),
  closeDeviation: (shipmentId, deviationId, payload) =>
    request(`/shipments/${shipmentId}/deviations/${deviationId}/close`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getReport: (id) => request(`/shipments/${id}/report`),
  getAuditTrail: (id) => request(`/shipments/${id}/audit-trail`),
};
