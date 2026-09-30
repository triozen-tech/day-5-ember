"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { isRecord } from "./recordDemo";

// Phone swipe rows (Origins, Bakes, Reviews): a small "Swipe →" hint shows the first time the row is on screen and
// hides after the first swipe. In ?record=1 the row also nudges itself one card over and back, to show the snap.
// Place it right after the row, inside a relative wrapper.

export default function SwipeHint() {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hint = ref.current!;
    const row = hint.previousElementSibling as HTMLElement | null;
    if (!row || !window.matchMedia("(max-width: 819px)").matches) return;
    let seen = false;
    const onScroll = () => row.scrollLeft > 12 && setShow(false);
    const io = new IntersectionObserver(
      ([e]) => {
        if (seen || e.intersectionRatio < 0.6) return;
        seen = true;
        io.disconnect();
        setShow(true);
        row.addEventListener("scroll", onScroll, { passive: true });
        if (isRecord()) {
          const card = row.children[1] as HTMLElement | undefined;
          const to = card ? card.offsetLeft - row.offsetLeft - parseFloat(getComputedStyle(row).paddingLeft) : 280;
          setTimeout(() => row.scrollTo({ left: to, behavior: "smooth" }), 700);
          setTimeout(() => row.scrollTo({ left: 0, behavior: "smooth" }), 2300);
          setTimeout(() => setShow(false), 3200);
        }
      },
      { threshold: [0.6] },
    );
    io.observe(row);
    return () => {
      io.disconnect();
      row.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!show) return;
    const arrow = ref.current!.querySelector(".swipe-arrow");
    const t = gsap.to(arrow, { x: 6, duration: 0.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
    return () => {
      t.kill();
    };
  }, [show]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute right-[clamp(20px,5vw,80px)] top-3 z-[3] inline-flex items-center gap-2 rounded-full bg-[#1b120c]/85 px-4 py-2 text-[14px] font-medium text-[#f4e9d8] backdrop-blur transition-opacity duration-500 min-[820px]:hidden ${show ? "opacity-100" : "opacity-0"}`}
    >
      Swipe <span className="swipe-arrow inline-block">→</span>
    </div>
  );
}
