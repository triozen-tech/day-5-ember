"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { menu } from "../content";
import Lines from "./Lines";
import TornEdge from "./TornEdge";
import { playOnceInView } from "./recordDemo";

// The menu board (Motion map M2 3D page flip): a printed café menu. All pages are stacked in one grid cell
// (so the card keeps the height of the tallest page). While the menu is on screen the pages flip by themselves
// every few seconds, like paper pages turning on their left edge; a tab click flips to that page and restarts
// the timer. The arch photo beside it swaps with the page. ?static=1: tabs switch instantly, no auto-flip.

const AUTO_MS = 3400;

export default function MenuBoard() {
  const [page, setPage] = useState(0);
  const root = useRef<HTMLElement>(null);
  const shown = useRef(0);
  const timer = useRef(0);
  const inView = useRef(false);

  // flip from the page on show to the new one
  useEffect(() => {
    const el = root.current!;
    const pages = el.querySelectorAll<HTMLElement>(".menu-page");
    const from = pages[shown.current];
    const to = pages[page];
    if (from === to) return;
    shown.current = page;
    if (prefersReducedMotion()) {
      gsap.set(from, { visibility: "hidden" });
      gsap.set(to, { visibility: "visible", rotationY: 0, opacity: 1 });
      return;
    }
    gsap.killTweensOf(pages);
    pages.forEach((p) => p !== from && p !== to && gsap.set(p, { visibility: "hidden" }));
    gsap
      .timeline()
      .to(from, { rotationY: -80, opacity: 0, duration: 0.42, ease: "power2.in", transformOrigin: "0% 50%" })
      .set(from, { visibility: "hidden", rotationY: 0 })
      .fromTo(to, { visibility: "visible", rotationY: 80, opacity: 0, transformOrigin: "0% 50%" }, { rotationY: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 0.34)
      .fromTo(to.querySelectorAll("li"), { x: 14, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: "power2.out", stagger: 0.04 }, 0.5);
  }, [page]);

  // auto-flip while on screen (filming needs it to play by itself)
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = root.current!;
    const tick = () => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        if (inView.current) setPage((p) => (p + 1) % menu.pages.length);
        tick();
      }, AUTO_MS);
    };
    const io = new IntersectionObserver(([e]) => {
      const was = inView.current;
      inView.current = e.intersectionRatio > 0.35;
      if (inView.current && !was) tick();
    }, { threshold: [0, 0.35, 0.6] });
    io.observe(el.querySelector(".menu-card-print")!);
    return () => {
      io.disconnect();
      window.clearTimeout(timer.current);
    };
  }, []);

  // record mode: the prices flip once, row by row, the first time the menu is on screen
  useEffect(() => {
    const el = root.current!;
    return playOnceInView(el.querySelector(".menu-card-print"), () => {
      el.querySelectorAll<HTMLElement>(".menu-page")[0].querySelectorAll("li").forEach((li, i) => {
        setTimeout(() => li.classList.add("flip-demo"), 600 + i * 160);
        setTimeout(() => li.classList.remove("flip-demo"), 1400 + i * 160);
      });
    }, 0.5);
  }, []);

  const choose = (i: number) => {
    setPage(i);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(function again() {
      if (inView.current) setPage((p) => (p + 1) % menu.pages.length);
      timer.current = window.setTimeout(again, AUTO_MS);
    }, AUTO_MS * 1.6);
  };

  return (
    <section ref={root} id="menu" data-cursor-demo="Flip" className="menu paper relative z-[2] pb-[clamp(60px,9vh,110px)] pt-[clamp(90px,13vh,160px)]">
      <TornEdge color="#f2e7d6" seed={23} />
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-7 uppercase">{menu.eyebrow}</p>
            <Lines lines={menu.title} className="text-[clamp(44px,5.6vw,96px)]" />
          </div>
          <p className="max-w-[340px] text-[16px] leading-relaxed text-muted">Hand-written every season. Prices include taxes; oat milk at no extra cost.</p>
        </div>

        <div className="mt-[clamp(36px,6vh,72px)] grid items-stretch gap-8 md:grid-cols-12">
          {/* the printed menu card */}
          <div data-cursor="Flip" data-record-time="1.5" data-record-hold="1.6" data-record-align="center" data-record-label="Menu board" className="menu-card-print relative rounded-[28px] border border-line bg-surface p-[clamp(20px,3vw,48px)] shadow-[0_30px_60px_-30px_rgba(42,26,16,0.35)] md:col-span-7" style={{ perspective: "1600px" }}>
            <div className="flex flex-wrap gap-2" role="tablist">
              {menu.pages.map((p, i) => (
                <button
                  key={p.tab}
                  type="button"
                  role="tab"
                  aria-selected={i === page}
                  onClick={() => choose(i)}
                  className={`menu-tab min-h-11 rounded-full border px-4 py-2 text-[14px] transition-colors duration-300 ${i === page ? "border-[#2a1a10] bg-[#2a1a10] text-[#f4e9d8]" : "border-line text-muted hover:text-fg"}`}
                >
                  {p.tab}
                </button>
              ))}
            </div>

            <div className="mt-[clamp(20px,4vh,40px)] grid [transform-style:preserve-3d]">
              {menu.pages.map((p, i) => (
                <ul
                  key={p.tab}
                  data-page={i}
                  className="menu-page col-start-1 row-start-1 space-y-[clamp(12px,2.2vh,22px)] [backface-visibility:hidden]"
                  style={{ visibility: i === 0 ? "visible" : "hidden" }}
                  aria-hidden={i !== page}
                >
                  {p.items.map((it) => (
                    <li key={it.name}>
                      <div className="menu-line">
                        <span className="font-display text-[clamp(21px,1.9vw,30px)]">{it.name}</span>
                        <span className="leader" />
                        <span className="menu-price text-[clamp(16px,1.3vw,20px)] font-semibold text-accent">₹{it.price}</span>
                      </div>
                      <p className="mt-0.5 text-[14px] text-muted">{it.note}</p>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>

          {/* arch photo that swaps with the page */}
          <div className="relative md:col-span-5 max-md:hidden">
            <div className="arch relative h-full min-h-[480px]">
              {menu.pages.map((p, i) => (
                <img
                  key={p.tab}
                  src={p.image}
                  alt={p.tab}
                  data-page-img={i}
                  className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
                  style={{ opacity: i === page ? 1 : 0 }}
                />
              ))}
            </div>
            <div className="arch-line pointer-events-none absolute -inset-3" />
          </div>
        </div>
      </div>
    </section>
  );
}
