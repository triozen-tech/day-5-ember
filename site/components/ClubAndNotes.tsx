"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { club, reviews } from "../content";
import Lines from "./Lines";
import SwipeHint from "./SwipeHint";

// Ember Club band (copper) + reviews printed as café receipts (Motion map M9 print-out): each receipt feeds out of
// a printer slot downwards, one line at a time (stepped), torn edge last; the four print one after another when
// the row comes on screen. Phone: receipts become a sideways swipe. ?static=1: all printed.

export default function ClubAndNotes() {
  const row = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = row.current!;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el.closest("section"), start: "top 80%", once: true } });
      gsap.utils.toArray<HTMLElement>(".receipt-wrap").forEach((wrap, i) => {
        const paper = wrap.querySelector(".receipt")!;
        const lines = wrap.querySelectorAll(".receipt-line");
        const steps = lines.length + 2;
        const at = i * 0.35;
        tl.fromTo(paper, { clipPath: "inset(0% 0% 100% 0%)", y: -18 }, { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 1.5, ease: `steps(${steps})` }, at);
        tl.fromTo(lines, { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: 1.5 / steps }, at + 0.05);
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <section id="club" data-record-time="1" data-record-hold="0.3" data-record-align="center" data-record-label="Ember Club" className="club band-copper relative z-[2]">
        <div className="container-x grid items-center gap-8 py-[clamp(48px,8vh,90px)] md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="mb-5 text-[12px] font-semibold uppercase tracking-[0.24em]">{club.eyebrow}</p>
            <h2 className="font-display text-[clamp(36px,4.4vw,74px)]">{club.title}</h2>
            <ul className="mt-6 flex flex-wrap gap-2">
              {club.perks.map((p) => (
                <li key={p} className="rounded-full border border-[#1b120c]/30 px-4 py-2 text-[14px] font-medium">
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center gap-8 md:col-span-5 md:justify-end">
            <img src={club.image} alt="Flat white with latte art" className="h-[clamp(120px,14vw,200px)] w-[clamp(120px,14vw,200px)] rounded-full object-cover shadow-[0_20px_40px_rgba(27,18,12,0.35)] max-md:hidden" />
            <a href="#visit" className="club-btn btn btn-solid">
              {club.button}
            </a>
          </div>
        </div>
      </section>

      <section id="reviews" data-record-time="0.9" data-record-hold="1.3" data-record-label="Reviews" className="reviews relative pb-[clamp(90px,13vh,160px)] pt-[clamp(56px,8vh,96px)]">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div>
              <p className="eyebrow mb-5 uppercase">{reviews.eyebrow}</p>
              <Lines lines={reviews.title} className="text-[clamp(38px,4.4vw,76px)]" />
            </div>
            <p className="text-[15px] text-muted">4.8 ★ from 2,300+ visits</p>
          </div>

          {/* bigger receipts: 3 across on laptop (the 4th shows on narrower screens), 2 across on tablet, a swipe on phone */}
          <div className="relative">
          <div ref={row} className="no-scrollbar -mx-[clamp(20px,5vw,80px)] mt-[clamp(28px,4vh,48px)] flex snap-x snap-mandatory scroll-px-[clamp(20px,5vw,80px)] items-start gap-5 overflow-x-auto px-[clamp(20px,5vw,80px)] min-[820px]:mx-0 min-[820px]:grid min-[820px]:grid-cols-2 min-[820px]:gap-7 min-[820px]:gap-y-12 min-[820px]:overflow-visible min-[820px]:px-0 lg:grid-cols-3">
            {reviews.items.map((r, i) => (
              <article key={r.name} className={`receipt-wrap w-[min(86vw,420px)] shrink-0 snap-start min-[820px]:w-auto ${i === 1 ? "lg:mt-10" : ""} ${i === 3 ? "lg:hidden" : ""}`} data-card={i}>
                {/* the printer slot the receipt feeds out of */}
                <div className="relative z-[1] -mx-2 h-3 rounded-full bg-[#0e0906] shadow-[inset_0_2px_3px_rgba(0,0,0,0.8),0_1px_0_rgba(244,233,216,0.1)]" />
                <div className="receipt receipt-lg -mt-1 px-8 pt-8 text-[17px] shadow-[0_28px_50px_-20px_rgba(0,0,0,0.65)]">
                  <p className="receipt-line text-center text-[13px] font-semibold uppercase tracking-[0.28em]">Ember Roast · Jubilee Hills</p>
                  <p className="receipt-line mt-1 text-center text-[13px] tracking-[0.12em] text-[#6d5744] max-md:text-[14px]">Order #{2041 + i * 17} · Table {3 + i * 2}</p>
                  <div className="receipt-rule my-5" />
                  {r.order.map(([item, price]) => (
                    <p key={item} className="receipt-line flex justify-between gap-3 text-[16px]">
                      <span>1 × {item}</span>
                      <span className="tabular-nums">₹{price}</span>
                    </p>
                  ))}
                  <div className="receipt-rule my-5" />
                  <p className="receipt-line text-[20px] text-[#985018]" aria-label="5 stars">★★★★★</p>
                  <p className="receipt-line font-display mt-3 text-[clamp(22px,1.9vw,27px)] leading-snug">“{r.text}”</p>
                  <p className="receipt-line mt-5 text-[16px] font-semibold">{r.name}</p>
                  <p className="receipt-line text-[14px] text-[#6d5744]">{r.who}</p>
                  <div className="receipt-rule my-5" />
                  <p className="receipt-line text-center text-[13px] uppercase tracking-[0.28em] text-[#6d5744]">Thank you · come back slow</p>
                </div>
              </article>
            ))}
          </div>
          <SwipeHint />
          </div>
        </div>
      </section>
    </>
  );
}
