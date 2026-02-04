import { useEffect, useMemo, useState } from "react";
import { Box, Button, Chip, Grid, Paper, Stack, Typography, Divider, IconButton, Tooltip } from "@mui/material";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";

import { brand } from "../theme";

// ✅ HERO carousel images
import hero1 from "../assets/hero1.webp";
import hero2 from "../assets/hero2.webp";
import hero3 from "../assets/hero3.webp";
import hero4 from "../assets/hero4.webp";

// ✅ Feature images
import inventoryImg from "../assets/inventory-tracking.webp";
import expiryImg from "../assets/expiry-reminders.webp";
import lowStockImg from "../assets/low-stock.webp";
import listSyncImg from "../assets/grocery-list-sync.webp";
import householdImg from "../assets/shared-household.webp";

// ✅ Workflow image
import workflowImg from "../assets/workflow.webp";

const sectionTone = {
  hero: { bg: "rgba(255,255,255,0.92)", accent: brand.springLeaves },
  features: { bg: "rgba(203,209,131,0.16)", accent: brand.goldVelvet },
  workflow: { bg: "rgba(211,194,205,0.18)", accent: brand.peaFlower },
  cta: { bg: "rgba(239,206,123,0.16)", accent: brand.floridaOranges },
};

/**
 * Shared viewport policy for scroll animations:
 * - once: true => no jitter, no replay spam
 * - amount: 0.22 => triggers when ~22% visible
 */
const VIEWPORT = { once: true, amount: 0.22 };

function Section({ id, tone, eyebrow, title, subtitle, children }) {
  const t = sectionTone[tone] || sectionTone.hero;

  return (
    <Box
      id={id}
      sx={{
        position: "relative",
        scrollMarginTop: "90px",
        mt: { xs: 2, md: 3 },
        px: { xs: 1.25, md: 2.2 },
        py: { xs: 3, md: 4 },
        borderRadius: 4,
        background: t.bg,
        border: "1px solid rgba(43,43,35,0.10)",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: "hidden",
      }}
    >
      {/* accent bar */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          background: t.accent,
          opacity: 0.9,
        }}
      />

      {/* subtle background glow */}
      <Box
        sx={{
          position: "absolute",
          top: -120,
          left: -140,
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: `radial-gradient(circle at 30% 30%, rgba(203,209,131,0.26), transparent 60%)`,
          filter: "blur(2px)",
          pointerEvents: "none",
        }}
      />

      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Box sx={{ width: "100%", maxWidth: 1020 }}>
          {(title || subtitle) && (
            <Stack spacing={0.8} sx={{ mb: { xs: 2, md: 2.5 }, textAlign: "center" }}>
              {eyebrow && (
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 950,
                    color: t.accent,
                    textTransform: "uppercase",
                    letterSpacing: 0.9,
                  }}
                >
                  {eyebrow}
                </Typography>
              )}
              {title && <Typography variant="h2">{title}</Typography>}
              {subtitle && (
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mx: "auto", maxWidth: 820, lineHeight: 1.7 }}
                >
                  {subtitle}
                </Typography>
              )}
            </Stack>
          )}

          {children}
        </Box>
      </Box>
    </Box>
  );
}

function LabelChip({ label }) {
  return (
    <Chip
      label={label}
      variant="outlined"
      sx={{
        borderColor: "rgba(43,43,35,0.20)",
        color: "rgba(43,43,35,0.85)",
        bgcolor: "transparent",
        fontWeight: 700,
      }}
    />
  );
}

/** ✅ Simple carousel with crossfade animation */
function HeroCarousel({ images }) {
  const [i, setI] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % images.length), 3500);
    return () => clearInterval(t);
  }, [images.length]);

  const go = (dir) => setI((p) => (p + dir + images.length) % images.length);

  return (
    <Paper
      sx={{
        p: 0,
        borderRadius: 4,
        boxShadow: "none",
        border: "1px solid rgba(43,43,35,0.10)",
        background: "#fff",
        overflow: "hidden",
        width: "100%",
        maxWidth: 520,
      }}
    >
      <Box sx={{ position: "relative" }}>
        <AnimatePresence mode="wait">
          <Box
            key={i}
            component={motion.img}
            src={images[i]}
            alt={`hero-${i + 1}`}
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0.2, scale: 0.99 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0.2, scale: 0.99 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: "100%",
              height: "240px",
              objectFit: "cover",
              display: "block",
            }}
          />
        </AnimatePresence>

        {/* arrows */}
        <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", px: 1 }}>
          <Tooltip title="Previous">
            <IconButton
              onClick={() => go(-1)}
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(43,43,35,0.12)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.95)" },
              }}
            >
              <ArrowBackIosNewRoundedIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>

          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title="Next">
            <IconButton
              onClick={() => go(1)}
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(43,43,35,0.12)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.95)" },
              }}
            >
              <ArrowForwardIosRoundedIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* dots */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 10,
            display: "flex",
            justifyContent: "center",
            gap: 0.8,
          }}
        >
          {images.map((_, idx) => (
            <Box
              key={idx}
              onClick={() => setI(idx)}
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                cursor: "pointer",
                border: "1px solid rgba(43,43,35,0.22)",
                bgcolor: idx === i ? brand.springLeaves : "rgba(255,255,255,0.85)",
              }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ p: 1.2 }}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Grocery life, but calmer — stock, expiry, list, done.
        </Typography>
      </Box>
    </Paper>
  );
}

