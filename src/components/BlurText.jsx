"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

const buildKeyframes = (from, steps) => {
  const keys = new Set([...Object.keys(from), ...steps.flatMap((step) => Object.keys(step))]);
  return Object.fromEntries([...keys].map((key) => [key, [from[key], ...steps.map((step) => step[key])]]));
};

export default function BlurText({ text = "", delay = 200, className = "", animateBy = "words", direction = "top", threshold = 0.1, rootMargin = "0px", animationFrom = undefined, animationTo = undefined, easing = (t) => t, onAnimationComplete = undefined, stepDuration = 0.35, as: Tag = "h1" }) {
  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || reduceMotion) { setInView(true); return; }
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setInView(true); observer.unobserve(node); } }, { threshold, rootMargin });
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, reduceMotion]);

  const defaultFrom = useMemo(() => direction === "top" ? { filter: "blur(10px)", opacity: 0, y: -28 } : { filter: "blur(10px)", opacity: 0, y: 28 }, [direction]);
  const defaultTo = useMemo(() => [{ filter: "blur(4px)", opacity: 0.55, y: direction === "top" ? 3 : -3 }, { filter: "blur(0px)", opacity: 1, y: 0 }], [direction]);
  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;
  const stepCount = toSnapshots.length + 1;
  const times = Array.from({ length: stepCount }, (_, index) => index / (stepCount - 1));

  return <Tag ref={ref} className={className} style={{ display: "flex", flexWrap: "wrap" }}>
    {elements.map((segment, index) => <motion.span className="inline-block will-change-[transform,filter,opacity]" key={`${segment}-${index}`} initial={reduceMotion ? false : fromSnapshot} animate={inView ? buildKeyframes(fromSnapshot, toSnapshots) : fromSnapshot} transition={{ duration: stepDuration * (stepCount - 1), times, delay: reduceMotion ? 0 : index * delay / 1000, ease: easing }} onAnimationComplete={index === elements.length - 1 ? onAnimationComplete : undefined}>{segment === " " ? "\u00A0" : segment}{animateBy === "words" && index < elements.length - 1 && "\u00A0"}</motion.span>)}
  </Tag>;
}
