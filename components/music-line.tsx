"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

interface MusicLineProps {
  isPlaying: boolean;
  toggleMusic: () => void;
}

export default function MusicLine({ isPlaying, toggleMusic }: MusicLineProps) {
  const [width, setWidth] = useState(256);
  const height = 20;
  const amplitude = 6;
  const frequency = 2; // number of full sine cycles across the width

  useEffect(() => {
    const handleResize = () => {
      const newWidth = Math.min(window.innerWidth * 0.8, 256);
      setWidth(newWidth);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const phaseRef = useRef(0);
  const path = useMotionValue(flatPath());

  // --- Create flat line ---
  function flatPath() {
    return `M 0 ${height / 2} L ${width} ${height / 2}`;
  }

  // --- Create sinusoidal wave path ---
  function wavePath(phase: number) {
    let pathData = `M 0 ${height / 2}`;
    for (let x = 0; x <= width; x++) {
      const radians = (2 * Math.PI * frequency * x) / width + phase;
      const y = height / 2 + Math.sin(radians) * amplitude;
      pathData += ` L ${x} ${y}`;
    }
    return pathData;
  }

  // --- Animation loop ---
  useEffect(() => {
    let animId: number;
    let lastTime = 0;

    const animateLoop = (time: number) => {
      if (!isPlaying) return;
      if (lastTime === 0) lastTime = time;
      const delta = time - lastTime;
      lastTime = time;

      phaseRef.current += delta * 0.01; // controls wave speed
      path.set(wavePath(phaseRef.current));

      animId = requestAnimationFrame(animateLoop);
    };

    if (isPlaying) {
      animId = requestAnimationFrame(animateLoop);
    } else {
      // when paused → flatten line
      animate(path, flatPath(), { duration: 0.3, ease: "easeInOut" });
    }

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, path]);

  return (
    <div className="absolute top-10 w-full flex flex-col items-center z-50">
      <div
        className="cursor-pointer mb-4"
        onClick={toggleMusic}
        style={{ width, height }}
      >
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <motion.path
            d={path}
            stroke="white"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className="text-white/70 text-sm transition-all duration-300 ease-out">
        {isPlaying ? "Click line to pause music" : "Click line to play music"}
      </span>
    </div>
  );
}
