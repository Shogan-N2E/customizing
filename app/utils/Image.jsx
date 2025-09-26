import { useRef, useState, useEffect } from "react";

// Function to normalize angle to -180 ~ 180 degrees
const normalizeAngle = (angle) => {
  while (angle > 180) angle -= 360;
  while (angle < -180) angle += 360;
  return angle;
};

// Individual image element component (rendered inside SVG)
export function ImageItem({
  id,
  x = 0,
  y = 0,
  src,
  width = 120,
  height = 120,
  rotation = 0,
  visible = true,
  onPositionChange,
  onSizeChange,
  onRotationChange,
  onDelete,
  onClick,
  isSelected = false,
  flipX = false,
  flipY = false,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [startRotation, setStartRotation] = useState(0);
  const [resizeHandle, setResizeHandle] = useState(null);

  const handleMouseDown = (e) => {
    e.stopPropagation();
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setStartPos({ x, y });
  };

  const handleResizeMouseDown = (e, handle) => {
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
    setStartPos({ x, y });
    setStartSize({ width, height });
  };

  const handleRotateMouseDown = (e) => {
    e.stopPropagation();
    
    setIsRotating(true);
    
  // Calculate rotation center
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    
  // Store mouse position converted to SVG coordinates
    const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    setDragStart({ x: mouseX, y: mouseY });
    setStartRotation(rotation);
  };

  const handleMouseMove = (e) => {
    if (isDragging && !isResizing && !isRotating) {
  // Move image
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      const newX = startPos.x + deltaX;
      const newY = startPos.y + deltaY;
      
      if (onPositionChange) {
        onPositionChange(id, newX, newY);
      }
    } else if (isResizing) {
  // Resize image
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      let newWidth = startSize.width;
      let newHeight = startSize.height;
      let newX = startPos.x;
      let newY = startPos.y;

      switch (resizeHandle) {
  case 'se': // bottom right
          newWidth = Math.max(20, startSize.width + deltaX);
          newHeight = Math.max(20, startSize.height + deltaY);
          break;
  case 'sw': // bottom left
          newWidth = Math.max(20, startSize.width - deltaX);
          newHeight = Math.max(20, startSize.height + deltaY);
          newX = startPos.x + (startSize.width - newWidth);
          break;
  case 'ne': // top right
          newWidth = Math.max(20, startSize.width + deltaX);
          newHeight = Math.max(20, startSize.height - deltaY);
          newY = startPos.y + (startSize.height - newHeight);
          break;
  case 'nw': // top left
          newWidth = Math.max(20, startSize.width - deltaX);
          newHeight = Math.max(20, startSize.height - deltaY);
          newX = startPos.x + (startSize.width - newWidth);
          newY = startPos.y + (startSize.height - newHeight);
          break;
      }

      if (onSizeChange) {
        onSizeChange(id, newWidth, newHeight, newX, newY);
      }
    } else if (isRotating) {
  // Image rotation - improved calculation for smooth rotation
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      
  // Current mouse position converted to SVG coordinates
      const svgElement = document.getElementById('design-svg');
      if (!svgElement) return;
      
      const rect = svgElement.getBoundingClientRect();
      const currentMouseX = e.clientX - rect.left;
      const currentMouseY = e.clientY - rect.top;
      
  // Calculate angle between current mouse position and center
      const currentAngle = Math.atan2(currentMouseY - centerY, currentMouseX - centerX) * 180 / Math.PI;
      const startAngle = Math.atan2(dragStart.y - centerY, dragStart.x - centerX) * 180 / Math.PI;
      
  // Calculate angle difference and normalize
      let angleDiff = normalizeAngle(currentAngle - startAngle);
      
  // Calculate new rotation value
      const newRotation = startRotation + angleDiff;
      
      if (onRotationChange) {
        onRotationChange(id, newRotation);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setResizeHandle(null);
  };

  useEffect(() => {
    if (isDragging || isResizing || isRotating) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, isRotating, dragStart, startPos, startSize, startRotation, resizeHandle]);

  if (!visible) return null;

  return (
    <g>
      <image
        href={src}
        x={x}
        y={y}
        width={width}
        height={height}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        transform={(() => {
          const cx = x + width / 2;
          const cy = y + height / 2;
            const sx = flipX ? -1 : 1;
            const sy = flipY ? -1 : 1;
          const rotatePart = `rotate(${rotation} ${cx} ${cy})`;
          if (sx === 1 && sy === 1) return rotatePart;
          const scalePart = `translate(${cx} ${cy}) scale(${sx} ${sy}) translate(${-cx} ${-cy})`;
          return `${rotatePart} ${scalePart}`;
        })()}
        onMouseDown={handleMouseDown}
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick(id);
        }}
      />
      
  {/* Show border and resize handles for selected image */}
      {isSelected && (
        <g onClick={(e) => e.stopPropagation()}>
          {/* Selection border - exactly same size as image */}
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill="none"
            stroke="#000000"
            strokeWidth="2"
            strokeDasharray="5,5"
            transform={`rotate(${rotation} ${x + width/2} ${y + height/2})`}
            style={{ pointerEvents: "none" }}
          />
          
          {/* Rotation handle - 20px above the top center of the image */}
          <g transform={`rotate(${rotation} ${x + width/2} ${y + height/2})`}>
            {/* Rotation handle connector line */}
            <line
              x1={x + width/2}
              y1={y - 4}
              x2={x + width/2}
              y2={y - 20}
              stroke="#000000"
              strokeWidth="2"
              style={{ pointerEvents: "none" }}
            />
            {/* Rotation handle (circle) */}
            <circle
              cx={x + width/2}
              cy={y - 20}
              r="6"
              fill="#000000"
              stroke="white"
              strokeWidth="2"
              style={{ cursor: "grab" }}
              onMouseDown={handleRotateMouseDown}
              onClick={(e) => e.stopPropagation()}
            />
          </g>

          {/* Resize handles - positioned exactly at the corners of the image */}
          <g transform={`rotate(${rotation} ${x + width/2} ${y + height/2})`}>
            {/* Top-left */}
            <rect
              x={x - 4}
              y={y - 4}
              width="8"
              height="8"
              fill="#000000"
              stroke="white"
              strokeWidth="2"
              style={{ cursor: "nw-resize" }}
              onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Top-right */}
            <rect
              x={x + width - 4}
              y={y - 4}
              width="8"
              height="8"
              fill="#000000"
              stroke="white"
              strokeWidth="2"
              style={{ cursor: "ne-resize" }}
              onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Bottom-left */}
            <rect
              x={x - 4}
              y={y + height - 4}
              width="8"
              height="8"
              fill="#000000"
              stroke="white"
              strokeWidth="2"
              style={{ cursor: "sw-resize" }}
              onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Bottom-right */}
            <rect
              x={x + width - 4}
              y={y + height - 4}
              width="8"
              height="8"
              fill="#000000"
              stroke="white"
              strokeWidth="2"
              style={{ cursor: "se-resize" }}
              onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
              onClick={(e) => e.stopPropagation()}
            />
          </g>
        </g>
      )}
    </g>
  );
}

