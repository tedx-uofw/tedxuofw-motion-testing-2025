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
    const [pulse, setPulse] = useState(null) // Pulse state
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
        [containerRef]
    )

    const handleMouseClick = (event) => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        setPulse({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            radius: 0,
            startTime: Date.now(),
        })
    }

    useEffect(() => {
        if (!pulse) return

        const animatePulse = () => {
            const elapsed = Date.now() - pulse.startTime
            const duration = 3000 // 3 seconds
            if (elapsed >= duration) {
                setPulse(null) // Clear pulse after 3 seconds
                return
            }

            const radius = (elapsed / duration) * 500 // Expand to max radius
            const intensity = Math.max(0, 1 - elapsed / duration) // Fade intensity as time passes
            setPulse((prev) => ({ ...prev, radius, intensity }))
            requestAnimationFrame(animatePulse)
        }

        animatePulse()
    }, [pulse])

    // Calculate the size of the dot based on its distance to the mouse and pulse
    const calculateDotSize = (dotX, dotY) => {
        let pulseEffect = 0
        if (pulse) {
            const distanceToPulse = Math.sqrt(
                Math.pow(pulse.x - dotX, 2) + Math.pow(pulse.y - dotY, 2)
            )

            // Check if the dot is near the wave's perimeter
            if (
                distanceToPulse >= pulse.radius - waveThickness &&
                distanceToPulse <= pulse.radius + waveThickness
            ) {
                const fadeFactor = 1 - Math.abs(distanceToPulse - pulse.radius) / waveThickness
                pulseEffect = fadeFactor * pulse.intensity // Reduce effect as the wave fades
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

        const size =
            dotSize +
            pulseEffect * (maxDotSize - dotSize) +
            mouseEffect * (maxDotSize - dotSize) * 0.5 // Mouse influence is subtler

        return size
    }

    // Generate the dot grid
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
