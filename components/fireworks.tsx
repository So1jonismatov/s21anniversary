"use client";

import { useEffect, useRef } from 'react';
import type { Container } from '@tsparticles/engine';
import Particles from '@tsparticles/react';
import { loadFull } from 'tsparticles';

interface FireworksProps {
  active: boolean;
}

export default function Fireworks({ active }: FireworksProps) {
  const containerRef = useRef<Container | null>(null);

  const particlesLoaded = async (container?: Container) => {
    containerRef.current = container || null;
  };

  const options = {
    fullScreen: {
      enable: true,
      zIndex: 100,
    },
    particles: {
      number: {
        value: 0,
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        value: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'],
      },
      shape: {
        type: 'circle',
      },
      opacity: {
        value: 1,
        random: true,
        anim: {
          enable: true,
          speed: 1,
          opacity_min: 0,
          sync: false,
        },
      },
      size: {
        value: 3,
        random: true,
        anim: {
          enable: false,
          speed: 4,
          size_min: 0.3,
          sync: false,
        },
      },
      line_linked: {
        enable: false,
      },
      move: {
        enable: true,
        speed: 5,
        direction: 'none',
        random: true,
        straight: false,
        out_mode: 'out',
        bounce: false,
      },
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: {
          enable: false,
        },
        onclick: {
          enable: false,
        },
        resize: true,
      },
    },
    detectRetina: true,
    emitters: {
      direction: 'none',
      life: {
        count: 0,
        duration: 0.1,
        delay: 0.4,
      },
      rate: {
        delay: 0.1,
        quantity: 1,
      },
      size: {
        width: 0,
        height: 0,
      },
    },
  };

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const interval = setInterval(() => {
      container.emit('emit');
    }, 1000);

    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <Particles
      id="fireworks"
      particlesLoaded={particlesLoaded}
      options={options}
      className="absolute inset-0 pointer-events-none"
    />
  );
}