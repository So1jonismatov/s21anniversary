"use client";

import { useSpring, animated } from '@react-spring/web';
import { useState, useEffect, useRef } from 'react';

interface MusicLineProps {
  isPlaying: boolean;
  toggleMusic: () => void;
}

export default function MusicLine({ isPlaying, toggleMusic }: MusicLineProps) {
  const lineSpring = useSpring({
    transform: isPlaying 
      ? "scaleX(1) rotate(5deg)" 
      : "scaleX(1) rotate(0deg)",
    config: { tension: 300, friction: 20 },
  });

  return (
    <div className="absolute bottom-10 w-full flex flex-col items-center">
      <animated.div
        style={lineSpring}
        className="w-32 h-1 bg-white rounded-full cursor-pointer mb-4"
        onClick={toggleMusic}
      />
      <span className="text-white/70 text-sm">
        {isPlaying ? "Click line to pause music" : "Click line to play music"}
      </span>
    </div>
  );
}