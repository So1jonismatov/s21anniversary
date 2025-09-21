"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSpring, animated, useTransition } from "@react-spring/web";
import { FireworksBackground } from "@/components/fireworks-background";

type Congratulation = {
  id: number;
  name: string;
  message: string;
};

type CongratulationsCanvasProps = {
  congratulations: Congratulation[];
};

const CongratulationsCanvas: React.FC<CongratulationsCanvasProps> = ({
  congratulations,
}) => {
  const [positions, setPositions] = useState<{
    [key: number]: { x: number; y: number; speed: number; hue: number };
  }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasSize = useRef({ width: 3000, height: 3000 });
  const windowSize = useRef({ width: 0, height: 0 });
  const isPanning = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>(0);
  const lastTime = useRef<number>(0);
  const panStart = useRef({ x: 0, y: 0 });
  const panStartTime = useRef<number>(0);
  const mousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Set canvas size based on window size
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
    congratulations.forEach((c) => {
      newPositions[c.id] = {
        x:
          Math.random() * canvasSize.current.width -
          canvasSize.current.width / 2,
        y:
          Math.random() * canvasSize.current.height -
          canvasSize.current.height / 2,
        speed: 0.2 + Math.random() * 1.8, // Random speed for 3D effect
        hue: Math.floor(Math.random() * 360), // Random hue for color variation
      };
    });
    setPositions(newPositions);
  }, [congratulations]);

  const [{ x, y, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
    config: {
      mass: 1,
      tension: 280,
      friction: 120,
      // Bezier curve easing: easeOutQuad
      easing: (t: number) =>
        t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    },
  }));

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Handle window resize
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

  // Mouse events for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    isPanning.current = true;
    lastPosition.current = { x: e.clientX, y: e.clientY };
    panStart.current = { x: e.clientX, y: e.clientY };
    panStartTime.current = Date.now();
    velocity.current = { x: 0, y: 0 };
    lastTime.current = Date.now();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isPanning.current) return;

    const currentTime = Date.now();
    const deltaTime = currentTime - lastTime.current;
    lastTime.current = currentTime;

    if (deltaTime === 0) return;

    const deltaX = e.clientX - lastPosition.current.x;
    const deltaY = e.clientY - lastPosition.current.y;

    // Calculate velocity
    velocity.current = {
      x: deltaX / deltaTime,
      y: deltaY / deltaTime,
    };

    // Apply panning with smooth easing
    api.start({
      x: x.get() + deltaX,
      y: y.get() + deltaY,
      immediate: true,
    });

    lastPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    if (!isPanning.current) return;

    isPanning.current = false;

    // Apply momentum with easing
    const momentum = () => {
      // Apply easing function for smooth deceleration
      const elapsed = Date.now() - panStartTime.current;
      const progress = Math.min(elapsed / 300, 1); // 300ms duration
      const easeOut = 1 - Math.pow(progress - 1, 2); // Ease out function

      // Calculate momentum based on velocity and easing
      const momentumX = velocity.current.x * 10 * easeOut;
      const momentumY = velocity.current.y * 10 * easeOut;

      if (Math.abs(momentumX) < 0.1 && Math.abs(momentumY) < 0.1) return;

      api.start({
        x: x.get() + momentumX,
        y: y.get() + momentumY,
        immediate: true,
      });

      // Apply damping
      velocity.current.x *= 0.92;
      velocity.current.y *= 0.92;

      animationRef.current = requestAnimationFrame(momentum);
    };

    animationRef.current = requestAnimationFrame(momentum);
  };

  // Touch events for panning
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;

    isPanning.current = true;
    lastPosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    panStartTime.current = Date.now();
    velocity.current = { x: 0, y: 0 };
    lastTime.current = Date.now();

    // Cancel any ongoing momentum
    cancelAnimationFrame(animationRef.current);

    // Prevent scrolling
    e.preventDefault();
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isPanning.current || e.touches.length !== 1) return;

    const currentTime = Date.now();
    const deltaTime = currentTime - lastTime.current;
    lastTime.current = currentTime;

    if (deltaTime === 0) return;

    const deltaX = e.touches[0].clientX - lastPosition.current.x;
    const deltaY = e.touches[0].clientY - lastPosition.current.y;

    // Calculate velocity
    velocity.current = {
      x: deltaX / deltaTime,
      y: deltaY / deltaTime,
    };

    // Apply panning
    api.start({
      x: x.get() + deltaX,
      y: y.get() + deltaY,
      immediate: true,
    });

    lastPosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

    // Prevent scrolling
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    if (!isPanning.current) return;

    isPanning.current = false;

    // Apply momentum with easing
    const momentum = () => {
      // Apply easing function for smooth deceleration
      const elapsed = Date.now() - panStartTime.current;
      const progress = Math.min(elapsed / 300, 1); // 300ms duration
      const easeOut = 1 - Math.pow(progress - 1, 2); // Ease out function

      // Calculate momentum based on velocity and easing
      const momentumX = velocity.current.x * 10 * easeOut;
      const momentumY = velocity.current.y * 10 * easeOut;

      if (Math.abs(momentumX) < 0.1 && Math.abs(momentumY) < 0.1) return;

      api.start({
        x: x.get() + momentumX,
        y: y.get() + momentumY,
        immediate: true,
      });

      // Apply damping
      velocity.current.x *= 0.92;
      velocity.current.y *= 0.92;

      animationRef.current = requestAnimationFrame(momentum);
    };

    animationRef.current = requestAnimationFrame(momentum);
  };

  // Cleanup
  useEffect(() => {
    const handleMouseMoveWrapper = (e: MouseEvent) => handleMouseMove(e);
    const handleMouseUpWrapper = () => handleMouseUp();
    const handleTouchMoveWrapper = (e: TouchEvent) => handleTouchMove(e);
    const handleTouchEndWrapper = () => handleTouchEnd();

    window.addEventListener("mousemove", handleMouseMoveWrapper);
    window.addEventListener("mouseup", handleMouseUpWrapper);
    window.addEventListener("touchmove", handleTouchMoveWrapper, {
      passive: false,
    });
    window.addEventListener("touchend", handleTouchEndWrapper);

    return () => {
      window.removeEventListener("mousemove", handleMouseMoveWrapper);
      window.removeEventListener("mouseup", handleMouseUpWrapper);
      window.removeEventListener("touchmove", handleTouchMoveWrapper);
      window.removeEventListener("touchend", handleTouchEndWrapper);
      cancelAnimationFrame(animationRef.current);
    };
  }, [api, x, y]);

  // Edge scrolling
  useEffect(() => {
    const edgeScroll = () => {
      if (isPanning.current) {
        animationRef.current = requestAnimationFrame(edgeScroll);
        return;
      }

      const { x: mouseX, y: mouseY } = mousePosition.current;
      const { width, height } = windowSize.current;

      const edgeThreshold = 100; // 100px from the edge
      let dx = 0;
      let dy = 0;

      if (mouseX < edgeThreshold) {
        dx = (edgeThreshold - mouseX) * 0.2;
      } else if (mouseX > width - edgeThreshold) {
        dx = -(mouseX - (width - edgeThreshold)) * 0.2;
      }

      if (mouseY < edgeThreshold) {
        dy = (edgeThreshold - mouseY) * 0.2;
      } else if (mouseY > height - edgeThreshold) {
        dy = -(mouseY - (height - edgeThreshold)) * 0.2;
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

  const centerOnMessage = (id: number) => {
    const pos = positions[id];
    if (pos) {
      api.start({
        x: -pos.x,
        y: -pos.y,
        scale: 1.5,
        // Smooth zoom animation with cubic bezier easing
        config: {
          tension: 170,
          friction: 26,
          easing: (t: number) => {
            // EaseInOutCubic
            return t < 0.5
              ? 4 * t * t * t
              : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
          },
        },
      });
    }
  };

  // Get wrapped position for infinite effect with speed-based movement
  const getWrappedPosition = (id: number, speedFactor: number = 1) => {
    const pos = positions[id];
    if (!pos) return { x: 0, y: 0 };

    const currentX = x.get();
    const currentY = y.get();

    // Apply speed factor to create 3D effect
    const adjustedX = currentX * pos.speed * speedFactor;
    const adjustedY = currentY * pos.speed * speedFactor;

    // Calculate the actual position of the message
    const actualX = pos.x + adjustedX;
    const actualY = pos.y + adjustedY;

    // Wrap around the canvas
    const halfCanvasWidth = canvasSize.current.width / 2;
    const halfCanvasHeight = canvasSize.current.height / 2;

    // Wrap X position
    let wrappedX = actualX;
    if (actualX > halfCanvasWidth) {
      wrappedX = actualX - canvasSize.current.width;
    } else if (actualX < -halfCanvasWidth) {
      wrappedX = actualX + canvasSize.current.width;
    }

    // Wrap Y position
    let wrappedY = actualY;
    if (actualY > halfCanvasHeight) {
      wrappedY = actualY - canvasSize.current.height;
    } else if (actualY < -halfCanvasHeight) {
      wrappedY = actualY + canvasSize.current.height;
    }

    // Convert back to relative position
    return {
      x: wrappedX - adjustedX,
      y: wrappedY - adjustedY,
    };
  };

  const transitions = useTransition(congratulations, {
    from: { opacity: 0, transform: "translateY(20px)" },
    enter: { opacity: 1, transform: "translateY(0px)" },
    trail: 100, // ms
    keys: item => item.id,
  });

  // Generate multiple instances for wrapping effect with different speeds and colors
  const renderMessages = () => {
    return transitions((style, congratulation) => {
      const pos = positions[congratulation.id];
      if (!pos) return null;

      const speedFactor = pos.speed;
      const hue = pos.hue;
      const mainPos = getWrappedPosition(congratulation.id, 1);

      const messages: React.JSX.Element[] = [];

      // Render the main message with parallax effect and color variation
      messages.push(
        <animated.div
          key={`${congratulation.id}-main`}
          style={{
            ...style,
            position: "absolute",
            left: `calc(50% + ${mainPos.x}px)`,
            top: `calc(50% + ${mainPos.y}px)`,
            transform: "translate(-50%, -50%)",
            zIndex: Math.floor(speedFactor * 10), // Higher speed messages in front
            backgroundColor: `hsla(${hue}, 70%, 50%, 0.2)`,
            borderColor: `hsla(${hue}, 70%, 70%, 0.4)`,
          }}
          onClick={() => centerOnMessage(congratulation.id)}
          className="p-6 backdrop-blur-lg rounded-2xl shadow-xl w-64 cursor-pointer hover:opacity-90 transition-all duration-300 ease-out border"
        >
          <h3
            className="text-xl font-semibold font-playfair"
            style={{ color: `hsl(${hue}, 90%, 90%)` }}
          >
            {congratulation.name}
          </h3>
          <p
            className="mt-3 font-playfair"
            style={{ color: `hsl(${hue}, 80%, 85%)` }}
          >
            {congratulation.message}
          </p>
        </animated.div>,
      );

      // Render additional instances for wrapping effect
      const offsets = [
        { x: -canvasSize.current.width, y: 0 },
        { x: canvasSize.current.width, y: 0 },
        { x: 0, y: -canvasSize.current.height },
        { x: 0, y: canvasSize.current.height },
        { x: -canvasSize.current.width, y: -canvasSize.current.height },
        { x: canvasSize.current.width, y: -canvasSize.current.height },
        { x: -canvasSize.current.width, y: canvasSize.current.height },
        { x: canvasSize.current.width, y: canvasSize.current.height },
      ];

      offsets.forEach((offset, index) => {
        const wrapPos = getWrappedPosition(congratulation.id, 1);
        messages.push(
          <animated.div
            key={`${congratulation.id}-wrap-${index}`}
            style={{
              ...style,
              position: "absolute",
              left: `calc(50% + ${wrapPos.x + offset.x * speedFactor}px)`,
              top: `calc(50% + ${wrapPos.y + offset.y * speedFactor}px)`,
              transform: "translate(-50%, -50%)",
              zIndex: Math.floor(speedFactor * 10),
              backgroundColor: `hsla(${hue}, 70%, 50%, 0.15)`,
              borderColor: `hsla(${hue}, 70%, 70%, 0.3)`,
            }}
            onClick={() => centerOnMessage(congratulation.id)}
            className="p-6 backdrop-blur-lg rounded-2xl shadow-xl w-64 cursor-pointer hover:opacity-80 transition-all duration-300 ease-out border opacity-80"
          >
            <h3
              className="text-xl font-semibold font-playfair"
              style={{ color: `hsl(${hue}, 90%, 85%)` }}
            >
              {congratulation.name}
            </h3>
            <p
              className="mt-3 font-playfair"
              style={{ color: `hsl(${hue}, 80%, 80%)` }}
            >
              {congratulation.message}
            </p>
          </animated.div>,
        );
      });

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

export default CongratulationsCanvas;
