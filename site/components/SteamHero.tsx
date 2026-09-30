"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useFramePlayer } from "@/components/engine/useFramePlayer";
import { onReveal } from "./LatteLoader";
import { hero } from "../content";
import Lines, { Rich } from "./Lines";

// Hero "Wipe the steamy window" (Motion map M19 focus pull). The fly-through's first frame fills the screen, seen
// through a fogged café window: a pre-blurred, darkened copy of that frame (14px laptop / 8px phone), a misty
// condensation film, water droplets and drip trails. Scrolling wipes the fog away in a curved hand sweep, left to
// right (an animated mask, over ~130vh of scroll), with a wet edge and droplets running down along the stroke; the
// video waits on its first frame until the glass is clear, then the fly-through scrubs on to the espresso machine.
// ?static=1: the fogged window with the headline (the hero's first screen).

// Deterministic randoms (same on server and browser)
function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}
const r1 = rng(97);
const DROPS = Array.from({ length: 90 }, () => ({ x: r1() * 100, y: r1() * 100, d: 3 + r1() * r1() * 20 }));
const r2 = rng(311);
const TRAILS = Array.from({ length: 7 }, (_, i) => ({ x: 8 + i * 13 + r2() * 7, y: r2() * 40, h: 14 + r2() * 22, w: 3 + r2() * 2.5 }));

// The wipe edge: a cubic curve in the mask's 300 × 100 space (same numbers as --wipe-mask in site.css)
const EDGE = [
  [138, -10],
  [176, 18],
  [184, 62],
  [146, 110],
] as const;
const edgeAt = (t: number) => {
  const u = 1 - t;
  const f = (i: 0 | 1) => u * u * u * EDGE[0][i] + 3 * u * u * t * EDGE[1][i] + 3 * u * t * t * EDGE[2][i] + t * t * t * EDGE[3][i];
  return [f(0), f(1)];
};
const EDGE_PATH = `M${EDGE[0].join(" ")} C${EDGE[1].join(" ")} ${EDGE[2].join(" ")} ${EDGE[3].join(" ")}`;
const EDGE_DROPS = [0.14, 0.24, 0.33, 0.45, 0.55, 0.66, 0.78, 0.88].map((t, i) => {
  const [x, y] = edgeAt(t);
  return { x: x + 1.4, y, fall: 5 + ((i * 37) % 7), tail: 50 + ((i * 53) % 60) };
});

// Mask positions (the mask is 3 screens wide): at 91% the curve's bulge (x ≈ 176 of 300) is just off the left
// edge of the screen (88% would put it on the edge); at 24% its top and bottom ends (x ≈ 148) have left the right edge. A steady (linear)
// sweep keeps the edge on screen for the whole wipe.
const MASK_FROM = 91;
const MASK_TO = 24;
const WIPE_START = 0.03;
const WIPE_END = 0.42; // of a 500vh pin (400vh of scroll): the edge is on screen for ≈125vh
// The statement overlaps the last 110vh of the hero (negative margin): its (transparent) box enters at ~72% of the
// hero scroll and its centred text rises into view from ~80%, reaching the centre as the hero ends. The espresso
// wash runs slowly under the rising text (0.76 → 0.95) while the video keeps moving, so the café fades out behind
// the words and there is never an empty screen.
const VIDEO_END = 0.84;

