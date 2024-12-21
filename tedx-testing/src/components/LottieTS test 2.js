import React, { useState, useEffect, useRef, useCallback } from "react";
import throttle from "lodash/throttle";

export default function DotGrid(props) {
    const {
        dotSize = 10,
        dotColor = "white",
        maxDotSize = 30,
        dotSpacing = 30,
        gridRows = 55,
        gridColumns = 55,
        waveThickness = 40, // Widen the wave's area of influence
        mouseInfluenceRadius = 150, // Radius of mouse hover effect
        distanceThreshold = 10,
        smoothFactor = 0.5,
        enableLookAt = true,
    } = props;

    const [mousePosition, setMousePosition] = useState({ x: -1, y: -1 });
    const [renderKey, setRenderKey] = useState(0); // Force UI re-render when necessary
    const wavesRef = useRef([]); // Store waves without triggering re-renders
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
        setRenderKey((prev) => prev + 1); // Trigger a re-render to update dots
    };

    const animateWaves = useCallback(() => {
        const now = Date.now();
        wavesRef.current = wavesRef.current
            .map((wave) => {
                const elapsed = now - wave.startTime;
                const expansionDuration = 3000; // Wave expansion duration (3 seconds)
                const fadeDuration = 1500; // Fade-out intensity duration

                if (elapsed >= fadeDuration) return null; // Remove completed waves

                const radius = (elapsed / expansionDuration) * 500; // Expand to max radius
                const intensity = Math.max(0, 1 - elapsed / fadeDuration); // Fade intensity

                return { ...wave, radius, intensity };
            })
            .filter(Boolean); // Remove completed waves

        setRenderKey((prev) => prev + 1); // Trigger re-render for UI updates
        requestAnimationFrame(animateWaves); // Continue animation loop
    }, []);

    useEffect(() => {
        requestAnimationFrame(animateWaves);
        return () => cancelAnimationFrame(animateWaves);
    }, [animateWaves]);

    const calculateDotSize = useCallback(
        (dotX, dotY) => {
            let pulseEffect = 0;
            for (const wave of wavesRef.current) {
                const distanceToWave = Math.sqrt(
                    Math.pow(wave.x - dotX, 2) + Math.pow(wave.y - dotY, 2)
                );
    
                if (
                    distanceToWave >= wave.radius - waveThickness &&
                    distanceToWave <= wave.radius + waveThickness
                ) {
                    const fadeFactor =
                        1 - Math.abs(distanceToWave - wave.radius) / waveThickness;
                    pulseEffect += fadeFactor * wave.intensity;
                }
            }
    
            const distanceToMouse = Math.sqrt(
                Math.pow(mousePosition.x - dotX, 2) +
                    Math.pow(mousePosition.y - dotY, 2)
            );
            const mouseEffect =
                distanceToMouse <= mouseInfluenceRadius
                    ? 1 - distanceToMouse / mouseInfluenceRadius
                    : 0;
    
            const aquariumWave = 0; // Replace with actual logic if needed
    
            const size =
                dotSize +
                pulseEffect * (maxDotSize - dotSize) +
                mouseEffect * (maxDotSize - dotSize) * 0.6 +
                aquariumWave * (maxDotSize - dotSize) * 0.3;
    
            // Ensure size is a valid number
            return isNaN(size) || size < 0 ? dotSize : Math.min(size, maxDotSize);
        },
        [mousePosition, dotSize, maxDotSize, waveThickness, mouseInfluenceRadius]
    );

    const dots = [];
    for (let i = 0; i < gridRows; i++) {
        for (let j = 0; j < gridColumns; j++) {
            const dotX = j * dotSpacing;
            const dotY = i * dotSpacing;
            const size = calculateDotSize(dotX, dotY);
            const shouldHaveChromaticAberration = size > maxDotSize * 0.5;

            if (shouldHaveChromaticAberration) {
                const dx = dotX - mousePosition.x;
                const dy = dotY - mousePosition.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const directionX = distance !== 0 ? (dx / distance) * 3 : 0;
                const directionY = distance !== 0 ? (dy / distance) * 3 : 0;

                const changeX = directionX * Math.exp(size / maxDotSize);
                const changeY = directionY * Math.exp(size / maxDotSize);

                dots.push(
                    <div
                        key={`${i}-${j}-red`}
                        style={{
                            position: "absolute",
                            left: dotX + changeX,
                            top: dotY + changeY,
                            transform: "translate(-50%, -50%)",
                            width: size * 0.9,
                            height: size * 0.9,
                            backgroundColor: "red",
                            borderRadius: "50%",
                            opacity: 0.5,
                            zIndex: 0,
                        }}
                    />
                );

                dots.push(
                    <div
                        key={`${i}-${j}-blue`}
                        style={{
                            position: "absolute",
                            left: dotX - changeX,
                            top: dotY - changeY,
                            transform: "translate(-50%, -50%)",
                            width: size * 0.9,
                            height: size * 0.9,
                            backgroundColor: "blue",
                            borderRadius: "50%",
                            opacity: 0.5,
                            zIndex: 0,
                        }}
                    />
                );
            }

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
