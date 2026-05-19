import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
  cubicBezier,
} from "framer-motion";
import "./ScrollTiltedGrid.css";

const easeIntoFocus = cubicBezier(0.22, 1, 0.36, 1);
const easeOutOfFocus = cubicBezier(0, 0, 0.58, 1);
const focusEase = [easeIntoFocus, easeOutOfFocus];

function Tile({ item, side, config }) {
  const ref = useRef(null);
  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const reduce = useReducedMotion();
  const sign = side === "L" ? -1 : 1;
  const { aspectRatio, perspective, maxTilt, maxBlur, rounded } = config;

  const blur = useTransform(p, [0, 0.5, 1], [maxBlur, 0, maxBlur], { ease: focusEase });
  const bright = useTransform(p, [0, 0.5, 1], [0, 1, 0], { ease: focusEase });
  const contrast = useTransform(p, [0, 0.5, 1], [2, 1, 2], { ease: focusEase });

  const ty = useTransform(p, [0, 0.5, 1], ["80%", "0%", "-80%"], { ease: focusEase });
  const tz = useTransform(p, [0, 0.5, 1], [200, 0, 200], { ease: focusEase });
  const rx = useTransform(p, [0, 0.5, 1], [maxTilt, 0, -maxTilt], { ease: focusEase });

  const tx = useTransform(p, [0, 0.5, 1], [`${sign * 20}%`, "0%", `${sign * 20}%`], { ease: focusEase });
  const rot = useTransform(p, [0, 0.5, 1], [-sign * 3, 0, sign * 3], { ease: focusEase });
  const sk = useTransform(p, [0, 0.5, 1], [sign * 10, 0, -sign * 10], { ease: focusEase });

  const innerSY = useTransform(p, [0, 0.5, 1], [1.4, 1, 1.4], { ease: focusEase });

  const filter = useMotionTemplate`blur(${blur}px) brightness(${bright}) contrast(${contrast})`;

  // Standard string array fallback or advanced object structure
  const imageUrl = typeof item === 'string' ? item : item.image;
  const hasOverlay = typeof item === 'object' && (item.title || item.subtitle || item.description);

  if (reduce) {
    return (
      <figure ref={ref} className="tilted-tile-reduce">
        <div className="tilted-tile-overflow" style={{ aspectRatio, borderRadius: rounded }}>
          <div className="tilted-tile-bg" style={{ backgroundImage: `url("${imageUrl}")` }} />
          {hasOverlay && (
            <div className="tilted-tile-overlay">
              {item.title && <h3>{item.title}</h3>}
              {item.subtitle && <span className="tilted-tile-subtitle">{item.subtitle}</span>}
              {item.description && <p className="tilted-tile-desc">{item.description}</p>}
              {item.action && <div className="tilted-tile-action">{item.action}</div>}
            </div>
          )}
        </div>
      </figure>
    );
  }

  return (
    <motion.figure ref={ref} className="tilted-tile" style={{ perspective, willChange: "transform" }}>
      <motion.div
        className="tilted-tile-inner"
        style={{ aspectRatio, borderRadius: rounded, filter, x: tx, y: ty, z: tz, rotate: rot, rotateX: rx, skewX: sk }}
      >
        <motion.div
          className="tilted-tile-bg will-change-transform"
          style={{ backgroundImage: `url("${imageUrl}")`, scaleY: innerSY, backfaceVisibility: "hidden" }}
        />
        {hasOverlay && (
          <div className="tilted-tile-overlay">
            {item.title && <h3>{item.title}</h3>}
            {item.subtitle && <span className="tilted-tile-subtitle">{item.subtitle}</span>}
            {item.description && <p className="tilted-tile-desc">{item.description}</p>}
            {item.action && <div className="tilted-tile-action">{item.action}</div>}
          </div>
        )}
      </motion.div>
    </motion.figure>
  );
}

export function ScrollTiltedGrid({
  items = [],
  loop = false,
  initialCycles = 3,
  aspectRatio = "3/4",
  gap = "3rem",
  perspective = 1200,
  maxTilt = 60,
  maxBlur = 6,
  rounded = "1rem",
  className = "",
}) {
  const [cycles, setCycles] = useState(loop ? initialCycles : 1);
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!loop) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setCycles((c) => c + 2);
        }
      },
      { rootMargin: "1500px 0px 1500px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loop]);

  const displayItems = useMemo(() => {
    if (items.length === 0) return [];
    return loop ? Array.from({ length: cycles }, () => items).flat() : [...items];
  }, [loop, cycles, items]);

  const config = useMemo(
    () => ({ aspectRatio, perspective, maxTilt, maxBlur, rounded }),
    [aspectRatio, perspective, maxTilt, maxBlur, rounded]
  );

  return (
    <section className={`tilted-grid-section ${className}`}>
      <div className="tilted-grid-container" style={{ gap }}>
        {displayItems.map((item, i) => (
          <Tile key={`${i}-${item.id || i}`} item={item} side={i % 2 === 0 ? "L" : "R"} config={config} />
        ))}
      </div>
      {loop && <div ref={sentinelRef} aria-hidden style={{ height: "1px", width: "100%" }} />}
    </section>
  );
}
