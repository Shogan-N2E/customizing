import React, { useState, useRef, useEffect } from "react";

export default function TextItem({
  svgRef,
  id,
  x: initialX,
  y: initialY,
  initialText = "",
  font = "Roboto",
  fontSize = 18,
  isBold = false,
  isItalic = false,
  isUnderline = false,
  isStrikethrough = false,
  rotation = 0,
  textAlign = "left",
  color = "#000000",
  isCurved = false,
  curveType = "Arch Up",
  curveIntensity = 0,
  isSelected = false,
  isEditing = false,
  onChange,
  onEditComplete,
  onPositionChange,
  onSelect,
  onFontSizeChange,
  onRotationChange,
  flipX = false,
  flipY = false,
}) {
  const [text, setText] = useState(initialText);
  const [editing, setEditing] = useState(isEditing);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState(isSelected);
  const [mouseDownPos, setMouseDownPos] = useState(null);
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [currentFontSize, setCurrentFontSize] = useState(fontSize);
  const [currentRotation, setCurrentRotation] = useState(rotation);
  
  // Control handle states
  const [isRotating, setIsRotating] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startRotation, setStartRotation] = useState(0);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [startBounds, setStartBounds] = useState({ width: 0, height: 0 });
      // TextItem state logging removed
  // Refs
  const offsetRef = useRef({ x: 0, y: 0 });
  const inputRef = useRef(null);
  const textRef = useRef(null);
  const [bbox, setBBox] = useState({ width: 0, height: 0 });

  // Deselect text when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Check if click is on sidebar or any control elements
      if (textRef.current && !textRef.current.contains(e.target)) {
        // Don't deselect if clicking on sidebar, buttons, inputs, or interactive elements
        const clickedElement = e.target.closest('.text-style-sidebar, button, input, select, textarea, [role="button"], .font-dropdown-container, .color-picker-container');
        const isInteractiveElement = e.target.tagName === 'BUTTON' || 
                                   e.target.tagName === 'INPUT' || 
                                   e.target.tagName === 'SELECT' || 
                                   e.target.tagName === 'TEXTAREA' ||
                                   e.target.closest('button') ||
                                   e.target.closest('.text-style-sidebar');
        
        if (!clickedElement && !isInteractiveElement) {
          setSelected(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get new bounding box on text change
  useEffect(() => {
    if (textRef.current) {
      // Add a small delay to ensure rendering is complete
      setTimeout(() => {
        try {
          const box = textRef.current.getBBox();
          setBBox(box);
        } catch (e) {
          // Fallback calculation for multi-line text if getBBox fails
          const lines = text.split('\n');
          const nonEmptyLines = lines.filter(line => line.trim() !== '');
          
          if (nonEmptyLines.length === 0) {
            setBBox({ width: currentFontSize * 5, height: currentFontSize });
            return;
          }
          
          // More accurate width calculation based on character counting
          const longestLine = lines.reduce((longest, current) => 
            current.length > longest.length ? current : longest, '');
          
          // Improved width calculation - more accurate character width estimation
          const avgCharWidth = currentFontSize * 0.7; // More realistic character width
          const calculatedWidth = Math.max(longestLine.length * avgCharWidth, currentFontSize * 2);
          
          // Height calculation with proper line spacing (1.2 is standard line height)
          const lineHeight = currentFontSize * 1.2;
          const calculatedHeight = lines.length * lineHeight;
          
          setBBox({ width: calculatedWidth, height: calculatedHeight });
        }
      }, 10);
    }
  }, [text, font, editing, currentFontSize]);

  // Focus input when editing starts
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      // Move cursor to end
      const textLength = inputRef.current.value.length;
      inputRef.current.setSelectionRange(textLength, textLength);
    }
  }, [editing]);

  // Sync internal text if initialText changes externally
  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  // Sync position if changed externally
  useEffect(() => {
    setPosition({ x: initialX, y: initialY });
  }, [initialX, initialY]);

  // Sync selected state
  useEffect(() => {
    setSelected(isSelected);
  }, [isSelected]);

  // Sync font size if changed externally
  useEffect(() => {
    setCurrentFontSize(fontSize);
  }, [fontSize]);

  // Sync rotation if changed externally
  useEffect(() => {
    setCurrentRotation(rotation);
  }, [rotation]);

  const handleChange = (e) => {
    setText(e.target.value);
    if (onChange) onChange(e.target.value);
    
    // Immediately update the bbox when the text changes
    setTimeout(() => {
      if (textRef.current) {
        try {
          const box = textRef.current.getBBox();
          setBBox(box);
        } catch (error) {
          // Fallback calculation - improved version
          const lines = e.target.value.split('\n');
          const nonEmptyLines = lines.filter(line => line.trim() !== '');
          
          if (nonEmptyLines.length === 0) {
            setBBox({ width: currentFontSize * 5, height: currentFontSize });
            return;
          }
          
          const longestLine = lines.reduce((longest, current) => 
            current.length > longest.length ? current : longest, '');
          
          // Improved calculations
          const avgCharWidth = currentFontSize * 0.7;
          const calculatedWidth = Math.max(longestLine.length * avgCharWidth, currentFontSize * 2);
          const lineHeight = currentFontSize * 1.2;
          const calculatedHeight = lines.length * lineHeight;
          
          setBBox({ width: calculatedWidth, height: calculatedHeight });
        }
      }
    }, 10);
  };

  // Font size change handler
  const handleFontSizeChange = (newSize) => {
  const size = Math.max(8, Math.min(72, newSize)); // 8~72px
    setCurrentFontSize(size);
    if (onFontSizeChange) onFontSizeChange(size);
  };

  // Rotation handle mouse down
  const handleRotateMouseDown = (e) => {
    e.stopPropagation();
    setIsRotating(true);

  // Calculate mouse position in SVG coordinates
    if (svgRef.current) {
      const pt = svgRef.current.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgPoint = pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
      setDragStart({ x: svgPoint.x, y: svgPoint.y });
    } else {
      setDragStart({ x: e.clientX, y: e.clientY });
    }
    
    setStartRotation(currentRotation);
  };

  // Resize handle mouse down
  const handleResizeMouseDown = (e, handle) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);

  // Calculate mouse position in SVG coordinates
    if (svgRef.current) {
      const pt = svgRef.current.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgPoint = pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
      setDragStart({ x: svgPoint.x, y: svgPoint.y });
    } else {
      setDragStart({ x: e.clientX, y: e.clientY });
    }
    
  // Save the current font size as the starting point
    setStartBounds({ width: bbox.width, height: bbox.height, fontSize: currentFontSize });
  };

  const handleMouseDown = (e) => {
  if (editing) return; // disable drag while editing
  if (!svgRef.current) return;

  // Record only the mouse down position and do not start dragging immediately
    setMouseDownPos({ x: e.clientX, y: e.clientY });
    
  // Get the mouse position in SVG coords for offset calculation
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursorPoint = pt.matrixTransform(svgRef.current.getScreenCTM().inverse());

  // Calculate the offset between the cursor and the TextItem's center
    offsetRef.current = {
      x: cursorPoint.x - position.x,
      y: cursorPoint.y - position.y,
    };

    setSelected(true);
    if (onSelect) onSelect(id);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    // Rotation handling - calculate angle based on center point
    if (isRotating) {
      const centerX = position.x;
      const centerY = position.y;

      // Convert current mouse position to SVG coordinates
      let currentX, currentY;
      if (svgRef.current) {
        const pt = svgRef.current.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgPoint = pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
        currentX = svgPoint.x;
        currentY = svgPoint.y;
      } else {
        currentX = e.clientX;
        currentY = e.clientY;
      }

      // Calculate angle between start point and current point
      const startAngle = Math.atan2(dragStart.y - centerY, dragStart.x - centerX);
      const currentAngle = Math.atan2(currentY - centerY, currentX - centerX);

      // Calculate angle difference and convert to degrees
      const angleDiff = (currentAngle - startAngle) * (180 / Math.PI);
      const newRotation = startRotation + angleDiff;
      
      setCurrentRotation(newRotation);
      if (onRotationChange) onRotationChange(newRotation);
      return;
    }

    // Resize handling
    if (isResizing) {
      // Convert current mouse position to SVG coordinates
      let currentX, currentY;
      if (svgRef.current) {
        const pt = svgRef.current.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgPoint = pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
        currentX = svgPoint.x;
        currentY = svgPoint.y;
      } else {
        currentX = e.clientX;
        currentY = e.clientY;
      }

      const dx = currentX - dragStart.x;
      const dy = currentY - dragStart.y;

      // Calculate the font size based on the resize handle
      let scaleFactor = 1;
      if (resizeHandle === 'se' || resizeHandle === 'nw') {
        // Diagonal handle: calculate scale based on diagonal distance
        scaleFactor = 1 + (dx + dy) * 0.01;
      } else if (resizeHandle === 'ne' || resizeHandle === 'sw') {
        // Opposite diagonal handle
        scaleFactor = 1 + (dx - dy) * 0.01;
      }

      // Calculate new font size based on starting font size (clamped between 8px and 72px)
      const startFontSize = startBounds.fontSize || currentFontSize;
      const newFontSize = Math.max(8, Math.min(72, startFontSize * scaleFactor));
      
      // Update only if the value has changed (rounded to 0.5px increments)
      const roundedSize = Math.round(newFontSize * 2) / 2; // Round to the nearest 0.5 unit
      if (Math.abs(roundedSize - currentFontSize) > 0.1) {
        setCurrentFontSize(roundedSize);
        if (onFontSizeChange) {
          onFontSizeChange(roundedSize);
        }
      }
      return;
    }

    // Existing drag handling
    if (!mouseDownPos) return;
    
  // Start dragging only after moving a certain distance
    const dx = e.clientX - mouseDownPos.x;
    const dy = e.clientY - mouseDownPos.y;
    if (!dragging && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
      setDragging(true);
    }
    
    if (!dragging || !svgRef.current) return;

  // Calculate new position of text
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursorPoint = pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
    const newX = cursorPoint.x - offsetRef.current.x;
    const newY = cursorPoint.y - offsetRef.current.y;
    setPosition({ x: newX, y: newY });
    if (onPositionChange) onPositionChange({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
  setDragging(false);
  setMouseDownPos(null);
  setIsRotating(false);
  setIsResizing(false);
  setResizeHandle(null);
  };

  // Editing handlers
  const handleDoubleClick = () => {
    setEditing(true);
  };

  const finishEditing = () => {
    setEditing(false);
    if (onEditComplete) onEditComplete();
  };

  const handleBlur = () => {
    finishEditing();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // Finish editing with Ctrl+Enter or plain Enter
      e.preventDefault();
      finishEditing();
    }
  // Treat Shift+Enter as a line break (default behavior)
  };

  // Global listeners for smooth dragging
  useEffect(() => {
    if (mouseDownPos || isRotating || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [mouseDownPos, dragging, isRotating, isResizing]);

  // Calculate text x position based on alignment within the bounding box
  const getTextX = (align) => {
    if (!bbox || bbox.width === 0) return position.x;
    
    switch (align) {
      case 'left':
        return position.x - bbox.width / 2; // Left edge of the text bounds
      case 'center':
        return position.x; // Center of the text bounds
      case 'right':
        return position.x + bbox.width / 2; // Right edge of the text bounds
      default:
        return position.x;
    }
  };

  // Calculate the actual visual position of the text based on alignment
  const getActualTextPosition = (align) => {
    // SVG textAnchor handles alignment at the same x position
    // So the visual position is always the same regardless of alignment
    return { 
      x: position.x, 
      width: bbox.width 
    };
  };

  // Calculate edit box x position based on alignment
  const getEditBoxX = (align) => {
    // Edit box should always be centered to match the selection box
    // regardless of text alignment - alignment is handled by textarea textAlign
    return position.x - bbox.width / 2 - 4;
  };

  // Convert textAlign to SVG textAnchor
  const getTextAnchor = (align) => {
    switch (align) {
      case 'left': return 'start';
      case 'center': return 'middle';
      case 'right': return 'end';
      case 'justify': return 'start';
      default: return 'middle';
    }
  };

  // Create curved text path using SVG standards
  const createCurvedTextPath = (textContent, curveType, intensity) => {
    if (!textContent || !isCurved || intensity === 0) return null;
    
    // Convert multiline text to single line for curve
    const singleLineText = textContent.replace(/\n/g, ' ');
    const textWidth = bbox.width || (singleLineText.length * currentFontSize * 0.7);
    
    // intensity: -100 to 100
    // 0 = straight line (handled above)
    // positive = curve down (arch down)
    // negative = curve up (arch up)
    // ±100 = complete circle
    
    let pathData;
    const centerX = position.x;
    const centerY = position.y;
    
    if (Math.abs(intensity) === 100) {
  // Complete circle for ±100 intensity (like Printify)
  // Calculate radius based on text length for proper circle size
      const textLength = singleLineText.length;
      const charWidth = currentFontSize * 0.6; // Approximate character width
      const totalTextWidth = Math.max(textLength * charWidth, 1);
      
  // Calculate circumference we want the text to occupy. Use spacingFactor to add breathing room.
      const spacingFactor = 1.3;
      const minCircumference = 2 * Math.PI * 10; // minimum circumference (radius 10px)
      const circumference = Math.max(totalTextWidth * spacingFactor, minCircumference);

  // Calculate radius to fit text around circle
      const radius = Math.max(circumference / (2 * Math.PI), 10); // minimum radius 10px
      
  // Create a complete circle using two semicircle arcs
  // Start from left side for better text distribution
      if (intensity > 0) {
  // Clockwise circle (positive intensity)
        pathData = `M ${centerX - radius} ${centerY}
                    A ${radius} ${radius} 0 1 1 ${centerX + radius} ${centerY}
                    A ${radius} ${radius} 0 1 1 ${centerX - radius} ${centerY}`;
      } else {
  // Counter-clockwise circle (negative intensity)
        pathData = `M ${centerX - radius} ${centerY}
                    A ${radius} ${radius} 0 1 0 ${centerX + radius} ${centerY}
                    A ${radius} ${radius} 0 1 0 ${centerX - radius} ${centerY}`;
      }

  // Return circumference so the renderer can set textLength on <textPath>
      return { pathData, textContent: singleLineText, circumference };
    } else {
  // Partial curves using quadratic Bezier curves
      const startX = centerX - textWidth / 2;
      const endX = centerX + textWidth / 2;
      const startY = centerY;
      const endY = centerY;
      
  // Calculate curve height based on intensity
      const maxCurveHeight = textWidth * 0.6; // Reasonable curve height
      const curveHeight = (Math.abs(intensity) / 100) * maxCurveHeight;
      
  // Control point for the curve
      const controlX = centerX;
      let controlY;
      
      if (intensity > 0) {
  // Positive intensity: curve down (arch down)
        controlY = centerY + curveHeight;
      } else {
  // Negative intensity: curve up (arch up)
        controlY = centerY - curveHeight;
      }
      
  // Quadratic Bezier curve: M start Q control end
      pathData = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
    }
    
    return { pathData, textContent: singleLineText };
  };

  // Debugging: state logging removed to reduce console noise
  useEffect(() => {
    // Intentionally left blank
  }, [selected, position, bbox]);

  return (
    <>
      {!editing && (
        <g transform={(() => {
          const sx = flipX ? -1 : 1;
          const sy = flipY ? -1 : 1;
          const rotatePart = `rotate(${currentRotation} ${position.x} ${position.y})`;
          if (sx === 1 && sy === 1) return rotatePart;
          const scalePart = `translate(${position.x} ${position.y}) scale(${sx} ${sy}) translate(${-position.x} ${-position.y})`;
          return `${rotatePart} ${scalePart}`;
        })()}>
          {!isCurved ? (
            // Regular text rendering
            <text
              ref={textRef}
              x={getTextX(textAlign)}
              y={position.y}
              cursor="move"
              onDoubleClick={handleDoubleClick}
              onMouseDown={handleMouseDown}
              fontFamily={`"${font}", serif`}
              fontSize={`${currentFontSize}px`}
              fontWeight={isBold ? "bold" : "normal"}
              fontStyle={isItalic ? "italic" : "normal"}
              textDecoration={`${isUnderline ? "underline" : ""} ${isStrikethrough ? "line-through" : ""}`.trim() || "none"}
              fill={color}
              style={{
                userSelect: "none",
                padding: "0px",
                margin: "0px"
              }}
              dominantBaseline="middle"
              textAnchor={getTextAnchor(textAlign)}
            >
              {text.split('\n').map((line, index) => {
                const lineHeight = currentFontSize * 1.2;
                const totalLines = text.split('\n').length;
                const offsetY = (index - (totalLines - 1) / 2) * lineHeight;
                
                return (
                  <tspan
                    key={index}
                    x={getTextX(textAlign)}
                    y={position.y + offsetY}
                  >
                    {line || '\u00A0'}
                  </tspan>
                );
              }) || <tspan>Click to edit</tspan>}
            </text>
          ) : (
            // Curved text rendering using SVG standards
            (() => {
              const curvedPath = createCurvedTextPath(text, curveType, curveIntensity);
              if (!curvedPath) {
                // Fallback: if no curved path (empty text or intensity === 0), render regular text
                return (
                  <text
                    ref={textRef}
                    x={getTextX(textAlign)}
                    y={position.y}
                    cursor="move"
                    onDoubleClick={handleDoubleClick}
                    onMouseDown={handleMouseDown}
                    fontFamily={`"${font}", serif`}
                    fontSize={`${currentFontSize}px`}
                    fontWeight={isBold ? "bold" : "normal"}
                    fontStyle={isItalic ? "italic" : "normal"}
                    textDecoration={`${isUnderline ? "underline" : ""} ${isStrikethrough ? "line-through" : ""}`.trim() || "none"}
                    fill={color}
                    style={{
                      userSelect: "none",
                      padding: "0px",
                      margin: "0px"
                    }}
                    dominantBaseline="middle"
                    textAnchor={getTextAnchor(textAlign)}
                  >
                    {text.split('\n').map((line, index) => {
                      const lineHeight = currentFontSize * 1.2;
                      const totalLines = text.split('\n').length;
                      const offsetY = (index - (totalLines - 1) / 2) * lineHeight;

                      return (
                        <tspan
                          key={index}
                          x={getTextX(textAlign)}
                          y={position.y + offsetY}
                        >
                          {line || '\u00A0'}
                        </tspan>
                      );
                    }) || <tspan>Click to edit</tspan>}
                  </text>
                );
              }

              return (
                <g>
                  {/* Define the path in defs for reusability */}
                  <defs>
                    <path
                      id={`curve-path-${id}`}
                      d={curvedPath.pathData}
                      fill="transparent"
                      stroke="transparent"
                    />
                  </defs>
                  
                  {/* Text following the path */}
                  <text
                    ref={textRef}
                    cursor="move"
                    onDoubleClick={handleDoubleClick}
                    onMouseDown={handleMouseDown}
                    fontFamily={`"${font}", serif`}
                    fontSize={`${currentFontSize}px`}
                    fontWeight={isBold ? "bold" : "normal"}
                    fontStyle={isItalic ? "italic" : "normal"}
                    textDecoration={`${isUnderline ? "underline" : ""} ${isStrikethrough ? "line-through" : ""}`.trim() || "none"}
                    fill={color}
                    style={{
                      userSelect: "none",
                      padding: "0px",
                      margin: "0px"
                    }}
                  >
                    <textPath 
                      href={`#curve-path-${id}`} 
                      xlinkHref={`#curve-path-${id}`}
                      startOffset="50%"
                      textAnchor="middle"
                      textLength={curvedPath.circumference || undefined}
                      lengthAdjust={curvedPath.circumference ? "spacingAndGlyphs" : undefined}
                    >
                      {curvedPath.textContent || 'Click to edit'}
                    </textPath>
                  </text>
                  
                  {/* Optional: Show path for debugging (remove in production) */}
                  {/* <path 
                    d={curvedPath.pathData} 
                    fill="none" 
                    stroke="rgba(255,0,0,0.3)" 
                    strokeWidth="1"
                    style={{ pointerEvents: "none" }}
                  /> */}
                </g>
              );
            })()
          )}
        </g>
      )}

      {editing && (
        <>
          {/* Invisible text for measurement */}
          <text
            ref={textRef}
            x={getTextX(textAlign)}
            y={position.y}
            fontFamily={`"${font}", sans-serif`}
            fontSize={`${currentFontSize}px`}
            fontWeight={isBold ? "bold" : "normal"}
            fontStyle={isItalic ? "italic" : "normal"}
            textDecoration={`${isUnderline ? "underline" : ""} ${isStrikethrough ? "line-through" : ""}`.trim() || "none"}
            dominantBaseline="middle"
            textAnchor={getTextAnchor(textAlign)}
            visibility="hidden"
          >
            {text.split('\n').map((line, index) => {
              const lineHeight = currentFontSize * 1.2;
              const totalLines = text.split('\n').length;
              const offsetY = (index - (totalLines - 1) / 2) * lineHeight;
              
              return (
                <tspan
                  key={index}
                  x={getTextX(textAlign)}
                  y={position.y + offsetY}
                >
                  {line || '\u00A0'}
                </tspan>
              );
            }) || <tspan> </tspan>}
          </text>

          <foreignObject
            x={getEditBoxX(textAlign)}
            y={position.y - bbox.height / 2 - 4}
            width={bbox.width + 8}
            height={bbox.height + 8}
          >
            <textarea
              ref={inputRef}
              value={text}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              style={{
                width: "100%",
                height: "100%",
                boxSizing: "border-box",
                fontFamily: `"${font}", sans-serif`,
                fontSize: `${currentFontSize}px`,
                fontWeight: isBold ? "bold" : "normal",
                fontStyle: isItalic ? "italic" : "normal",
                textDecoration: `${isUnderline ? "underline" : ""} ${isStrikethrough ? "line-through" : ""}`.trim() || "none",
                padding: "0px",
                margin: "0px",
                border: "1px solid #ccc",
                outline: "none",
                resize: "none",
                overflow: "hidden",
                textAlign: textAlign,
                lineHeight: "1.2",
                background: "white",
                color: color,
                verticalAlign: "top"
              }}
            />
          </foreignObject>
        </>
      )}
      
      {selected && bbox && !editing && (
        <g onClick={(e) => e.stopPropagation()}>
          {/* Selection border - match actual text position */}
          <rect
            x={position.x - bbox.width / 2}
            y={position.y - bbox.height / 2}
            width={bbox.width}
            height={bbox.height}
            fill="none"
            stroke="#f87171"
            strokeWidth="2"
            strokeDasharray="5,5"
            transform={`rotate(${currentRotation} ${position.x} ${position.y})`}
            style={{ pointerEvents: "none" }}
          />

          {/* Control handles container */}
          <g transform={`rotate(${currentRotation} ${position.x} ${position.y})`}>
            {/* Rotation handle - above the text */}
            <line
              x1={position.x}
              y1={position.y - bbox.height / 2 - 4}
              x2={position.x}
              y2={position.y - bbox.height / 2 - 20}
              stroke="#f87171"
              strokeWidth="2"
              style={{ pointerEvents: "none" }}
            />
            <circle
              cx={position.x}
              cy={position.y - bbox.height / 2 - 20}
              r="6"
              fill="#f87171"
              stroke="white"
              strokeWidth="2"
              style={{ cursor: "grab" }}
              onMouseDown={handleRotateMouseDown}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Corner handles for resizing */}
            {(() => {
              const textLeft = position.x - bbox.width / 2;
              const textRight = position.x + bbox.width / 2;
              const textTop = position.y - bbox.height / 2;
              const textBottom = position.y + bbox.height / 2;
              
              return (
                <>
                  {/* Top-left */}
                  <rect
                    x={textLeft - 4}
                    y={textTop - 4}
                    width="8"
                    height="8"
                    fill="#f87171"
                    stroke="white"
                    strokeWidth="2"
                    style={{ cursor: "nw-resize" }}
                    onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {/* Top-right */}
                  <rect
                    x={textRight - 4}
                    y={textTop - 4}
                    width="8"
                    height="8"
                    fill="#f87171"
                    stroke="white"
                    strokeWidth="2"
                    style={{ cursor: "ne-resize" }}
                    onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {/* Bottom-left */}
                  <rect
                    x={textLeft - 4}
                    y={textBottom - 4}
                    width="8"
                    height="8"
                    fill="#f87171"
                    stroke="white"
                    strokeWidth="2"
                    style={{ cursor: "sw-resize" }}
                    onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {/* Bottom-right */}
                  <rect
                    x={textRight - 4}
                    y={textBottom - 4}
                    width="8"
                    height="8"
                    fill="#f87171"
                    stroke="white"
                    strokeWidth="2"
                    style={{ cursor: "se-resize" }}
                    onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
                    onClick={(e) => e.stopPropagation()}
                  />
                </>
              );
            })()}
          </g>
        </g>
      )}
    </>
  );
}