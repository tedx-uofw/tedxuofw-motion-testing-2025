import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import throttle from "lodash/throttle";
import circleDiameters from "../data/circle_diameters.json";

export default function DotGrid(props) {
  const {
    dotSize = 0,
    dotColor = 0xffffff, // White color in HEX
    maxDotSize = 5,
    dotSpacing = 30,
    gridRows = 55,
    gridColumns = 55,
    waveThickness = 40,
    mouseInfluenceRadius = 150,
    baseChromaticOffset = 10,
    maxChromaticDistance = 300,
  } = props;

  const containerRef = useRef(null);
  const appRef = useRef(null);
  const dotsRef = useRef([]);
  const wavesRef = useRef([]);
  const framesRef = useRef(circleDiameters);
  const mousePosition = useRef({ x: -1, y: -1 });
  const currentFrameIndex = useRef(0);

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  console.log(`Mobile device detected: ${isMobile}`);

  useEffect(() => {
    const app = new PIXI.Application({
      width: gridColumns * dotSpacing,
      height: gridRows * dotSpacing,
      backgroundAlpha: 0,
      resolution: window.devicePixelRatio || 1, // High resolution
      autoDensity: true, // Adjust canvas size to match resolution
      // antialias: true, // Enable anti-aliasing for smoother rendering
    });
    containerRef.current.appendChild(app.view);
    appRef.current = app;

    const dotContainer = new PIXI.Container();
    dotContainer.sortableChildren = true; // Enable zIndex sorting
    app.stage.addChild(dotContainer);

    // Initialize dots
    for (let i = 0; i < gridRows; i++) {
      for (let j = 0; j < gridColumns; j++) {
        const dot = new PIXI.Container();
        dot.x = j * dotSpacing;
        dot.y = i * dotSpacing;

        const redHalo = new PIXI.Graphics();
        redHalo.blendMode = PIXI.BLEND_MODES.ADD;
        redHalo.zIndex = 0; // Red halo below blue, green, and main dot
        dot.addChild(redHalo);

        const blueHalo = new PIXI.Graphics();
        blueHalo.blendMode = PIXI.BLEND_MODES.ADD;
        blueHalo.zIndex = 1; // Blue halo above red
        dot.addChild(blueHalo);

        const greenHalo = new PIXI.Graphics();
        greenHalo.blendMode = PIXI.BLEND_MODES.ADD;
        greenHalo.zIndex = 2; // Green halo above blue and red
        dot.addChild(greenHalo);

        const mainDot = new PIXI.Graphics();
        mainDot.zIndex = 3; // Main white dot on top
        dot.addChild(mainDot);

        dotContainer.addChild(dot);
        dotsRef.current.push({ dot, mainDot, redHalo, blueHalo, greenHalo, i, j });
      }
    }

    // Add ticker for animations
    app.ticker.add(() => {
      animateFrames();
      animateWaves();
      renderDots();
    });

    app.view.addEventListener("mousemove", throttle(handleMouseMove, 50));
    app.view.addEventListener("click", handleMouseClick);

    return () => {
      app.ticker.stop();
      app.destroy(true, true);
    };
  }, []);

  const animateFrames = () => {
    if (!framesRef.current.length) return;
    currentFrameIndex.current =
      (currentFrameIndex.current + 1) % framesRef.current.length;
  };

  const animateWaves = () => {
    const now = Date.now();
    wavesRef.current = wavesRef.current.filter((wave) => {
      const elapsed = now - wave.startTime;
      if (elapsed > 3000) return false; // Remove wave after 3 seconds
      wave.radius = (elapsed / 3000) * 500; // Expand over 3 seconds
      wave.intensity = Math.max(0, 1 - elapsed / 1500); // Fade over 1.5 seconds
      return true;
    });
  };

  const calculateDotSize = (x, y, i, j) => {
    let size = 0;

    // Wave effect
    for (const wave of wavesRef.current) {
      const distance = Math.sqrt((wave.x - x) ** 2 + (wave.y - y) ** 2);
      if (
        distance >= wave.radius - waveThickness &&
        distance <= wave.radius + waveThickness
      ) {
        const fadeFactor = 1 - Math.abs(distance - wave.radius) / waveThickness;
        size += fadeFactor * wave.intensity * maxDotSize;
      }
    }

    // Mouse effect (skip on mobile)
    if (!isMobile) {
      const mouseDist = Math.sqrt(
        (mousePosition.current.x - x) ** 2 + (mousePosition.current.y - y) ** 2
      );
      if (mouseDist <= mouseInfluenceRadius) {
        const mouseFactor = 1 - mouseDist / mouseInfluenceRadius;
        size += mouseFactor * (maxDotSize * 0.5);
      }
    }

    // Frame effect
    const frameDiameter =
      framesRef.current[currentFrameIndex.current]?.[j]?.[i];
    if (typeof frameDiameter === "number") {
      size += frameDiameter;
    }

    // Ensure size is within valid bounds
    size = Math.max(size, 0); // Minimum size is 0
    size = Math.min(size, maxDotSize); // Maximum size is maxDotSize

    return size;
  };

  const renderDots = () => {
    dotsRef.current.forEach(({ dot, mainDot, redHalo, blueHalo, greenHalo, i, j }) => {
      if (!dot || !dot.parent) return;

      const x = dot.x;
      const y = dot.y;
      const size = calculateDotSize(x, y, i, j);

      // Clear previous drawings
      redHalo.clear();
      blueHalo.clear();
      greenHalo.clear();
      mainDot.clear();

      // Skip rendering for dots with size <= 0
      if (size <= 0) return;

      // Main dot
      mainDot.beginFill(dotColor);
      mainDot.drawCircle(0, 0, size / 2);
      mainDot.endFill();

      // Chromatic aberration
      const dx = x - mousePosition.current.x;
      const dy = y - mousePosition.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < maxChromaticDistance && size > maxDotSize * 0.5) {
        const directionX = dx / distance;
        const directionY = dy / distance;

        // Red halo
        const redOffset = baseChromaticOffset * (distance / maxChromaticDistance);
        redHalo.beginFill(0xff0000, 0.9 * (1 - distance / maxChromaticDistance));
        redHalo.drawCircle(
          -directionX * redOffset,
          -directionY * redOffset,
          size / 2
        );
        redHalo.endFill();

        // Blue halo
        const blueOffset =
          baseChromaticOffset * 0.8 * (distance / maxChromaticDistance);
        blueHalo.beginFill(0x0000ff, 0.9 * (1 - distance / maxChromaticDistance));
        blueHalo.drawCircle(
          directionX * blueOffset,
          directionY * blueOffset,
          size / 2
        );
        blueHalo.endFill();

        // Green halo
        const greenOffset =
          baseChromaticOffset * 0.5 * (distance / maxChromaticDistance);
        greenHalo.beginFill(0x00ff00, 0.9 * (1 - distance / maxChromaticDistance));
        greenHalo.drawCircle(
          directionX * greenOffset,
          -directionY * greenOffset,
          size / 2
        );
        greenHalo.endFill();
      }
    });
  };

  const handleMouseMove = (event) => {
    const rect = appRef.current.view.getBoundingClientRect();
    mousePosition.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handleMouseClick = (event) => {
    const rect = appRef.current.view.getBoundingClientRect();
    wavesRef.current.push({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      radius: 0,
      startTime: Date.now(),
    });
  };

  return <div ref={containerRef} />;
}
