"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { stay } from "../content";
import Lines from "./Lines";
import TornEdge from "./TornEdge";
import { useTilt } from "./useTilt";

// Stay a while (Motion map M7 multi-speed parallax): an editorial collage of three arch photos at different
// sizes. Each layer (photos, notes) drifts at its own speed (data-speed) as the section passes, like a slow look
// around the room. Phone: two photos, half the amounts. Scrubbed, so record mode gets the same.

export default function StayAWhile() {
  const [big, mid, small] = stay.photos;
  const root = useRef<HTMLElement>(null);
  useTilt(root, ".stay-layer .arch", 6);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = root.current!;
    const k = window.matchMedia("(max-width: 767px)").matches ? 0.5 : 1;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".stay-layer").forEach((layer) => {
        const amount = Number(layer.dataset.speed || 0.1) * 520 * k;
        gsap.fromTo(layer, { y: amount / 2 }, { y: -amount / 2, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.5 } });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="stay" data-record-time="1.3" data-record-hold="0.3" data-record-align="center" data-record-label="Stay a while" className="stay paper relative z-[3] overflow-hidden pb-[clamp(110px,16vh,190px)] pt-[clamp(90px,13vh,160px)]">
      <TornEdge color="#f2e7d6" seed={51} />
      <div className="container-x grid items-center gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="eyebrow mb-7 uppercase">{stay.eyebrow}</p>
          <Lines lines={stay.title} className="text-[clamp(52px,6.6vw,116px)]" />
          <p className="mt-7 max-w-[360px] text-[18px] leading-relaxed text-muted">{stay.text}</p>
          <ul className="mt-8 space-y-3 text-[15px]">
            {stay.photos.map((p) => (
              <li key={p.label} className="flex items-center gap-3 border-b border-line pb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="font-medium">{p.label}</span>
                <span className="text-muted">· {p.note}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="stay-collage relative h-[clamp(520px,82vh,860px)] md:col-span-8 max-md:h-[120vw]">
          <figure className="stay-layer absolute left-0 top-[6%] w-[46%] max-md:w-[62%]" data-speed="0.08">
            <div className="arch tilt-card aspect-[3/4]">
              <img src={big.image} alt={big.label} className="h-full w-full object-cover" />
            </div>
            <figcaption className="mt-3 text-[13px] text-muted max-md:text-[14px]">{big.label}</figcaption>
          </figure>
          <figure className="stay-layer absolute right-0 top-0 w-[38%] max-md:w-[46%]" data-speed="0.22">
            <div className="arch tilt-card aspect-[3/4]">
              <img src={mid.image} alt={mid.label} className="h-full w-full object-cover" />
            </div>
            <figcaption className="mt-3 text-right text-[13px] text-muted max-md:text-[14px]">{mid.label}</figcaption>
          </figure>
          <figure className="stay-layer absolute bottom-0 right-[18%] w-[30%] max-md:hidden" data-speed="0.34">
            <div className="arch tilt-card aspect-[3/4] shadow-[0_30px_60px_-20px_rgba(42,26,16,0.5)]">
              <img src={small.image} alt={small.label} className="h-full w-full object-cover" />
            </div>
          </figure>
          <span className="stay-layer stay-note absolute left-[6%] top-[88%] rotate-[-4deg] rounded-full bg-[#1b120c] px-4 py-2 text-[13px] text-[#f4e9d8] shadow-lg max-md:text-[14px] max-md:left-[30%] max-md:top-[84%]" data-speed="0.4">
            {mid.note}
          </span>
          <span className="stay-layer stay-note absolute left-[52%] top-[18%] rotate-[3deg] rounded-full bg-[#e0913f] px-4 py-2 text-[13px] font-medium text-[#1b120c] shadow-lg max-md:hidden" data-speed="0.3">
            {small.note}
          </span>
        </div>
      </div>
    </section>
  );
}
