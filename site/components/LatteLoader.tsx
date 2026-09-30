"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { loading } from "@/lib/loading";
import { atFromUrl, waitForClock } from "@/lib/atTime";
import { LogoMark } from "./Logo";

// Loader (Motion map M5 circle wipe). The engine loader is off (meta.loader = false).
// A latte cup seen from above: the cup rim and a copper crema ring draw, a latte-art heart forms, the name rises.
// Then the coffee in the cup becomes a window onto the site and grows until it fills the screen.
// Always LOADER_SECONDS when the hero frames are ready (waits at most HOLD_MAX more for them).
// With &at=HH:MM:SS it holds its first frame (preloading every image) and plays at that time.

const DRAW = 1.7;
const OPEN = 0.8;
const HOLD_MAX = 3;
export const LOADER_SECONDS = DRAW + OPEN; // 2.5

let revealed = false;

/** Runs when the cup starts opening onto the site (immediately if it already has, or with ?static=1). */
export function onReveal(fn: () => void) {
  if (revealed) {
    fn();
    return () => {};
  }
  const h = () => fn();
  window.addEventListener("ember:reveal", h, { once: true });
  return () => window.removeEventListener("ember:reveal", h);
}

function reveal() {
  if (revealed) return;
  revealed = true;
  window.dispatchEvent(new Event("ember:reveal"));
}

const loadImage = (src: string) =>
  new Promise<void>((done) => {
    const img = new Image();
    img.onload = img.onerror = () => done();
    img.src = src;
  });

async function preloadAll() {
  const urls = [...new Set(Array.from(document.images).map((i) => i.currentSrc || i.src).filter(Boolean))];
  await Promise.all([...urls.map(loadImage), document.fonts.ready]);
}

