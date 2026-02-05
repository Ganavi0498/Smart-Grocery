import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Container,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined";
import { useMemo, useState } from "react";
import { brand } from "../theme";
import Footer from "./Footer";
import { useAuth } from "../auth/AuthContext";

function LogoMark() {
  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: 12,
        display: "grid",
        placeItems: "center",
        background: `linear-gradient(135deg, ${brand.pistachio}, ${brand.springLeaves})`,
        border: "1px solid rgba(43,43,35,0.12)",
        boxShadow: "0 10px 18px rgba(43,43,35,0.12)",
        color: brand.nightForest,
      }}
    >
      <SpaOutlinedIcon sx={{ fontSize: 22 }} />
    </Box>
  );
}

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const displayName = useMemo(() => {
    const name = user?.name?.trim();
    if (name) return name;
    const email = user?.email?.trim();
    if (email) return email.split("@")[0];
    return "User";
  }, [user]);

  // Compute unread notifications count from localStorage (set by Notifications page)
  const unreadCount = useMemo(() => {
    try {
      const raw = localStorage.getItem("sg_notifications");
      if (!raw) return 0;
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return 0;
      return arr.filter((n) => !n.readAt).length;
    } catch {
      return 0;
    }
  }, [location.pathname]);

  const links = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Inventory", path: "/inventory" },
    { label: "Alerts", path: "/alerts" },
    { label: "Grocery List", path: "/grocery" },
    { label: "Notifications", path: "/notifications", badge: unreadCount },
    { label: "Household", path: "/household" },
  ];

  const navBtnSx = {
    color: brand.nightForest,
    fontWeight: 850,
    borderRadius: 12,
    "&:hover": { backgroundColor: "rgba(203,209,131,0.22)" },
  };

  const accountPillSx = {
    px: 1.2,
    py: 0.6,
    borderRadius: 999,
    backgroundColor: "rgba(203,209,131,0.18)",
    border: "1px solid rgba(43,43,35,0.14)",
    color: brand.nightForest,
    fontWeight: 900,
    maxWidth: 220,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  return (
    <Box sx={{ minHeight: "100vh", overflowX: "hidden" }}>
      {/* FIXED TOP NAV */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          top: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.drawer + 2,
          backgroundColor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(43,43,35,0.10)",
          color: brand.nightForest,
        }}
      >
        {/* maxWidth={false} => FULL WIDTH */}
        <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, md: 5 } }}>
          <Toolbar sx={{ px: 0, py: 1.1, gap: 1 }}>
            <IconButton
              onClick={() => setOpen(true)}
              sx={{ display: { xs: "inline-flex", md: "none" }, color: brand.nightForest }}
              aria-label="Open menu"
            >
              <MenuIcon />
            </IconButton>

            <Box
              onClick={() => navigate("/dashboard")}
              sx={{ display: "flex", alignItems: "center", gap: 1.2, cursor: "pointer" }}
            >
              <LogoMark />
              <Typography sx={{ fontWeight: 950 }}>Smart Grocery</Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* Desktop nav */}
            <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.5 }}>
              {links.map((l) => {
                const active = location.pathname === l.path;
                return (
                  <Button
                    key={l.path}
                    sx={{
                      ...navBtnSx,
                      borderBottom: active ? "2px solid rgba(120,140,20,0.95)" : "2px solid transparent",
                      borderRadius: 0,
                      position: "relative",
                    }}
                    onClick={() => navigate(l.path)}
                  >
                    {l.label}
                    {l.badge > 0 && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: -6,
                          right: -12,
                          background: "#e53935",
                          color: "#fff",
                          borderRadius: "50%",
                          minWidth: 22,
                          height: 22,
                          fontSize: 13,
                          fontWeight: 900,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                          zIndex: 2,
                        }}
                      >
                        {l.badge}
                      </Box>
                    )}
                  </Button>
                );
              })}

              <Divider orientation="vertical" flexItem sx={{ mx: 1.4, borderColor: "rgba(43,43,35,0.12)" }} />

              <Typography sx={accountPillSx} title={displayName}>
                Hi, {displayName}
              </Typography>

              <Button
                onClick={handleLogout}
                sx={{
                  ml: 1,
                  ...navBtnSx,
                  border: "1px solid rgba(43,43,35,0.16)",
                }}
              >
                Logout
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Spacer for fixed navbar */}
      <Box sx={{ height: { xs: 72, md: 78 } }} />

      {/* Mobile Drawer */}
      <Drawer open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 300, p: 2 }}>
          <Box sx={{ display: "flex", gap: 1.2, alignItems: "center", mb: 1 }}>
            <LogoMark />
            <Box>
              <Typography sx={{ fontWeight: 950 }}>Smart Grocery</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Minimal • Mobile-first
              </Typography>
            </Box>
          </Box>

          <List>
            {links.map((l) => (
              <ListItemButton
                key={l.path}
                onClick={() => {
                  setOpen(false);
                  navigate(l.path);
                }}
                sx={{ borderRadius: 2, position: "relative" }}
              >
                <ListItemText primary={l.label} />
                {l.badge > 0 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 18,
                      background: "#e53935",
                      color: "#fff",
                      borderRadius: "50%",
                      minWidth: 22,
                      height: 22,
                      fontSize: 13,
                      fontWeight: 900,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                      zIndex: 2,
                    }}
                  >
                    {l.badge}
                  </Box>
                )}
              </ListItemButton>
            ))}

            <Divider sx={{ my: 1 }} />

            <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2 }}>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      {/* FULL-WIDTH CONTENT AREA */}
      <Box sx={{ flex: 1, overflowX: "hidden" }}>
        <Container
          maxWidth={false}
          disableGutters
          sx={{
            px: { xs: 2, md: 5 },
            py: { xs: 2, md: 3 },
          }}
        >
          <Outlet />
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
