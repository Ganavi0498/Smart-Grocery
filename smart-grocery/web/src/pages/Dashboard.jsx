import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../api/client";
import { brand } from "../theme";

/** Helpers to handle slight API shape differences safely */
function extractArray(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.inventory)) return payload.inventory;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

function extractHousehold(payload) {
  if (!payload) return null;
  return payload.household || payload.current || payload.data || payload;
}

function extractList(payload) {
  if (!payload) return null;
  return payload.list || payload.data || payload;
}

function StatPill({ label, value, tone = "neutral" }) {
  const styles =
    tone === "danger"
      ? { borderColor: "rgba(220, 38, 38, 0.35)", background: "rgba(220, 38, 38, 0.06)" }
      : tone === "warning"
      ? { borderColor: "rgba(245, 158, 11, 0.40)", background: "rgba(245, 158, 11, 0.08)" }
      : { borderColor: "rgba(43,43,35,0.14)", background: "rgba(203,209,131,0.14)" };

  return (
    <Box
      sx={{
        border: "1px solid",
        borderRadius: 3,
        px: 1.2,
        py: 1,
        ...styles,
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 1,
        minWidth: 0,
      }}
    >
      <Typography sx={{ color: "text.secondary", fontWeight: 700, fontSize: 13 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 950, fontSize: 18 }}>{value}</Typography>
    </Box>
  );
}

