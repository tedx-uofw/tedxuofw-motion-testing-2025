import React, { useEffect, useState } from "react";
import dotData from "../data/circle_diameters_compressed.dat";

// Helper functions to decompress data in JavaScript
function base64ToUint8Array(base64) {
    try {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    } catch (error) {
        throw new Error("Invalid base64 string provided.");
    }
}

function decompressBZ2(data) {
    const bz2 = require("bz2");
    return bz2.decompress(data);
}

function decompressZlib(data) {
    const pako = require("pako");
    return pako.inflate(data);
}

function binaryToFrames(binaryData, gridSize = 55) {
    const frames = [];
    const frameSize = gridSize * gridSize * 2; // Each value is 16-bit (2 bytes)

    let index = 0;
    while (index < binaryData.length) {
        const frame = [];
        for (let i = 0; i < gridSize; i++) {
            const row = [];
            for (let j = 0; j < gridSize; j++) {
                // Extract 16-bit float (half-precision)
                const value = new DataView(binaryData.buffer, index, 2).getFloat16(0, true);
                row.push(value);
                index += 2;
            }
            frame.push(row);
        }
        frames.push(frame);
    }

    return frames;
}

export default function DotData({ onFramesReady }) {
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Verify if `dotData` is valid base64
                if (typeof dotData !== "string") {
                    throw new Error("dotData is not a valid base64 string.");
                }

                // Decode and decompress data
                const compressedBZ2 = base64ToUint8Array(dotData);
                const compressedZlib = decompressBZ2(compressedBZ2);
                const binaryData = decompressZlib(compressedZlib);

                // Convert binary data into frames
                const frames = binaryToFrames(new Uint8Array(binaryData));

                // Notify parent component or handle frames here
                onFramesReady(frames);
            } catch (err) {
                console.error("Error decompressing data:", err);
                setError(err.message);
            }
        };

        fetchData();
    }, [onFramesReady]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return null; // No UI is rendered here
}
