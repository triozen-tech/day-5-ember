import { origins } from "../content";

// Hand-drawn south India map (Motion map M8: the copper routes draw from each estate to the roastery).
// Simple lon/lat projection; the outline is deliberately loose, like a sketch on a coffee bag.

const K = 40;
const px = (lon: number, lat: number) => [(lon - 72.5) * K, (20 - lat) * K] as const;

const OUTLINE: [number, number][] = [
  [72.9, 19.6], [73.0, 18.0], [73.3, 17.0], [73.7, 16.0], [73.9, 15.3], [74.4, 14.0], [74.8, 12.9], [75.4, 11.8], [75.9, 11.0],
  [76.3, 9.9], [76.6, 9.0], [77.1, 8.3], [77.5, 8.1], [78.1, 8.8], [78.2, 9.3], [79.0, 9.4], [79.3, 10.3], [79.85, 10.8],
  [79.85, 11.9], [80.2, 13.0], [80.3, 13.6], [80.1, 15.0], [80.3, 15.7], [81.0, 16.0], [81.6, 16.4], [82.3, 16.7], [82.4, 17.2],
  [83.3, 17.7], [84.2, 18.4], [84.8, 19.2], [85.1, 19.6],
];

function smooth(pts: (readonly [number, number])[]) {
  return pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}

export default function OriginMap({ className = "" }: { className?: string }) {
  const outline = smooth(OUTLINE.map(([lo, la]) => px(lo, la)));
  const [rx, ry] = px(origins.roastery.lon, origins.roastery.lat);
  return (
    <svg viewBox="0 0 520 500" className={className} fill="none" aria-label="Map of the four coffee estates and the roastery in Hyderabad">
      <defs>
        <linearGradient id="map-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a1a10" stopOpacity="0" />
          <stop offset=".12" stopColor="#2a1a10" stopOpacity="1" />
        </linearGradient>
      </defs>
      <path className="map-outline" d={outline} stroke="url(#map-fade)" strokeOpacity=".55" strokeWidth="1.4" strokeLinejoin="round" strokeDasharray="1 0" />
      {/* hills */}
      {origins.items.map((o) => {
        const [x, y] = px(o.lon, o.lat);
        return <path key={`h-${o.name}`} d={`M${x - 14},${y + 6} l7,-9 l5,5 l6,-10 l10,14`} stroke="#6d5744" strokeOpacity=".6" strokeWidth="1.2" strokeLinejoin="round" />;
      })}
      {/* routes to the roastery: dashed, revealed by a solid mask path that draws from the estate (M8) */}
      {origins.items.map((o, i) => {
        const [x, y] = px(o.lon, o.lat);
        const cx = (x + rx) / 2 + (i % 2 ? 40 : -30);
        const cy = (y + ry) / 2 - 30;
        const d = `M${x},${y} Q${cx},${cy} ${rx},${ry}`;
        return (
          <g key={`r-${o.name}`}>
            <mask id={`route-mask-${i}`} maskUnits="userSpaceOnUse" x="0" y="0" width="520" height="500">
              <path className="route-reveal" d={d} stroke="#fff" strokeWidth="6" fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset="0" />
            </mask>
            <path className="map-route" d={d} stroke="#985018" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="5 6" mask={`url(#route-mask-${i})`} />
          </g>
        );
      })}
      {origins.items.map((o, i) => {
        const [x, y] = px(o.lon, o.lat);
        const east = o.lon > 80; // Araku: label below the dot, clear of the roastery
        return (
          <g key={o.name} className="map-dot" data-dot={i}>
            <circle cx={x} cy={y} r="9" fill="#985018" fillOpacity=".18" />
            <circle cx={x} cy={y} r="4.5" fill="#985018" />
            <text x={east ? x + 6 : x + 14} y={east ? y + 28 : y + 5} textAnchor={east ? "middle" : "start"} fill="#2a1a10" fontSize="15" fontFamily="var(--font-body-family)" fontWeight="500">
              {String(i + 1).padStart(2, "0")} {o.name}
            </text>
          </g>
        );
      })}
      <g className="map-roastery">
        <circle cx={rx} cy={ry} r="16" fill="#e0913f" fillOpacity=".22" />
        <circle cx={rx} cy={ry} r="7" fill="#e0913f" stroke="#1b120c" strokeWidth="2" />
        <text x={rx - 18} y={ry + 5} textAnchor="end" fill="#2a1a10" fontSize="15" fontFamily="var(--font-body-family)" fontWeight="600">
          Roastery · Hyderabad
        </text>
      </g>
    </svg>
  );
}
