"use client";

import type { Lang } from "@/lib/i18n";

const UI = {
  es: {
    slides: "Diapositivas del proyecto",
    prev: "Diapositiva anterior",
    next: "Diapositiva siguiente",
    drag: "Arrastrá",
  },
  en: {
    slides: "Project slides",
    prev: "Previous slide",
    next: "Next slide",
    drag: "Drag",
  },
} as const;

import { useCallback, useEffect, useRef, useState } from "react";
import { Badge, Button, Tag } from "@/components/ds";
import type { Project, Slide } from "./projects";

const CARD_TRANSITION = "transform 640ms cubic-bezier(.16,1,.3,1)";

const cardBase: React.CSSProperties = {
  // Proportional card: width tracks height (max ~2:1) so it never elongates on
  // wide screens; height fills most of the viewport. Centred, with side peeks.
  flex: "0 0 var(--card-w)",
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  borderRadius: "var(--r-media)",
  border: "1px solid var(--border-hairline)",
  background: "var(--surface-canvas)",
  padding: "var(--card-pad)",
  minHeight: "var(--card-h)",
  position: "relative",
};

const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--fs-micro)",
  letterSpacing: "var(--ls-caps)",
  textTransform: "uppercase",
};

export function ProjectCarousel({ project, lang = "es" }: { project: Project; lang?: Lang }) {
  const ui = UI[lang];
  const slider = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [hintGone, setHintGone] = useState(false);
  const [secondIn, setSecondIn] = useState(false);
  const secondLatched = useRef(false);

  const N = project.slides.length;

  const measure = useCallback(() => {
    const t = track.current;
    const s = slider.current;
    if (!t || !s) return null;
    const cards = Array.from(t.children).filter(
      (c) => (c as HTMLElement).dataset.card === "1"
    ) as HTMLElement[];
    if (!cards.length) return null;
    // Centred carousel: translate so card n sits in the middle of the viewport.
    const half = s.clientWidth / 2;
    const at = (n: number) => cards[n].offsetLeft + cards[n].offsetWidth / 2 - half;
    const maxScroll = at(cards.length - 1);
    return { cards, at, maxScroll, cardW: cards[0].offsetWidth };
  }, []);

  const applyTransform = useCallback((px: number, animate: boolean) => {
    const t = track.current;
    if (!t) return;
    t.style.transition = animate ? CARD_TRANSITION : "none";
    t.style.transform = `translate3d(${px}px,0,0)`;
  }, []);

  const goTo = useCallback(
    (n: number, animate = true) => {
      const m = measure();
      if (!m) return;
      const clamped = Math.max(0, Math.min(N - 1, n));
      indexRef.current = clamped;
      setIndex(clamped);
      applyTransform(-m.at(clamped), animate);
    },
    [measure, applyTransform, N]
  );

  const markInteracted = useCallback(() => setHintGone(true), []);

  // Initial position + reposition on resize.
  useEffect(() => {
    goTo(indexRef.current, false);
    const onResize = () => goTo(indexRef.current, false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [goTo]);

  // Drag (pointer events).
  useEffect(() => {
    const s = slider.current;
    if (!s) return;
    let down = false;
    let captured = false;
    let startX = 0;
    let startY = 0;
    let base = 0;
    let dx = 0;
    let pointerId = -1;
    let range = { min: 0, max: 0 };

    const onDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button, a")) return;
      const m = measure();
      if (!m) return;
      down = true;
      captured = false;
      startX = e.clientX;
      startY = e.clientY;
      base = -m.at(indexRef.current);
      range = { min: -m.maxScroll, max: 0 };
      pointerId = e.pointerId;
      dx = 0;
    };

    const onMove = (e: PointerEvent) => {
      if (!down) return;
      dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!captured) {
        if (Math.abs(dx) < 7) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          down = false; // vertical intent — let the page scroll
          return;
        }
        captured = true;
        s.setPointerCapture(pointerId);
        markInteracted();
      }
      let x = base + dx;
      // Rubber band past the edges.
      if (x > range.max) x = range.max + (x - range.max) * 0.3;
      else if (x < range.min) x = range.min + (x - range.min) * 0.3;
      applyTransform(x, false);
    };

    const onUp = () => {
      if (!down) return;
      down = false;
      if (!captured) return;
      const m = measure();
      const threshold = m ? m.cardW * 0.14 : 60;
      if (Math.abs(dx) > threshold) {
        goTo(indexRef.current + (dx < 0 ? 1 : -1));
      } else {
        goTo(indexRef.current);
      }
      // Swallow the phantom click that follows a drag.
      const swallow = (ev: Event) => {
        ev.stopPropagation();
        ev.preventDefault();
      };
      s.addEventListener("click", swallow, { capture: true, once: true });
      setTimeout(
        () => s.removeEventListener("click", swallow, { capture: true } as EventListenerOptions),
        60
      );
    };

    s.addEventListener("pointerdown", onDown);
    s.addEventListener("pointermove", onMove);
    s.addEventListener("pointerup", onUp);
    s.addEventListener("pointercancel", onUp);
    return () => {
      s.removeEventListener("pointerdown", onDown);
      s.removeEventListener("pointermove", onMove);
      s.removeEventListener("pointerup", onUp);
      s.removeEventListener("pointercancel", onUp);
    };
  }, [measure, applyTransform, goTo, markInteracted]);

  // Horizontal wheel scroll.
  useEffect(() => {
    const s = slider.current;
    if (!s) return;
    let acc = 0;
    let locked = false;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (locked) return;
      acc += e.deltaX;
      markInteracted();
      if (Math.abs(acc) > 60) {
        goTo(indexRef.current + (acc > 0 ? 1 : -1));
        acc = 0;
        locked = true;
        setTimeout(() => (locked = false), 520);
      }
    };
    s.addEventListener("wheel", onWheel, { passive: false });
    return () => s.removeEventListener("wheel", onWheel);
  }, [goTo, markInteracted]);

  // Parallax + one-shot second-card entrance.
  useEffect(() => {
    const s = slider.current;
    const t = track.current;
    if (!s || !t) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSecondIn(true);
      return;
    }
    let raf = 0;
    const frame = () => {
      raf = 0;
      const rect = s.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < -200 || rect.top > vh + 200) return;
      const p = (vh / 2 - (rect.top + rect.height / 2)) / vh;
      t.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        el.style.transform = `translate3d(0,${p * 34}px,0)`;
      });
      if (!secondLatched.current && rect.top + rect.height * 0.75 <= vh) {
        secondLatched.current = true;
        setSecondIn(true);
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <article
      data-reveal
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
    >
      {/* Project meta row + paginator */}
      <div
        style={{
          ...mono,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-3) var(--space-5)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-3)" }}>
          <span style={{ color: "var(--text-muted)" }}>{project.id}</span>
          <span style={{ color: "var(--text-accent)" }}>{project.name}</span>
          {project.badge ? (
            <Badge tone={project.badge.tone} dot={project.badge.dot}>
              {project.badge.label}
            </Badge>
          ) : null}
        </div>
        <div
          role="group"
          aria-label={ui.slides}
          style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}
        >
          {project.slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              style={{
                background: "none",
                border: 0,
                borderBottom: `1px solid ${i === index ? "currentColor" : "transparent"}`,
                padding: "2px 1px",
                margin: 0,
                font: "inherit",
                letterSpacing: "inherit",
                textTransform: "inherit",
                color: i === index ? "var(--text-primary)" : "var(--text-muted)",
                cursor: "pointer",
                transition: "color 180ms ease,border-color 180ms ease",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Slider — always dark scope */}
      <div
        ref={slider}
        data-slider
        data-theme="dark"
        style={{
          ["--card-pad" as string]: "clamp(24px, 4.5vw, 64px)",
          // Card ~1.6:1 (Flayks-like). Width-driven so it stays large: it fills
          // 92vw, only shrinking when height would exceed 88svh. Height follows.
          ["--card-w" as string]: "min(92vw, calc(88svh * 1.6))",
          ["--card-h" as string]: "calc(var(--card-w) / 1.6)",
          color: "var(--text-primary)",
          position: "relative",
          cursor: "grab",
          touchAction: "pan-y",
          overflow: "hidden",
          marginInline: "calc((var(--page-margin) + var(--bleed)) * -1)",
        }}
      >
        <div
          ref={track}
          style={{
            display: "flex",
            gap: "clamp(10px,1.4vw,20px)",
            // Centre the active card: the padding leaves room for the side peeks.
            padding: "0 calc((100vw - var(--card-w)) / 2)",
            willChange: "transform",
          }}
        >
          {project.slides.map((slide, i) => {
            // The second card enters as a whole: slides in from the right + fades.
            const entering = i === 1;
            const style: React.CSSProperties = entering
              ? {
                  ...cardBase,
                  opacity: secondIn ? 1 : 0,
                  transform: secondIn ? "translate3d(0,0,0)" : "translate3d(72px,0,0)",
                  transition:
                    "opacity 640ms cubic-bezier(.16,1,.3,1),transform 640ms cubic-bezier(.16,1,.3,1)",
                }
              : cardBase;
            return (
              <div key={i} data-card="1" style={style}>
                <SlideInner slide={slide} />
              </div>
            );
          })}
        </div>

        {/* Arrows + drag hint — anchored to the bottom-right of the centred card */}
        <div
          style={{
            position: "absolute",
            right: "calc((100vw - var(--card-w)) / 2 + clamp(16px,2.4vw,28px))",
            bottom: "clamp(14px,2vw,24px)",
            zIndex: 5,
            display: "flex",
            alignItems: "center",
            gap: "var(--space-4)",
          }}
        >
          <span
            style={{
              ...mono,
              color: "var(--text-muted)",
              transition: "opacity 640ms ease",
              opacity: hintGone ? 0 : 1,
            }}
          >
            {ui.drag}
          </span>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <ArrowButton
              label={ui.prev}
              disabled={index === 0}
              onClick={() => {
                markInteracted();
                goTo(index - 1);
              }}
            >
              ←
            </ArrowButton>
            <ArrowButton
              label={ui.next}
              disabled={index === N - 1}
              onClick={() => {
                markInteracted();
                goTo(index + 1);
              }}
            >
              →
            </ArrowButton>
          </div>
        </div>

        {/* Grain overlay */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 4,
            pointerEvents: "none",
            backgroundImage: "var(--grain-image)",
            backgroundSize: "220px",
            mixBlendMode: "overlay",
            opacity: 0.32,
            borderRadius: "var(--r-media)",
          }}
        />
      </div>
    </article>
  );
}

function ArrowButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        width: 44,
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        border: "1px solid var(--border-hairline)",
        background: "none",
        color: "var(--text-primary)",
        fontFamily: "var(--font-mono)",
        fontSize: "1rem",
        padding: 0,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.35 : 1,
        transition: "border-color 180ms ease,background 180ms ease,opacity 180ms ease",
      }}
    >
      {children}
    </button>
  );
}

function SlideInner({ slide }: { slide: Slide }) {
  if (slide.kind === "media") {
    return (
      <>
        <div
          data-parallax
          style={{
            position: "relative",
            zIndex: 3,
            // Fill the card: the 16:10 frame is sized to the card's inner height.
            width: "min(100%, calc((var(--card-h) - 2 * var(--card-pad)) * 1.6))",
          }}
        >
          <div
            style={{
              position: "relative",
              aspectRatio: "16 / 10",
              borderRadius: "var(--r-media)",
              overflow: "hidden",
              border: "1px solid var(--border-hairline)",
              background: "var(--surface-raised)",
            }}
          >
            {slide.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={slide.src}
                alt={slide.placeholder}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <Placeholder label={slide.placeholder} />
            )}
          </div>
        </div>
        <span
          style={{
            ...mono,
            position: "absolute",
            left: "clamp(24px,4.5vw,64px)",
            bottom: "clamp(16px,2.4vw,28px)",
            zIndex: 3,
            maxWidth: "46%",
            color: "var(--text-muted)",
          }}
        >
          {slide.caption}
        </span>
      </>
    );
  }

  if (slide.kind === "plate") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--cobalt-500)",
        }}
      >
        <span
          aria-hidden="true"
          data-numeric
          data-parallax
          style={{
            position: "relative",
            zIndex: 3,
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            fontSize: "clamp(6rem,15vw,12rem)",
            color: "var(--bone-50)",
          }}
        >
          {slide.numeral}
        </span>
        <span
          style={{
            ...mono,
            position: "absolute",
            left: "clamp(24px,4.5vw,64px)",
            bottom: "clamp(16px,2.4vw,28px)",
            zIndex: 3,
            maxWidth: "46%",
            color: "rgba(247,244,237,0.72)",
          }}
        >
          {slide.caption}
        </span>
      </div>
    );
  }

  if (slide.kind === "ficha") {
    return (
      <div
        data-parallax
        style={{
          position: "relative",
          zIndex: 3,
          width: "100%",
          maxWidth: 900,
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-5)",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-title-1)",
            fontWeight: 500,
            letterSpacing: "var(--ls-title)",
            lineHeight: "var(--lh-snug)",
            textWrap: "balance",
          }}
        >
          {slide.title}
        </h3>
        <div style={{ ...mono, color: "var(--text-accent)" }}>{slide.role}</div>
        <p
          style={{
            margin: 0,
            fontSize: "var(--fs-body)",
            lineHeight: "var(--lh-body)",
            color: "var(--text-secondary)",
            maxWidth: "var(--measure-prose)",
            textWrap: "pretty",
          }}
        >
          {slide.body}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
          {slide.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        {slide.link ? (
          <div>
            <Button size="sm" variant={slide.link.variant} arrow href={slide.link.href}>
              {slide.link.label}
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  // metrics
  return (
    <div
      data-parallax
      style={{
        position: "relative",
        zIndex: 3,
        width: "100%",
        maxWidth: 1100,
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-7)",
      }}
    >
      <div style={{ ...mono, color: "var(--text-muted)" }}>{slide.kicker}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-8) var(--space-10)" }}>
        {slide.stats.map((stat) => (
          <div key={stat.label}>
            <div
              data-numeric
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                letterSpacing: "-0.03em",
                lineHeight: 1,
                fontSize: "clamp(2.75rem,6vw,5.5rem)",
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: "var(--fs-body-sm)",
                color: "var(--text-secondary)",
                marginTop: "var(--space-2)",
                maxWidth: "24ch",
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          fontSize: "var(--fs-body-sm)",
          color: "var(--text-secondary)",
          paddingTop: "var(--space-4)",
          borderTop: "1px solid var(--border-hairline)",
          maxWidth: "var(--measure-caption)",
        }}
      >
        {slide.closer}
      </div>
    </div>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-5)",
        textAlign: "center",
        ...mono,
        color: "var(--text-muted)",
        background:
          "repeating-linear-gradient(-45deg,transparent,transparent 10px,var(--action-quiet-fill) 10px,var(--action-quiet-fill) 20px)",
      }}
    >
      {label}
    </div>
  );
}
