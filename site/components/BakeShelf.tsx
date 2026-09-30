"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { bakes } from "../content";
import Lines from "./Lines";
import SwipeHint from "./SwipeHint";
import { useTilt } from "./useTilt";

// Fresh bakes (Motion map M13 scale-down inside mask): four arch-top cards on the cream band that continues
// from the menu. As each card scrolls in, its arch opens from a smaller arch to full size while the photo inside
// settles from zoomed-in (scrubbed, each card a beat after the last). Phone: sideways swipe, scale only.

export default function BakeShelf() {
  const root = useRef<HTMLElement>(null);
  useTilt(root, ".bake-arch");

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = root.current!;
    const phone = window.matchMedia("(max-width: 819px)").matches;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".bake-card").forEach((card, i) => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: card, start: `top ${98 - (i % 4) * 5}%`, end: `top ${48 - (i % 4) * 5}%`, scrub: 0.6 },
        });
        if (!phone) tl.fromTo(card.querySelector(".bake-mask"), { clipPath: "inset(10% 9% 0% 9% round 9999px 9999px 12px 12px)" }, { clipPath: "inset(0% 0% 0% 0% round 9999px 9999px 12px 12px)", duration: 1 }, 0);
        tl.fromTo(card.querySelector(".bake-img"), { scale: phone ? 1.2 : 1.35 }, { scale: 1, duration: 1 }, 0);
        tl.fromTo(card.querySelector(".bake-meta"), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.5);
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="bakes" className="bakes paper relative pb-[clamp(110px,16vh,190px)] pt-[clamp(50px,8vh,100px)]">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6 border-t border-line pt-[clamp(40px,7vh,80px)]">
          <div>
            <p className="eyebrow mb-7 uppercase">{bakes.eyebrow}</p>
            <Lines lines={bakes.title} className="text-[clamp(44px,5.6vw,96px)]" />
          </div>
          <p className="max-w-[340px] text-[16px] leading-relaxed text-muted">{bakes.text}</p>
        </div>

        <div className="relative">
        <div data-record-time="1.2" data-record-hold="0.4" data-record-align="center" data-record-label="Bakes" className="bake-row no-scrollbar -mx-[clamp(20px,5vw,80px)] mt-[clamp(36px,6vh,72px)] flex snap-x snap-mandatory scroll-px-[clamp(20px,5vw,80px)] gap-5 overflow-x-auto px-[clamp(20px,5vw,80px)] min-[820px]:mx-0 min-[820px]:grid min-[820px]:grid-cols-2 min-[820px]:gap-7 min-[820px]:gap-y-12 min-[820px]:overflow-visible min-[820px]:px-0 lg:grid-cols-4">
          {bakes.items.map((b, i) => (
            <article key={b.name} className="bake-card group w-[min(70vw,360px)] shrink-0 snap-start min-[820px]:w-auto" data-card={i} data-cursor="Add">
              <div className="bake-mask">
              <div className="arch bake-arch tilt-card relative aspect-[3/4] bg-[#e6d6bf]">
                <img src={b.image} alt={b.name} className="bake-img absolute inset-0 h-full w-full object-cover" />
                <span className="absolute bottom-4 left-4 rounded-full bg-[#1b120c]/80 px-3 py-1 text-[12px] font-medium tracking-[0.06em] text-[#f4e9d8] backdrop-blur max-md:text-[14px]">
                  {b.out}
                </span>
              </div>
              </div>
              <div className="bake-meta mt-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-[clamp(23px,1.9vw,30px)]">{b.name}</h3>
                  <p className="mt-1 text-[14px] text-muted">{b.note}</p>
                </div>
                <span className="price-tag mt-1 shrink-0">₹{b.price}</span>
              </div>
            </article>
          ))}
        </div>
        <SwipeHint />
        </div>
      </div>
    </section>
  );
}
