"use client";

import { useState, useEffect, useRef } from "react";
import Typewriter from "typewriter-effect";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type Container, type ISourceOptions } from "@tsparticles/engine";
import { loadFull } from "tsparticles";
import { motion, AnimatePresence } from "framer-motion";
import MusicLine from "@/components/music-line";
import Fireworks from "@/components/fireworks";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

type Congratulation = {
  id: number;
  name: string;
  message: string;
  created_at?: string;
};

export default function Home() {
  const [init, setInit] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [congratulations, setCongratulations] = useState<Congratulation[]>([]);

  useEffect(() => {
    const fetchCongratulations = async () => {
      try {
        const response = await fetch('/api/congratulations');
        if (response.ok) {
          const data = await response.json();
          setCongratulations(data);
        } else {
          console.error('Failed to fetch congratulations');
        }
      } catch (error) {
        console.error('Error fetching congratulations:', error);
      }
    };

    fetchCongratulations();
  }, []);
  const [formData, setFormData] = useState({ name: "", message: "" });
  const [fireworksActive, setFireworksActive] = useState(false);

  // this should be run only once per application lifetime
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container) => {
    console.log(container);
  };

  const options: ISourceOptions = {
    background: {
      color: {
        value: "#000",
      },
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        onClick: {
          enable: true,
          mode: "push",
        },
        onHover: {
          enable: true,
          mode: "repulse",
        },
      },
      modes: {
        push: {
          quantity: 4,
        },
        repulse: {
          distance: 200,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: "#ffffff",
      },
      links: {
        color: "#ffffff",
        distance: 150,
        enable: true,
        opacity: 0.5,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce",
        },
        random: false,
        speed: 2,
        straight: false,
      },
      number: {
        density: {
          enable: true,
        },
        value: 80,
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 5 },
      },
    },
    detectRetina: true,
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
          setTimeout(() => setFireworksActive(false), 5000);
        } else {
          console.error("Failed to submit congratulation");
        }
      } catch (error) {
        console.error("Error submitting congratulation:", error);
      }
    }
  };

  // Simulate loading more congratulations when scrolling near edges
  const loadMoreCongratulations = () => {
    // In a real implementation, this would fetch more data from the API
    console.log("Loading more congratulations...");
  };

  useInfiniteScroll(loadMoreCongratulations);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Audio element */}
      <audio ref={audioRef} src="/music.mp3" autoPlay loop />

      {/* Particles background */}
      {init && (
        <Particles
          id="tsparticles"
          particlesLoaded={particlesLoaded}
          options={options}
          className="absolute inset-0"
        />
      )}

      {/* Fireworks effect */}
      <Fireworks active={fireworksActive} />

      {/* Fullscreen landing section */}
      <div className="min-h-screen flex flex-col items-center justify-center relative z-10 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            <Typewriter
              options={{
                strings: ["School 21", "Mariamfi", "Happy 1st Anniversary!"],
                autoStart: true,
                loop: true,
                delay: 75,
                deleteSpeed: 50,
              }}
            />
          </h1>

          <motion.p
            className="text-xl text-white/90 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            Celebrating one year of innovation, learning, and community
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="mt-12"
        >
          <button
            onClick={() => setShowForm(true)}
            className="px-8 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-white font-semibold text-lg hover:bg-white/20 transition-all duration-300 shadow-xl"
          >
            Send Your Congratulations
          </button>
        </motion.div>

        <MusicLine isPlaying={isPlaying} toggleMusic={toggleMusic} />
      </div>

      {/* Form section */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="min-h-screen flex items-center justify-center relative z-10 px-4 py-12"
          >
            <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">
                Send Your Congratulations
              </h2>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-white mb-2">
                    Your Name/Nickname
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your name or nickname"
                    minLength={1}
                    maxLength={50}
                    required
                  />
                  <div className="text-right text-white/50 text-sm mt-1">
                    {formData.name.length}/50
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-white mb-2">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Write your congratulations here..."
                    minLength={10}
                    maxLength={500}
                    required
                  />
                  <div className="text-right text-white/50 text-sm mt-1">
                    {formData.message.length}/500
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-purple-600 rounded-lg text-white font-semibold hover:bg-purple-700 transition-colors"
                    disabled={
                      !formData.name.trim() ||
                      !formData.message.trim() ||
                      formData.message.length < 10
                    }
                  >
                    Send Congratulations
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Congratulations display section */}
      <div className="min-h-screen py-20 relative z-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Community Congratulations
          </h2>

          <div className="space-y-6">
            {congratulations.map((congratulation) => (
              <motion.div
                key={congratulation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-white">
                    {congratulation.name}
                  </h3>
                </div>
                <p className="text-white/90 mt-3">{congratulation.message}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
