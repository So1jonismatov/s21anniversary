"use client";

import * as React from "react";
import {
  motion,
  type SpringOptions,
  useMotionValue,
  useSpring,
} from "motion/react";

import { cn } from "@/lib/utils";

type BubbleBackgroundProps = React.ComponentProps<"div"> & {
  interactive?: boolean;
  transition?: SpringOptions;
  colors?: {
    first: string;
    second: string;
    third: string;
    fourth: string;
    fifth: string;
    sixth: string;
  };
};

function BubbleBackground({
  ref,
  className,
  children,
  interactive = false,
  transition = { stiffness: 100, damping: 20 },
  colors = {
    first: "124,70,213", // #7c46d5
    second: "68,235,153", // #44eb99
    third: "124,70,213",
    fourth: "68,235,153",
    fifth: "124,70,213",
    sixth: "68,235,153",
  },
  ...props
}: BubbleBackgroundProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, transition);
  const springY = useSpring(mouseY, transition);

  React.useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () =>
      window.removeEventListener("mousemove", handleMouseMove);
  }, [interactive, mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      data-slot="bubble-background"
      className={cn(
        "relative size-full overflow-hidden bg-gradient-to-br from-[#7c46d5] to-[#44eb99]",
        className,
      )}
      {...props}
    >
      <style>
        {`
            :root {
              --first-color: ${colors.first};
              --second-color: ${colors.second};
              --third-color: ${colors.third};
              --fourth-color: ${colors.fourth};
              --fifth-color: ${colors.fifth};
              --sixth-color: ${colors.sixth};
            }
          `}
      </style>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-0 left-0 w-0 h-0"
      >
        <defs>
          <filter id="goo">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div
        className="absolute inset-0"
        style={{ filter: "url(#goo) blur(40px)" }}
      >
        <motion.div
          className="absolute rounded-full size-[80%] top-[10%] left-[10%] mix-blend-hard-light bg-[radial-gradient(circle_at_center,rgba(var(--first-color),0.8)_0%,rgba(var(--first-color),0)_50%)]"
          animate={{ y: [-50, 50, -50] }}
          transition={{ duration: 30, ease: "easeInOut", repeat: Infinity }}
        />

        <motion.div
          className="absolute inset-0 flex justify-center items-center origin-[calc(50%-400px)]"
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
          }}
        >
          <div className="rounded-full size-[80%] top-[10%] left-[10%] mix-blend-hard-light bg-[radial-gradient(circle_at_center,rgba(var(--second-color),0.8)_0%,rgba(var(--second-color),0)_50%)]" />
        </motion.div>

        <motion.div
          className="absolute inset-0 flex justify-center items-center origin-[calc(50%+400px)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity }}
        >
          <div className="absolute rounded-full size-[80%] bg-[radial-gradient(circle_at_center,rgba(var(--third-color),0.8)_0%,rgba(var(--third-color),0)_50%)] mix-blend-hard-light top-[calc(50%+200px)] left-[calc(50%-500px)]" />
        </motion.div>

        <motion.div
          className="absolute rounded-full size-[80%] top-[10%] left-[10%] mix-blend-hard-light bg-[radial-gradient(circle_at_center,rgba(var(--fourth-color),0.8)_0%,rgba(var(--fourth-color),0)_50%)] opacity-70"
          animate={{ x: [-50, 50, -50] }}
          transition={{ duration: 40, ease: "easeInOut", repeat: Infinity }}
        />

        <motion.div
          className="absolute inset-0 flex justify-center items-center origin-[calc(50%_-_800px)_calc(50%_+_200px)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity }}
        >
          <div className="absolute rounded-full size-[160%] mix-blend-hard-light bg-[radial-gradient(circle_at_center,rgba(var(--fifth-color),0.8)_0%,rgba(var(--fifth-color),0)_50%)] top-[calc(50%-80%)] left-[calc(50%-80%)]" />
        </motion.div>

        {interactive && (
          <motion.div
            className="absolute rounded-full size-full mix-blend-hard-light bg-[radial-gradient(circle_at_center,rgba(var(--sixth-color),0.8)_0%,rgba(var(--sixth-color),0)_50%)] opacity-70"
            style={{
              x: springX,
              y: springY,
            }}
          />
        )}
      </div>

      {children}
    </div>
  );
}

export { BubbleBackground, type BubbleBackgroundProps };
