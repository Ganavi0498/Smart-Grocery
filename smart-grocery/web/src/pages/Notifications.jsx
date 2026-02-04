// web/src/pages/Notifications.jsx
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";

const PRESET_WINDOWS = [14, 7, 3, 1];

export default function Notifications() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [items, setItems] = useState([]);
  const [expiryWindows, setExpiryWindows] = useState([7, 3]);

  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });

  // Token: safe for both styles:
  // - if apiRequest expects token param -> we pass it
  // - if apiRequest ignores extra params -> JS ignores extra args
  const token = useMemo(() => localStorage.getItem("sg_token"), []);

  const selected = useMemo(() => new Set(expiryWindows), [expiryWindows]);

  function showToast(msg, severity = "success") {
    setToast({ open: true, msg, severity });
  }

  async function loadAll() {
    setLoading(true);
    try {
      // Preferences (optional endpoint; we tolerate if missing)
      try {
        const prefs = await apiRequest("/api/notifications/prefs", { method: "GET", token });
        if (Array.isArray(prefs?.expiryWindows) && prefs.expiryWindows.length > 0) {
          setExpiryWindows(prefs.expiryWindows);
        }
      } catch {
        // ignore prefs failure; defaults stay
      }

      const res = await apiRequest("/api/notifications", { method: "GET", token });
      setItems(Array.isArray(res?.items) ? res.items : []);
    } catch (e) {
      showToast(e?.message || "Failed to load notifications", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleWindow(w) {
    const next = new Set(selected);
    if (next.has(w)) next.delete(w);
    else next.add(w);

    const normalized = Array.from(next)
      .map(Number)
      .filter((n) => Number.isFinite(n) && n > 0 && n <= 90)
      .sort((a, b) => b - a);

    setExpiryWindows(normalized);
  }

  async function savePrefs() {
    setBusy(true);
    try {
      const res = await apiRequest(
        "/api/notifications/prefs",
        {
          method: "PUT",
          body: { expiryWindows },
          token,
        }
      );

      if (Array.isArray(res?.expiryWindows)) {
        setExpiryWindows(res.expiryWindows);
      }

      showToast("Reminder settings saved");
    } catch (e) {
      showToast(e?.message || "Failed to save settings", "error");
    } finally {
      setBusy(false);
    }
  }

  async function generateNow() {
    setBusy(true);
    try {
      const res = await apiRequest(
        "/api/notifications/generate-expiry",
        {
          method: "POST",
          body: { expiryWindows },
          token,
        }
      );

      const created = Number(res?.created ?? 0);
      showToast(`Generated ${created} notification(s)`);

      // Reload list after generation
      await loadAll();
    } catch (e) {
      showToast(e?.message || "Failed to generate notifications", "error");
    } finally {
      setBusy(false);
    }
  }

  async function markRead(id) {
    setBusy(true);
    try {
      const res = await apiRequest(`/api/notifications/${id}/read`, { method: "PATCH", token });
      const updated = res?.item;

      setItems((prev) =>
        prev.map((n) => (n._id === id ? { ...n, ...(updated || {}), readAt: updated?.readAt || new Date().toISOString() } : n))
      );
    } catch (e) {
      showToast(e?.message || "Failed to mark as read", "error");
    } finally {
      setBusy(false);
    }
  }

  async function dismiss(id) {
    setBusy(true);
    try {
      await apiRequest(`/api/notifications/${id}/dismiss`, { method: "PATCH", token });
      setItems((prev) => prev.filter((n) => n._id !== id));
    } catch (e) {
      showToast(e?.message || "Failed to dismiss", "error");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 950, mx: "auto", px: 2, py: 3 }}>
      <Typography variant="h5" sx={{ mb: 0.5 }}>
        Notifications
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
        Expiry reminders are generated based on your configured windows (e.g., 7 and 3 days).
      </Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Reminder windows
          </Typography>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            {PRESET_WINDOWS.map((w) => (
              <Chip
                key={w}
                label={`${w} day(s)`}
                variant={selected.has(w) ? "filled" : "outlined"}
                onClick={() => toggleWindow(w)}
                sx={{ mb: 1 }}
              />
            ))}
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button variant="contained" onClick={savePrefs} disabled={busy || expiryWindows.length === 0}>
              Save settings
            </Button>
            <Button variant="outlined" onClick={generateNow} disabled={busy || expiryWindows.length === 0}>
              Generate now
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Divider sx={{ my: 2 }} />

      {items.length === 0 ? (
        <Typography>No notifications right now.</Typography>
      ) : (
        <Stack spacing={2}>
          {items.map((n) => {
            const isRead = Boolean(n.readAt);
            return (
              <Card key={n._id} sx={{ opacity: isRead ? 0.85 : 1 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                    <Box>
                      <Typography variant="subtitle1">{n.title}</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                        {n.message}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7, display: "block", mt: 1 }}>
                        {n.createdAt ? `Created: ${new Date(n.createdAt).toLocaleString()}` : ""}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1}>
                      {!isRead && (
                        <Button size="small" onClick={() => markRead(n._id)} disabled={busy}>
                          Mark read
                        </Button>
                      )}
                      <Button size="small" color="error" onClick={() => dismiss(n._id)} disabled={busy}>
                        Dismiss
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
