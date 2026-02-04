import { apiRequest } from "./client";

export function listInventory(token, { filter, days } = {}) {
  const qs = new URLSearchParams();
  if (filter) qs.set("filter", filter);
  if (days !== undefined && days !== null) qs.set("days", String(days));

  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiRequest(`/api/inventory${suffix}`, { token });
}

export function createInventoryItem(token, payload) {
  return apiRequest("/api/inventory", {
    method: "POST",
    token,
    body: payload,
  });
}

export function updateInventoryItem(token, id, payload) {
  return apiRequest(`/api/inventory/${id}`, {
    method: "PATCH",
    token,
    body: payload,
  });
}

export function deleteInventoryItem(token, id) {
  return apiRequest(`/api/inventory/${id}`, {
    method: "DELETE",
    token,
  });
}