export default function SteamHero() {
  const outer = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  // phones get the lighter centre-cut portrait frames. Only when the screen is narrow enough (aspect ≤ 0.52) that the
  // crop shows exactly what the full frame shows, so the pre-blurred fog image still lines up with the video
  const [frames] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px) and (max-aspect-ratio: 13/25)").matches ? hero.framesPhone : hero.frames,
  );
  const player = useFramePlayer(frames, canvas, { blockLoader: true });

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const root = outer.current!;
    let offReveal = () => {};

    const ctx = gsap.context(() => {
      // intro: the headline rises once the loader's cup opens
      // (elements, not selector strings: the reveal callback runs inside the loader's GSAP context)
      const q = gsap.utils.selector(root);
      const lines = q(".hero-copy .line-inner");
      const rest = q(".hero-copy .eyebrow, .hero-copy p:not(.eyebrow), .hero-copy .btn, .hero-note-in");
      gsap.set(lines, { yPercent: 110 });
      gsap.set(rest, { opacity: 0, y: 20 });
      offReveal = onReveal(() => {
        gsap.to(lines, { yPercent: 0, duration: 1.3, ease: "power4.out", stagger: 0.14, delay: 0.25 });
        gsap.to(rest, { opacity: 1, y: 0, duration: 1, ease: "power2.out", stagger: 0.08, delay: 0.6 });
      });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.8 },
        onUpdate() {
          // the fly-through plays between the wipe and VIDEO_END; after that the statement slides up over the hero
          player.current.seek(Math.min(1, Math.max(0, (this.progress() - WIPE_END - 0.02) / (VIDEO_END - WIPE_END - 0.02))));
        },
      });
      tl.to({}, { duration: 1 }, 0); // timeline length 1 = scroll progress 0–1

      // M19: the hand wipe. Mask + wet edge move together (same ease, same time); droplets run down the edge.
      const dur = WIPE_END - WIPE_START;
      const wipe = { duration: dur, ease: "none" };
      tl.fromTo(".hero-fog", { webkitMaskPosition: `${MASK_FROM}% 0%`, maskPosition: `${MASK_FROM}% 0%` }, { webkitMaskPosition: `${MASK_TO}% 0%`, maskPosition: `${MASK_TO}% 0%`, ...wipe }, WIPE_START);
      tl.fromTo(".wipe-edge", { x: 0, xPercent: (-200 * MASK_FROM) / 300 }, { xPercent: (-200 * MASK_TO) / 300, ...wipe }, WIPE_START);
      q(".edge-drop").forEach((el, i) => {
        tl.fromTo(el, { y: 0 }, { y: `${EDGE_DROPS[i].fall}vh`, duration: dur * 0.8, ease: "power1.in" }, WIPE_START + dur * 0.1);
        tl.fromTo(el.querySelector(".edge-tail"), { height: 0 }, { height: EDGE_DROPS[i].tail, duration: dur * 0.8, ease: "power1.in" }, WIPE_START + dur * 0.1);
      });
      tl.to(".hero-fog", { opacity: 0, duration: 0.02 }, WIPE_END - 0.01);

      // the headline stays until the wipe is ~60% done, then lifts away
      const fadeAt = WIPE_START + dur * 0.6;
      tl.to(".hero-copy", { y: -70, opacity: 0, duration: 0.08, ease: "power1.in" }, fadeAt);
      tl.to(".hero-copy-shade", { opacity: 0, duration: 0.1 }, fadeAt);
      tl.to([".hero-note", ".hero-scroll"], { opacity: 0, duration: 0.04 }, WIPE_START);

      // captions while the café comes closer, over a dark wash
      tl.to(".hero-cap-shade", { opacity: 1, duration: 0.05 }, 0.44);
      const at = [
        [0.47, 0.6],
        [0.61, 0.76],
      ];
      q("[data-hero-caption]").forEach((el, i) => {
        const [a, b] = at[i];
        tl.fromTo(el, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.06, ease: "power2.out" }, a);
        tl.to(el, { opacity: 0, y: -30, duration: 0.05, ease: "power2.in" }, b - 0.05);
      });

      // X2 colour wash into the statement: the video fades into espresso brown as the hero ends
      tl.fromTo(".hero-end-wash", { opacity: 0 }, { opacity: 1, duration: 0.19, ease: "sine.inOut" }, 0.76);
    }, root);

    return () => {
      offReveal();
      ctx.revert();
    };
  }, [player]);

  return (
    <section ref={outer} id="top" className="hero-outer pin-outer" style={{ height: "500vh" }} data-record-time="0" data-record-hold="1" data-record-label="Hero">
      {/* record-mode stops inside the pin: the wipe is done (42%), the café + captions are done (80%) */}
      <div aria-hidden className="pointer-events-none absolute left-0 h-px w-px" style={{ top: "168vh" }} data-record-time="3.2" data-record-label="Hero: glass wiped" />
      <div aria-hidden className="pointer-events-none absolute left-0 h-px w-px" style={{ top: "320vh" }} data-record-time="3.4" data-record-label="Hero: café, captions" />
      <div className="hero-stage pin-stage bg-bg">
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" />

        {/* the fogged glass: blurred café, misty film, droplets, drip trails; the mask wipes it away */}
        <div className="hero-fog pointer-events-none absolute inset-0">
          <picture>
            <source media="(max-width: 767px)" srcSet="/images/ember/hero-fog-phone.webp" />
            <img src="/images/ember/hero-fog.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
          </picture>
          {/* condensation film: misty white, denser towards the bottom of the glass */}
          <div className="absolute inset-0 bg-[rgba(238,230,220,0.14)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(242,234,224,0.26)_0%,rgba(242,234,224,0.08)_55%,transparent_85%)]" />
          <div className="fog-noise absolute inset-0" />
          <svg className="absolute inset-0 h-full w-full" aria-hidden>
            <defs>
              <radialGradient id="drop" cx="36%" cy="30%" r="72%">
                <stop offset="0" stopColor="#fff" stopOpacity=".95" />
                <stop offset=".28" stopColor="#fff8ee" stopOpacity=".35" />
                <stop offset=".7" stopColor="#1b120c" stopOpacity=".28" />
                <stop offset="1" stopColor="#fff" stopOpacity=".55" />
              </radialGradient>
              <linearGradient id="trail" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fff8ee" stopOpacity="0" />
                <stop offset=".6" stopColor="#fff8ee" stopOpacity=".22" />
                <stop offset="1" stopColor="#fff8ee" stopOpacity=".5" />
              </linearGradient>
            </defs>
            {TRAILS.map((t, i) => (
              <g key={`t${i}`}>
                <rect x={`${t.x}%`} y={`${t.y}%`} width={t.w} height={`${t.h}%`} rx={t.w / 2} fill="url(#trail)" />
                <circle cx={`${t.x}%`} cy={`${t.y + t.h}%`} r={t.w * 1.25} fill="url(#drop)" transform={`translate(${t.w / 2} 0)`} stroke="#fff8ee" strokeOpacity=".4" strokeWidth=".8" />
              </g>
            ))}
            {DROPS.map((d, i) => (
              <circle key={i} cx={`${d.x}%`} cy={`${d.y}%`} r={d.d / 2} fill="url(#drop)" stroke="#fff8ee" strokeOpacity=".35" strokeWidth=".7" />
            ))}
          </svg>
        </div>

        {/* the wet edge of the wipe: 3 screens wide like the mask, slid in step with it */}
        <div className="wipe-edge pointer-events-none absolute inset-y-0 left-0 w-[300%]" style={{ transform: `translateX(${(-200 * MASK_FROM) / 300}%)` }}>
          <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
            <path d={EDGE_PATH} transform="translate(1.2 0)" fill="none" stroke="#fff8ee" strokeOpacity=".16" strokeWidth="14" vectorEffect="non-scaling-stroke" />
            <path d={EDGE_PATH} transform="translate(1.2 0)" fill="none" stroke="#fff8ee" strokeOpacity=".55" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </svg>
          {EDGE_DROPS.map((d, i) => (
            <span key={i} className="edge-drop absolute block" style={{ left: `${(d.x / 300) * 100}%`, top: `${d.y}%` }}>
              <span className="edge-tail absolute bottom-[60%] left-1/2 block h-0 w-[3px] -translate-x-1/2 rounded-full bg-[linear-gradient(0deg,rgba(255,248,238,0.55),rgba(255,248,238,0))]" />
              <span className="relative block h-[12px] w-[8px] rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-[radial-gradient(circle_at_35%_30%,#fff_0%,rgba(255,248,238,0.4)_35%,rgba(27,18,12,0.35)_75%,rgba(255,255,255,0.6)_100%)] shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
            </span>
          ))}
        </div>

        {/* darker glass behind the headline (lifts away with it) */}
        <div className="hero-copy-shade pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(27,18,12,0.62)_0%,rgba(27,18,12,0.3)_45%,transparent_75%)] max-md:bg-[linear-gradient(180deg,rgba(27,18,12,0.62)_0%,rgba(27,18,12,0.28)_50%,transparent_80%)]" />

        {/* dark wash so the captions read over the bright copper machine */}
        <div className="hero-cap-shade pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(90deg,rgba(27,18,12,0.88)_0%,rgba(27,18,12,0.6)_38%,transparent_68%)] opacity-0 max-md:bg-[linear-gradient(0deg,transparent_18%,rgba(27,18,12,0.82)_42%,rgba(27,18,12,0.82)_58%,transparent_82%)]" />

        {/* X2: espresso wash at the very end of the hero (the statement below starts on the same colour) */}
        <div className="hero-end-wash pointer-events-none absolute inset-0 z-[4] bg-[#1b120c] opacity-0" />

        {/* headline */}
        <div className="hero-copy container-x relative z-[3] flex h-full flex-col justify-center pb-[4vh] max-md:justify-start max-md:pt-[16vh]">
          <div className="max-w-[48vw] max-md:max-w-none">
            <p className="eyebrow mb-7 uppercase max-md:mb-5">{hero.eyebrow}</p>
            <Lines as="h1" lines={hero.title} className="text-[clamp(60px,9vw,160px)] [text-shadow:0_4px_40px_rgba(27,18,12,0.35)]" />
            <p className="mt-8 max-w-[440px] text-[clamp(15px,1.15vw,18px)] leading-relaxed text-[#f4e9d8]/85 max-md:mt-5">{hero.text}</p>
            <div className="mt-10 flex flex-wrap gap-3 max-md:hidden">
              <a href={hero.buttons[0].href} className="btn btn-solid">
                {hero.buttons[0].label}
              </a>
              <a href={hero.buttons[1].href} className="btn btn-outline">
                {hero.buttons[1].label}
              </a>
            </div>
          </div>
        </div>

        <p className="hero-note absolute bottom-[4vh] left-[clamp(20px,5vw,80px)] z-[3] text-[13px] text-[#f4e9d8]/80 max-md:hidden">
          <span className="hero-note-in inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#7bc47f]" /> {hero.note}
          </span>
        </p>
        <p className="hero-scroll absolute bottom-[4vh] right-[clamp(20px,5vw,80px)] z-[3] text-[12px] uppercase tracking-[0.3em] text-[#f4e9d8]/75">Scroll to wipe the glass</p>

        {/* captions (appear while the café comes closer); the italic word is crema here, not copper */}
        {hero.captions.map((c, i) => (
          <p
            key={c}
            data-hero-caption={i}
            className="hero-caption font-display pointer-events-none absolute left-[clamp(20px,5vw,80px)] top-1/2 z-[3] max-w-[min(760px,86vw)] -translate-y-1/2 whitespace-pre-line text-[clamp(38px,4.8vw,84px)] text-[#f4e9d8] opacity-0 [text-shadow:0_2px_30px_rgba(27,18,12,0.85)]"
          >
            <Rich text={c} />
          </p>
        ))}
      </div>
    </section>
  );
}
