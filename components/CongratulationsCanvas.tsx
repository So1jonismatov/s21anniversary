"use client";

import React, { useState, useEffect, useRef } from "react";
import { animated, useTransition } from "@react-spring/web";
import { Congratulation } from "@/types";
import { usePanAndZoom } from "@/hooks/usePanAndZoom";
import { isMobileOrTouchDevice } from "@/lib/mobile-detection";

type CongratulationsCanvasProps = {
  congratulations: Congratulation[];
  newestMessageId: number | null;
};

const CongratulationsCanvas: React.FC<CongratulationsCanvasProps> = ({
  congratulations,
  newestMessageId,
}) => {
  const [positions, setPositions] = useState<{
    [key: number]: { x: number; y: number; speed: number; hue: number };
  }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasSize = useRef({ width: 3000, height: 3000 });
  const windowSize = useRef({ width: 0, height: 0 });
  const mousePosition = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>(0);
  // Detect if we're on a mobile device for performance optimizations
  const isMobile = isMobileOrTouchDevice();

  const { x, y, scale, handleMouseDown, handleTouchStart, api } =
    usePanAndZoom();

  useEffect(() => {
    windowSize.current = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    canvasSize.current = {
      width: 3000,
      height: 3000,
    };

    const newPositions: {
      [key: number]: { x: number; y: number; speed: number; hue: number };
    } = {};
    // Limit the number of congratulations on mobile for performance
    const limitedCongratulations = isMobile
      ? congratulations.slice(0, Math.min(congratulations.length, 50))
      : congratulations;

    limitedCongratulations.forEach((c) => {
      if (c.id === newestMessageId) {
        newPositions[c.id] = {
          x: 0,
          y: 0,
          speed: 1,
          hue: Math.floor(Math.random() * 360),
        };
      } else {
        newPositions[c.id] = {
          x:
            Math.random() * canvasSize.current.width -
            canvasSize.current.width / 2,
          y:
            Math.random() * canvasSize.current.height -
            canvasSize.current.height / 2,
          speed: 0.2 + Math.random() * 1.8,
          hue: Math.floor(Math.random() * 360),
        };
      }
    });
    setPositions(newPositions);
  }, [congratulations, newestMessageId, isMobile]);

  const centerOnMessage = React.useCallback((id: number) => {
    const pos = positions[id];
    if (pos) {
      api.start({
        x: -pos.x,
        y: -pos.y,
        scale: 1.5,
        config: {
          tension: 170,
          friction: 26,
          easing: (t: number) => {
            return t < 0.5
              ? 4 * t * t * t
              : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
          },
        },
      });
    }
  }, [api, positions]);

  useEffect(() => {
    if (newestMessageId) {
      centerOnMessage(newestMessageId);
    }
  }, [newestMessageId, centerOnMessage]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      windowSize.current = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window;
    if (isTouchDevice) return;

    const edgeScroll = () => {
      const { x: mouseX, y: mouseY } = mousePosition.current;
      const { width, height } = windowSize.current;

      const edgeThreshold = 200; // 200px from the edge
      let dx = 0;
      let dy = 0;

      if (mouseX < edgeThreshold) {
        dx = (edgeThreshold - mouseX) * 0.05;
      } else if (mouseX > width - edgeThreshold) {
        dx = -(mouseX - (width - edgeThreshold)) * 0.05;
      }

      if (mouseY < edgeThreshold) {
        dy = (edgeThreshold - mouseY) * 0.05;
      } else if (mouseY > height - edgeThreshold) {
        dy = -(mouseY - (height - edgeThreshold)) * 0.05;
      }

      if (dx !== 0 || dy !== 0) {
        api.start({
          x: x.get() + dx,
          y: y.get() + dy,
          immediate: true,
        });
      }

      animationRef.current = requestAnimationFrame(edgeScroll);
    };

    animationRef.current = requestAnimationFrame(edgeScroll);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [api, x, y]);

  const getWrappedPosition = (id: number, speedFactor: number = 1) => {
    const pos = positions[id];
    if (!pos) return { x: 0, y: 0 };

    const currentX = x.get();
    const currentY = y.get();

    const adjustedX = currentX * pos.speed * speedFactor;
    const adjustedY = currentY * pos.speed * speedFactor;

    const actualX = pos.x + adjustedX;
    const actualY = pos.y + adjustedY;

    const halfCanvasWidth = canvasSize.current.width / 2;
    const halfCanvasHeight = canvasSize.current.height / 2;

    let wrappedX = actualX;
    if (actualX > halfCanvasWidth) {
      wrappedX = actualX - canvasSize.current.width;
    } else if (actualX < -halfCanvasWidth) {
      wrappedX = actualX + canvasSize.current.width;
    }

    let wrappedY = actualY;
    if (actualY > halfCanvasHeight) {
      wrappedY = actualY - canvasSize.current.height;
    } else if (actualY < -halfCanvasHeight) {
      wrappedY = actualY + canvasSize.current.height;
    }

    return {
      x: wrappedX - adjustedX,
      y: wrappedY - adjustedY,
    };
  };

  const transitions = useTransition(congratulations, {
    from: { opacity: 0, transform: "translateY(20px)" },
    enter: { opacity: 1, transform: "translateY(0px)" },
    trail: isMobile ? 50 : 100, // Reduce trail animation on mobile
    keys: (item) => item.id,
  });

  const renderMessages = () => {
    // Limit the number of messages rendered on mobile
    const visibleCongratulations = isMobile
      ? congratulations.slice(0, Math.min(congratulations.length, 50))
      : congratulations;

    return transitions((style, congratulation) => {
      // Skip rendering if this congratulation is not in our visible set on mobile
      if (
        isMobile &&
        !visibleCongratulations.some((c) => c.id === congratulation.id)
      ) {
        return null;
      }

      const pos = positions[congratulation.id];
      if (!pos) return null;

      const speedFactor = pos.speed;
      const hue = pos.hue;
      const mainPos = getWrappedPosition(congratulation.id, 1);

      const messages: React.JSX.Element[] = [];

      messages.push(
        <animated.div
          key={`${congratulation.id}-main`}
          style={{
            ...style,
            position: "absolute",
            left: `calc(50% + ${mainPos.x}px)`,
            top: `calc(50% + ${mainPos.y}px)`,
            transform: "translate(-50%, -50%)",
            zIndex: Math.floor(speedFactor * 10),
            backgroundColor: `hsla(${hue}, 70%, 50%, ${isMobile ? 0.15 : 0.2})`, // Reduce opacity on mobile
            borderColor: `hsla(${hue}, 70%, 70%, ${isMobile ? 0.3 : 0.4})`,
          }}
          onClick={() => centerOnMessage(congratulation.id)}
          className={`px-4 py-6 backdrop-blur-lg rounded-2xl shadow-xl w-40 md:w-48 cursor-pointer ${
            isMobile ? "hover:opacity-80" : "hover:opacity-90"
          } transition-all duration-300 ease-out border`}
        >
          <h3
            className="text-base md:text-lg font-semibold font-playfair truncate"
            style={{ color: `hsl(${hue}, 90%, 90%)` }}
          >
            {congratulation.username}
          </h3>
          <p
            className="mt-2 text-sm font-playfair line-clamp-3"
            style={{ color: `hsl(${hue}, 80%, 85%)` }}
          >
            {congratulation.comment}
          </p>
        </animated.div>,
      );

      return messages;
    });
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-screen overflow-hidden"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <animated.div style={{ x, y, scale }} className="relative w-full h-full">
        {renderMessages()}
      </animated.div>
    </div>
  );
};

export default React.memo(CongratulationsCanvas);
