import { useRef, useState } from "react";

export default function SelectionToolAdmin() {
  const imgRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [box, setBox] = useState(null); // { x, y, width, height }

  const handleMouseDown = (e) => {
    const rect = imgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStart({ x, y });
    setBox(null);
    setIsDragging(true);
  }

  const handleMouseMove = (e) => {
    if (!isDragging || !imgRef.current) return;

    const rect = imgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newBox = {
      x: Math.min(start.x, x),
      y: Math.min(start.y, y),
      width: Math.abs(start.x - x),
      height: Math.abs(start.y - y),
    };

    setBox(newBox);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <img
        ref={imgRef}
        src="/tshirt.jpg"
        style={{ width: 600, height: "auto", display: "block", userSelect: "none" }}
        draggable={false}
      />
      {box && (
        <div
          style={{
            position: "absolute",
            left: box.x,
            top: box.y,
            width: box.width,
            height: box.height,
            border: "2px dashed blue",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}

