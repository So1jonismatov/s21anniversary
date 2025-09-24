"use client";

import { useState, useRef } from "react";
import { Congratulation } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://161.35.204.26:3010";
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "/api";

export function useCongratulations() {
  const [congratulations, setCongratulations] = useState<Congratulation[]>([]);
  const prefetched = useRef(false);

  const prefetchCongratulations = async () => {
    if (prefetched.current) return;
    prefetched.current = true;
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`);
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

  const addCongratulation = async (newCongratulation: Congratulation) => {
    // Optimistically update UI
    setCongratulations((prev) => [newCongratulation, ...prev]);

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newCongratulation.username,
          comment: newCongratulation.comment,
        }),
      });

      if (response.ok) {
        const confirmedCongratulation = await response.json();
        // Replace temporary message with confirmed one
        setCongratulations((prev) =>
          prev.map((c) =>
            c.id === newCongratulation.id ? confirmedCongratulation : c
          )
        );
      } else {
        // Even if the post fails (e.g., duplicate username),
        // we keep the optimistic update for a smooth experience.
        console.error("Failed to submit congratulation, but that's okay.");
      }
    } catch (error) {
      console.error("Error submitting congratulation:", error);
    }
  };

  return { congratulations, prefetchCongratulations, addCongratulation };
}
