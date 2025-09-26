import React, { useRef, useEffect, useState } from "react";

import DesignArea from "./DesignArea";

export default function Canvas() {
  let tempCoords = { x: 100, y: 100, width: 200, height: 200 };
  let coords = tempCoords;

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [initialTexts, setInitialTexts] = useState([
    {
      id: 1,
      x: 150,
      y: 150,
      text: "hello world",
      isEditing: false,
      visible: true,
      rotation: 0,
      textAlign: "left",
      color: "#000000",
      isCurved: false,
      curveType: "Arch Up",
      curveIntensity: 0,
      zIndex: 0, // Default z-index for text
    },
  ]);

  const designAreaRef = useRef();

  const handleExportPDF = async () => {
    if (!designAreaRef.current?.getSVG) return;

    const svgElement = designAreaRef.current.getSVG();
    if (!svgElement) {
      console.error("SVG el not found");
      return;
    }

    // Serialise SVG to string
    const svgString = new XMLSerializer().serializeToString(svgElement);

    try {
      const response = await fetch("/api/svg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ svg: svgString }),
      });

      const data = await response.json();
      if (data.success) {
        alert("PDF created. URL: " + data.url);
        // Save URL to cart line property
      } else {
        alert("Failed to create PDF");
      }
    } catch (err) {
      console.error("Error exporting PDF:", err);
    }
  };

  // Update canvas size on mount and resize
  useEffect(() => {
    const updateSize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Center design area inside canvas
  const centeredCoords = {
    width: coords.width,
    height: coords.height,
    x: (canvasSize.width - coords.width) / 2,
    y: (canvasSize.height - coords.height) / 2,
  };

  const handleAddText = () => {
    if (designAreaRef.current?.addText) {
      const newText = designAreaRef.current.addText();
      setInitialTexts((prev) => {
        const updatedInitialTexts = [...prev, { ...newText }];
        console.log("Updated initialTexts after adding new text:", updatedInitialTexts);
        return updatedInitialTexts;
      });
    }
  };

  return (
    <div
      style={{
        overflow: "hidden",
        backgroundColor: "gray",

        width: "100vw",
        height: "100vh",
      }}
    >
      <DesignArea
        ref={designAreaRef}
        coords={centeredCoords}
        initialTexts={initialTexts}
      />
      <button onClick={handleAddText}>Add Text</button>
      <button onClick={handleExportPDF}>Export PDF</button>
    </div>
  );
}