import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Alert,
  Tooltip,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import RemoveOutlinedIcon from "@mui/icons-material/RemoveOutlined";
import AddInventoryDialog from "../components/AddInventoryDialog";
import { useAuth } from "../auth/AuthContext";
import { brand } from "../theme";
import {
  createInventoryItem,
  deleteInventoryItem,
  listInventory,
  updateInventoryItem,
} from "../api/inventory";

const FILTERS = [
  { value: "", label: "All" },
  { value: "lowStock", label: "Low stock" },
  { value: "expiringSoon", label: "Expiring soon" },
];

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

export default function Inventory() {
  const { token, user } = useAuth();

  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [days, setDays] = useState(7);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openAdd, setOpenAdd] = useState(false);

  const showDays = filter === "expiringSoon";

  const canUseInventory = Boolean(user?.householdId);

  async function load() {
    setError("");
    setLoading(true);
    try {
      const data = await listInventory(token, { filter, days: showDays ? days : undefined });
      setItems(data?.items || []);
    } catch (e) {
      setError(e?.message || "Failed to load inventory.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!canUseInventory) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, days, canUseInventory]);

  async function handleCreate(payload) {
    await createInventoryItem(token, payload);
    await load();
  }

  async function adjustQty(item, delta) {
    const next = Number(item.quantity || 0) + delta;
    if (next < 0) return;
    await updateInventoryItem(token, item._id, { quantity: next });
    await load();
  }

  async function handleDelete(item) {
    const ok = window.confirm(`Delete "${item.name}"?`);
    if (!ok) return;
    await deleteInventoryItem(token, item._id);
    await load();
  }

  const stats = useMemo(() => {
    const total = items.length;
    const low = items.filter((x) => Number(x.quantity) <= Number(x.threshold)).length;
    const exp = items.filter((x) => x.expiryDate).length;
    return { total, low, exp };
  }, [items]);

  if (!canUseInventory) {
    return (
      <Container sx={{ py: 5 }}>
        <Paper sx={{ p: 2.5, borderRadius: 2, border: "1px solid rgba(43,43,35,0.12)" }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: brand.nightForest }}>
            Inventory is linked to a household
          </Typography>
          <Typography sx={{ color: "text.secondary", mt: 1 }}>
            Create or join a household first. Then you can add items and share inventory with others.
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
            <Typography variant="h3" sx={{ fontWeight: 950, color: brand.nightForest }}>
              Inventory
            </Typography>
            <Typography color="text.secondary">
              Track stock levels, expiry dates, and low-stock thresholds.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={() => setOpenAdd(true)}
            sx={{ alignSelf: { xs: "stretch", md: "center" } }}
          >
            Add item
          </Button>
        </Stack>

        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
            border: "1px solid rgba(43,43,35,0.12)",
            boxShadow: "0 12px 28px rgba(43,43,35,0.08)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              <Chip label={`Total: ${stats.total}`} />
              <Chip label={`Low stock: ${stats.low}`} />
              <Chip label={`With expiry: ${stats.exp}`} />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems="center">
              <TextField
                select
                label="Filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                size="small"
                sx={{ minWidth: { xs: "100%", sm: 200 } }}
              >
                {FILTERS.map((f) => (
                  <MenuItem key={f.value} value={f.value}>
                    {f.label}
                  </MenuItem>
                ))}
              </TextField>

              {showDays ? (
                <TextField
                  label="Days"
                  type="number"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  size="small"
                  sx={{ minWidth: { xs: "100%", sm: 160 } }}
                  inputProps={{ min: 1, max: 60 }}
                />
              ) : null}

              <Button variant="outlined" onClick={load} disabled={loading}>
                Refresh
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

          {/* Responsive list: cards */}
          <Stack spacing={1.2}>
            {loading ? (
              <Typography color="text.secondary">Loading inventory…</Typography>
            ) : items.length === 0 ? (
              <Typography color="text.secondary">
                No items yet. Click <b>Add item</b> to get started.
              </Typography>
            ) : (
              items.map((item) => {
                const qty = Number(item.quantity || 0);
                const thr = Number(item.threshold || 0);
                const isLow = qty <= thr;

                return (
                  <Paper
                    key={item._id}
                    sx={{
                      p: 1.6,
                      borderRadius: 2,
                      border: "1px solid rgba(43,43,35,0.10)",
                      background: isLow ? "rgba(239,206,123,0.25)" : "rgba(255,255,255,0.9)",
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.2}
                      alignItems={{ xs: "stretch", sm: "center" }}
                      justifyContent="space-between"
                    >
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
                          <Typography sx={{ fontWeight: 900, color: brand.nightForest }}>
                            {item.name}
                          </Typography>
                          <Chip size="small" label={item.category || "Other"} />
                          {isLow ? <Chip size="small" color="warning" label="Low stock" /> : null}
                        </Stack>

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                          Qty: <b>{qty}</b> {item.unit || ""} · Threshold: <b>{thr}</b> · Expiry: <b>{formatDate(item.expiryDate)}</b>
                          {item.location ? ` · Location: ${item.location}` : ""}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={0.6} alignItems="center" justifyContent="flex-end">
                        <Tooltip title="Decrease quantity">
                          <IconButton onClick={() => adjustQty(item, -1)} aria-label="decrease">
                            <RemoveOutlinedIcon />
                          </IconButton>
                        </Tooltip>

                        <Typography sx={{ width: 28, textAlign: "center", fontWeight: 900 }}>
                          {qty}
                        </Typography>

                        <Tooltip title="Increase quantity">
                          <IconButton onClick={() => adjustQty(item, +1)} aria-label="increase">
                            <AddOutlinedIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete item">
                          <IconButton onClick={() => handleDelete(item)} aria-label="delete">
                            <DeleteOutlineOutlinedIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Paper>
                );
              })
            )}
          </Stack>
        </Paper>
      </Stack>

      <AddInventoryDialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onCreate={handleCreate}
      />
    </Container>
  );
}
