"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { beans } from "../content";
import Lines from "./Lines";
import TornEdge from "./TornEdge";
import { BAG_EVENT } from "./MenuCardNav";
import { playOnceInView } from "./recordDemo";

// Take home (Motion map M4 stack fan-out): one kraft bag photo, four bags made in code by printing a different
// label on it (colour, origin, roast, notes, grind). The bags start as a tight stack in the middle of the row
// (fanned a little) and spread out to their places as you scroll; their names and prices follow. The grind
// chips cycle by themselves while the bags are on screen (they stop once someone picks one). Phone: the stack
// spreads into the 2 × 2 grid.

// Where the blank label sits on bag-kraft.webp (fractions of the image)
const LABEL = { left: 17.2, top: 32.7, width: 65.2, height: 52.4 };

export default function BeanBags() {
  const [grind, setGrind] = useState(0);
  const [added, setAdded] = useState<number | null>(null);
  const root = useRef<HTMLElement>(null);
  const picked = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = root.current!;
    const row = el.querySelector<HTMLElement>(".bag-row")!;
    const ctx = gsap.context(() => {
      // M4: each bag starts at the centre of the row (offset measured live, so it works for 4 across and 2 × 2)
      const bags = gsap.utils.toArray<HTMLElement>(".bag-art");
      const offset = (b: HTMLElement) => {
        const r = row.getBoundingClientRect();
        const c = b.getBoundingClientRect();
        return { x: r.left + r.width / 2 - (c.left + c.width / 2) - (Number(gsap.getProperty(b, "x")) || 0), y: r.top + r.height / 2 - (c.top + c.height / 2) - (Number(gsap.getProperty(b, "y")) || 0) };
      };
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: row, start: "top 88%", end: "top 30%", scrub: 0.7, invalidateOnRefresh: true },
      });
      bags.forEach((b, i) => {
        tl.fromTo(
          b,
          { x: () => offset(b).x, y: () => offset(b).y * 0.6, rotation: (i - 1.5) * 7, scale: 0.9 },
          { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.75, ease: "power2.out" },
          0,
        );
      });
      tl.fromTo(".bag-info", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, stagger: 0.05 }, 0.62);

      // grind chips cycle while the bags are on screen
      let t = 0;
      const io = new IntersectionObserver(([e]) => {
        clearInterval(t);
        if (e.isIntersecting && !picked.current) t = window.setInterval(() => !picked.current && setGrind((g) => (g + 1) % beans.grinds.length), 2200);
      }, { threshold: 0.4 });
      io.observe(row);
      return () => {
        io.disconnect();
        clearInterval(t);
      };
    }, el);
    return () => ctx.revert();
  }, []);

  // "Add to bag": a coffee bean flies in an arc from the button to the bag icon in the nav, then the count bumps
  const add = (i: number, from?: HTMLElement | null) => {
    setAdded(i);
    setTimeout(() => setAdded((a) => (a === i ? null : a)), 1600);
    const icon = document.querySelector<HTMLElement>(".bag-icon");
    if (!from || !icon || prefersReducedMotion()) {
      window.dispatchEvent(new Event(BAG_EVENT));
      return;
    }
    const a = from.getBoundingClientRect();
    const b = icon.getBoundingClientRect();
    const bean = document.createElement("div");
    bean.className = "flying-bean";
    bean.innerHTML = `<svg viewBox="0 0 18 22" width="24" height="30"><ellipse cx="9" cy="11" rx="7.5" ry="10" fill="#6b3c1f" stroke="#2a1a10" stroke-width="1"/><path d="M8.2 2.5c-2.6 3 2.8 5.4 0.2 8.4s-1.8 5.6 1 8.4" stroke="#e0913f" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`;
    document.body.appendChild(bean);
    const sx = a.left + a.width / 2 - 12;
    const sy = a.top - 8;
    const tx = b.left + b.width / 2 - 12;
    const ty = b.top + b.height / 2 - 15;
    // a small hop off the button, then a curve into the bag (it stays on screen: the bag icon is at the very top)
    gsap
      .timeline({
        onComplete: () => {
          bean.remove();
          window.dispatchEvent(new Event(BAG_EVENT));
        },
      })
      .set(bean, { x: sx, y: sy, rotation: 0, scale: 1.2 })
      .to(bean, { x: tx, duration: 0.85, ease: "power1.inOut" }, 0)
      .to(bean, { y: sy - 46, duration: 0.2, ease: "power2.out" }, 0)
      .to(bean, { y: ty, duration: 0.65, ease: "power2.in" }, 0.2)
      .to(bean, { rotation: 540, scale: 0.6, duration: 0.85, ease: "none" }, 0);
  };

  // record mode: add one bag by itself once the bags have spread out
  useEffect(() => {
    const el = root.current!;
    return playOnceInView(el.querySelector(".bag-row"), () => {
      setTimeout(() => {
        const btn = el.querySelectorAll<HTMLElement>(".add-btn")[1];
        add(1, btn);
      }, 1500);
    }, 0.6);
  }, []);

  return (
    <section ref={root} id="beans" className="beans relative z-[2] bg-bg pb-[clamp(110px,16vh,190px)] pt-[clamp(90px,13vh,160px)]">
      <TornEdge color="#1b120c" seed={37} fiber="#c8a57a" />
      {/* X1: dims while the next section slides over it */}
      <div className="x1-dim pointer-events-none absolute inset-0 z-[5] bg-[#1b120c] opacity-0" />
      <div className="container-x">
        <div className="grid items-end gap-8 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="eyebrow mb-7 uppercase">{beans.eyebrow}</p>
            <Lines lines={beans.title} className="text-[clamp(44px,5.6vw,96px)]" />
          </div>
          <div className="md:col-span-6 md:pl-8">
            <p className="max-w-[420px] text-[16px] leading-relaxed text-muted">{beans.text}</p>
            <div className="mt-6 flex flex-wrap gap-2" role="radiogroup" aria-label="Grind">
              {beans.grinds.map((g, i) => (
                <button
                  key={g}
                  type="button"
                  role="radio"
                  aria-checked={i === grind}
                  onClick={() => {
                    picked.current = true;
                    setGrind(i);
                  }}
                  className={`grind-chip min-h-11 rounded-full border px-4 py-2 text-[14px] transition-colors duration-300 ${i === grind ? "border-accent bg-accent text-accent-fg" : "border-line text-muted hover:text-fg"}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div data-record-time="1.3" data-record-hold="1.4" data-record-align="center" data-record-label="Beans" className="bag-row mt-[clamp(40px,7vh,80px)] grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-8">
          {beans.items.map((b, i) => (
            <article key={b.origin} className="bag-card" data-card={i} data-cursor="Take home">
              <div className="bag-art relative mx-auto w-[88%] [container-type:inline-size]">
                <div className="amber-glow absolute inset-x-[-10%] bottom-[-6%] h-[40%]" />
                <img src={beans.bagImage} alt={`${b.origin} coffee bag`} className="relative block w-full drop-shadow-[0_24px_30px_rgba(0,0,0,0.55)]" />
                {/* printed label */}
                <div
                  className="absolute flex flex-col overflow-hidden rounded-[2px] text-center"
                  style={{ left: `${LABEL.left}%`, top: `${LABEL.top}%`, width: `${LABEL.width}%`, height: `${LABEL.height}%`, color: b.ink }}
                >
                  <span className="absolute inset-0 mix-blend-multiply" style={{ background: b.label }} />
                  <div className="relative flex h-full flex-col items-center justify-between px-[6cqw] py-[7cqw]">
                    <span className="text-[4.2cqw] font-semibold uppercase tracking-[0.3em]">Ember Roast</span>
                    <div>
                      <p className="font-display text-[8.4cqw] leading-[0.98]">{b.origin}</p>
                      <p className="mt-[3cqw] text-[4.6cqw] uppercase tracking-[0.14em] opacity-80">{b.roast} roast</p>
                      <div className="mt-[3cqw] flex justify-center gap-[1.6cqw]">
                        {[1, 2, 3, 4].map((n) => (
                          <span key={n} className="h-[2.6cqw] w-[2.6cqw] rounded-full border" style={{ borderColor: b.ink, background: n <= b.roastLevel ? b.ink : "transparent" }} />
                        ))}
                      </div>
                    </div>
                    <span className="bag-grind text-[4.4cqw] tracking-[0.06em] opacity-85">250 g · {beans.grinds[grind]}</span>
                  </div>
                </div>
              </div>
              <div className="bag-info mt-6 text-center">
                <h3 className="font-display text-[clamp(22px,1.9vw,30px)]">{b.origin}</h3>
                <p className="mt-1 text-[14px] text-muted">{b.notes}</p>
                <div className="mt-4 flex items-center justify-center gap-3 max-md:flex-col max-md:gap-2">
                  <span className="text-[18px] font-semibold text-accent">₹{b.price}</span>
                  <button type="button" onClick={(e) => add(i, e.currentTarget)} className="add-btn min-h-11 rounded-full border border-line px-4 py-2 text-[14px] transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-accent-fg">
                    {added === i ? "Added ✓" : "Add to bag"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
