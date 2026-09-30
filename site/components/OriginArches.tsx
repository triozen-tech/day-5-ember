"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { origins } from "../content";
import Lines from "./Lines";
import OriginMap from "./OriginMap";
import TornEdge from "./TornEdge";
import SwipeHint from "./SwipeHint";
import { useTilt } from "./useTilt";

// Origins (Motion map M8 line draw-on): cream paper tears in; the map's routes draw from each estate to the
// roastery, the estate dots light up in turn, then the four arch cards rise. Phone: the map sits above a sideways
// swipe of cards. ?static=1: everything drawn.

export default function OriginArches() {
  const root = useRef<HTMLElement>(null);
  useTilt(root, ".origin-card .arch");

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = root.current!;
    const ctx = gsap.context(() => {
      // M8: routes draw from each estate to the roastery, the estate dots light in turn, then the cards rise
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top 65%", end: "bottom 92%", scrub: 0.7 },
      });
      tl.to({}, { duration: 1 }, 0);
      tl.fromTo(".map-outline", { opacity: 0.2 }, { opacity: 1, duration: 0.25 }, 0);
      tl.fromTo(".map-roastery", { scale: 0.4, opacity: 0, transformOrigin: "50% 50%", transformBox: "fill-box" }, { scale: 1, opacity: 1, duration: 0.1, ease: "back.out(2)" }, 0.02);
      gsap.utils.toArray<SVGGElement>(".map-dot").forEach((dot, i) => {
        const at = 0.06 + i * 0.1;
        tl.fromTo(dot, { opacity: 0.25, scale: 0.6, transformOrigin: "50% 50%", transformBox: "fill-box" }, { opacity: 1, scale: 1, duration: 0.06, ease: "back.out(2)" }, at);
        tl.fromTo(`#route-mask-${i} .route-reveal`, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.16, ease: "power1.inOut" }, at + 0.03);
      });
      gsap.utils.toArray<HTMLElement>(".origin-card").forEach((card, i) => {
        tl.fromTo(card, { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 0.18, ease: "power2.out" }, 0.42 + i * 0.1);
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="origins" data-cursor-demo="Swipe" data-record-time="1.8" data-record-hold="0.4" data-record-align="bottom" data-record-label="Origins" className="origins paper relative z-[2] pb-[clamp(90px,13vh,170px)] pt-[clamp(80px,12vh,150px)]">
      <TornEdge color="#f2e7d6" seed={11} />
      {/* X1: dims while the next section slides over it */}
      <div className="x1-dim pointer-events-none absolute inset-0 z-[5] bg-[#1b120c] opacity-0" />
      <div className="container-x">
        <div className="grid items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="eyebrow mb-7 uppercase">{origins.eyebrow}</p>
            <Lines lines={origins.title} className="text-[clamp(46px,6vw,104px)]" />
            <p className="mt-7 max-w-[400px] text-[17px] leading-relaxed text-muted">{origins.text}</p>
          </div>
          <div className="md:col-span-7">
            <OriginMap className="mx-auto h-auto w-full max-w-[560px]" />
          </div>
        </div>

        <div className="relative">
        <div data-cursor="Swipe" className="no-scrollbar -mx-[clamp(20px,5vw,80px)] mt-[clamp(40px,7vh,90px)] flex snap-x snap-mandatory scroll-px-[clamp(20px,5vw,80px)] gap-5 overflow-x-auto px-[clamp(20px,5vw,80px)] min-[820px]:mx-0 min-[820px]:grid min-[820px]:grid-cols-2 min-[820px]:gap-6 min-[820px]:gap-y-12 min-[820px]:overflow-visible min-[820px]:px-0 lg:grid-cols-4">
          {origins.items.map((o, i) => (
            <article key={o.name} className="origin-card w-[min(74vw,360px)] shrink-0 snap-start min-[820px]:w-auto" data-card={i}>
              <div className="arch tilt-card relative aspect-[4/5]">
                <img src={o.image} alt={`Coffee hills of ${o.name}`} className="arch-img absolute inset-0 h-full w-full object-cover" />
                <span className="absolute left-1/2 top-5 -translate-x-1/2 rounded-full bg-[#f2e7d6]/90 px-3 py-1 text-[12px] font-semibold tracking-[0.18em] text-[#2a1a10]">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-3">
                <h3 className="font-display text-[clamp(26px,2.2vw,34px)]">{o.name}</h3>
                <span className="text-[13px] text-muted max-md:text-[14px]">{o.altitude}</span>
              </div>
              <p className="mt-1 text-[14px] text-muted">
                {o.estate} · {o.process}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {o.notes.map((n) => (
                  <li key={n} className="rounded-full border border-line px-3 py-1 text-[13px] max-md:text-[14px]">
                    {n}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <SwipeHint />
        </div>
      </div>
    </section>
  );
}
