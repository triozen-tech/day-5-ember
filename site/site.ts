import type { SiteMeta, Theme } from "@/lib/site";

// Settings for THIS site: Ember Roast, a (concept) specialty coffee café and roastery in Hyderabad.
// Direction + Motion map: site/DESIGN.md. Cream "paper" sections override these colours in site.css (.paper).

export const meta: SiteMeta = {
  name: "Ember Roast",
  title: "Ember Roast — Walk in. Slow down.",
  description:
    "A specialty coffee café and roastery in Hyderabad: single-origin Indian coffees roasted every morning, an espresso bar, hand-brewed pour-overs, fresh bakes and beans to take home.",
  loaderText: "Ember Roast",
  loader: false, // site/components/LatteLoader.tsx replaces the engine loader
  // ?record=1 uses the section timeline (data-record-* on the sections, docs/RECORDING.md): 36.4 s after the 2.5 s
  // loader (≈ 39 s in all), the same seconds on laptop and phone. duration is only the fallback for constant-speed mode.
  record: { duration: 36 },
};

export const theme: Theme = {
  bg: "#1b120c",
  surface: "#271a11",
  text: "#f4e9d8",
  muted: "#c4ad92",
  accent: "#e0913f",
  accentText: "#1b120c",
  line: "#3b2b1f",
  fontDisplay: "'Fraunces Variable', 'Fraunces', Georgia, serif",
  fontBody: "'Outfit Variable', 'Outfit', system-ui, sans-serif",
  radius: 999,
  uppercaseHeadings: false,
  heroText: "#f4e9d8",
};
