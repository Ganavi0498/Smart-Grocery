import { Box, Container, Divider, Grid, IconButton, Link, Paper, Stack, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined";
import { brand } from "../theme";

function FooterLink({ children, onClick }) {
  return (
    <Link
      component="button"
      onClick={onClick}
      underline="none"
      sx={{
        textAlign: "left",
        color: "rgba(43,43,35,0.82)",
        fontWeight: 700,
        fontSize: "0.95rem",
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        "&:hover": { color: brand.springLeaves },
      }}
    >
      {children}
    </Link>
  );
}

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const go = (path) => navigate(path);

  const goHomeAndScroll = (id) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Box
      sx={{
        width: { xs: "100%", md: "100vw" },
        position: { xs: "static", md: "relative" },
        left: { md: "50%" },
        right: { md: "50%" },
        marginLeft: { md: "-50vw" },
        marginRight: { md: "-50vw" },
        mt: { xs: 3, md: 5 },
        mb: 0,
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 18px 40px rgba(43,43,35,0.10)",
        borderTop: "1px solid rgba(43,43,35,0.10)",
        zIndex: 10,
        overflowX: "hidden",
      }}
    >
      <Container maxWidth="lg">
        <Paper
          sx={{
            borderRadius: 3,
            p: { xs: 3, md: 5 }, // More padding for better spacing
            background: "none",
            border: "none",
            boxShadow: "none",
          }}
        >
          <Grid
            container
            spacing={{ xs: 3, md: 4 }}
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{
              rowGap: { xs: 3, md: 4 },
              columnGap: { xs: 2, md: 4 },
            }}
          >
            <Grid item xs={12} md={4} sx={{ minWidth: 220 }}>
              <Stack spacing={1.8}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      background: `linear-gradient(135deg, ${brand.pistachio}, ${brand.springLeaves})`,
                      border: "1px solid rgba(43,43,35,0.12)",
                      color: brand.nightForest,
                    }}
                  >
                    <SpaOutlinedIcon />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 950, color: brand.nightForest }}>Smart Grocery</Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Inventory • expiry • shared households
                    </Typography>
                  </Box>
                </Stack>
                <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 360 }}>
                  A minimal, mobile-first grocery inventory app that reduces waste and prevents duplicate buys.
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={4} md={2.7} sx={{ minWidth: 150, pl: { md: 2 } }}>
              <Stack spacing={1.5}>
                <Typography sx={{ fontWeight: 950, color: brand.nightForest }}>Company</Typography>
                <FooterLink onClick={() => goHomeAndScroll("features")}>Features</FooterLink>
                <FooterLink onClick={() => goHomeAndScroll("workflow")}>Workflow</FooterLink>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={4} md={2.7} sx={{ minWidth: 150, pl: { md: 2 } }}>
              <Stack spacing={1.5}>
                <Typography sx={{ fontWeight: 950, color: brand.nightForest }}>Product</Typography>
                <FooterLink onClick={() => go("/inventory")}>Inventory</FooterLink>
                <FooterLink onClick={() => go("/alerts")}>Alerts</FooterLink>
                <FooterLink onClick={() => go("/grocery-list")}>Grocery list</FooterLink>
                <FooterLink onClick={() => go("/household")}>Household</FooterLink>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={4} md={2.6} sx={{ minWidth: 170, pl: { md: 2 } }}>
              <Stack spacing={1.5}>
                <Typography sx={{ fontWeight: 950, color: brand.nightForest }}>Account</Typography>
                <FooterLink onClick={() => go("/login")}>Login</FooterLink>
                <FooterLink onClick={() => go("/register")}>Create account</FooterLink>
                <Stack direction="row" spacing={1.2} sx={{ pt: 0.5 }}>
                  <IconButton
                    aria-label="Email"
                    size="small"
                    sx={{ border: "1px solid rgba(43,43,35,0.14)" }}
                  >
                    <MailOutlineIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    aria-label="GitHub"
                    size="small"
                    sx={{ border: "1px solid rgba(43,43,35,0.14)" }}
                  >
                    <GitHubIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    aria-label="LinkedIn"
                    size="small"
                    sx={{ border: "1px solid rgba(43,43,35,0.14)" }}
                  >
                    <LinkedInIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    aria-label="Instagram"
                    size="small"
                    sx={{ border: "1px solid rgba(43,43,35,0.14)" }}
                  >
                    <InstagramIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
          >
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              © {new Date().getFullYear()} Smart Grocery. Student MVP.
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Built with MERN • Docker • Material UI
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
