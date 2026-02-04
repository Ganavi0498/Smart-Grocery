import { createTheme } from "@mui/material/styles";

export const brand = {
  lilacGrey: "#D3C2CD",
  springLeaves: "#849E15", // NOTE: hex must be 0-9/A-F (not "I")
  goodSurf: "#92A2A6",
  goldVelvet: "#B28622",
  brinkOfPink: "#F8CABA",
  poppy: "#D8560E",
  butterYellow: "#EFCE7B",
  floridaOranges: "#E1903E",
  peaFlower: "#6777B6",
  nightForest: "#2B2B23",
  dustyBerry: "#D17089",
  pistachio: "#CBD183",
};

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: brand.springLeaves, contrastText: "#FFFFFF" },
    secondary: { main: brand.peaFlower, contrastText: "#FFFFFF" },
    background: { default: "#FFFFFF", paper: "#FFFFFF" },
    text: {
      primary: brand.nightForest,
      secondary: "rgba(43,43,35,0.72)",
    },
    divider: "rgba(43,43,35,0.12)",
  },

  shape: { borderRadius: 12 },

  typography: {
    fontFamily: [
      "Inter",
      "system-ui",
      "-apple-system",
      "Segoe UI",
      "Roboto",
      "Arial",
      "sans-serif",
    ].join(","),
    h1: { fontSize: "2.8rem", fontWeight: 950, letterSpacing: -1.1, lineHeight: 1.05 },
    h2: { fontSize: "2.05rem", fontWeight: 900, letterSpacing: -0.9, lineHeight: 1.15 },
    h3: { fontSize: "1.22rem", fontWeight: 850, letterSpacing: -0.35 },
    body1: { fontSize: "1rem", lineHeight: 1.72 },
    body2: { fontSize: "0.95rem", lineHeight: 1.65 },
    button: { textTransform: "none", fontWeight: 900 },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: "#fff",
          backgroundImage: `
            radial-gradient(1100px 650px at 10% 0%, rgba(203,209,131,0.18), transparent 60%),
            radial-gradient(900px 600px at 92% 10%, rgba(103,119,182,0.12), transparent 60%),
            radial-gradient(1100px 700px at 50% 100%, rgba(211,194,205,0.18), transparent 65%)
          `,
          backgroundAttachment: "fixed",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(43,43,35,0.10)",
          boxShadow: "0 10px 28px rgba(43,43,35,0.08)",
          borderRadius: 14,
        },
      },
    },

    // ✅ Strong hierarchy: buttons look like buttons
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          minHeight: 44,
          paddingLeft: 18,
          paddingRight: 18,
        },
        containedPrimary: {
          boxShadow: "0 10px 18px rgba(43,43,35,0.18)",
          "&:hover": { boxShadow: "0 14px 26px rgba(43,43,35,0.20)" },
        },
        outlined: {
          borderWidth: 2,
          backgroundColor: "#fff",
          "&:hover": { borderWidth: 2, backgroundColor: "rgba(203,209,131,0.12)" },
        },
      },
    },

    // ✅ Chips should look like labels, not actions
    MuiChip: {
      styleOverrides: {
        root: {
          height: 28,
          borderRadius: 10, // not pill
          fontWeight: 850,
        },
        label: {
          fontSize: "0.78rem",
          paddingLeft: 10,
          paddingRight: 10,
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255,255,255,0.90)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(43,43,35,0.10)",
          boxShadow: "none",
        },
      },
    },
  },
});
