import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { useAuth } from "../auth/AuthContext";
import { createHousehold, getCurrentHousehold, joinHousehold } from "../api/households";
import { brand } from "../theme";

const anim = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22 },
};

export default function Household() {
  const { token, user, refreshMe } = useAuth();

  const [loading, setLoading] = useState(true);
  const [household, setHousehold] = useState(null);

  const [createName, setCreateName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const hasHousehold = Boolean(user?.householdId || household?.id);

  async function load() {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const data = await getCurrentHousehold(token);
      setHousehold(data?.household || null);
    } catch {
      setHousehold(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreate() {
    setError("");
    setSuccess("");
    const name = createName.trim();
    if (name.length < 2) {
      setError("Household name must be at least 2 characters.");
      return;
    }

    try {
      setLoading(true);
      await createHousehold(token, name);
      await refreshMe(token);
      await load();
      setCreateName("");
      setSuccess("Household created successfully.");
    } catch (e) {
      setError(e?.message || "Failed to create household.");
    } finally {
      setLoading(false);
    }
  }

  async function onJoin() {
    setError("");
    setSuccess("");
    const code = joinCode.trim().toUpperCase();
    if (code.length < 4) {
      setError("Invite code looks too short.");
      return;
    }

    try {
      setLoading(true);
      await joinHousehold(token, code);
      await refreshMe(token);
      await load();
      setJoinCode("");
      setSuccess("Joined household successfully.");
    } catch (e) {
      setError(e?.message || "Failed to join household.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container sx={{ py: { xs: 3, md: 5 } }}>
      <motion.div {...anim}>
        <Stack spacing={2.5} alignItems="center" textAlign="center">
          <Typography variant="h3" sx={{ fontWeight: 950, color: brand.nightForest }}>
            Household
          </Typography>
          <Typography sx={{ color: "text.secondary", maxWidth: 720 }}>
            A household lets roommates/family share the same inventory, alerts, and grocery list.
            Create one or join using an invite code.
          </Typography>
        </Stack>

        <Box sx={{ mt: 3, display: "grid", gap: 2 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {success ? <Alert severity="success">{success}</Alert> : null}

          <Paper
            sx={{
              p: 2.2,
              borderRadius: 2,
              border: "1px solid rgba(43,43,35,0.12)",
              boxShadow: "0 12px 28px rgba(43,43,35,0.10)",
            }}
          >
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 900, color: brand.nightForest }}>
                Current household
              </Typography>

              {loading ? (
                <Typography color="text.secondary">Loading...</Typography>
              ) : household ? (
                <Stack spacing={0.6}>
                  <Typography><b>Name:</b> {household.name}</Typography>
                  <Typography><b>Invite code:</b> {household.inviteCode}</Typography>
                  <Typography><b>Members:</b> {household.membersCount}</Typography>
                </Stack>
              ) : (
                <Typography color="text.secondary">You are not in a household yet.</Typography>
              )}

              <Button variant="outlined" onClick={load} disabled={loading}>
                Refresh
              </Button>
            </Stack>
          </Paper>

          <Divider />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
            }}
          >
            <Paper
              sx={{
                p: 2.2,
                borderRadius: 2,
                border: "1px solid rgba(43,43,35,0.12)",
                boxShadow: "0 12px 28px rgba(43,43,35,0.10)",
              }}
            >
              <Stack spacing={1.2}>
                <Typography sx={{ fontWeight: 900, color: brand.nightForest }}>
                  Create a household
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You’ll become the first member and get an invite code to share.
                </Typography>

                <TextField
                  label="Household name"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  fullWidth
                />

                <Button
                  variant="contained"
                  onClick={onCreate}
                  disabled={loading || createName.trim().length < 2 || hasHousehold}
                >
                  Create
                </Button>

                {hasHousehold ? (
                  <Typography variant="body2" color="text.secondary">
                    You already belong to a household. Leave/switch can be added later.
                  </Typography>
                ) : null}
              </Stack>
            </Paper>

            <Paper
              sx={{
                p: 2.2,
                borderRadius: 2,
                border: "1px solid rgba(43,43,35,0.12)",
                boxShadow: "0 12px 28px rgba(43,43,35,0.10)",
              }}
            >
              <Stack spacing={1.2}>
                <Typography sx={{ fontWeight: 900, color: brand.nightForest }}>
                  Join a household
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter an invite code from someone in your household.
                </Typography>

                <TextField
                  label="Invite code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  fullWidth
                />

                <Button
                  variant="contained"
                  onClick={onJoin}
                  disabled={loading || joinCode.trim().length < 4 || hasHousehold}
                >
                  Join
                </Button>

                {hasHousehold ? (
                  <Typography variant="body2" color="text.secondary">
                    You already belong to a household.
                  </Typography>
                ) : null}
              </Stack>
            </Paper>
          </Box>
        </Box>
      </motion.div>
    </Container>
  );
}
