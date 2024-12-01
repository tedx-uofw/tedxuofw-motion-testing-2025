import React, { useState, useEffect, useRef, useCallback } from "react"
import throttle from "lodash/throttle"

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function DotGrid(props) {
    const {
        dotSize,
        dotColor,
        maxDotSize,
        distanceThreshold,
        dotSpacing,
        gridRows,
        gridColumns,
        smoothFactor,
        shape,
        enableLookAt,
    } = props

    const [mousePosition, setMousePosition] = useState({ x: -1, y: -1 })
    const containerRef = useRef(null)

    // Throttle the mouse move event handler to reduce state updates
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

    useEffect(() => {
        // Cleanup the throttle function on component unmount
        return () => {
            handleMouseMove.cancel()
        }
    }, [handleMouseMove])

    // Calculate the size of the dot based on its distance to the mouse cursor
    const calculateDotSize = (dotX, dotY) => {
        const distance = Math.sqrt(
            Math.pow(mousePosition.x - dotX, 2) +
                Math.pow(mousePosition.y - dotY, 2)
        )

        // Adjust the smoothing factor by multiplying the distance threshold
        const smoothFalloff = Math.exp(
            -distance / (distanceThreshold * smoothFactor)
        )
        const size = dotSize + (maxDotSize - dotSize) * smoothFalloff

        return size
    }

    // Calculate the angle between each dot and the mouse position
    const calculateRotationAngle = (dotX, dotY) => {
        const deltaX = mousePosition.x - dotX
        const deltaY = mousePosition.y - dotY
        const angle = Math.atan2(deltaY, deltaX) // Calculate angle in radians
        return angle * (180 / Math.PI) // Convert to degrees
    }

    // Generate the dot grid
    const dots = []
    for (let i = 0; i < gridRows; i++) {
        for (let j = 0; j < gridColumns; j++) {
            const dotX = j * (dotSize + dotSpacing)
            const dotY = i * (dotSize + dotSpacing)

            // Determine styles based on the selected shape
            let shapeStyle = {}
            let shapeElement = null

            // Calculate rotation angle only if look-at is enabled
            const rotationAngle = enableLookAt
                ? calculateRotationAngle(dotX, dotY)
                : 0

            if (shape === "circle") {
                shapeStyle = {
                    width: calculateDotSize(dotX, dotY),
                    height: calculateDotSize(dotX, dotY),
                    backgroundColor: dotColor,
                    borderRadius: "50%",
                }
            } else if (shape === "square") {
                shapeStyle = {
                    width: calculateDotSize(dotX, dotY),
                    height: calculateDotSize(dotX, dotY),
                    backgroundColor: dotColor,
                    borderRadius: "0%",
                }
            } else if (shape === "triangle") {
                const size = calculateDotSize(dotX, dotY)
... (57 lines left)
Collapse
Dot Grid.ts
6 KB
﻿
import React, { useState, useEffect, useRef, useCallback } from "react"
import throttle from "lodash.throttle"

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function DotGrid(props) {
    const {
        dotSize,
        dotColor,
        maxDotSize,
        distanceThreshold,
        dotSpacing,
        gridRows,
        gridColumns,
        smoothFactor,
        shape,
        enableLookAt,
    } = props

    const [mousePosition, setMousePosition] = useState({ x: -1, y: -1 })
    const containerRef = useRef(null)

    // Throttle the mouse move event handler to reduce state updates
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

    useEffect(() => {
        // Cleanup the throttle function on component unmount
        return () => {
            handleMouseMove.cancel()
        }
    }, [handleMouseMove])

    // Calculate the size of the dot based on its distance to the mouse cursor
    const calculateDotSize = (dotX, dotY) => {
        const distance = Math.sqrt(
            Math.pow(mousePosition.x - dotX, 2) +
                Math.pow(mousePosition.y - dotY, 2)
        )

        // Adjust the smoothing factor by multiplying the distance threshold
        const smoothFalloff = Math.exp(
            -distance / (distanceThreshold * smoothFactor)
        )
        const size = dotSize + (maxDotSize - dotSize) * smoothFalloff

        return size
    }

    // Calculate the angle between each dot and the mouse position
    const calculateRotationAngle = (dotX, dotY) => {
        const deltaX = mousePosition.x - dotX
        const deltaY = mousePosition.y - dotY
        const angle = Math.atan2(deltaY, deltaX) // Calculate angle in radians
        return angle * (180 / Math.PI) // Convert to degrees
    }

    // Generate the dot grid
    const dots = []
    for (let i = 0; i < gridRows; i++) {
        for (let j = 0; j < gridColumns; j++) {
            const dotX = j * (dotSize + dotSpacing)
            const dotY = i * (dotSize + dotSpacing)

            // Determine styles based on the selected shape
            let shapeStyle = {}
            let shapeElement = null

            // Calculate rotation angle only if look-at is enabled
            const rotationAngle = enableLookAt
                ? calculateRotationAngle(dotX, dotY)
                : 0

            if (shape === "circle") {
                shapeStyle = {
                    width: calculateDotSize(dotX, dotY),
                    height: calculateDotSize(dotX, dotY),
                    backgroundColor: dotColor,
                    borderRadius: "50%",
                }
            } else if (shape === "square") {
                shapeStyle = {
                    width: calculateDotSize(dotX, dotY),
                    height: calculateDotSize(dotX, dotY),
                    backgroundColor: dotColor,
                    borderRadius: "0%",
                }
            } else if (shape === "triangle") {
                const size = calculateDotSize(dotX, dotY)
                shapeStyle = {
                    width: "0",
                    height: "0",
                    borderLeft: `${size / 2}px solid transparent`,
                    borderRight: `${size / 2}px solid transparent`,
                    borderBottom: `${size}px solid ${dotColor}`,
                    backgroundColor: "transparent",
                }
            }
            // Rectangle shape handling
            else if (shape === "rectangle") {
                const size = calculateDotSize(dotX, dotY)
                shapeStyle = {
                    width: size * 1.5, // Rectangle is 1.5 times wider than its height
                    height: size,
                    backgroundColor: dotColor,
                    borderRadius: "0%",
                }
            }

            dots.push(
                <div
                    key={`${i}-${j}`}
                    style={{
                        position: "absolute",
                        left: dotX,
                        top: dotY,
                        transform: `translate(-50%, -50%) rotate(${rotationAngle}deg)`,
                        transformOrigin: "center",
                        ...shapeStyle,
                    }}
                >
                    {shapeElement}
                </div>
            )
        }
    }

    return (
        <div
            ref={containerRef}
            style={{
                position: "relative",
                width: gridColumns * (dotSize + dotSpacing),
                height: gridRows * (dotSize + dotSpacing),
                overflow: "hidden", // Added overflow hidden here
                ...props.style,
            }}
            onMouseMove={handleMouseMove}
        >
            {dots}
        </div>
    )
}