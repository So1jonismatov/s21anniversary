"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import names from "@/lib/my.js";
import { Congratulation } from "@/types";

type CongratulationsFormProps = {
  onFormSubmit: (newCongratulation: Congratulation) => void;
  prefetchCongratulations: () => void;
};

export default function CongratulationsForm({
  onFormSubmit,
  prefetchCongratulations,
}: CongratulationsFormProps) {
  const [formData, setFormData] = useState({ username: "", comment: "" });
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, username: value });
    if (value) {
      const filteredNames = Object.keys(names)
        .filter((name) => name.toLowerCase().startsWith(value.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filteredNames);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (name: string) => {
    setFormData({ ...formData, username: name });
    setSuggestions([]);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted");
    if (
      formData.username.trim() &&
      formData.comment.trim() &&
      formData.comment.length >= 10
    ) {
      const newCongratulation: Congratulation = {
        id: Date.now(), // Temporary ID
        username: formData.username,
        comment: formData.comment,
      };
      onFormSubmit(newCongratulation);
      setFormData({ username: "", comment: "" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
      <motion.div
        className="w-full max-w-2xl bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl"
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
            transition={{
              delay: 0.3,
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <label htmlFor="name" className="block text-white mb-2">
              Your Name/Nickname
            </label>
            <div className="relative">
              <input
                type="text"
                id="name"
                value={formData.username}
                onFocus={prefetchCongratulations}
                onChange={handleNameChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ease-out"
                placeholder="Enter your name or nickname"
                minLength={1}
                maxLength={50}
                required
                autoComplete="off"
              />
              {suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-black/80 backdrop-blur-lg border border-white/10 rounded-lg mt-1">
                  {suggestions.map((name) => (
                    <li
                      key={name}
                      onClick={() => handleSuggestionClick(name)}
                      className="px-4 py-2 text-white cursor-pointer hover:bg-purple-600"
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="text-right text-white/50 text-sm mt-1 transition-all duration-300 ease-out">
              {formData.username.length}/50
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.4,
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <label htmlFor="message" className="block text-white mb-2">
              Your Message
            </label>
            <textarea
              id="message"
              value={formData.comment}
              onFocus={prefetchCongratulations}
              onChange={(e) =>
                setFormData({ ...formData, comment: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ease-out"
              placeholder="Write your congratulations here..."
              minLength={10}
              maxLength={500}
              required
            />
            <div className="text-right text-white/50 text-sm mt-1 transition-all duration-300 ease-out">
              {formData.comment.length}/500
            </div>
          </motion.div>

          <motion.div
            className="flex justify-end"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.5,
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <button
              type="submit"
              className="px-6 py-3 bg-purple-600 rounded-lg text-white font-semibold hover:bg-purple-700 transition-all duration-300 ease-out"
              disabled={
                !formData.username.trim() ||
                !formData.comment.trim() ||
                formData.comment.length < 10
              }
              onClick={handleFormSubmit}
            >
              Send Congratulations
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
