"use client";

import { useSpring } from "@react-spring/web";
import { useEffect, useRef, RefObject } from "react";

export function usePanAndZoom(ref: RefObject<HTMLDivElement | null>) {
  const [{ x, y, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
    config: {
      mass: 1,
      tension: 280,
      friction: 120,
      easing: (t: number) =>
        t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    },
  }));

  const isPanning = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const lastTime = useRef<number>(0);
  const panStart = useRef({ x: 0, y: 0 });
  const panStartTime = useRef<number>(0);
  const initialPinchDistance = useRef(0);
  const isThrottled = useRef(false);
  const throttleTimeout = useRef<NodeJS.Timeout | null>(null);

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

    velocity.current = {
      x: deltaX / deltaTime,
      y: deltaY / deltaTime,
    };

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

    const momentum = () => {
      const elapsed = Date.now() - panStartTime.current;
      const progress = Math.min(elapsed / 300, 1);
      const easeOut = 1 - Math.pow(progress - 1, 2);

      const momentumX = velocity.current.x * 10 * easeOut;
      const momentumY = velocity.current.y * 10 * easeOut;

      if (Math.abs(momentumX) < 0.1 && Math.abs(momentumY) < 0.1) return;

      api.start({
        x: x.get() + momentumX,
        y: y.get() + momentumY,
        immediate: true,
      });

      velocity.current.x *= 0.92;
      velocity.current.y *= 0.92;

      requestAnimationFrame(momentum);
    };

    requestAnimationFrame(momentum);
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      isPanning.current = true;
      lastPosition.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartTime.current = Date.now();
      velocity.current = { x: 0, y: 0 };
      lastTime.current = Date.now();
    } else if (e.touches.length === 2) {
      isPanning.current = false; // Do not pan when zooming
      initialPinchDistance.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
    }
    e.preventDefault();
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1 && isPanning.current) {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime.current;
      lastTime.current = currentTime;

      if (deltaTime === 0) return;

      const deltaX = e.touches[0].clientX - lastPosition.current.x;
      const deltaY = e.touches[0].clientY - lastPosition.current.y;

      velocity.current = {
        x: deltaX / deltaTime,
        y: deltaY / deltaTime,
      };

      api.start({
        x: x.get() + deltaX,
        y: y.get() + deltaY,
        immediate: true,
      });

      lastPosition.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else if (e.touches.length === 2 && initialPinchDistance.current > 0) {
      if (isThrottled.current) return;
      isThrottled.current = true;

      const currentPinchDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      const scaleFactor = currentPinchDistance / initialPinchDistance.current;
      api.start({ scale: scale.get() * scaleFactor });
      initialPinchDistance.current = currentPinchDistance;

      throttleTimeout.current = setTimeout(() => {
        isThrottled.current = false;
      }, 16);
    }
    e.preventDefault();
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (e.touches.length < 2) {
      initialPinchDistance.current = 0;
    }
    if (e.touches.length < 1 && isPanning.current) {
      isPanning.current = false;
      const momentum = () => {
        const elapsed = Date.now() - panStartTime.current;
        const progress = Math.min(elapsed / 300, 1);
        const easeOut = 1 - Math.pow(progress - 1, 2);

        const momentumX = velocity.current.x * 10 * easeOut;
        const momentumY = velocity.current.y * 10 * easeOut;

        if (Math.abs(momentumX) < 0.1 && Math.abs(momentumY) < 0.1) return;

        api.start({
          x: x.get() + momentumX,
          y: y.get() + momentumY,
          immediate: true,
        });

        velocity.current.x *= 0.92;
        velocity.current.y *= 0.92;

        requestAnimationFrame(momentum);
      };

      requestAnimationFrame(momentum);
    }
  };

  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
      api.start({ scale: scale.get() * scaleFactor });
    }
  };

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMoveWrapper = (e: MouseEvent) => handleMouseMove(e);
    const handleMouseUpWrapper = () => handleMouseUp();
    const handleTouchStartWrapper = (e: TouchEvent) => handleTouchStart(e);
    const handleTouchMoveWrapper = (e: TouchEvent) => handleTouchMove(e);
    const handleTouchEndWrapper = (e: TouchEvent) => handleTouchEnd(e);
    const handleWheelWrapper = (e: WheelEvent) => handleWheel(e);

    element.addEventListener("mousedown", handleMouseDown as any);
    element.addEventListener("touchstart", handleTouchStartWrapper, {
      passive: false,
    });
    window.addEventListener("mousemove", handleMouseMoveWrapper);
    window.addEventListener("mouseup", handleMouseUpWrapper);
    window.addEventListener("touchmove", handleTouchMoveWrapper, {
      passive: false,
    });
    window.addEventListener("touchend", handleTouchEndWrapper);
    element.addEventListener("wheel", handleWheelWrapper, { passive: false });

    return () => {
      if (throttleTimeout.current) {
        clearTimeout(throttleTimeout.current);
      }
      element.removeEventListener("mousedown", handleMouseDown as any);
      element.removeEventListener("touchstart", handleTouchStartWrapper);
      window.removeEventListener("mousemove", handleMouseMoveWrapper);
      window.removeEventListener("mouseup", handleMouseUpWrapper);
      window.removeEventListener("touchmove", handleTouchMoveWrapper);
      window.removeEventListener("touchend", handleTouchEndWrapper);
      element.removeEventListener("wheel", handleWheelWrapper);
    };
  }, [ref]);

  return { x, y, scale, api };
}
