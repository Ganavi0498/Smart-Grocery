import { useEffect, useMemo, useState } from "react";
import {
  Alert as MuiAlert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import { useAuth } from "../auth/AuthContext";
import { listInventory } from "../api/inventory";
import { brand } from "../theme";

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function daysUntil(iso) {
  if (!iso) return null;
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export default function Alerts() {
  const { token, user } = useAuth();
  const hasHousehold = Boolean(user?.householdId);

  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [lowStock, setLowStock] = useState([]);
  const [expiring, setExpiring] = useState([]);

  async function load() {
    setError("");
    setLoading(true);
    try {
      const [lowResp, expResp] = await Promise.all([
        listInventory(token, { filter: "lowStock" }),
        listInventory(token, { filter: "expiringSoon", days }),
      ]);

      setLowStock(lowResp?.items || []);
      setExpiring(expResp?.items || []);
    } catch (e) {
      setError(e?.message || "Failed to load alerts.");
      setLowStock([]);
      setExpiring([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!hasHousehold) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, hasHousehold]);

  const summary = useMemo(() => {
    return {
      low: lowStock.length,
      exp: expiring.length,
      total: lowStock.length + expiring.length,
    };
  }, [lowStock, expiring]);

  if (!hasHousehold) {
    return (
      <Container sx={{ py: 5 }}>
        <Paper sx={{ p: 2.5, borderRadius: 2, border: "1px solid rgba(43,43,35,0.12)" }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: brand.nightForest }}>
            Alerts require a household
          </Typography>
          <Typography sx={{ color: "text.secondary", mt: 1 }}>
            Create or join a household first. Alerts are calculated per household inventory.
          </Typography>
          <Button variant="contained" sx={{ mt: 2 }} href="/household">
            Go to Household
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={2.2}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.2} alignItems={{ xs: "stretch", md: "center" }}>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <NotificationsActiveOutlinedIcon />
              <Typography variant="h3" sx={{ fontWeight: 950, color: brand.nightForest }}>
                Alerts
              </Typography>
            </Stack>
            <Typography color="text.secondary">
              Actionable notifications based on your inventory and expiry dates.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems="center">
            <TextField
              label="Expiring within (days)"
              type="number"
              size="small"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              inputProps={{ min: 1, max: 60 }}
              sx={{ minWidth: { xs: "100%", sm: 220 } }}
            />
            <Button variant="outlined" onClick={load} disabled={loading}>
              Refresh
            </Button>
          </Stack>
        </Stack>

        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
            border: "1px solid rgba(43,43,35,0.12)",
            boxShadow: "0 12px 28px rgba(43,43,35,0.08)",
          }}
        >
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Chip label={`Total alerts: ${summary.total}`} />
            <Chip label={`Low stock: ${summary.low}`} />
            <Chip label={`Expiring soon: ${summary.exp}`} />
          </Stack>

          <Divider sx={{ my: 2 }} />

          {error ? <MuiAlert severity="error" sx={{ mb: 2 }}>{error}</MuiAlert> : null}
          {loading ? (
            <Typography color="text.secondary">Loading alerts…</Typography>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
              }}
            >
              {/* Low stock */}
              <Paper sx={{ p: 2, borderRadius: 2, border: "1px solid rgba(43,43,35,0.10)" }}>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <WarningAmberOutlinedIcon />
                    <Typography sx={{ fontWeight: 900, color: brand.nightForest }}>
                      Low Stock
                    </Typography>
                    <Chip size="small" color="warning" label={lowStock.length} />
                  </Stack>

                  {lowStock.length === 0 ? (
                    <Typography color="text.secondary">No low stock items right now.</Typography>
                  ) : (
                    <Stack spacing={1}>
                      {lowStock.map((x) => (
                        <Paper
                          key={x._id}
                          sx={{
                            p: 1.2,
                            borderRadius: 2,
                            border: "1px solid rgba(43,43,35,0.08)",
                            background: "rgba(239,206,123,0.25)",
                          }}
                        >
                          <Typography sx={{ fontWeight: 900 }}>
                            {x.name} <Typography component="span" color="text.secondary">({x.category || "Other"})</Typography>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Qty: <b>{x.quantity}</b> {x.unit || ""} · Threshold: <b>{x.threshold}</b>
                          </Typography>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Paper>

              {/* Expiring soon */}
              <Paper sx={{ p: 2, borderRadius: 2, border: "1px solid rgba(43,43,35,0.10)" }}>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EventBusyOutlinedIcon />
                    <Typography sx={{ fontWeight: 900, color: brand.nightForest }}>
                      Expiring Soon
                    </Typography>
                    <Chip size="small" color="error" label={expiring.length} />
                  </Stack>

                  {expiring.length === 0 ? (
                    <Typography color="text.secondary">No items expiring in the next {days} days.</Typography>
                  ) : (
                    <Stack spacing={1}>
                      {expiring.map((x) => {
                        const d = daysUntil(x.expiryDate);
                        return (
                          <Paper
                            key={x._id}
                            sx={{
                              p: 1.2,
                              borderRadius: 2,
                              border: "1px solid rgba(43,43,35,0.08)",
                              background: "rgba(216,86,14,0.12)",
                            }}
                          >
                            <Typography sx={{ fontWeight: 900 }}>
                              {x.name} <Typography component="span" color="text.secondary">({x.category || "Other"})</Typography>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Expiry: <b>{fmtDate(x.expiryDate)}</b>
                              {d !== null ? ` · In ${d} day(s)` : ""}
                            </Typography>
                          </Paper>
                        );
                      })}
                    </Stack>
                  )}
                </Stack>
              </Paper>
            </Box>
          )}
        </Paper>
      </Stack>
    </Container>
  );
}
