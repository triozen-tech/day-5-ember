"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { footer, visit } from "../content";
import { playOnceInView } from "./recordDemo";
import Lines from "./Lines";

// Visit + footer (Motion map M24 outline to fill): the huge wordmark is two stacked copies, an outline and an
// amber fill; the fill rises from the bottom like a coal catching as you reach the end of the page, and a few
// embers drift up off it. ?static=1: fully filled.

// deterministic embers (same on server and browser)
const EMBERS = Array.from({ length: 18 }, (_, i) => ({ left: (i * 37 + 11) % 97, size: 3 + ((i * 7) % 5), delay: (i * 0.43) % 4, dur: 3.5 + ((i * 13) % 30) / 10 }));

export default function EmberFooter() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = root.current!;
    const ctx = gsap.context(() => {
      const mark = el.querySelector(".wordmark")!;
      gsap.fromTo(
        ".wordmark-fill",
        { clipPath: "inset(100% 0% 0% 0%)" },
        // the wordmark sits at the very end of the page, so the fill runs over the whole footer (top of footer at
        // 55% of the screen → end of the page)
        { clipPath: "inset(0% 0% 0% 0%)", ease: "power1.inOut", scrollTrigger: { trigger: el, start: "top 55%", end: "bottom bottom", scrub: 0.6 } },
      );
      gsap.fromTo(".embers", { opacity: 0 }, { opacity: 1, ease: "none", scrollTrigger: { trigger: mark, start: "top bottom", end: "bottom bottom", scrub: true } });
    }, el);
    // record mode: the footer links underline one after another, once
    const offDemo = playOnceInView(el.querySelector(".footer-link"), () => {
      el.querySelectorAll(".footer-link .er-link").forEach((a, i) => {
        setTimeout(() => a.classList.add("is-demo"), 200 + i * 140);
        setTimeout(() => a.classList.remove("is-demo"), 1300 + i * 140);
      });
    }, 1);
    return () => {
      offDemo();
      ctx.revert();
    };
  }, []);

  return (
    <footer ref={root} id="visit" data-record-time="1.5" data-record-hold="1" data-record-align="bottom" data-record-label="Visit + footer" className="visit relative overflow-hidden border-t border-line pt-[clamp(90px,13vh,160px)]">
      <div className="container-x grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="eyebrow mb-7 uppercase">{visit.eyebrow}</p>
          <Lines lines={visit.title} className="text-[clamp(56px,7vw,124px)]" />
          <p className="mt-6 text-[18px] text-muted">{visit.area}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={visit.buttons[0].href} className="btn btn-solid">
              {visit.buttons[0].label}
            </a>
            <a href={visit.buttons[1].href} className="btn btn-outline">
              {visit.buttons[1].label}
            </a>
          </div>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <dl className="divide-y divide-line border-y border-line">
            {visit.hours.map(([d, h]) => (
              <div key={d} className="flex items-baseline justify-between gap-4 py-5">
                <dt className="text-[15px] text-muted">{d}</dt>
                <dd className="font-display text-[clamp(22px,2vw,30px)]">{h}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-6 flex flex-wrap gap-2">
            {visit.extras.map((e) => (
              <li key={e} className="rounded-full border border-line px-4 py-2 text-[14px] text-muted">
                {e}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container-x mt-[clamp(70px,11vh,130px)] grid gap-10 text-[15px] sm:grid-cols-3">
        {footer.columns.map((c) => (
          <div key={c.title}>
            <p className="text-[12px] uppercase tracking-[0.22em] text-accent">{c.title}</p>
            <ul className="mt-4 space-y-2 text-muted max-md:space-y-0">
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#top" className="footer-link inline-flex min-h-11 min-w-11 items-center md:min-h-0 md:min-w-0">
                    <span className="er-link">{l}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* wordmark: outline + amber fill (M24), embers drifting up */}
      <div className="wordmark relative mt-[clamp(50px,8vh,100px)] select-none px-[clamp(12px,2vw,28px)]" aria-hidden>
        <div className="embers pointer-events-none absolute inset-x-0 bottom-[20%] top-[-40%] overflow-hidden">
          {EMBERS.map((e, i) => (
            <span
              key={i}
              className="ember absolute bottom-0 rounded-full bg-[#f2a54e]"
              style={{ left: `${e.left}%`, width: e.size, height: e.size, animationDelay: `${e.delay}s`, animationDuration: `${e.dur}s` }}
            />
          ))}
        </div>
        <p className="font-display outline-text whitespace-nowrap text-center text-[clamp(64px,15.4vw,260px)] leading-[0.9]">{footer.wordmark}</p>
        <p
          className="wordmark-fill font-display absolute inset-x-[clamp(12px,2vw,28px)] top-0 whitespace-nowrap bg-[linear-gradient(0deg,#e0913f_0%,#f2b36a_55%,#f4e9d8_100%)] bg-clip-text text-center text-[clamp(64px,15.4vw,260px)] leading-[0.9] text-transparent"
          style={{ clipPath: "inset(0 0 0 0)" }}
        >
          {footer.wordmark}
        </p>
      </div>

      <div className="container-x flex flex-wrap items-center justify-between gap-4 border-t border-line py-6 text-[13px] text-muted">
        <span className="max-md:text-[14px]">© 2026 Ember Roast</span>
        <span className="max-md:text-[14px]">{footer.note}</span>
      </div>
    </footer>
  );
}
