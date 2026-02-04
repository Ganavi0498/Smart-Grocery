import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  IconButton,
  Paper,
  Stack,
  Switch,
  Typography,
  Tooltip,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";
import DoneAllOutlinedIcon from "@mui/icons-material/DoneAllOutlined";
import AddGroceryItemDialog from "../components/AddGroceryItemDialog";
import { useAuth } from "../auth/AuthContext";
import { brand } from "../theme";
import {
  addGroceryItem,
  completeList,
  deleteGroceryItem,
  getCurrentGroceryList,
  syncLowStock,
  updateGroceryItem,
} from "../api/grocery";

export default function GroceryList() {
  const { token, user } = useAuth();
  const hasHousehold = Boolean(user?.householdId);

  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [shoppingMode, setShoppingMode] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);

  async function load() {
    setError("");
    setLoading(true);
    try {
      const data = await getCurrentGroceryList(token);
      setList(data?.list || null);
    } catch (e) {
      setError(e?.message || "Failed to load grocery list.");
      setList(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!hasHousehold) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHousehold]);

  async function doAdd(payload) {
    await addGroceryItem(token, payload);
    await load();
  }

  async function toggleChecked(item) {
    setBusy(true);
    try {
      await updateGroceryItem(token, item._id, { checked: !item.checked });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function removeItem(item) {
    const ok = window.confirm(`Remove "${item.name}" from the list?`);
    if (!ok) return;
    setBusy(true);
    try {
      await deleteGroceryItem(token, item._id);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function sync() {
    setBusy(true);
    setError("");
    try {
      await syncLowStock(token);
      await load();
    } catch (e) {
      setError(e?.message || "Sync failed.");
    } finally {
      setBusy(false);
    }
  }

  async function complete() {
    const ok = window.confirm("Complete this list and start a new one?");
    if (!ok) return;

    setBusy(true);
    setError("");
    try {
      await completeList(token);
      await load();
    } catch (e) {
      setError(e?.message || "Failed to complete list.");
    } finally {
      setBusy(false);
    }
  }

  const grouped = useMemo(() => {
    const items = list?.items || [];
    const map = new Map();
    for (const it of items) {
      const key = it.category || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(it);
    }
    // stable category order
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [list]);

  const summary = useMemo(() => {
    const items = list?.items || [];
    const total = items.length;
    const done = items.filter((x) => x.checked).length;
    return { total, done, open: total - done };
  }, [list]);

  if (!hasHousehold) {
    return (
      <Container sx={{ py: 5 }}>
        <Paper sx={{ p: 2.5, borderRadius: 2, border: "1px solid rgba(43,43,35,0.12)" }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: brand.nightForest }}>
            Grocery List is linked to a household
          </Typography>
          <Typography sx={{ color: "text.secondary", mt: 1 }}>
            Create or join a household first to share a grocery list with others.
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
              Grocery List
            </Typography>
            <Typography color="text.secondary">
              Shopping-ready list for your household. Sync low stock items from inventory anytime.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems="center">
            <Button variant="outlined" startIcon={<SyncOutlinedIcon />} onClick={sync} disabled={busy || loading}>
              Sync low stock
            </Button>
            <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => setOpenAdd(true)} disabled={busy}>
              Add item
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
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between">
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              <Chip label={`Total: ${summary.total}`} />
              <Chip label={`Open: ${summary.open}`} />
              <Chip label={`Checked: ${summary.done}`} />
              {list?.generatedAt ? <Chip label={`Generated: ${new Date(list.generatedAt).toLocaleDateString()}`} /> : null}
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary">Shopping mode</Typography>
              <Switch checked={shoppingMode} onChange={(e) => setShoppingMode(e.target.checked)} />
              <Button variant="outlined" startIcon={<DoneAllOutlinedIcon />} onClick={complete} disabled={busy || loading}>
                Complete
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

          {loading ? (
            <Typography color="text.secondary">Loading list…</Typography>
          ) : !list || (list.items || []).length === 0 ? (
            <Typography color="text.secondary">
              No items yet. Click <b>Add item</b> or <b>Sync low stock</b>.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {grouped.map(([cat, items]) => (
                <Box key={cat}>
                  <Typography sx={{ fontWeight: 900, mb: 1 }}>{cat}</Typography>
                  <Stack spacing={1}>
                    {items.map((it) => (
                      <Paper
                        key={it._id}
                        sx={{
                          p: shoppingMode ? 1.6 : 1.2,
                          borderRadius: 2,
                          border: "1px solid rgba(43,43,35,0.10)",
                          background: it.checked ? "rgba(146,162,166,0.18)" : "rgba(255,255,255,0.9)",
                          opacity: it.checked ? 0.7 : 1,
                        }}
                      >
                        <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="space-between">
                          <Box
                            onClick={() => toggleChecked(it)}
                            role="button"
                            style={{ cursor: "pointer", flex: 1 }}
                          >
                            <Typography sx={{ fontWeight: 900, textDecoration: it.checked ? "line-through" : "none" }}>
                              {it.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Qty: <b>{it.quantity}</b> {it.unit || ""} {it.source ? ` · Source: ${it.source}` : ""}
                            </Typography>
                          </Box>

                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <Tooltip title="Remove item">
                              <IconButton onClick={() => removeItem(it)} aria-label="remove">
                                <DeleteOutlineOutlinedIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </Stack>

      <AddGroceryItemDialog open={openAdd} onClose={() => setOpenAdd(false)} onCreate={doAdd} />
    </Container>
  );
}
