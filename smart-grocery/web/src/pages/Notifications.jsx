import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";
import {
  Box, Button, Card, CardContent, Chip, CircularProgress, Divider,
  Stack, Typography
} from "@mui/material";

const PRESET_WINDOWS = [14, 7, 3, 1];

export default function Notifications() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [prefs, setPrefs] = useState([7, 3]);
  const [busy, setBusy] = useState(false);
  const selected = useMemo(() => new Set(prefs), [prefs]);

  async function loadAll() {
    setLoading(true);
    try {
      const p = await apiRequest("/api/notifications/prefs");
      setPrefs(p.expiryWindows || [7, 3]);

      const n = await apiRequest("/api/notifications");
      setItems(n.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  async function toggleWindow(w) {
    const next = new Set(selected);
    if (next.has(w)) next.delete(w);
    else next.add(w);
    setPrefs(Array.from(next).sort((a,b)=>b-a));
  }

  async function savePrefs() {
    setBusy(true);
    try {
      const res = await apiRequest("/api/notifications/prefs", {
        method: "PUT",
        body: JSON.stringify({ expiryWindows: prefs })
      });
      setPrefs(res.expiryWindows || prefs);
    } finally {
      setBusy(false);
    }
  }

  async function generateNow() {
    setBusy(true);
    try {
      await apiRequest("/api/notifications/generate-expiry", {
        method: "POST",
        body: JSON.stringify({ expiryWindows: prefs })
      });
      await loadAll();
    } finally {
      setBusy(false);
    }
  }

  async function markRead(id) {
    await apiRequest(`/api/notifications/${id}/read`, { method: "PATCH" });
    await loadAll();
  }

  async function dismiss(id) {
    await apiRequest(`/api/notifications/${id}/dismiss`, { method: "PATCH" });
    await loadAll();
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", px: 2, py: 3 }}>
      <Typography variant="h5" sx={{ mb: 1 }}>Notifications</Typography>
      <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
        Expiry reminders are generated for your reminder windows (e.g., 7 and 3 days).
      </Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Reminder windows</Typography>
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
            <Button variant="contained" disabled={busy || prefs.length === 0} onClick={savePrefs}>
              Save settings
            </Button>
            <Button variant="outlined" disabled={busy || prefs.length === 0} onClick={generateNow}>
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
          {items.map((n) => (
            <Card key={n._id}>
              <CardContent>
                <Typography variant="subtitle1">{n.title}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.85, mb: 1 }}>
                  {n.message}
                </Typography>

                <Stack direction="row" spacing={1}>
                  {!n.readAt && (
                    <Button size="small" onClick={() => markRead(n._id)}>Mark read</Button>
                  )}
                  <Button size="small" color="error" onClick={() => dismiss(n._id)}>Dismiss</Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
