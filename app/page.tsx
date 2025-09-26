"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FireworksBackground } from "@/components/fireworks-background";
import CongratulationsCanvas from "@/components/CongratulationsCanvas";
import MusicLine from "@/components/music-line";
import CongratulationsForm from "@/components/CongratulationsForm";
import { Congratulation } from "@/types";
import { useCongratulations } from "@/hooks/useCongratulations";
import { isMobileDevice } from "@/lib/mobile-detection";

import QrCodeModal from "@/components/QrCodeModal";

const MemoizedCongratulationsCanvas = React.memo(CongratulationsCanvas);
const MemoizedFireworksBackground = React.memo(FireworksBackground);

const FIREWORK_COLORS = [
  "#F472B6",
  "#E879F9",
  "#C084FC",
  "#818CF8",
  "#60A5FA",
  "#38BDF8",
  "#4ADE80",
  "#FACC15",
];

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showForm, setShowForm] = useState(true);
  const [showCanvas, setShowCanvas] = useState(false);
  const [showMusicLine, setShowMusicLine] = useState(false);
  const [fireworksActive, setFireworksActive] = useState(false);
  const [newestMessageId, setNewestMessageId] = useState<number | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const isMobile = React.useMemo(() => isMobileDevice(), []);

  const { congratulations, prefetchCongratulations, addCongratulation } =
    useCongratulations();

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current
          .play()
          .catch((e) => console.log("Audio play failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleFormSubmit = (newCongratulation: Congratulation) => {
    addCongratulation(newCongratulation);
    setNewestMessageId(newCongratulation.id);
    setShowForm(false);
    setFireworksActive(true);
    setShowCanvas(true);
    setShowMusicLine(true);
    if (!isPlaying) {
      toggleMusic();
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      });
    }
  };

  const handleQrCode = () => {
    setIsQrModalOpen(true);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Audio element */}
      <audio ref={audioRef} src="/music.mp3" loop />

      {/* Music line at the top */}
      <AnimatePresence>
        {showMusicLine && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <MusicLine
              isPlaying={isPlaying}
              toggleMusic={toggleMusic}
              onShare={handleShare}
              onQrCode={handleQrCode}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        url={typeof window !== "undefined" ? window.location.href : ""}
      />

      {/* Form section */}
      {showForm && (
        <CongratulationsForm
          onFormSubmit={handleFormSubmit}
          prefetchCongratulations={prefetchCongratulations}
        />
      )}

      {/* Congratulations display section - only show on non-mobile or with reduced performance impact */}
      {showCanvas && (
        <div className="w-full h-screen absolute top-0 left-0 z-0">
          <MemoizedCongratulationsCanvas
            congratulations={congratulations}
            newestMessageId={newestMessageId}
            isModalOpen={isQrModalOpen}
          />
        </div>
      )}

      {/* Fireworks effect - disabled on mobile for performance */}
      <AnimatePresence>
        {fireworksActive && !isMobile && !isQrModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 pointer-events-none"
          >
            <MemoizedFireworksBackground
              className="absolute inset-0 flex items-center justify-center rounded-xl"
              color={FIREWORK_COLORS}
              population={isMobile ? 0.3 : 1}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
