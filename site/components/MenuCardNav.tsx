"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";
import { onSiteReady } from "@/lib/loading";
import { nav } from "../content";
import { Logo } from "./Logo";
import { onReveal } from "./LatteLoader";
import { isRecord } from "./recordDemo";

// the section pill: section id → the name it shows
const SECTIONS: [string, string][] = [
  ["top", "The café"],
  ["story", "From hill to cup"],
  ["origins", "Our beans"],
  ["roast", "The roast"],
  ["pour", "The pour"],
  ["menu", "The menu"],
  ["bakes", "Fresh bakes"],
  ["beans", "Take home"],
  ["stay", "Stay a while"],
  ["club", "Ember Club"],
  ["reviews", "Kind words"],
  ["visit", "Visit"],
];

// N4 minimal nav: ember mark + name on the left; "Open now", bag and a round Menu button on the right.
// Menu opens a full-screen cream menu card (Motion map M18 corner grow): it unfolds diagonally from the Menu
// button's corner (a triangle, then the full card), then the links slide up one by one. Closing folds it back.
// Each cluster sits on its own espresso pill, so it stays readable over cream sections too.
// Round 4 details: the Menu button pulls towards the cursor (magnetic) and fills with copper from the left on hover;
// the bag count bumps when a bean lands in it; a small pill in the middle shows the current section's name, sliding
// to the new name as you scroll (laptop/tablet). In ?record=1 the Menu button plays its hover once by itself.

export const BAG_EVENT = "ember:bag";