function MiniPreview() {
  return (
    <Paper
      sx={{
        p: 2.2,
        borderRadius: 3,
        boxShadow: "none",
        background: "#fff",
        border: "1px solid rgba(43,43,35,0.10)",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography sx={{ fontWeight: 950 }}>Live preview</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            What the app is built to solve
          </Typography>
        </Box>
        <Chip
          label="MVP"
          sx={{
            bgcolor: "rgba(43,43,35,0.08)",
            color: brand.nightForest,
            fontWeight: 900,
            borderRadius: 10,
          }}
        />
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      <Stack spacing={1.2}>
        <Typography variant="body2" sx={{ fontWeight: 900, display: "flex", gap: 1, alignItems: "center" }}>
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: brand.poppy }} />
          Expiring soon
        </Typography>

        <Paper sx={{ p: 1.25, borderRadius: 2, boxShadow: "none", border: "1px solid rgba(43,43,35,0.10)" }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ fontWeight: 900 }}>
              Milk
            </Typography>
            <Typography variant="body2" sx={{ color: brand.poppy, fontWeight: 950 }}>
              2 days
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Location: Fridge • Qty: 1L
          </Typography>
        </Paper>

        <Typography variant="body2" sx={{ fontWeight: 900, display: "flex", gap: 1, alignItems: "center" }}>
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: brand.floridaOranges }} />
          Low stock
        </Typography>

        <Paper sx={{ p: 1.25, borderRadius: 2, boxShadow: "none", border: "1px solid rgba(43,43,35,0.10)" }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ fontWeight: 900 }}>
              Rice
            </Typography>
            <Typography variant="body2" sx={{ color: brand.floridaOranges, fontWeight: 950 }}>
              Add to list
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Suggested qty based on your threshold
          </Typography>
        </Paper>

        <Button
          variant="outlined"
          fullWidth
          sx={{ borderColor: "rgba(43,43,35,0.35)", color: brand.nightForest }}
          startIcon={<ChecklistOutlinedIcon />}
        >
          Generate list (preview)
        </Button>
      </Stack>
    </Paper>
  );
}

