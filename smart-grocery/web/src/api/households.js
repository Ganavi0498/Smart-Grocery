import { apiRequest } from "./client";

export function getCurrentHousehold(token) {
  return apiRequest("/api/households/current", { token });
}

export function createHousehold(token, name) {
  return apiRequest("/api/households", {
    method: "POST",
    token,
    body: { name },
  });
}

export function joinHousehold(token, inviteCode) {
  return apiRequest("/api/households/join", {
    method: "POST",
    token,
    body: { inviteCode },
  });
}