// Image upload and management component
export default function ImageUploader({ onImageAdd }) {
  const fileInputRef = useRef(null);

  const handleImageButtonClick = () => {
  // Trigger hidden file input
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

  // Validate image file
    if (!file.type.startsWith('image/')) {
  alert('Only image files can be uploaded.');
      return;
    }

  // Convert file to DataURL
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataURL = event.target.result;
      
  // Create Image object to check image size
      const img = new Image();
      img.onload = () => {
  // Resize to appropriate size (max 200px)
        let newWidth = img.width;
        let newHeight = img.height;
        
        const maxSize = 200;
        if (newWidth > maxSize || newHeight > maxSize) {
          const ratio = Math.min(maxSize / newWidth, maxSize / newHeight);
          newWidth = newWidth * ratio;
          newHeight = newHeight * ratio;
        }

  // Pass new image data to parent component
        const newImage = {
          id: Date.now(), // Temporary ID (UUID recommended in production)
          src: dataURL,
          x: 50, // Default position
          y: 50,
          width: newWidth,
          height: newHeight,
          rotation: 0, // Default rotation
          visible: true,
        };

        if (onImageAdd) {
          onImageAdd(newImage);
        }
      };
      img.src = dataURL;
    };

    reader.readAsDataURL(file);
    
  // Reset file input (to allow re-selecting the same file)
    e.target.value = '';
  };

  return (
    <>
  {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      
  {/* Return image upload trigger function */}
  {/* Actual button is rendered by parent and calls this function */}
      <div style={{ display: 'none' }}>
  {/* This component only provides logic, UI is managed by parent */}
      </div>
    </>
  );
}

// Image upload hook (for simpler usage)
export function useImageUpload() {
  const fileInputRef = useRef(null);

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const createFileInput = (onImageAdd) => (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      style={{ display: 'none' }}
      onChange={(e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) {
          if (file) alert('이미지 파일만 업로드 가능합니다.');
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const dataURL = event.target.result;
          const img = new Image();
          img.onload = () => {
            let newWidth = img.width;
            let newHeight = img.height;
            
            const maxSize = 200;
            if (newWidth > maxSize || newHeight > maxSize) {
              const ratio = Math.min(maxSize / newWidth, maxSize / newHeight);
              newWidth = newWidth * ratio;
              newHeight = newHeight * ratio;
            }

            const newImage = {
              id: Date.now(),
              src: dataURL,
              x: 50,
              y: 50,
              width: newWidth,
              height: newHeight,
              rotation: 0,
              visible: true,
            };

            onImageAdd(newImage);
          };
          img.src = dataURL;
        };
        reader.readAsDataURL(file);
        e.target.value = '';
      }}
    />
  );

  return { triggerImageUpload, createFileInput };
}
