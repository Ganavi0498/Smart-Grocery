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
import { useLocation, useNavigate, Link as RouterLink } from "react-router-dom";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useAuth } from "../auth/AuthContext";
import { brand } from "../theme";

const cardAnim = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25 },
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from || "/dashboard";

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fieldErrors = useMemo(() => {
    const e = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = "Enter a valid email address.";
    if (form.password.length < 1 && submitAttempted) e.password = "Password is required.";
    return e;
  }, [form, submitAttempted]);

  const canSubmit =
    form.email.trim() &&
    form.password &&
    Object.keys(fieldErrors).length === 0 &&
    !submitting;

  function onChange(key) {
    return (ev) => setForm((p) => ({ ...p, [key]: ev.target.value }));
  }

  function onBlur(key) {
    return () => setTouched((p) => ({ ...p, [key]: true }));
  }

  function showFieldError(key) {
    return Boolean(fieldErrors[key]) && (touched[key] || submitAttempted);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitAttempted(true);
    setTouched({ email: true, password: true });

    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed.");
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
            <Typography sx={{ fontWeight: 950, color: brand.nightForest }} variant="h3">
              Welcome back
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 420 }}>
              Log in to manage inventory, alerts, and grocery lists.
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
              autoComplete="current-password"
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
                    <IconButton onClick={() => setShowPwd((v) => !v)} edge="end" aria-label="toggle password">
                      {showPwd ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
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
                {submitting ? "Logging in..." : "Login"}
              </Button>

              <Button
                component={RouterLink}
                to="/register"
                variant="outlined"
                size="large"
                sx={{
                  minWidth: { xs: "100%", sm: 180 },
                  borderColor: brand.nightForest,
                  color: brand.nightForest,
                }}
              >
                Create account
              </Button>
            </Stack>

            <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center" }}>
              Tip: If you tried to open a protected page, we’ll send you back there after login.
            </Typography>
          </Stack>
        </Paper>
      </motion.div>
    </Box>
  );
}