export default function MenuCardNav() {
  const [open, setOpen] = useState(false);
  const [bag, setBag] = useState(0);
  const card = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const bagIcon = useRef<HTMLAnchorElement>(null);
  const [section, setSection] = useState(0);

  // magnetic Menu button (+ one demo hover in record mode)
  useEffect(() => {
    const btn = menuBtn.current!;
    if (prefersReducedMotion()) return;
    const xTo = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = btn.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.35);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    btn.addEventListener("pointermove", move);
    btn.addEventListener("pointerleave", leave);
    let offDemo = () => {};
    if (isRecord())
      offDemo = onReveal(() => {
        gsap
          .timeline({ delay: 1.6 })
          .add(() => btn.classList.add("is-demo"))
          .to(btn, { x: -7, y: 3, duration: 0.5, ease: "power3.out" })
          .to(btn, { x: 0, y: 0, duration: 0.7, ease: "power3.out" }, "+=0.6")
          .add(() => btn.classList.remove("is-demo"), "-=0.2");
      });
    return () => {
      btn.removeEventListener("pointermove", move);
      btn.removeEventListener("pointerleave", leave);
      offDemo();
    };
  }, []);

  // the section pill follows the section in the middle of the screen
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let triggers: ScrollTrigger[] = [];
    const off = onSiteReady(() => {
      triggers = SECTIONS.map(([id], i) => {
        const el = document.getElementById(id);
        return el ? ScrollTrigger.create({ trigger: el, start: "top 50%", end: "bottom 50%", onToggle: (st) => st.isActive && setSection(i) }) : null;
      }).filter(Boolean) as ScrollTrigger[];
    });
    return () => {
      off();
      triggers.forEach((t) => t.kill());
    };
  }, []);

  useEffect(() => {
    const onBag = () => {
      setBag((n) => n + 1);
      const icon = bagIcon.current;
      if (icon) {
        gsap.fromTo(icon.querySelector(".bag-count"), { scale: 1.7 }, { scale: 1, duration: 0.6, ease: "back.out(3)" });
        gsap.fromTo(icon, { rotation: -10 }, { rotation: 0, duration: 0.5, ease: "back.out(2)" });
      }
    };
    window.addEventListener(BAG_EVENT, onBag);
    return () => window.removeEventListener(BAG_EVENT, onBag);
  }, []);

  // M18: unfold from the top-right corner (4-point polygon so GSAP can tween it)
  useEffect(() => {
    const el = card.current!;
    const CLOSED = "polygon(100% 0%, 100% 0%, 100% 0%, 100% 0%)";
    const HALF = "polygon(0% 0%, 100% 0%, 100% 100%, 100% 100%)";
    const FULL = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
    if (first.current) {
      first.current = false;
      gsap.set(el, { clipPath: CLOSED, visibility: "hidden" });
      return;
    }
    const links = el.querySelectorAll(".menu-link > a > span:last-child > span");
    const aside = el.querySelectorAll("aside > *");
    gsap.killTweensOf([el, links, aside]);
    if (prefersReducedMotion()) {
      gsap.set(el, { clipPath: open ? FULL : CLOSED, visibility: open ? "visible" : "hidden" });
      return;
    }
    if (open) {
      gsap
        .timeline()
        .set(el, { visibility: "visible", clipPath: CLOSED })
        .to(el, { clipPath: HALF, duration: 0.32, ease: "power2.in" })
        .to(el, { clipPath: FULL, duration: 0.38, ease: "power3.out" })
        .fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.05 }, 0.45)
        .fromTo(aside, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.08 }, 0.55);
    } else {
      gsap
        .timeline()
        .to(el, { clipPath: HALF, duration: 0.25, ease: "power2.in" })
        .to(el, { clipPath: CLOSED, duration: 0.25, ease: "power2.out" })
        .set(el, { visibility: "hidden" });
    }
  }, [open]);

  useEffect(() => {
    if (open) window.__lenis?.stop();
    else window.__lenis?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-3 px-[clamp(14px,2.2vw,32px)] pt-[clamp(14px,2vw,24px)]">
        <a href="#top" className="flex items-center rounded-full bg-[#1b120c]/80 px-4 py-2.5 text-[#f4e9d8] backdrop-blur-md" data-cursor="Home">
          <Logo />
        </a>
        {/* the section pill (laptop/tablet): the new name slides up into place */}
        <div className="section-pill pointer-events-none absolute left-1/2 top-[clamp(14px,2vw,24px)] hidden h-11 -translate-x-1/2 items-center gap-2.5 rounded-full bg-[#1b120c]/80 px-5 text-[13px] text-[#f4e9d8] backdrop-blur-md md:flex" aria-live="polite">
          <span className="h-1.5 w-1.5 rounded-full bg-[#e0913f] shadow-[0_0_8px_#e0913f]" />
          <span className="relative block h-[1.3em] overflow-hidden">
            <span className="block transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)]" style={{ transform: `translateY(${-section * 1.3}em)` }}>
              {SECTIONS.map(([id, name]) => (
                <span key={id} className="block h-[1.3em] whitespace-nowrap leading-[1.3em]">
                  {name}
                </span>
              ))}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-[#1b120c]/80 p-1.5 pl-4 text-[#f4e9d8] backdrop-blur-md">
          <span className="hidden items-center gap-2 pr-2 text-[13px] text-[#f4e9d8]/85 md:inline-flex">
            <span className="live-dot h-2 w-2 rounded-full bg-[#7bc47f] shadow-[0_0_8px_#7bc47f]" />
            {nav.status}
          </span>
          <a ref={bagIcon} href="#beans" aria-label={`Bag, ${bag} items`} className="bag-icon relative grid h-11 w-11 place-items-center rounded-full border border-[#f4e9d8]/15" data-cursor="Bag">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 8h14l-1.2 12H6.2L5 8Z M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <span className="bag-count absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#e0913f] px-1 text-[11px] font-semibold text-[#1b120c]">{bag}</span>
          </a>
          <button
            ref={menuBtn}
            type="button"
            onClick={() => setOpen(true)}
            className="menu-btn relative grid h-11 place-items-center overflow-hidden rounded-full border border-[#e0913f] px-5 text-[14px] font-semibold tracking-[0.06em] text-[#f4e9d8]"
            aria-expanded={open}
            aria-controls="menu-card"
          >
            <span className="menu-btn-fill absolute inset-0 rounded-full bg-[#e0913f]" />
            <span className="relative">Menu</span>
          </button>
        </div>
      </header>

      <div
        id="menu-card"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        ref={card}
        className="menu-card paper invisible fixed inset-[10px] z-[70] overflow-y-auto rounded-[28px] md:inset-[14px]"
        data-lenis-prevent
      >
        <div className="flex min-h-full flex-col px-[clamp(20px,5vw,72px)] py-[clamp(20px,4vh,44px)]">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#1b120c]">
                <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden>
                  <g transform="rotate(28 16 16)">
                    <path d="M16 3.2c6.4 0 10.6 5.9 10.6 12.8S22.4 28.8 16 28.8 5.4 22.9 5.4 16 9.6 3.2 16 3.2Z" fill="#f4e9d8" />
                    <path d="M15.2 6.2c-3.4 3.6 3.9 6.6 0.4 10.2s-2.6 6.8 1.2 9.4" stroke="#e0913f" strokeWidth="1.9" strokeLinecap="round" fill="none" />
                  </g>
                </svg>
              </span>
              <span className="font-display text-[22px]">The Menu Card</span>
            </span>
            <button type="button" onClick={() => setOpen(false)} className="grid h-12 w-12 place-items-center rounded-full border border-line text-[22px]" aria-label="Close menu">
              ×
            </button>
          </div>

          <div className="mt-[6vh] grid flex-1 gap-12 md:grid-cols-12">
            <nav className="md:col-span-8">
              <ul>
                {nav.links.map((l, i) => (
                  <li key={l.href} className="menu-link border-b border-line">
                    <a href={l.href} onClick={() => setOpen(false)} className="group flex items-baseline gap-5 py-[1.2vh]">
                      <span className="w-8 text-[12px] tracking-[0.2em] text-muted">{String(i + 1).padStart(2, "0")}</span>
                      <span className="block overflow-hidden pb-[0.08em]">
                        <span className="font-display block text-[clamp(34px,5.6vw,84px)] transition-[color,translate] duration-500 group-hover:translate-x-3 group-hover:text-accent">
                          <span className="er-link">{l.label}</span>
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <aside className="flex flex-col gap-6 md:col-span-4 md:pt-4">
              <div className="rounded-[22px] bg-[#1b120c] p-7 text-[#f4e9d8]">
                <p className="eyebrow uppercase">{nav.todaysPour.label}</p>
                <p className="font-display mt-4 text-[32px]">{nav.todaysPour.value}</p>
                <p className="mt-2 text-[15px] text-[#c4ad92]">{nav.todaysPour.note}</p>
              </div>
              <div className="rounded-[22px] border border-line p-7">
                <p className="text-[12px] uppercase tracking-[0.22em] text-muted">Hours</p>
                {nav.hours.map((h) => (
                  <p key={h} className="mt-3 text-[16px]">
                    {h}
                  </p>
                ))}
              </div>
              <a href="#menu" onClick={() => setOpen(false)} className="btn btn-solid justify-center">
                Order ahead
              </a>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
