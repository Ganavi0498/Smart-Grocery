import { useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  MenuItem,
  Alert,
} from "@mui/material";

const CATEGORIES = ["Dairy", "Produce", "Meat", "Pantry", "Frozen", "Beverages", "Household", "Other"];
const UNITS = ["pcs", "kg", "g", "L", "ml", "pack"];

function toIsoOrNull(dateStr) {
  // Accept yyyy-mm-dd and convert to ISO at 10:30Z like your backend expects
  if (!dateStr) return null;
  // keep it simple: midnight UTC
  return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
}

export default function AddInventoryDialog({ open, onClose, onCreate }) {
  const [form, setForm] = useState({
    name: "",
    category: "Other",
    quantity: 1,
    unit: "pcs",
    threshold: 1,
    expiryDate: "",
    location: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fieldErrors = useMemo(() => {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Name must be at least 2 characters.";
    if (Number(form.quantity) < 0) e.quantity = "Quantity cannot be negative.";
    if (Number(form.threshold) < 0) e.threshold = "Threshold cannot be negative.";
    return e;
  }, [form]);

  const canSubmit =
    form.name.trim() &&
    Object.keys(fieldErrors).length === 0 &&
    !submitting;

  function set(key) {
    return (ev) => setForm((p) => ({ ...p, [key]: ev.target.value }));
  }

  async function handleCreate() {
    setError("");
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        quantity: Number(form.quantity),
        unit: form.unit,
        threshold: Number(form.threshold),
        location: form.location.trim() || "",
        // backend expects ISO datetime or null
        expiryDate: form.expiryDate ? toIsoOrNull(form.expiryDate) : null,
      };

      await onCreate(payload);

      // reset for next add
      setForm({
        name: "",
        category: "Other",
        quantity: 1,
        unit: "pcs",
        threshold: 1,
        expiryDate: "",
        location: "",
      });

      onClose();
    } catch (e) {
      setError(e?.message || "Failed to create item.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add inventory item</DialogTitle>

      <DialogContent>
        <Stack spacing={1.6} sx={{ mt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          <TextField
            label="Item name"
            value={form.name}
            onChange={set("name")}
            error={Boolean(fieldErrors.name)}
            helperText={fieldErrors.name || " "}
            fullWidth
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
            <TextField select label="Category" value={form.category} onChange={set("category")} fullWidth>
              {CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>

            <TextField label="Location (optional)" value={form.location} onChange={set("location")} fullWidth />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
            <TextField
              label="Quantity"
              type="number"
              value={form.quantity}
              onChange={set("quantity")}
              error={Boolean(fieldErrors.quantity)}
              helperText={fieldErrors.quantity || " "}
              fullWidth
              inputProps={{ min: 0 }}
            />

            <TextField select label="Unit" value={form.unit} onChange={set("unit")} fullWidth>
              {UNITS.map((u) => (
                <MenuItem key={u} value={u}>
                  {u}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Low-stock threshold"
              type="number"
              value={form.threshold}
              onChange={set("threshold")}
              error={Boolean(fieldErrors.threshold)}
              helperText={fieldErrors.threshold || " "}
              fullWidth
              inputProps={{ min: 0 }}
            />
          </Stack>

          <TextField
            label="Expiry date (optional)"
            type="date"
            value={form.expiryDate}
            onChange={set("expiryDate")}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="text">
          Cancel
        </Button>
        <Button onClick={handleCreate} variant="contained" disabled={!canSubmit}>
          {submitting ? "Adding..." : "Add item"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
