import React, { useState, useEffect, useRef, useCallback } from "react"
import throttle from "lodash/throttle"

export default function DotGrid(props) {
    const {
        dotSize = 10,
        dotColor = "blue",
        maxDotSize = 30,
        dotSpacing = 30,
        gridRows = 10,
        gridColumns = 10,
        waveThickness = 40, // Widen the wave's area of influence
        mouseInfluenceRadius = 150, // Radius of mouse hover effect
    } = props

    const [mousePosition, setMousePosition] = useState({ x: -1, y: -1 })
    const [waves, setWaves] = useState([]) // Store multiple waves
    const [aquariumEffect, setAquariumEffect] = useState(0) // Aquarium effect state
    const containerRef = useRef(null)

    const handleMouseMove = useCallback(
        throttle((event) => {
            if (!containerRef.current) return
            const rect = containerRef.current.getBoundingClientRect()
            setMousePosition({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            })
        }, 50),
        []
    )

    const handleMouseClick = (event) => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        setWaves((prev) => [
            ...prev,
            {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
                radius: 0,
                startTime: Date.now(),
            },
        ])
    }

    useEffect(() => {
        if (waves.length === 0) return

        const animateWaves = () => {
            const now = Date.now()
            setWaves((prev) =>
                prev
                    .map((wave) => {
                        const elapsed = now - wave.startTime
                        const expansionDuration = 3000 // Wave expansion duration (3 seconds)
                        const fadeDuration = 1500 // Fade-out intensity duration (1.5 seconds)

                        // Remove wave once intensity is 0
                        if (elapsed >= fadeDuration) return null

                        const radius = (elapsed / expansionDuration) * 500 // Expand to max radius
                        const intensity = Math.max(0, 1 - elapsed / fadeDuration) // Fade intensity

                        return { ...wave, radius, intensity }
                    })
                    .filter(Boolean) // Remove completed waves
            )
            requestAnimationFrame(animateWaves)
        }

        animateWaves()
    }, [waves])

    useEffect(() => {
        const interval = setInterval(() => {
            setAquariumEffect((prev) => prev + 0.05)
        }, .0167)

        return () => clearInterval(interval)
    }, [])

    const calculateDotSize = useCallback(
        (dotX, dotY) => {
            let pulseEffect = 0
            for (const wave of waves) {
                const distanceToWave = Math.sqrt(
                    Math.pow(wave.x - dotX, 2) + Math.pow(wave.y - dotY, 2)
                )

                // Check if the dot is near the wave's perimeter
                if (
                    distanceToWave >= wave.radius - waveThickness &&
                    distanceToWave <= wave.radius + waveThickness
                ) {
                    const fadeFactor =
                        1 - Math.abs(distanceToWave - wave.radius) / waveThickness
                    pulseEffect += fadeFactor * wave.intensity
                }
            }

            // Mouse influence effect
            const distanceToMouse = Math.sqrt(
                Math.pow(mousePosition.x - dotX, 2) + Math.pow(mousePosition.y - dotY, 2)
            )
            const mouseEffect =
                distanceToMouse <= mouseInfluenceRadius
                    ? 1 - distanceToMouse / mouseInfluenceRadius
                    : 0

            // Aquarium effect
            const aquariumWave = Math.sin(aquariumEffect + dotX * 0.2 + dotY * 0.2) * 0.5 + 0.5

            const size =
                dotSize +
                pulseEffect * (maxDotSize - dotSize) +
                mouseEffect * (maxDotSize - dotSize) * 0.5 + // Mouse influence is subtler
                aquariumWave * (maxDotSize - dotSize) * 0.3 // Aquarium effect

            return size
        },
        [mousePosition, waves, dotSize, maxDotSize, waveThickness, mouseInfluenceRadius, aquariumEffect]
    )

    const dots = []
    for (let i = 0; i < gridRows; i++) {
        for (let j = 0; j < gridColumns; j++) {
            const dotX = j * dotSpacing
            const dotY = i * dotSpacing

            const size = calculateDotSize(dotX, dotY)

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
                    }}
                />
            )
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
    )
}
