import { loadFont } from "@remotion/google-fonts/Figtree";

// Mesmos tokens de src/app/globals.css (o app usa Tailwind; aqui os valores vão direto).
export const COR = {
  rosa50: "#fde7ef",
  rosa100: "#fbd3e1",
  rosa300: "#e7a9c2",
  rosa600: "#b83c70",
  rosa700: "#962d5a",
  azul50: "#f1f7fc",
  azul100: "#cfe6f7",
  azul700: "#2f6596",
  tinta: "#1f1b2d",
  suave: "#5e5873",
  linha: "#dce7f0",
  alerta: "#b42318",
  alerta50: "#fdecea",
  alerta900: "#8a1c12",
  lilas: "#e6dcf7",
  menta: "#d6efe2",
  baunilha: "#fbeec4",
  pessego: "#fde2cc",
  verde: "#4f9a6b",
  branco: "#ffffff",
};

export const SOMBRA_SUAVE = "0 2px 4px rgb(31 42 68 / 0.05), 0 24px 56px -30px rgb(31 42 68 / 0.35)";
export const SOMBRA_ROSA = "0 20px 60px -24px rgb(184 60 112 / 0.75)";

export const { fontFamily: FONTE } = loadFont("normal", { weights: ["500", "600", "700", "800"], subsets: ["latin"] });

export const FPS = 30;
