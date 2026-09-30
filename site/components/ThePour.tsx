"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useFramePlayer } from "@/components/engine/useFramePlayer";
import { pour } from "../content";
import Lines from "./Lines";

// THE SIGNATURE (Motion map M27 frame-sequence scrub): pinned; the pour-over video fills the jug as you scroll.
// On the left a café brew scale counts the timer and the grams, and the five recipe steps light up in turn.
// ?static=1: the finished brew (last frame, 3:00, 250 g, all steps lit).

export const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// Water on the scale through the brew (seconds → grams): bloom to 50 g, rest, pour to 150 g, rest, pour to 250 g.
const WATER: [number, number][] = [
  [0, 0],
  [15, 50],
  [45, 50],
  [70, 150],
  [90, 150],
  [120, 250],
  [180, 250],
];
const gramsAt = (t: number) => {
  for (let i = 1; i < WATER.length; i++) {
    const [t1, g1] = WATER[i];
    const [t0, g0] = WATER[i - 1];
    if (t <= t1) return g0 + ((g1 - g0) * (t - t0)) / (t1 - t0);
  }
  return WATER[WATER.length - 1][1];
};
const stepSeconds = pour.steps.map((s) => {
  const [m, sec] = s.at.split(":").map(Number);
  return m * 60 + sec;
});

export default function ThePour() {
  const outer = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  // phones get lighter centre-cut frames (the video only fills the top of a phone screen)
  const [frames] = useState(() => (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches ? pour.framesPhone : pour.frames));
  const player = useFramePlayer(frames, canvas);

  useEffect(() => {
    if (prefersReducedMotion()) {
      player.current.seek(1); // the finished brew
      return;
    }
    const root = outer.current!;
    const time = root.querySelector<HTMLElement>(".scale-time")!;
    const grams = root.querySelector<HTMLElement>(".scale-grams")!;
    const steps = Array.from(root.querySelectorAll<HTMLElement>("[data-step]"));

    // M27: the frames, the scale and the steps all follow one scrubbed progress
    const render = (p: number) => {
      player.current.seek(p);
      const t = Math.min(pour.total.seconds, p * pour.total.seconds * 1.04); // reaches 3:00 just before the end
      time.textContent = fmtTime(t);
      grams.textContent = gramsAt(t).toFixed(1);
      steps.forEach((el, i) => el.classList.toggle("is-on", t >= stepSeconds[i]));
    };

    const ctx = gsap.context(() => {
      const state = { p: 0 };
      render(0);
      gsap.to(state, {
        p: 1,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.7 },
        onUpdate: () => render(state.p),
      });

    }, root);
    return () => ctx.revert();
  }, [player]);

  return (
    <section ref={outer} id="pour" data-cursor="Pour" data-cursor-demo="Pour" className="pour-outer pin-outer" style={{ height: "380vh" }} data-record-time="1" data-record-label="The Pour">
      {/* record-mode stop: the jug is full (end of the pin) */}
      <div aria-hidden className="pointer-events-none absolute left-0 h-px w-px" style={{ top: "calc(100% - 100vh)" }} data-record-time="3.8" data-record-label="The Pour: full jug" />
      <div className="pin-stage">
        {/* phone: the video takes the top of the screen so the whole dripper + jug shows above the scale */}
        <canvas ref={canvas} className="absolute inset-0 h-full w-full max-md:bottom-auto max-md:h-[56%]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(27,18,12,0.92)_0%,rgba(27,18,12,0.7)_32%,transparent_58%),linear-gradient(0deg,rgba(27,18,12,0.7)_0%,transparent_22%)] max-md:bg-[linear-gradient(0deg,#1b120c_0%,#1b120c_44%,transparent_60%)]" />

        <div className="container-x relative z-[2] flex h-full flex-col justify-center max-md:justify-end max-md:pb-[5vh]">
          <div className="pour-copy max-w-[580px]">
            <p className="eyebrow mb-6 uppercase">{pour.eyebrow}</p>
            <Lines lines={pour.title} className="text-[clamp(38px,4.4vw,78px)]" />

            <ul className="mt-6 flex flex-wrap gap-2 max-md:hidden">
              {pour.recipe.map((r) => (
                <li key={r} className="rounded-full border border-[#f4e9d8]/20 px-3 py-1 text-[13px] text-muted">
                  {r}
                </li>
              ))}
            </ul>

            {/* brew scale */}
            <div className="brew-scale mt-[clamp(20px,4vh,40px)] inline-flex items-stretch gap-1 rounded-[20px] bg-[#0e0906] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(244,233,216,0.08)]">
              <div className="rounded-[14px] bg-[#130c08] px-5 py-3">
                <p className="text-[12px] uppercase tracking-[0.24em] text-muted">Time</p>
                <p className="scale-time mt-1 font-mono text-[clamp(30px,2.8vw,44px)] leading-none tabular-nums text-[#e0913f] [text-shadow:0_0_18px_rgba(224,145,63,0.55)]">
                  {fmtTime(pour.total.seconds)}
                </p>
              </div>
              <div className="rounded-[14px] bg-[#130c08] px-5 py-3">
                <p className="text-[12px] uppercase tracking-[0.24em] text-muted">Water</p>
                <p className="mt-1 font-mono text-[clamp(30px,2.8vw,44px)] leading-none tabular-nums text-[#e0913f] [text-shadow:0_0_18px_rgba(224,145,63,0.55)]">
                  <span className="scale-grams">{pour.total.grams.toFixed(1)}</span>
                  <span className="ml-1 text-[0.5em] text-muted">g</span>
                </p>
              </div>
            </div>

            {/* recipe steps */}
            <ol className="mt-[clamp(20px,4vh,40px)] space-y-[clamp(6px,1.2vh,14px)]">
              {pour.steps.map((s, i) => (
                <li key={s.name} data-step={i} className="pour-step is-on flex items-baseline gap-4">
                  <span className="w-11 font-mono text-[13px] tabular-nums text-muted max-md:text-[14px]">{s.at}</span>
                  <span className="step-dot relative top-[-2px] h-2 w-2 shrink-0 rounded-full bg-[#e0913f] shadow-[0_0_10px_#e0913f]" />
                  <span className="text-[clamp(15px,1.2vw,18px)] font-medium">{s.name}</span>
                  <span className="text-[14px] text-muted max-md:hidden">{s.detail}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
