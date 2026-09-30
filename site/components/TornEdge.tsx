// Torn kraft-paper edge (S4). Sits on the boundary between two sections and is filled with the colour of the
// section it belongs to. Deterministic (seeded) so server and browser draw the same edge.

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function tornPath(seed: number, w = 1440, h = 34) {
  const r = rand(seed);
  let x = 0;
  const pts: string[] = [];
  while (x < w) {
    pts.push(`${x.toFixed(1)},${(6 + r() * (h - 14) + (r() > 0.85 ? 6 : 0)).toFixed(1)}`);
    x += 6 + r() * 22;
  }
  pts.push(`${w},${(8 + r() * 12).toFixed(1)}`);
  return `M0,${h} L${pts.join(" L")} L${w},${h} Z`;
}

/** side="top": the edge sits on top of its section (tears upward into the one above). "bottom": below it. */
export default function TornEdge({ color, side = "top", seed = 7, fiber = "#fbf5ec" }: { color: string; side?: "top" | "bottom"; seed?: number; fiber?: string }) {
  const d = tornPath(seed);
  return (
    <svg
      data-torn
      aria-hidden
      viewBox="0 0 1440 34"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute left-0 z-[2] block h-[clamp(18px,2.4vw,34px)] w-full ${side === "top" ? "bottom-[calc(100%-1px)]" : "top-[calc(100%-1px)] rotate-180"}`}
    >
      <path d={d} fill={fiber} opacity="0.55" transform="translate(0 -3)" />
      <path d={d} fill={color} />
    </svg>
  );
}
