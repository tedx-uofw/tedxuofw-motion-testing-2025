import React, { useState, useEffect, useRef, useCallback } from "react";
import throttle from "lodash/throttle";
import circleDiameters from "../data/circle_diameters.json";

export default function DotGrid(props) {
  const {
    dotSize = 0,
    dotColor = "white",
    maxDotSize = 10,
    dotSpacing = 30,
    gridRows = 55,
    gridColumns = 55,
    waveThickness = 40,
    mouseInfluenceRadius = 150,
    distanceThreshold = 10,
    smoothFactor = 0.5,
    enableLookAt = true,
  } = props;

  // JSON frames
  const [frames, setFrames] = useState([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

  useEffect(() => {
    try {
      setFrames(circleDiameters);
    } catch (error) {
      console.error("Error loading circle_diameters.json:", error);
    }
  }, []);

  // OPTIONAL: Animate frames (cycle through them)
  useEffect(() => {
    if (!frames.length) return;
    let lastTimestamp = performance.now();
    let requestId;

    const animateFrames = (now) => {
      const delta = now - lastTimestamp;
      // Increase frame index every ~100ms
      if (delta > 1000 * 0.0167) {
        setCurrentFrameIndex((prevIndex) => (prevIndex + 1) % frames.length);
        lastTimestamp = now;
      }
      requestId = requestAnimationFrame(animateFrames);
    };

    requestId = requestAnimationFrame(animateFrames);
    return () => cancelAnimationFrame(requestId);
  }, [frames]);

  // Mouse & wave stuff
  const [mousePosition, setMousePosition] = useState({ x: -1, y: -1 });
  const [renderKey, setRenderKey] = useState(0);
  const wavesRef = useRef([]);
  const containerRef = useRef(null);

  const handleMouseMove = useCallback(
    throttle((event) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }, 50),
    []
  );

  const handleMouseClick = (event) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    wavesRef.current.push({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      radius: 0,
      startTime: Date.now(),
    });
    setRenderKey((prev) => prev + 1);
  };

  const animateWaves = useCallback(() => {
    const now = Date.now();
    wavesRef.current = wavesRef.current
      .map((wave) => {
        const elapsed = now - wave.startTime;
        const expansionDuration = 3000; // 3s
        const fadeDuration = 1500;      // 1.5s

        if (elapsed >= fadeDuration) return null;

        const radius = (elapsed / expansionDuration) * 500;
        const intensity = Math.max(0, 1 - elapsed / fadeDuration);

        return { ...wave, radius, intensity };
      })
      .filter(Boolean);

    setRenderKey((prev) => prev + 1);
    requestAnimationFrame(animateWaves);
  }, []);

  useEffect(() => {
    requestAnimationFrame(animateWaves);
    return () => cancelAnimationFrame(animateWaves);
  }, [animateWaves]);

  // Calculate final dot size
  const calculateDotSize = useCallback(
    (dotX, dotY, i, j) => {
      // Start from 0 instead of a positive default
      let size = 0;

      // Wave effect
      for (const wave of wavesRef.current) {
        const distanceToWave = Math.sqrt(
          (wave.x - dotX) ** 2 + (wave.y - dotY) ** 2
        );
        if (
          distanceToWave >= wave.radius - waveThickness &&
          distanceToWave <= wave.radius + waveThickness
        ) {
          const fadeFactor =
            1 - Math.abs(distanceToWave - wave.radius) / waveThickness;
          // Increase wave contribution if you want bigger expansions
          size += fadeFactor * wave.intensity * (maxDotSize * 0.4);
        }
      }

      // Mouse effect
      const distanceToMouse = Math.sqrt(
        (mousePosition.x - dotX) ** 2 + (mousePosition.y - dotY) ** 2
      );
      if (distanceToMouse <= mouseInfluenceRadius) {
        const mouseFactor = 1 - distanceToMouse / mouseInfluenceRadius;
        // Let's say the mouse can grow the dot by up to half the maxDotSize
        size += mouseFactor * (maxDotSize * 0.5);
      }

      // JSON frame effect
      if (frames.length > 0) {
        const frameDiameter = frames[currentFrameIndex]?.[j]?.[i];
        if (typeof frameDiameter === "number") {
          // Example to add a bit of variation
          size += frameDiameter - ((frameDiameter % 30) / 30);
        }
      }

      // Ensure size is within bounds
      if (isNaN(size) || size <= 0) {
        size = 0; // will skip rendering if < 1
      } else {
        size = Math.min(size, maxDotSize);
      }

      return size;
    },
    [
      mousePosition,
      maxDotSize,
      waveThickness,
      mouseInfluenceRadius,
      frames,
      currentFrameIndex,
    ]
  );

  // Chromatic aberration settings
  const maxChromaticDistance = 200;
  const minSizeForAberration = maxDotSize * 0.5;
  
  // Increase this to push the halos further out from the main dot
  const baseChromaticOffset = 10; // was 3
  
  const dots = [];
  for (let i = 0; i < gridRows; i++) {
    for (let j = 0; j < gridColumns; j++) {
      const dotX = j * dotSpacing;
      const dotY = i * dotSpacing;
      const size = calculateDotSize(dotX, dotY, i, j);

      // Skip rendering entirely if size < 1
      if (size < 1) {
        continue;
      }

      // Distance from mouse (for aberration)
      const dx = dotX - mousePosition.x;
      const dy = dotY - mousePosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Chromatic aberration only if within maxChromaticDistance
      // and if size is above some threshold
      const nearMouse = distance < maxChromaticDistance;
      const shouldHaveChromaticAberration =
        size > minSizeForAberration && nearMouse;

      if (shouldHaveChromaticAberration) {
        // Goes from 1 near the mouse to 0 near the boundary
        const fadeFactor = 1 - distance / maxChromaticDistance;

        // Let offset be smaller near the mouse, bigger near boundary
        const rawOffsetFactor = distance / maxChromaticDistance; // 0 -> 1
        const offsetFactor = 0.0 + 0.8 * rawOffsetFactor;         // 0 -> 1

        const directionX = distance !== 0 ? dx / distance : 0;
        const directionY = distance !== 0 ? dy / distance : 0;

        // Larger dot => bigger offset, now multiplied by 10 for intensity
        const dotSizeFactor = Math.exp(size / maxDotSize);
        const offset = baseChromaticOffset * dotSizeFactor * offsetFactor;

        // Increase opacity from 0.5 -> 1.0 for stronger color
        const aberrationOpacity = 0.9 * fadeFactor;

        // Red halo
        dots.push(
          <div
            key={`${i}-${j}-red`}
            style={{
              position: "absolute",
              left: dotX + directionX * offset,
              top: dotY + directionY * offset,
              transform: "translate(-50%, -50%)",
              width: size * 0.9,
              height: size * 0.9,
              backgroundColor: "red",
              borderRadius: "50%",
              opacity: aberrationOpacity,
              zIndex: 0,
            }}
          />
        );

        // Blue halo in opposite direction
        dots.push(
          <div
            key={`${i}-${j}-blue`}
            style={{
              position: "absolute",
              left: dotX - directionX * offset,
              top: dotY - directionY * offset,
              transform: "translate(-50%, -50%)",
              width: size * 0.9,
              height: size * 0.9,
              backgroundColor: "blue",
              borderRadius: "50%",
              opacity: aberrationOpacity,
              zIndex: 0,
            }}
          />
        );
      }

      // Main dot
      dots.push(
        <div
          key={`${i}-${j}`}
          style={{
            position: "absolute",
            left: dotX,
            top: dotY,
            transform: "translate(-50%, -50%)",
            width: size,
            height: size,
            backgroundColor: dotColor,
            borderRadius: "50%",
            zIndex: 1,
          }}
        />
      );
    }
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: gridColumns * dotSpacing,
        height: gridRows * dotSpacing,
        overflow: "hidden",
      }}
      onMouseMove={handleMouseMove}
      onClick={handleMouseClick}
    >
      {dots}
    </div>
  );
}