function SoftCard({ title, icon, right, children }) {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid rgba(43,43,35,0.10)",
        borderRadius: 4,
        backgroundColor: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 12px 30px rgba(43,43,35,0.06)",
        height: "100%",
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.4 } }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <Box sx={{ display: "grid", placeItems: "center" }}>{icon}</Box>
          <Typography sx={{ fontWeight: 950 }}>{title}</Typography>
          <Box sx={{ flexGrow: 1 }} />
          {right}
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, token, isReady } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [household, setHousehold] = useState(null);

  const [inventoryTotal, setInventoryTotal] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [expiringSoonCount, setExpiringSoonCount] = useState(0);

  const [list, setList] = useState(null);

  const expiringDays = 7;

  const displayName = useMemo(() => {
    const name = user?.name?.trim();
    if (name) return name;
    const email = user?.email?.trim();
    if (email) return email.split("@")[0];
    return "there";
  }, [user]);

  const listItems = useMemo(() => list?.items || [], [list]);
  const listItemsCount = listItems.length;
  const listCheckedCount = listItems.filter((x) => Boolean(x.checked)).length;

  const checkedPct = useMemo(() => {
    if (!listItemsCount) return 0;
    return Math.round((listCheckedCount / listItemsCount) * 100);
  }, [listCheckedCount, listItemsCount]);

  const hasHousehold = Boolean(household?._id || household?.id);

  const healthTone =
    lowStockCount === 0 && expiringSoonCount === 0 ? "success" : "warning";

  const healthLabel =
    lowStockCount === 0 && expiringSoonCount === 0
      ? "Healthy"
      : lowStockCount > 0 && expiringSoonCount > 0
      ? "Needs attention"
      : lowStockCount > 0
      ? "Low stock"
      : "Expiring soon";

  async function loadDashboard() {
    if (!isReady || !token) return;

    setLoading(true);
    setError("");

    try {
      const hRaw = await apiRequest("/api/households/current", { token });
      const hh = extractHousehold(hRaw);
      setHousehold(hh || null);

      if (!hh?._id && !hh?.id) {
        setLoading(false);
        return;
      }

      const [invAllRaw, invLowRaw, invExpRaw, listRaw] = await Promise.all([
        apiRequest("/api/inventory", { token }),
        apiRequest("/api/inventory?filter=lowStock", { token }),
        apiRequest(`/api/inventory?filter=expiringSoon&days=${expiringDays}`, { token }),
        apiRequest("/api/lists/current", { token }),
      ]);

      setInventoryTotal(extractArray(invAllRaw).length);
      setLowStockCount(extractArray(invLowRaw).length);
      setExpiringSoonCount(extractArray(invExpRaw).length);

      const l = extractList(listRaw);
      setList(l || null);

      setLoading(false);
    } catch (e) {
      setLoading(false);
      setError(e?.message || "Failed to load dashboard.");
    }
  }

  async function handleSyncLowStock() {
    try {
      const res = await apiRequest("/api/lists/sync-low-stock", { method: "POST", token });
      const updated = extractList(res);
      setList(updated || null);
      await loadDashboard();
    } catch (e) {
      setError(e?.message || "Sync failed.");
    }
  }

  async function handleCompleteList() {
    try {
      const res = await apiRequest("/api/lists/complete", { method: "POST", token });
      const nextList = res?.list || res?.nextList || extractList(res);
      setList(nextList || null);
    } catch (e) {
      setError(e?.message || "Complete list failed.");
    }
  }

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, token]);

  return (
    <Box sx={{ width: "100%", maxWidth: 1280, mx: "auto", pb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          borderRadius: 5,
          p: { xs: 2, md: 3 },
          mb: 2,
          background: `radial-gradient(1200px 240px at 10% 0%, rgba(203,209,131,0.22), transparent 55%),
                       radial-gradient(900px 280px at 90% 10%, rgba(120,140,20,0.14), transparent 55%)`,
          border: "1px solid rgba(43,43,35,0.08)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 950 }}>
              Dashboard
            </Typography>
            <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
              Welcome, {displayName}. Here’s what matters today.
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 1.4, flexWrap: "wrap" }}>
              <Chip
                label={`Household: ${household?.name || (hasHousehold ? "Active" : "Not set")}`}
                sx={{
                  fontWeight: 850,
                  backgroundColor: "rgba(203,209,131,0.16)",
                  border: "1px solid rgba(43,43,35,0.10)",
                }}
              />
              {hasHousehold && (
                <Chip label={`Status: ${healthLabel}`} color={healthTone} sx={{ fontWeight: 850 }} />
              )}
            </Stack>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="contained"
              onClick={handleSyncLowStock}
              disabled={!hasHousehold || lowStockCount === 0}
              sx={{
                fontWeight: 900,
                borderRadius: 3,
                backgroundColor: brand.springLeaves,
                "&:hover": { backgroundColor: brand.springLeaves },
              }}
            >
              Sync low stock to list
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate("/alerts")}
              sx={{ fontWeight: 900, borderRadius: 3 }}
            >
              View low stock
            </Button>

            <Button
              variant="text"
              startIcon={<RefreshOutlinedIcon />}
              onClick={loadDashboard}
              sx={{ fontWeight: 900 }}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Loading / Error */}
      {loading && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, py: 3 }}>
          <CircularProgress size={22} />
          <Typography sx={{ color: "text.secondary" }}>Loading dashboard…</Typography>
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Household not set */}
      {!loading && !error && !hasHousehold && (
        <SoftCard
          title="Set up your household"
          icon={<HomeOutlinedIcon />}
          right={<Chip label="Required" color="warning" size="small" />}
        >
          <Typography sx={{ color: "text.secondary", mb: 2 }}>
            Inventory and grocery list are scoped to a household. Create or join one to continue.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button variant="contained" onClick={() => navigate("/household")} sx={{ fontWeight: 900 }}>
              Go to Household
            </Button>
            <Button variant="outlined" onClick={() => navigate("/inventory")} sx={{ fontWeight: 900 }}>
              Go to Inventory
            </Button>
          </Stack>
        </SoftCard>
      )}

      {/* ✅ CLEAN GRID LAYOUT (exactly as you asked) */}
      {!loading && !error && hasHousehold && (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "repeat(12, 1fr)" },
            alignItems: "stretch",
          }}
        >
          {/* Row 1: Household | Inventory | Alerts snapshot */}
          <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
            <SoftCard
              title="Household"
              icon={<HomeOutlinedIcon />}
              right={<Chip size="small" label={healthLabel} color={healthTone} sx={{ fontWeight: 900 }} />}
            >
              <Typography sx={{ fontWeight: 950 }}>{household?.name || "Your Household"}</Typography>
              <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
                Shared inventory + grocery list scope.
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/household")}
                  sx={{ fontWeight: 900, borderRadius: 3 }}
                >
                  Manage
                </Button>
                <Button variant="text" onClick={loadDashboard} sx={{ fontWeight: 900, borderRadius: 3 }}>
                  Refresh
                </Button>
              </Stack>
            </SoftCard>
          </Box>

          <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
            <SoftCard
              title="Inventory overview"
              icon={<Inventory2OutlinedIcon />}
              right={
                <Chip
                  size="small"
                  label={`${inventoryTotal} items`}
                  sx={{
                    fontWeight: 900,
                    backgroundColor: "rgba(203,209,131,0.16)",
                    border: "1px solid rgba(43,43,35,0.10)",
                  }}
                />
              }
            >
              <Box sx={{ display: "grid", gap: 1 }}>
                <StatPill label="Total items" value={inventoryTotal} />
                <StatPill label="Low stock" value={lowStockCount} tone={lowStockCount ? "warning" : "neutral"} />
                <StatPill
                  label={`Expiring in ${expiringDays} days`}
                  value={expiringSoonCount}
                  tone={expiringSoonCount ? "danger" : "neutral"}
                />
              </Box>

              <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  onClick={() => navigate("/inventory")}
                  sx={{
                    fontWeight: 900,
                    borderRadius: 3,
                    backgroundColor: brand.springLeaves,
                    "&:hover": { backgroundColor: brand.springLeaves },
                  }}
                >
                  Go to inventory
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/alerts")}
                  sx={{ fontWeight: 900, borderRadius: 3 }}
                >
                  View alerts
                </Button>
              </Stack>
            </SoftCard>
          </Box>

          <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
            <SoftCard title="Alerts snapshot" icon={<WarningAmberOutlinedIcon />}>
              <Stack spacing={1}>
                <StatPill label="Low stock" value={lowStockCount} tone={lowStockCount ? "warning" : "neutral"} />
                <StatPill
                  label={`Expiring (${expiringDays}d)`}
                  value={expiringSoonCount}
                  tone={expiringSoonCount ? "danger" : "neutral"}
                />
              </Stack>

              <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  onClick={() => navigate("/alerts")}
                  sx={{ fontWeight: 900, borderRadius: 3 }}
                >
                  Open alerts
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/inventory")}
                  sx={{ fontWeight: 900, borderRadius: 3 }}
                >
                  Fix in inventory
                </Button>
              </Stack>
            </SoftCard>
          </Box>

          {/* Row 2: Grocery list | Today’s focus (50/50) */}
          <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 6" } }}>
            <SoftCard
              title="Grocery list"
              icon={<ShoppingCartOutlinedIcon />}
              right={
                <Chip
                  size="small"
                  label={listItemsCount ? `Active: ${listItemsCount}` : "Empty"}
                  sx={{
                    fontWeight: 900,
                    backgroundColor: "rgba(203,209,131,0.16)",
                    border: "1px solid rgba(43,43,35,0.10)",
                  }}
                />
              }
            >
              <Stack spacing={1.2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ color: "text.secondary", fontWeight: 800 }}>Progress</Typography>
                  <Typography sx={{ fontWeight: 950 }}>
                    {listCheckedCount}/{listItemsCount}
                  </Typography>
                </Stack>

                <LinearProgress variant="determinate" value={checkedPct} />

                {lowStockCount > 0 && (
                  <Alert icon={<WarningAmberOutlinedIcon />} severity="warning" sx={{ borderRadius: 3 }}>
                    You have {lowStockCount} low-stock item(s). Sync them into your grocery list.
                  </Alert>
                )}

                <Box
                  sx={{
                    border: "1px solid rgba(43,43,35,0.08)",
                    borderRadius: 3,
                    p: 1.2,
                    backgroundColor: "rgba(255,255,255,0.70)",
                  }}
                >
                  <Typography sx={{ fontWeight: 900, mb: 1 }}>Preview</Typography>

                  {listItemsCount === 0 ? (
                    <Typography sx={{ color: "text.secondary" }}>
                      No items yet. Add manually or sync low stock.
                    </Typography>
                  ) : (
                    <List dense sx={{ py: 0 }}>
                      {listItems.slice(0, 3).map((it) => (
                        <ListItem key={it._id || it.id} sx={{ px: 0 }}>
                          <ListItemText
                            primary={
                              <Typography sx={{ fontWeight: 850 }}>
                                {it.name}{" "}
                                <Typography component="span" sx={{ color: "text.secondary", fontWeight: 700 }}>
                                  • {it.quantity} {it.unit}
                                </Typography>
                              </Typography>
                            }
                            secondary={it.source ? `Source: ${it.source}` : null}
                          />
                        </ListItem>
                      ))}
                      {listItemsCount > 3 && (
                        <Typography sx={{ color: "text.secondary", fontWeight: 800, mt: 0.5 }}>
                          +{listItemsCount - 3} more…
                        </Typography>
                      )}
                    </List>
                  )}
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <Button
                    variant="contained"
                    onClick={() => navigate("/grocery")}
                    sx={{ fontWeight: 900, borderRadius: 3 }}
                    endIcon={<ArrowForwardOutlinedIcon />}
                  >
                    Open grocery list
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleSyncLowStock}
                    sx={{ fontWeight: 900, borderRadius: 3 }}
                    disabled={lowStockCount === 0}
                  >
                    Sync low stock
                  </Button>
                  <Button
                    variant="text"
                    onClick={handleCompleteList}
                    sx={{ fontWeight: 900, borderRadius: 3 }}
                    disabled={listItemsCount === 0}
                  >
                    Complete list
                  </Button>
                </Stack>
              </Stack>
            </SoftCard>
          </Box>

          <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 6" } }}>
            <SoftCard title="Today’s focus" icon={<WarningAmberOutlinedIcon />}>
              <Typography sx={{ color: "text.secondary", mb: 1.2 }}>
                Recommended actions based on your inventory + list.
              </Typography>

              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 1.4 }}>
                {expiringSoonCount > 0 && (
                  <Chip
                    size="small"
                    label={`Expiring: ${expiringSoonCount}`}
                    sx={{
                      fontWeight: 900,
                      backgroundColor: "rgba(245, 158, 11, 0.14)",
                      border: "1px solid rgba(245, 158, 11, 0.35)",
                    }}
                  />
                )}
                {lowStockCount > 0 && (
                  <Chip
                    size="small"
                    label={`Low stock: ${lowStockCount}`}
                    sx={{
                      fontWeight: 900,
                      backgroundColor: "rgba(245, 158, 11, 0.14)",
                      border: "1px solid rgba(245, 158, 11, 0.35)",
                    }}
                  />
                )}
                {expiringSoonCount === 0 && lowStockCount === 0 && (
                  <Chip
                    size="small"
                    label="No urgent items"
                    sx={{
                      fontWeight: 900,
                      backgroundColor: "rgba(203,209,131,0.16)",
                      border: "1px solid rgba(43,43,35,0.10)",
                    }}
                  />
                )}
              </Stack>

              <Stack spacing={1}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate("/inventory")}
                  sx={{ fontWeight: 900, borderRadius: 3 }}
                >
                  Add / update items
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate("/alerts")}
                  sx={{ fontWeight: 900, borderRadius: 3 }}
                >
                  Review alerts
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSyncLowStock}
                  disabled={lowStockCount === 0}
                  sx={{
                    fontWeight: 900,
                    borderRadius: 3,
                    backgroundColor: brand.springLeaves,
                    "&:hover": { backgroundColor: brand.springLeaves },
                  }}
                >
                  Sync low stock
                </Button>
                <Button
                  variant="text"
                  fullWidth
                  onClick={() => navigate("/grocery")}
                  sx={{ fontWeight: 900, borderRadius: 3 }}
                >
                  Manage grocery list
                </Button>
              </Stack>

              <Divider sx={{ my: 1.6 }} />

              <Typography sx={{ fontWeight: 950, mb: 0.8 }}>Quick insight</Typography>
              <Typography sx={{ color: "text.secondary" }}>
                Set thresholds on frequently-used items (milk, rice, eggs) to make alerts genuinely useful.
              </Typography>
            </SoftCard>
          </Box>
        </Box>
      )}
    </Box>
  );
}
