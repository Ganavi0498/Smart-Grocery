import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useAuth } from "../auth/AuthContext";
import { brand } from "../theme";

const cardAnim = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25 },
};

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  // ✅ Track whether a field has been interacted with
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirm: false,
  });

  // ✅ Track submit attempts (show all errors after user tries)
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fieldErrors = useMemo(() => {
    const e = {};

    if (form.name.trim().length < 2) e.name = "Enter your name (min 2 characters).";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = "Enter a valid email address.";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters.";
    if (form.confirm && form.confirm !== form.password) e.confirm = "Passwords do not match.";

    // Optional: only complain if confirm is empty after submit attempt
    if (!form.confirm && submitAttempted) e.confirm = "Please confirm your password.";

    return e;
  }, [form, submitAttempted]);

  const canSubmit =
    form.name.trim() &&
    form.email.trim() &&
    form.password &&
    form.confirm &&
    Object.keys(fieldErrors).length === 0 &&
    !submitting;

  function onChange(key) {
    return (ev) => {
      const val = ev.target.value;
      setForm((p) => ({ ...p, [key]: val }));
    };
  }

  function onBlur(key) {
    return () => setTouched((p) => ({ ...p, [key]: true }));
  }

  // ✅ Decide when to show error UI for a specific field
  function showFieldError(key) {
    return Boolean(fieldErrors[key]) && (touched[key] || submitAttempted);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitAttempted(true);

    // Mark all fields touched when submitting so user sees what's missing
    setTouched({ name: true, email: true, password: true, confirm: true });

    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ minHeight: "65vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <motion.div {...cardAnim} style={{ width: "100%" }}>
        <Paper
          component="form"
          onSubmit={onSubmit}
          sx={{
            width: "100%",
            maxWidth: 520,
            mx: "auto",
            p: { xs: 2.2, md: 3 },
            borderRadius: 3,
            border: "1px solid rgba(43,43,35,0.12)",
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 18px 40px rgba(43,43,35,0.10)",
          }}
        >
          <Stack spacing={1.2} alignItems="center" textAlign="center">
            <Typography
              sx={{
                fontWeight: 950,
                color: brand.nightForest,
                letterSpacing: 0.2,
              }}
              variant="h3"
            >
              Create your account
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 420 }}>
              Start tracking inventory and expiry alerts. You can create or join a household in the next step.
            </Typography>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}

          <Stack spacing={1.6}>
            <TextField
              label="Full name"
              value={form.name}
              onChange={onChange("name")}
              onBlur={onBlur("name")}
              autoComplete="name"
              error={showFieldError("name")}
              helperText={showFieldError("name") ? fieldErrors.name : " "}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              fullWidth
            />

            <TextField
              label="Email"
              value={form.email}
              onChange={onChange("email")}
              onBlur={onBlur("email")}
              autoComplete="email"
              error={showFieldError("email")}
              helperText={showFieldError("email") ? fieldErrors.email : " "}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              fullWidth
            />

            <TextField
              label="Password"
              type={showPwd ? "text" : "password"}
              value={form.password}
              onChange={onChange("password")}
              onBlur={onBlur("password")}
              autoComplete="new-password"
              error={showFieldError("password")}
              helperText={showFieldError("password") ? fieldErrors.password : " "}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPwd((v) => !v)}
                      edge="end"
                      aria-label="toggle password"
                    >
                      {showPwd ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              fullWidth
            />

            <TextField
              label="Confirm password"
              type={showConfirm ? "text" : "password"}
              value={form.confirm}
              onChange={onChange("confirm")}
              onBlur={onBlur("confirm")}
              autoComplete="new-password"
              error={showFieldError("confirm")}
              helperText={showFieldError("confirm") ? fieldErrors.confirm : " "}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirm((v) => !v)}
                      edge="end"
                      aria-label="toggle confirm password"
                    >
                      {showConfirm ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              fullWidth
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} justifyContent="center" alignItems="center">
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={!canSubmit}
                sx={{ minWidth: { xs: "100%", sm: 220 } }}
              >
                {submitting ? "Creating..." : "Create account"}
              </Button>

              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                size="large"
                sx={{
                  minWidth: { xs: "100%", sm: 180 },
                  borderColor: brand.nightForest,
                  color: brand.nightForest,
                }}
              >
                I already have one
              </Button>
            </Stack>

            <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center" }}>
              By continuing, you agree this is a student MVP (no production guarantees).
            </Typography>
          </Stack>
        </Paper>
      </motion.div>
    </Box>
  );
}