/** ✅ Feature row with scroll reveal + hover lift + subtle image float */
function FeatureRow({ title, desc, bullets, tags, img, icon, accent, flip = false }) {
  const reduceMotion = useReducedMotion();

  const cardVariants = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.2 } } }
    : {
        hidden: (dir) => ({ opacity: 0, y: 18, x: dir * 18, scale: 0.985 }),
        show: {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          transition: { type: "spring", stiffness: 120, damping: 18 },
        },
      };

  const imgFloat = reduceMotion
    ? {}
    : {
        animate: { y: [0, -6, 0] },
        transition: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
      };

  const dir = flip ? 1 : -1;

  return (
    <Box
      component={motion.div}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={cardVariants}
      custom={dir}
      style={{ width: "100%" }}
    >
      <Paper
        sx={{
          p: { xs: 2.0, sm: 2.6, md: 3 },
          borderRadius: 4,
          boxShadow: "none",
          background: "#fff",
          border: "1px solid rgba(43,43,35,0.10)",
        }}
      >
        <Grid
          container
          spacing={{ xs: 1.6, sm: 2.6 }}
          alignItems="center"
          direction={{ xs: "column", sm: flip ? "row-reverse" : "row" }}
          sx={{ flexWrap: { xs: "wrap", sm: "nowrap" } }}
        >
          {/* TEXT */}
          <Grid item xs={12} sm={7} md={7} sx={{ minWidth: 0 }}>
            <Stack
              spacing={1.2}
              sx={{
                textAlign: { xs: "center", sm: "left" },
                alignItems: { xs: "center", sm: "flex-start" },
              }}
            >
              <Stack
                direction="row"
                spacing={1.2}
                alignItems="flex-start"
                sx={{
                  width: "100%",
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 3,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "rgba(43,43,35,0.06)",
                    color: accent,
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h3" sx={{ lineHeight: 1.2 }}>
                    {title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      mt: 0.6,
                      lineHeight: 1.7,
                      maxWidth: 520,
                    }}
                  >
                    {desc}
                  </Typography>
                </Box>
              </Stack>

              {/* bullets */}
              <Box
                component="ul"
                sx={{
                  m: 0,
                  pl: 2.2,
                  width: "100%",
                  maxWidth: 560,
                  textAlign: "left",
                  color: "rgba(43,43,35,0.80)",
                  "& li": { mb: 0.7 },
                }}
              >
                {bullets.map((b) => (
                  <li key={b}>
                    <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                      {b}
                    </Typography>
                  </li>
                ))}
              </Box>

              {/* tags */}
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  flexWrap: "wrap",
                  justifyContent: { xs: "center", sm: "flex-start" },
                  pt: 0.3,
                }}
              >
                {tags.map((t) => (
                  <Chip
                    key={t}
                    label={t}
                    size="small"
                    sx={{
                      bgcolor: "rgba(43,43,35,0.06)",
                      fontWeight: 900,
                      borderRadius: 999,
                    }}
                  />
                ))}
              </Stack>
            </Stack>
          </Grid>

          {/* IMAGE */}
          <Grid item xs={12} sm={5} md={5} sx={{ minWidth: 0 }}>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
              <Box
                component={motion.div}
                whileHover={reduceMotion ? undefined : { y: -4 }}
                transition={{ duration: 0.18 }}
                style={{ width: "100%" }}
              >
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: { xs: 520, sm: 420, md: 520 },
                    borderRadius: 4,
                    border: "1px solid rgba(43,43,35,0.10)",
                    background: "linear-gradient(180deg, rgba(255,255,255,0.70), rgba(255,255,255,0.35))",
                    p: { xs: 1.6, sm: 1.6, md: 2.0 },
                    minHeight: { xs: 0, sm: 240, md: 280 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    component={motion.img}
                    src={img}
                    alt={title}
                    {...imgFloat}
                    style={{
                      width: "100%",
                      height: reduceMotion ? "260px" : "260px",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

/** ✅ Workflow timeline (clean rail + stagger) */
function WorkflowTimeline({ steps }) {
  const reduceMotion = useReducedMotion();
  const lastIdx = steps.length - 1;
  const DOT_TOP = 30;

  const container = reduceMotion
    ? {}
    : {
        hidden: {},
        show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
      };

  const item = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.2 } } }
    : {
        hidden: { opacity: 0, y: 18, scale: 0.99 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 120, damping: 18 } },
      };

  return (
    <Box sx={{ width: "100%", maxWidth: 920, mx: "auto", mt: { xs: 2, sm: 2.5 } }}>
      <Paper
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: 5,
          boxShadow: "none",
          background: "rgba(255,255,255,0.68)",
          border: "1px solid rgba(43,43,35,0.10)",
          backdropFilter: "blur(6px)",
        }}
        component={motion.div}
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
      >
        <Stack spacing={{ xs: 1.6, sm: 2 }}>
          {steps.map((s, idx) => (
            <Box
              key={s.n}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "56px 1fr" },
                columnGap: { sm: 2 },
                alignItems: "stretch",
              }}
            >
              {/* RAIL (tablet/desktop only) */}
              <Box sx={{ position: "relative", display: { xs: "none", sm: "block" } }}>
                {idx !== 0 && (
                  <Box
                    sx={{
                      position: "absolute",
                      left: "50%",
                      top: 0,
                      height: DOT_TOP,
                      width: 2,
                      bgcolor: "rgba(43,43,35,0.12)",
                      transform: "translateX(-50%)",
                    }}
                  />
                )}
                {idx !== lastIdx && (
                  <Box
                    sx={{
                      position: "absolute",
                      left: "50%",
                      top: DOT_TOP + 18,
                      bottom: 0,
                      width: 2,
                      bgcolor: "rgba(43,43,35,0.12)",
                      transform: "translateX(-50%)",
                    }}
                  />
                )}

                <Box
                  component={motion.div}
                  initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
                  whileInView={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
                  viewport={VIEWPORT}
                  transition={{ type: "spring", stiffness: 160, damping: 14 }}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: DOT_TOP,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: s.c,
                    transform: "translateX(-50%)",
                    border: "3px solid rgba(255,255,255,0.95)",
                    boxShadow: "0 14px 24px rgba(43,43,35,0.12)",
                  }}
                />
              </Box>

              {/* CARD */}
              <Paper
                component={motion.div}
                variants={item}
                whileHover={reduceMotion ? undefined : { y: -2 }}
                transition={{ duration: 0.18 }}
                sx={{
                  p: { xs: 2, sm: 2.2 },
                  borderRadius: { xs: 4, sm: 999 },
                  boxShadow: "none",
                  background: "#fff",
                  border: "1px solid rgba(43,43,35,0.10)",
                  borderLeft: { xs: `6px solid ${s.c}`, sm: "1px solid rgba(43,43,35,0.10)" },
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.2}
                  alignItems={{ xs: "center", sm: "baseline" }}
                  justifyContent={{ xs: "center", sm: "flex-start" }}
                  sx={{ textAlign: { xs: "center", sm: "left" } }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        display: { xs: "inline-flex", sm: "none" },
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        bgcolor: s.c,
                      }}
                    />
                    <Chip
                      label={s.n}
                      sx={{
                        bgcolor: "rgba(43,43,35,0.06)",
                        fontWeight: 950,
                        borderRadius: 999,
                      }}
                    />
                  </Stack>

                  <Typography variant="h3" sx={{ lineHeight: 1.2 }}>
                    {s.t}
                  </Typography>
                </Stack>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.9,
                    color: "text.secondary",
                    lineHeight: 1.7,
                    textAlign: { xs: "center", sm: "left" },
                  }}
                >
                  {s.d}
                </Typography>
              </Paper>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const heroImages = useMemo(() => [hero1, hero2, hero3, hero4], []);
  const featureTags = useMemo(() => ["Clean MVP", "Mobile-first", "Household scoped"], []);

  const features = useMemo(
    () => [
      {
        title: "Inventory tracking",
        desc: "Track quantity and storage location so you stop buying duplicates.",
        bullets: ["Per-item quantity + location", "Optional thresholds", "Fast updates (no clutter)"],
        img: inventoryImg,
        icon: <Inventory2OutlinedIcon />,
        accent: brand.springLeaves,
      },
      {
        title: "Expiry reminders",
        desc: "Get notified before items expire based on your lead time (3–7 days).",
        bullets: ["Lead-time reminders", "‘Expiring soon’ action view", "Waste prevention by default"],
        img: expiryImg,
        icon: <WarningAmberOutlinedIcon />,
        accent: brand.poppy,
      },
      {
        title: "Low-stock alerts",
        desc: "Set thresholds; when stock dips below, it becomes an action item.",
        bullets: ["Threshold per item", "No manual scanning", "Turns alerts into list items"],
        img: lowStockImg,
        icon: <ChecklistOutlinedIcon />,
        accent: brand.floridaOranges,
      },
      {
        title: "List sync",
        desc: "Sync low-stock items into your grocery list and check off while shopping.",
        bullets: ["One-tap sync", "Shopping-friendly checklist", "Less missed items"],
        img: listSyncImg,
        icon: <SpeedOutlinedIcon />,
        accent: brand.goodSurf,
      },
      {
        title: "Shared household",
        desc: "Invite family/roommates with a code so everyone shops off the same data.",
        bullets: ["Single pantry source of truth", "Shared list", "Less duplicate buying"],
        img: householdImg,
        icon: <GroupsOutlinedIcon />,
        accent: brand.dustyBerry,
      },
      {
        title: "AI-ready suggestions (later)",
        desc: "MVP captures the right signals now (usage + thresholds) so AI can plug in later.",
        bullets: ["Stores usage signals", "Future: refill timing + qty suggestions", "Future: receipt/OCR import"],
        img: hero4,
        icon: <AutoAwesomeOutlinedIcon />,
        accent: brand.peaFlower,
      },
    ],
    []
  );

  // Page-load hero animation
  const heroIn = reduceMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
      };

  // Scroll section wrapper
  const sectionIn = reduceMotion
    ? { initial: { opacity: 1 }, whileInView: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
      };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2.5, md: 3 } }}>
      {/* HERO (page-open animation) */}
      <motion.div {...heroIn}>
        <Section
          tone="hero"
          eyebrow="Smart Grocery"
          title={
            <Box component="span">
              Your pantry,{" "}
              <Box component="span" sx={{ color: brand.springLeaves }}>
                under control.
              </Box>
            </Box>
          }
          subtitle="Track inventory, prevent expiry waste, and build grocery lists that match your household—fast, minimal, and mobile-first."
        >
          <Grid container spacing={2.5} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={6}>
              <Stack spacing={2} alignItems="center" justifyContent="center">
                <HeroCarousel images={heroImages} />

                <Chip
                  label="Less waste • Fewer duplicates • Faster shopping"
                  sx={{
                    bgcolor: "rgba(248,202,186,0.80)",
                    color: brand.nightForest,
                    fontWeight: 900,
                    borderRadius: 10,
                    width: "fit-content",
                  }}
                />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems="center" justifyContent="center">
                  <Button variant="contained" size="large" onClick={() => navigate("/register")}>
                    Create free account
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{ borderColor: brand.nightForest, color: brand.nightForest }}
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </Button>
                </Stack>

                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }} justifyContent="center">
                  <LabelChip label="Inventory + expiry" />
                  <LabelChip label="Shared household" />
                  <LabelChip label="AI-ready suggestions" />
                </Stack>

                <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", maxWidth: 520, lineHeight: 1.7 }}>
                  Built as a student MVP with clean domain boundaries: Household → Inventory → Alerts → Grocery List.
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <MiniPreview />
            </Grid>
          </Grid>
        </Section>
      </motion.div>

      {/* FEATURES (scroll-in per card, staggered naturally by viewport position) */}
      <motion.div {...sectionIn} viewport={VIEWPORT}>
        <Section
          id="features"
          tone="features"
          eyebrow="Features"
          title="Designed for real households"
          subtitle="Clean inputs. Clear outputs. Less tapping, fewer mistakes—especially on mobile."
        >
          <Stack spacing={2.2}>
            {features.map((f, idx) => (
              <FeatureRow
                key={f.title}
                title={f.title}
                desc={f.desc}
                bullets={f.bullets}
                tags={featureTags}
                img={f.img}
                icon={f.icon}
                accent={f.accent}
                flip={idx % 2 === 1}
              />
            ))}
          </Stack>
        </Section>
      </motion.div>

      {/* WORKFLOW (scroll-in + image reveal + timeline stagger) */}
      <motion.div {...sectionIn} viewport={VIEWPORT}>
        <Section
          id="workflow"
          tone="workflow"
          eyebrow="Workflow"
          title="Three steps. No setup marathon."
          subtitle="Everything is scoped to a household. Alerts drive action. Lists stay in sync."
        >
          <Stack spacing={2.2} alignItems="center">
            {/* workflow image */}
            <Box
              component={motion.div}
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
              whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: "100%", display: "flex", justifyContent: "center" }}
            >
              <Box
                component="img"
                src={workflowImg}
                alt="Workflow"
                style={{
                  width: "100%",
                  maxWidth: 760,
                  height: "260px",
                  objectFit: "contain",
                  display: "block",
                  borderRadius: 16,
                  filter: "drop-shadow(0 18px 28px rgba(43,43,35,0.10))",
                }}
              />
            </Box>

            <WorkflowTimeline
              steps={[
                {
                  n: "01",
                  t: "Create or join a household",
                  d: "Start solo or join via invite code. Inventory and lists are scoped here.",
                  c: brand.goldVelvet,
                },
                {
                  n: "02",
                  t: "Add items once, then maintain",
                  d: "Track quantity, threshold and expiry date. Updates are quick and minimal.",
                  c: brand.springLeaves,
                },
                {
                  n: "03",
                  t: "Let alerts drive the list",
                  d: "Low stock + expiring soon become action items. Sync them into the grocery list.",
                  c: brand.peaFlower,
                },
              ]}
            />
          </Stack>
        </Section>
      </motion.div>

      {/* CTA (scroll-in) */}
      <motion.div {...sectionIn} viewport={VIEWPORT}>
        <Section
          tone="cta"
          eyebrow="Get started"
          title="Start simple. Scale smart."
          subtitle="This MVP focuses on clean fundamentals. Once stable, you can extend notifications and smarter suggestions without rewriting the app."
        >
          <Stack spacing={2} alignItems="center" justifyContent="center">
            <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", maxWidth: 860 }}>
              Current MVP scope: authentication, households, inventory, alerts, and grocery list sync. Next logical additions:
              in-app notifications history + “mark as read/dismiss” flows.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems="center" justifyContent="center">
              <Button variant="contained" size="large" onClick={() => navigate("/register")}>
                Create account
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{ borderColor: brand.nightForest, color: brand.nightForest }}
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            </Stack>
          </Stack>
        </Section>
      </motion.div>
    </Box>
  );
}
