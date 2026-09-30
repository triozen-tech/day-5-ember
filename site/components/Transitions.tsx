"use client";

import { useEffect } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";
import { onSiteReady } from "@/lib/loading";

// Section transitions (X codes in docs/MOTION-MENU.md; the hero's X2 wash lives in SteamHero):
//   X3  every torn paper edge stretches tall as it comes up the screen and settles flat as it passes
//   X1  Origins stays pinned (and dims) while the roast dial slides up over it; the same for Beans → Stay a while
//   X2  the Ember Club band arrives in Stay a while's cream and washes to copper as it comes up the screen
//       (the colour change happens on the band itself, so the Stay a while photos are never tinted)
// ?static=1: nothing (sections simply follow each other).

export default function Transitions() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let ctx: gsap.Context | undefined;
    // after the loader has fully gone (scroll positions are refreshed then anyway)
    const off = onSiteReady(() => {
      ctx = gsap.context(() => {
        // X3: torn edges
        gsap.utils.toArray<SVGElement>("[data-torn]").forEach((edge) => {
          gsap.fromTo(
            edge,
            { scaleY: 2.6, transformOrigin: "50% 100%" },
            { scaleY: 1, ease: "none", scrollTrigger: { trigger: edge, start: "top bottom", end: "top 45%", scrub: 0.5 } },
          );
        });

        // X1: overlap slides (the next section has a higher z-index and an opaque background)
        const overlap = (from: string) => {
          const el = document.querySelector<HTMLElement>(from);
          if (!el) return;
          ScrollTrigger.create({ trigger: el, start: "bottom bottom", end: "+=100%", pin: true, pinSpacing: false });
          const dim = el.querySelector(".x1-dim");
          if (dim) gsap.fromTo(dim, { opacity: 0 }, { opacity: 0.65, ease: "none", scrollTrigger: { trigger: el, start: "bottom bottom", end: "bottom top", scrub: true } });
        };
        overlap("#origins");
        overlap("#beans");

        // X2: the club band washes cream → copper on its way up (its text is dark on both)
        const club = document.getElementById("club");
        if (club) gsap.fromTo(club, { "--bg": "#f2e7d6" }, { "--bg": "#e0913f", ease: "none", scrollTrigger: { trigger: club, start: "top bottom", end: "top 45%", scrub: true } });
      });
      ScrollTrigger.refresh();
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, []);

  return null;
}
