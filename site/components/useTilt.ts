"use client";

import { useEffect, type RefObject } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { playOnceInView } from "./recordDemo";

// Arch cards lean gently towards the cursor in 3D and lift with a soft shadow (Round 4 detail).
// In ?record=1 each card does one slow lean-and-settle by itself when its row comes on screen.

export function useTilt(root: RefObject<HTMLElement | null>, selector: string, max = 7) {
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>(selector));
    const offs: (() => void)[] = [];
    cards.forEach((card) => gsap.set(card, { transformPerspective: 900, transformOrigin: "50% 60%" }));

    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      cards.forEach((card) => {
        const rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
        const ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
        const move = (e: PointerEvent) => {
          const r = card.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * max * 2);
          rx(-((e.clientY - r.top) / r.height - 0.5) * max * 2);
        };
        const enter = () => {
          card.classList.add("is-lifted");
          gsap.to(card, { y: -10, duration: 0.6, ease: "power3.out" });
        };
        const leave = () => {
          card.classList.remove("is-lifted");
          rx(0);
          ry(0);
          gsap.to(card, { y: 0, duration: 0.7, ease: "power3.out" });
        };
        card.addEventListener("pointermove", move);
        card.addEventListener("pointerenter", enter);
        card.addEventListener("pointerleave", leave);
        offs.push(() => {
          card.removeEventListener("pointermove", move);
          card.removeEventListener("pointerenter", enter);
          card.removeEventListener("pointerleave", leave);
        });
      });
    }

    // record mode: one lean-and-settle per card, a beat apart
    offs.push(
      playOnceInView(cards[0]?.parentElement?.parentElement ?? null, () => {
        cards.forEach((card, i) => {
          gsap
            .timeline({ delay: 0.3 + i * 0.18 })
            .add(() => card.classList.add("is-lifted"))
            .to(card, { rotationY: max, rotationX: 3, y: -10, duration: 0.7, ease: "power2.out" })
            .to(card, { rotationY: -max * 0.6, rotationX: -2, duration: 0.8, ease: "sine.inOut" })
            .to(card, { rotationY: 0, rotationX: 0, y: 0, duration: 0.8, ease: "power3.out" })
            .add(() => card.classList.remove("is-lifted"));
        });
      }, 0.4),
    );
    return () => offs.forEach((f) => f());
  }, [root, selector, max]);
}
