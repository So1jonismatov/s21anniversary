"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { BubbleBackground } from "@/components/bubble-background";
import { FireworksBackground } from "@/components/fireworks-background";
import CongratulationsCanvas from "@/components/CongratulationsCanvas";
import MusicLine from "@/components/music-line";

type Congratulation = {
  id: number;
  name: string;
  message: string;
  created_at?: string;
};

const MemoizedCongratulationsCanvas = React.memo(CongratulationsCanvas);
const MemoizedFireworksBackground = React.memo(FireworksBackground);

export default function Home() {
  const { resolvedTheme: theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showForm, setShowForm] = useState(true);
  const [showCanvas, setShowCanvas] = useState(false);
  const [showMusicLine, setShowMusicLine] = useState(false);
  const [congratulations, setCongratulations] = useState<Congratulation[]>([]);
  const [formData, setFormData] = useState({ name: "", message: "" });
  const [fireworksActive, setFireworksActive] = useState(false);
  const prefetched = useRef(false);

  const prefetchCongratulations = async () => {
    if (prefetched.current) return;
    prefetched.current = true;
    try {
      const response = await fetch("/api/congratulations");
      if (response.ok) {
        const data = await response.json();
        setCongratulations(data);
      } else {
        console.error("Failed to fetch congratulations");
      }
    } catch (error) {
      console.error("Error fetching congratulations:", error);
    }
  };

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



  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.message.trim()) {
      try {
        const response = await fetch("/api/congratulations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            message: formData.message,
          }),
        });

        if (response.ok) {
          const newCongratulation = await response.json();
          setCongratulations([newCongratulation, ...congratulations]);
          setFormData({ name: "", message: "" });
          setShowForm(false);
          setFireworksActive(true);
          setShowCanvas(true);
          setShowMusicLine(true);
          if (!isPlaying) {
            toggleMusic();
          }
        } else {
          console.error("Failed to submit congratulation");
        }
      } catch (error) {
        console.error("Error submitting congratulation:", error);
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Audio element */}
      <audio ref={audioRef} src="/music.mp3" loop />

      {/* Fireworks effect */}
      <AnimatePresence>
        {fireworksActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-60 pointer-events-none"
          >
            <MemoizedFireworksBackground
              className="absolute inset-0 flex items-center justify-center rounded-xl"
              color={theme === 'dark' ? 'white' : 'black'}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Music line at the top */}
      <AnimatePresence>
        {showMusicLine && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <MusicLine isPlaying={isPlaying} toggleMusic={toggleMusic} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form section */}
      {showForm && (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
          <motion.div 
            className="w-full max-w-2xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.h2 
              className="text-3xl font-bold text-white mb-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              Send Your Congratulations
            </motion.h2>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              >
                <label htmlFor="name" className="block text-white mb-2">
                  Your Name/Nickname
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onFocus={prefetchCongratulations}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ease-out"
                  placeholder="Enter your name or nickname"
                  minLength={1}
                  maxLength={50}
                  required
                />
                <div className="text-right text-white/50 text-sm mt-1 transition-all duration-300 ease-out">
                  {formData.name.length}/50
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              >
                <label htmlFor="message" className="block text-white mb-2">
                  Your Message
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onFocus={prefetchCongratulations}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ease-out"
                  placeholder="Write your congratulations here..."
                  minLength={10}
                  maxLength={500}
                  required
                />
                <div className="text-right text-white/50 text-sm mt-1 transition-all duration-300 ease-out">
                  {formData.message.length}/500
                </div>
              </motion.div>

              <motion.div
                className="flex justify-end"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              >
                <motion.button
                  type="submit"
                  className="px-6 py-3 bg-purple-600 rounded-lg text-white font-semibold hover:bg-purple-700 transition-all duration-300 ease-out"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={
                    !formData.name.trim() ||
                    !formData.message.trim() ||
                    formData.message.length < 10
                  }
                >
                  Send Congratulations
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Congratulations display section */}
      {showCanvas && (
        <div className="w-full h-screen absolute top-0 left-0 z-0">
          <MemoizedCongratulationsCanvas congratulations={congratulations} />
        </div>
      )}
    </div>
  );
}
