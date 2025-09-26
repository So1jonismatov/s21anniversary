"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { Share2, QrCode } from "lucide-react";

interface MusicLineProps {
  isPlaying: boolean;
  toggleMusic: () => void;
  onShare: () => void;
  onQrCode: () => void;
}

export default function MusicLine({
  isPlaying,
  toggleMusic,
  onShare,
  onQrCode,
}: MusicLineProps) {
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

  // --- Create flat line ---
  const flatPath = useCallback(() => {
    return `M 0 ${height / 2} L ${width} ${height / 2}`;
  }, [width]);

  // --- Create sinusoidal wave path ---
  const wavePath = useCallback(
    (phase: number) => {
      let pathData = `M 0 ${height / 2}`;
      for (let x = 0; x <= width; x++) {
        const radians = (2 * Math.PI * frequency * x) / width + phase;
        const y = height / 2 + Math.sin(radians) * amplitude;
        pathData += ` L ${x} ${y}`;
      }
      return pathData;
    },
    [width],
  );

  const path = useMotionValue(flatPath());

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
      const controls = animate(path, wavePath(phaseRef.current), {
        duration: 0.3,
        ease: "easeInOut",
      });
      controls.then(() => {
        animId = requestAnimationFrame(animateLoop);
      });
    } else {
      // when paused → flatten line
      animate(path, flatPath(), { duration: 0.3, ease: "easeInOut" });
    }

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, path, flatPath, wavePath]);

  return (
    <div className="absolute top-10 w-full flex flex-col items-center z-50">
      <div className="flex items-center gap-4">
        <button
          onClick={onShare}
          className="text-white/70 hover:text-white transition-colors"
        >
          <Share2 size={20} />
        </button>
        <motion.div
          className="cursor-pointer"
          onClick={toggleMusic}
          style={{ width, height }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <motion.path
              d={path}
              stroke="white"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </svg>
        </motion.div>
        <button
          onClick={onQrCode}
          className="text-white/70 hover:text-white transition-colors"
        >
          <QrCode size={20} />
        </button>
      </div>
      <span className="text-white/70 text-sm transition-all duration-300 ease-out mt-4">
        {isPlaying ? "Click line to pause music" : "Click line to play music"}
      </span>
    </div>
  );
}