export default function LatteLoader({ name }: { name: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const finish = () => {
      setGone(true);
      reveal();
      loading.markFinished();
    };
    if (prefersReducedMotion()) {
      finish();
      return;
    }
    window.scrollTo(0, 0);

    // ready = hero frames loaded (and with &at=, every image too)
    const target = atFromUrl();
    let framesReady = false;
    let imagesReady = !target;
    const unsub = loading.subscribe((_, done) => {
      if (done) framesReady = true;
    });
    if (target) {
      const t0 = performance.now();
      Promise.all([preloadAll(), new Promise<void>((r) => { const w = () => (framesReady ? r() : requestAnimationFrame(w)); w(); })]).then(() => {
        imagesReady = true;
        console.log(`[record] loader: all images ready in ${((performance.now() - t0) / 1000).toFixed(1)} s`);
      });
    }
    let cancelClock = () => {};

    const el = root.current!;
    const hole = { r: 0 };
    const setHole = () => {
      const m = `radial-gradient(circle at 50% 46%, transparent ${hole.r}px, #000 ${hole.r + 1}px)`;
      el.style.setProperty("mask", m);
      el.style.setProperty("-webkit-mask", m);
    };

    const ctx = gsap.context(() => {
      const coffee = el.querySelector<SVGCircleElement>(".ll-coffee")!;
      const tl = gsap.timeline({ paused: !!target });
      // strokes start fully hidden in the markup (pathLength 1, dash offset 1), so nothing shows before they draw
      // (also invisible until their draw starts: the stroke's start point can leave a hairline)
      // the rim draws fast from the start and fades in as it goes, so no tiny arc lingers
      tl.to(".ll-rim, .ll-saucer", { opacity: 1, duration: 0.3, ease: "power1.in" }, 0.05)
        .set(".ll-crema", { opacity: 1 }, 0.55)
        .to(".ll-rim", { strokeDashoffset: 0, duration: 0.7, ease: "power3.out" }, 0.05)
        .fromTo(".ll-handle", { opacity: 0 }, { opacity: 1, duration: 0.01 }, 0.55)
        .to(".ll-handle", { strokeDashoffset: 0, duration: 0.3, ease: "power2.out" }, 0.55)
        .to(".ll-saucer", { strokeDashoffset: 0, duration: 0.9, ease: "power3.out" }, 0.05)
        .fromTo(".ll-coffee", { scale: 0.6, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, opacity: 1, duration: 0.6, ease: "power2.out" }, 0.3)
        .to(".ll-crema", { strokeDashoffset: 0, duration: 0.7, ease: "power2.out" }, 0.55)
        .fromTo(".ll-heart", { scale: 0.2, opacity: 0, transformOrigin: "50% 60%" }, { scale: 1, opacity: 1, duration: 0.7, ease: "power3.out" }, 0.85)
        // once drawn, drop the dash pattern so no seam shows at the start point
        .set(".ll-rim, .ll-handle", { strokeDasharray: "none" }, 0.9)
        .set(".ll-saucer", { strokeDasharray: "none" }, 0.96)
        .set(".ll-crema", { strokeDasharray: "none" }, 1.27)
        .fromTo(".ll-letter", { y: 0, yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: "power3.out", stagger: 0.03 }, 0.7)
        .fromTo(".ll-sub", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 1.1)
        // hold here until the hero frames (and with &at=, all images) are in
        .add(() => {
          const t0 = performance.now();
          const ok = () => imagesReady && (framesReady || (!target && performance.now() - t0 > HOLD_MAX * 1000));
          if (ok()) return;
          tl.pause();
          const wait = () => (ok() ? tl.play() : requestAnimationFrame(wait));
          wait();
        }, DRAW - 0.05)
        // the coffee turns into a window onto the site, then the window grows
        .add(() => {
          const r = coffee.getBoundingClientRect();
          hole.r = r.width / 2;
          setHole();
          reveal();
        }, DRAW)
        .to([".ll-name", ".ll-heart", ".ll-crema"], { opacity: 0, duration: 0.25, ease: "power1.in" }, DRAW)
        .to(".ll-coffee", { opacity: 0, duration: 0.2 }, DRAW)
        .to(
          hole,
          {
            r: () => Math.hypot(window.innerWidth, window.innerHeight),
            duration: OPEN,
            ease: "power3.inOut",
            onUpdate: setHole,
          },
          DRAW + 0.05,
        )
        .to(".ll-cup", { scale: () => Math.hypot(window.innerWidth, window.innerHeight) / Math.max(1, coffee.getBoundingClientRect().width), opacity: 0, duration: OPEN, ease: "power3.inOut", transformOrigin: "50% 50%" }, DRAW + 0.05)
        // the engine starts (smooth scroll, scroll-position refresh) only after the cup has fully opened, so that
        // heavy work never lands in the middle of the opening on slower phones
        .add(() => {
          loading.markFinished();
          setGone(true);
        }, LOADER_SECONDS + 0.1);

      if (target) {
        if (Date.now() < target.getTime()) console.log(`[record] loader frozen until ${target.toLocaleTimeString()}`);
        cancelClock = waitForClock(target, () => tl.play(0));
      }
    }, el);

    return () => {
      unsub();
      cancelClock();
      ctx.revert();
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={root} data-loader aria-hidden className="fixed inset-0 z-[100] overflow-hidden bg-[#1b120c]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(224,145,63,0.16),transparent_45%)]" />
      <div className="absolute inset-x-0 top-[46%] flex -translate-y-1/2 justify-center">
        <svg viewBox="0 0 300 300" className="ll-cup h-[min(46vh,70vw)] w-auto overflow-visible">
          {/* saucer + cup rim */}
          <circle className="ll-saucer" opacity="0" cx="150" cy="150" r="138" fill="none" stroke="#f4e9d8" strokeOpacity=".25" strokeWidth="1.2" pathLength={1} strokeDasharray="1" strokeDashoffset="1" transform="rotate(-90 150 150)" />
          <circle className="ll-rim" opacity="0" cx="150" cy="150" r="100" fill="none" stroke="#f4e9d8" strokeWidth="9" pathLength={1} strokeDasharray="1" strokeDashoffset="1" transform="rotate(-90 150 150)" />
          {/* handle */}
          <path className="ll-handle" d="M244 128c26 0 30 44 0 44" fill="none" stroke="#f4e9d8" strokeWidth="9" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" opacity="0" />
          {/* coffee */}
          <circle className="ll-coffee" cx="150" cy="150" r="92" fill="#6b3c1f" style={{ opacity: 0 }} />
          <circle className="ll-crema" opacity="0" cx="150" cy="150" r="80" fill="none" stroke="#e0913f" strokeWidth="10" strokeOpacity=".8" pathLength={1} strokeDasharray="1" strokeDashoffset="1" transform="rotate(-90 150 150)" />
          {/* latte-art heart */}
          <path
            className="ll-heart"
            d="M150 196c-30-20-52-40-52-64 0-16 12-28 27-28 11 0 20 6 25 16 5-10 14-16 25-16 15 0 27 12 27 28 0 24-22 44-52 64Z"
            fill="#f4e9d8"
            style={{ opacity: 0 }}
          />
        </svg>
      </div>
      <div className="ll-name absolute inset-x-0 top-[calc(46%+min(23vh,35vw)+28px)] flex flex-col items-center gap-3 text-[#f4e9d8]">
        <div className="font-display flex items-center gap-3 overflow-hidden pb-1 text-[clamp(28px,3.4vw,46px)]">
          <LogoMark className="ll-letter h-[0.9em] w-[0.9em] shrink-0 text-[#f4e9d8]" glow={false} />
          <span className="flex">
            {name.split("").map((ch, i) => (
              <span key={i} className="ll-letter inline-block">
                {ch === " " ? "\u00a0" : ch}
              </span>
            ))}
          </span>
        </div>
        <span className="ll-sub text-[12px] uppercase tracking-[0.32em] text-[#c4ad92]" style={{ opacity: 0 }}>
          Roasting since this morning
        </span>
      </div>
    </div>
  );
}
