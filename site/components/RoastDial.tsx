"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { roast } from "../content";
import Lines from "./Lines";

// Roast dial (Motion map M30 dial rotate): pinned; a copper half-circle dial sits over a round tray of beans.
// Scrolling turns the needle Green → Light → Medium → Ember (it rests at each stop), the copper arc fills behind
// it, and the bean photo + notes switch as the needle passes each stop. The pills jump to a stop.
// ?static=1: the last stop (Ember); the pills switch stops by hand.

const ANGLES = [-66, -22, 22, 66]; // needle angle per stop (0 = straight up)
const fillFor = (angle: number) => 100 - ((angle + 90) / 180) * 100; // arc dash offset for a needle angle
// scroll progress (0–1) where the needle arrives at / leaves each stop
const ARRIVE = [0, 0.3, 0.56, 0.82];
const LEAVE = [0.12, 0.38, 0.64];

export default function RoastDial() {
  const outer = useRef<HTMLElement>(null);
  const [active, setActive] = useState(roast.stops.length - 1);
  const motion = useRef(false);

  useEffect(() => {
    const root = outer.current!;
    const needle = root.querySelector(".dial-needle");
    const fill = root.querySelector(".dial-fill");
    if (prefersReducedMotion()) {
      gsap.set(needle, { rotation: ANGLES[3], svgOrigin: "200 200" });
      return;
    }
    motion.current = true;
    setActive(0);

    const ctx = gsap.context(() => {
      gsap.set(needle, { rotation: ANGLES[0], svgOrigin: "200 200" });
      gsap.set(fill, { strokeDashoffset: fillFor(ANGLES[0]) });

      let last = 0;
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.8 },
        onUpdate() {
          // switch the stop when the needle is halfway to it
          const p = this.progress();
          let i = 0;
          for (let k = 1; k < ARRIVE.length; k++) if (p >= (LEAVE[k - 1] + ARRIVE[k]) / 2) i = k;
          if (i !== last) {
            last = i;
            setActive(i);
          }
        },
      });
      tl.to({}, { duration: 1 }, 0);
      for (let k = 1; k < ANGLES.length; k++) {
        const d = ARRIVE[k] - LEAVE[k - 1];
        tl.to(needle, { rotation: ANGLES[k], duration: d }, LEAVE[k - 1]);
        tl.to(fill, { strokeDashoffset: fillFor(ANGLES[k]), duration: d }, LEAVE[k - 1]);
      }
      // the tray turns a little with the needle, like beans in the drum
      tl.fromTo(".roast-tray", { rotation: -24 }, { rotation: 24, ease: "none", duration: 1 }, 0);
    }, root);
    return () => {
      motion.current = false;
      ctx.revert();
    };
  }, []);

  // pill: with motion, scroll to where the needle rests on that stop; without, just switch
  const go = (i: number) => {
    const root = outer.current;
    if (!motion.current || !root || !window.__lenis) return setActive(i);
    const travel = root.offsetHeight - window.innerHeight;
    const rest = i === 0 ? 0.05 : (ARRIVE[i] + (LEAVE[i] ?? 1)) / 2;
    window.__lenis.scrollTo(root.offsetTop + travel * rest, { duration: 1.4 });
  };

  return (
    <section ref={outer} id="roast" className="roast-outer pin-outer relative z-[3] bg-bg" style={{ height: "320vh" }} data-record-time="1.4" data-record-label="Roast dial">
      {/* record-mode stop: the needle has reached Ember (90% of the 220vh of scroll) */}
      <div aria-hidden className="pointer-events-none absolute left-0 h-px w-px" style={{ top: "198vh" }} data-record-time="3.4" data-record-label="Roast dial: Ember" />
      <div className="pin-stage flex items-center">
        {/* laptop: text left, dial right · below 1024px (phones, tablets): big dial on top, text below */}
        <div className="container-x grid items-center gap-10 max-lg:flex max-lg:h-full max-lg:flex-col max-lg:justify-center max-lg:gap-[3vh] max-lg:pt-[9vh] lg:grid-cols-12">
          {/* text */}
          <div className="lg:col-span-5 max-lg:order-2 max-lg:w-full max-lg:max-w-[560px]">
            <p className="eyebrow mb-6 uppercase max-lg:mb-3">{roast.eyebrow}</p>
            <Lines lines={roast.title} className="text-[clamp(40px,5.2vw,92px)] max-lg:text-[clamp(32px,6vw,56px)]" />

            <div className="relative mt-[clamp(24px,5vh,56px)] grid max-lg:mt-[2vh]">
              {roast.stops.map((s, i) => (
                <div
                  key={s.name}
                  data-roast-panel={i}
                  className={`roast-panel col-start-1 row-start-1 ${i === active ? "is-on" : ""}`}
                  style={{ transform: `translateY(${i === active ? 0 : i < active ? -18 : 18}px)` }}
                  aria-hidden={i !== active}
                >
                  <div className="flex items-baseline gap-4">
                    <span className="font-display text-[clamp(34px,3.4vw,54px)] text-accent">{s.name}</span>
                    <span className="text-[14px] text-muted">{s.sub}</span>
                  </div>
                  <p className="mt-3 max-w-[420px] text-[17px] leading-relaxed">{s.notes}</p>
                  <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-muted">
                    <span>{s.time} in the drum</span>
                    <span>{s.temp}</span>
                    <span className="text-fg">{s.best}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-[clamp(24px,5vh,48px)] flex flex-wrap gap-2 max-lg:mt-[2vh]">
              {roast.stops.map((s, i) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => go(i)}
                  className={`roast-pill min-h-11 rounded-full border px-4 py-2 text-[13px] max-md:text-[14px] transition-colors duration-300 ${i === active ? "border-accent bg-accent text-accent-fg" : "border-line text-muted hover:text-fg"}`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* dial + bean tray */}
          <div className="relative mx-auto aspect-square w-full max-w-[min(680px,78vh)] lg:col-span-7 max-lg:order-1 max-lg:w-[min(86vw,46vh)] max-lg:shrink-0">
            <div className="absolute inset-[13%] overflow-hidden rounded-full shadow-[0_40px_80px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(224,145,63,0.25)]">
              <div className="roast-tray absolute inset-0">
                {roast.stops.map((s, i) => (
                  <img
                    key={s.name}
                    src={s.image}
                    alt={`${s.name} roast coffee beans`}
                    data-roast-img={i}
                    className="absolute inset-0 h-full w-full scale-[1.35] object-cover transition-opacity duration-700"
                    style={{ opacity: i === active ? 1 : 0 }}
                  />
                ))}
              </div>
            </div>
            <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
              {/* the arc */}
              <path d="M 34 200 A 166 166 0 0 1 366 200" stroke="#3b2b1f" strokeWidth="10" strokeLinecap="round" fill="none" />
              <path
                className="dial-fill"
                d="M 34 200 A 166 166 0 0 1 366 200"
                stroke="#e0913f"
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
                pathLength={100}
                strokeDasharray="100"
                strokeDashoffset={fillFor(ANGLES[3])}
              />
              {/* ticks + labels */}
              {roast.stops.map((s, i) => {
                const a = ((ANGLES[i] - 90) * Math.PI) / 180;
                const x1 = 200 + Math.cos(a) * 178;
                const y1 = 200 + Math.sin(a) * 178;
                const x2 = 200 + Math.cos(a) * 190;
                const y2 = 200 + Math.sin(a) * 190;
                const lx = 200 + Math.cos(a) * 214;
                const ly = 200 + Math.sin(a) * 214;
                return (
                  <g key={s.name}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c4ad92" strokeWidth="1.5" />
                    <text
                      x={lx}
                      y={ly + 5}
                      textAnchor="middle"
                      fontSize="14"
                      fontFamily="var(--font-body-family)"
                      fill={i === active ? "#e0913f" : "#c4ad92"}
                      fontWeight={i === active ? 600 : 400}
                      style={{ transition: "fill .4s ease" }}
                    >
                      {s.name}
                    </text>
                  </g>
                );
              })}
              {/* needle (GSAP turns it around the dial centre) */}
              <g className="dial-needle">
                <path d="M200 26 L207 44 L193 44 Z" fill="#e0913f" />
                <circle cx="200" cy="18" r="3" fill="#e0913f" opacity=".6" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
