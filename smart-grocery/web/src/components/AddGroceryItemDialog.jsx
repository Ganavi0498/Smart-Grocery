import { useMemo, useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material";

const CATEGORIES = ["Dairy", "Produce", "Meat", "Pantry", "Frozen", "Beverages", "Household", "Other"];
const UNITS = ["pcs", "kg", "g", "L", "ml", "pack"];

export default function AddGroceryItemDialog({ open, onClose, onCreate }) {
  const [form, setForm] = useState({ name: "", category: "Other", quantity: 1, unit: "pcs" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fieldErrors = useMemo(() => {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Name must be at least 2 characters.";
    if (Number(form.quantity) < 0) e.quantity = "Quantity cannot be negative.";
    return e;
  }, [form]);

  const canSubmit = form.name.trim() && Object.keys(fieldErrors).length === 0 && !submitting;

  function set(key) {
    return (ev) => setForm((p) => ({ ...p, [key]: ev.target.value }));
  }

  async function handleCreate() {
    setError("");
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await onCreate({
        name: form.name.trim(),
        category: form.category,
        quantity: Number(form.quantity),
        unit: form.unit,
      });
      setForm({ name: "", category: "Other", quantity: 1, unit: "pcs" });
      onClose();
    } catch (e) {
      setError(e?.message || "Failed to add item.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add grocery item</DialogTitle>
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
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>

            <TextField select label="Unit" value={form.unit} onChange={set("unit")} fullWidth>
              {UNITS.map((u) => (
                <MenuItem key={u} value={u}>{u}</MenuItem>
              ))}
            </TextField>

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
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="text">Cancel</Button>
        <Button onClick={handleCreate} variant="contained" disabled={!canSubmit}>
          {submitting ? "Adding..." : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
