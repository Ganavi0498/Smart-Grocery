import { apiRequest } from "./client";

export function getCurrentGroceryList(token) {
  return apiRequest("/api/lists/current", { token });
}

export function addGroceryItem(token, payload) {
  return apiRequest("/api/lists/items", { method: "POST", token, body: payload });
}

export function updateGroceryItem(token, itemId, payload) {
  return apiRequest(`/api/lists/items/${itemId}`, { method: "PATCH", token, body: payload });
}

export function deleteGroceryItem(token, itemId) {
  return apiRequest(`/api/lists/items/${itemId}`, { method: "DELETE", token });
}

export function syncLowStock(token) {
  return apiRequest("/api/lists/sync-low-stock", { method: "POST", token });
}

export function completeList(token) {
  return apiRequest("/api/lists/complete", { method: "POST", token });
}
