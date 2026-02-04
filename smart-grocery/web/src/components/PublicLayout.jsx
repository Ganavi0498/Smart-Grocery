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
import { useState, useMemo } from "react";
import { brand } from "../theme";
import Footer from "./Footer";
import { useAuth } from "../auth/AuthContext";

function LogoMark() {
  return (
    <Box
      sx={{
        width: 42,
        height: 42,
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

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthed, isReady, logout } = useAuth();

  const isLoggedIn = isReady && Boolean(isAuthed);
  const displayName = useMemo(() => {
    const name = user?.name?.trim();
    if (name) return name;
    const email = user?.email?.trim();
    if (email) return email.split("@")[0];
    return "User";
  }, [user]);

  function scrollTo(id) {
    const doScroll = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      setOpen(false);
    };

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(doScroll, 80);
    } else {
      doScroll();
    }
  }

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  const navBtnSx = {
    color: brand.nightForest,
    borderRadius: 12,
    "&:hover": { backgroundColor: "rgba(203,209,131,0.22)" },
  };

  const accountPillSx = {
    px: 1.2,
    py: 0.6,
    borderRadius: 999,
    backgroundColor: "rgba(203,209,131,0.22)",
    border: "1px solid rgba(43,43,35,0.14)",
    color: brand.nightForest,
    fontWeight: 800,
    maxWidth: 220,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const logoutBtnSx = {
    ...navBtnSx,
    border: "1px solid rgba(43,43,35,0.16)",
    ml: 1,
  };

  const dashboardBtnSx = {
    ml: 1,
    borderRadius: 12,
  };

  // Navbar height spacer (fixed AppBar needs this so content isn't hidden)
  const appBarSpacerSx = { height: { xs: 72, md: 78 } };

  return (
    <Box sx={{ minHeight: "100vh", overflowX: "hidden" }}>
      {/* NAVBAR (FIXED - always stays on top) */}
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
        <Container maxWidth="lg">
          <Toolbar sx={{ px: 0, py: 1.2, gap: 1 }}>
            <IconButton
              onClick={() => setOpen(true)}
              sx={{ display: { xs: "inline-flex", md: "none" }, color: brand.nightForest }}
              aria-label="Open menu"
            >
              <MenuIcon />
            </IconButton>

            <Box
              onClick={() => navigate("/")}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                cursor: "pointer",
              }}
            >
              <LogoMark />
              <Typography sx={{ fontWeight: 950 }}>Smart Grocery</Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* Desktop menu */}
            <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
              {/* Left: public nav links */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Button sx={navBtnSx} onClick={() => scrollTo("features")}>
                  Features
                </Button>
                <Button sx={navBtnSx} onClick={() => scrollTo("workflow")}>
                  Workflow
                </Button>
              </Box>

              <Divider
                orientation="vertical"
                flexItem
                sx={{ mx: 1.4, borderColor: "rgba(43,43,35,0.12)" }}
              />

              {/* Right: account block */}
              {isLoggedIn ? (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography sx={accountPillSx} title={displayName}>
                    Hi, {displayName}
                  </Typography>

                  <Button sx={logoutBtnSx} onClick={handleLogout}>
                    Logout
                  </Button>

                  <Button
                    variant="contained"
                    sx={dashboardBtnSx}
                    onClick={() => navigate("/dashboard")}
                  >
                    Dashboard
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Button sx={navBtnSx} onClick={() => navigate("/login")}>
                    Login
                  </Button>

                  <Button variant="contained" onClick={() => navigate("/register")} sx={{ ml: 1 }}>
                    Get started
                  </Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Spacer so page content starts below fixed navbar */}
      <Box sx={appBarSpacerSx} />

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

              {isLoggedIn && (
                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    fontWeight: 700,
                    color: brand.nightForest,
                    maxWidth: 240,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={displayName}
                >
                  Hi, {displayName}
                </Typography>
              )}
            </Box>
          </Box>

          <List>
            <ListItemButton onClick={() => scrollTo("features")} sx={{ borderRadius: 2 }}>
              <ListItemText primary="Features" />
            </ListItemButton>
            <ListItemButton onClick={() => scrollTo("workflow")} sx={{ borderRadius: 2 }}>
              <ListItemText primary="Workflow" />
            </ListItemButton>

            <Divider sx={{ my: 1 }} />

            {isLoggedIn ? (
              <>
                <ListItemButton
                  onClick={() => {
                    setOpen(false);
                    navigate("/dashboard");
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  <ListItemText primary="Dashboard" />
                </ListItemButton>

                <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2 }}>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </>
            ) : (
              <>
                <ListItemButton
                  onClick={() => {
                    setOpen(false);
                    navigate("/login");
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  <ListItemText primary="Login" />
                </ListItemButton>
                <ListItemButton
                  onClick={() => {
                    setOpen(false);
                    navigate("/register");
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  <ListItemText primary="Get started" />
                </ListItemButton>
              </>
            )}
          </List>
        </Box>
      </Drawer>

      {/* PAGE CONTAINER CENTERED */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
          py: { xs: 2, md: 3 },
          mb: 0,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 1100, px: { xs: 1.2, md: 2 } }}>
          <Outlet />
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}
