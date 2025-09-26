import React, { forwardRef, useState, useImperativeHandle, useEffect } from "react";
import TextItem from "./TextItem";
import { ImageItem } from "./Image";

const DesignArea = forwardRef(({ coords, onTextsChange, onImagesChange, onSelectionChange, onTextsChangeComplete, onImagesChangeComplete }, ref) => {
  const { x, y, width, height } = coords;

  const [texts, setTexts] = useState([
    { 
      id: '1', 
      x: 150, 
      y: 150, 
      text: "hello world", 
      isEditing: false, 
      visible: true, 
      rotation: 0,
      fontSize: 18,
      font: 'Roboto',
      isBold: false,
      isItalic: false,
      isUnderline: false,
      isStrikethrough: false,
      textAlign: 'left', 
      color: '#000000',
      flipX: false,
      flipY: false,
      isCurved: false,
      curveType: 'Arch Up',
      curveIntensity: 0,
      zIndex: 0 // Default z-index for text
    },
  ]);

  const [images, setImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [selectedTextId, setSelectedTextId] = useState(null);

  // Notify parent when texts change
  useEffect(() => {
    if (onTextsChange) {
      onTextsChange(texts);
    }
  }, [texts]);

  // Notify parent when images change
  useEffect(() => {
    if (onImagesChange) {
      onImagesChange(images);
    }
  }, [images, onImagesChange]);

  const updateText = (id, newText) => {
    setTexts((items) => {
      const next = items.map((item) =>
        item.id === id ? { ...item, text: newText } : item
      );
      return next;
    });
  };

  const updatePosition = (id, pos) => {
    setTexts((items) => {
      const next = items.map((item) =>
        item.id === id ? { ...item, x: pos.x, y: pos.y } : item
      );
      return next;
    });
  };

  const updateTextStyle = (id, style) => {
    setTexts((items) => {
      const next = items.map((item) =>
        item.id === id ? { ...item, ...style } : item
      );
      return next;
    });
  };

  const updateTextRotation = (id, rotation) => {
    setTexts((items) => {
      const next = items.map((item) =>
        item.id === id ? { ...item, rotation } : item
      );
      return next;
    });
  };

  const finishEditing = (id) => {
    setTexts((items) => {
      const next = items.map((item) =>
        item.id === id ? { ...item, isEditing: false } : item
      );
      return next;
    });
  };

  const handleTextClick = () => {
  // Deselect image when text is clicked
    setSelectedImageId(null);
  };

  const handleSpecificTextClick = (textId) => {
  // Select specific text
    setSelectedTextId(textId);
    setSelectedImageId(null);
    
  // Notify parent of selection state
    if (onSelectionChange) {
      onSelectionChange({ type: 'text', id: textId });
    }
  };

  const addText = () => {
    const newText = {
      id: String(Date.now()),  // unique id as string
      x: 200,  // default position
      y: 200,
      text: "This is a new text item",
      isEditing: true, // starts in edit mode
      visible: true, // visible by default
      rotation: 0, // default rotation
      fontSize: 18,
      font: 'Roboto',
      isBold: false,
      isItalic: false,
      isUnderline: false,
      isStrikethrough: false,
      textAlign: 'left', // default alignment
      color: '#000000', // Default to black
      flipX: false,
      flipY: false,
      isCurved: false, // Default is not curved
      curveType: 'Arch Up', // Default curve type
      curveIntensity: 0, // Default curve intensity
      zIndex: 0 // Default z-index for text
    };

    // Update internal state and notify parent callbacks so parent can update initialTexts/snapshots
    setTexts((prev) => {
      const next = [...prev, newText];
      try {
        if (onTextsChange) onTextsChange(next);
        if (onTextsChangeComplete) onTextsChangeComplete(next);
      } catch (e) {
        console.warn('Failed to call text change callbacks', e);
      }
      return next;
    });

    console.log("New text added:", newText);
    return { ...newText }; // Ensure a complete initial state is returned
  };

  const addTextWithData = (textData) => {
    const newText = {
      id: String(textData.id || Date.now()),
      x: textData.x || 200,
      y: textData.y || 200,
      text: textData.text || "",
      isEditing: textData.isEditing || false,
      visible: textData.visible !== undefined ? textData.visible : true,
      rotation: textData.rotation || 0,
      fontSize: textData.fontSize || 18,
      font: textData.font || 'Roboto',
      isBold: textData.isBold || false,
      isItalic: textData.isItalic || false,
      isUnderline: textData.isUnderline || false,
      isStrikethrough: textData.isStrikethrough || false,
      textAlign: textData.textAlign || 'left',
      color: textData.color || '#000000',
      flipX: textData.flipX || false,
      flipY: textData.flipY || false,
      isCurved: textData.isCurved || false,
      curveType: textData.curveType || 'Arch Up',
      curveIntensity: textData.curveIntensity || 0,
      zIndex: textData.zIndex || 0
    };
    setTexts((prev) => {
      const next = [...prev, newText];
      try {
        if (onTextsChange) onTextsChange(next);
        if (onTextsChangeComplete) onTextsChangeComplete(next);
      } catch (e) {
        console.warn('Failed to call text change callbacks', e);
      }
      return next;
    });
    return newText;
  };

  const toggleTextVisibility = (id) => {
    setTexts((items) => {
      const next = items.map((item) =>
        item.id === id ? { ...item, visible: !item.visible } : item
      );
      try {
        if (onTextsChange) onTextsChange(next);
        if (onTextsChangeComplete) onTextsChangeComplete(next);
      } catch (e) { console.warn('toggleTextVisibility callbacks failed', e); }
      return next;
    });
  };

  const deleteText = (id) => {
    setTexts((items) => {
      const next = items.filter((item) => item.id !== id);
      try {
        if (onTextsChange) onTextsChange(next);
        if (onTextsChangeComplete) onTextsChangeComplete(next);
      } catch (e) { console.warn('deleteText callbacks failed', e); }
      return next;
    });
  };

  // Image management functions
  const addImage = (imageData) => {
    const newImage = {
      id: String(imageData.id || `${Date.now()}-${Math.random()}`), // Ensure unique id as string
      x: imageData.x !== undefined ? imageData.x : 150,
      y: imageData.y !== undefined ? imageData.y : 150,
      src: imageData.src || imageData.url || '',
      width: imageData.width || 100,
      height: imageData.height || 100,
      rotation: imageData.rotation || 0,
      visible: imageData.visible !== undefined ? imageData.visible : true,
      zIndex: imageData.zIndex || 1,
      flipX: imageData.flipX || false,
      flipY: imageData.flipY || false,
    };

    setImages((prev) => {
      const next = [...prev, newImage];
      try {
        if (onImagesChange) onImagesChange(next);
        if (onImagesChangeComplete) onImagesChangeComplete(next);
      } catch (e) {
        console.warn('Failed to call image change callbacks', e);
      }
      return next;
    });

    console.log("New image added:", newImage);
    return { ...newImage };
  };

  const updateImagePosition = (id, newX, newY) => {
    setImages((items) => {
      const next = items.map((item) =>
        item.id === id ? { ...item, x: newX, y: newY } : item
      );
      return next;
    });
  };

  const updateImageSize = (id, newWidth, newHeight, newX, newY) => {
    setImages((items) => {
      const next = items.map((item) =>
        item.id === id ? { 
          ...item, 
          width: newWidth, 
          height: newHeight,
          x: newX !== undefined ? newX : item.x,
          y: newY !== undefined ? newY : item.y
        } : item
      );
      try {
        if (onImagesChange) onImagesChange(next);
        if (onImagesChangeComplete) onImagesChangeComplete(next);
      } catch (e) { console.warn('updateImageSize callbacks failed', e); }
      return next;
    });
  };

  const updateImageRotation = (id, newRotation) => {
    setImages((items) => {
      const next = items.map((item) =>
        item.id === id ? { ...item, rotation: newRotation } : item
      );
      return next;
    });
  };

  // Notify parent when images change
  useEffect(() => {
    if (onImagesChange) {
      onImagesChange(images);
    }
  }, [images]);

  const handleImageClick = (id) => {
    setSelectedImageId(id);
    setSelectedTextId(null);
    
  // Notify parent of selection state
    if (onSelectionChange) {
      onSelectionChange({ type: 'image', id: id });
    }
  };

  const handleCanvasClick = () => {
    setSelectedImageId(null);
    setSelectedTextId(null);
    
  // Notify parent of deselection
    if (onSelectionChange) {
      onSelectionChange(null);
    }
  };

  const toggleImageVisibility = (id) => {
    setImages((items) => {
      const next = items.map((item) =>
        item.id === id ? { ...item, visible: !item.visible } : item
      );
      try {
        if (onImagesChange) onImagesChange(next);
        if (onImagesChangeComplete) onImagesChangeComplete(next);
      } catch (e) { console.warn('toggleImageVisibility callbacks failed', e); }
      return next;
    });
  };

  const deleteImage = (id) => {
    setImages((items) => {
      const next = items.filter((item) => item.id !== id);
      try {
        if (onImagesChange) onImagesChange(next);
        if (onImagesChangeComplete) onImagesChangeComplete(next);
      } catch (e) { console.warn('deleteImage callbacks failed', e); }
      return next;
    });
  };

  const updateTextZIndex = (id, newZIndex) => {
    setTexts((items) => {
      const updated = items.map((item) =>
        item.id === id ? { ...item, zIndex: newZIndex } : item
      );
      const next = updated.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
      try {
        if (onTextsChange) onTextsChange(next);
        if (onTextsChangeComplete) onTextsChangeComplete(next);
      } catch (e) { console.warn('updateTextZIndex callbacks failed', e); }
      return next;
    });
  };

  const updateImageZIndex = (id, newZIndex) => {
    setImages((items) => {
      const updated = items.map((item) =>
        item.id === id ? { ...item, zIndex: newZIndex } : item
      );
      const next = updated.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
      try {
        if (onImagesChange) onImagesChange(next);
        if (onImagesChangeComplete) onImagesChangeComplete(next);
      } catch (e) { console.warn('updateImageZIndex callbacks failed', e); }
      return next;
    });
  };

  const sortElementsByZIndex = () => {
    setTexts((items) => {
      const sortedTexts = [...items].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
      return sortedTexts;
    });
    setImages((items) => {
      const sortedImages = [...items].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
      return sortedImages;
    });
  };

  const bringToFront = (id, type) => {
    // Move element to absolute top by computing max zIndex across both texts and images
    if (type === "text") {
      setTexts((textItems) => {
        // compute max across texts and images
        const textsMax = textItems.length > 0 ? Math.max(...textItems.map((it) => it.zIndex || 0)) : 0;
        const imagesMax = images.length > 0 ? Math.max(...images.map((it) => it.zIndex || 0)) : 0;
        const maxZIndex = Math.max(textsMax, imagesMax);
        const updatedTexts = textItems.map((item) =>
          item.id === id ? { ...item, zIndex: maxZIndex + 1 } : item
        );
        try {
          if (onTextsChange) onTextsChange(updatedTexts);
          if (onTextsChangeComplete) onTextsChangeComplete(updatedTexts);
        } catch (e) { console.warn('bringToFront callbacks failed', e); }
        return updatedTexts;
      });
    } else if (type === "image") {
      setImages((imageItems) => {
        const textsMax = texts.length > 0 ? Math.max(...texts.map((it) => it.zIndex || 0)) : 0;
        const imagesMax = imageItems.length > 0 ? Math.max(...imageItems.map((it) => it.zIndex || 0)) : 0;
        const maxZIndex = Math.max(textsMax, imagesMax);
        const updatedImages = imageItems.map((item) =>
          item.id === id ? { ...item, zIndex: maxZIndex + 1 } : item
        );
        try {
          if (onImagesChange) onImagesChange(updatedImages);
          if (onImagesChangeComplete) onImagesChangeComplete(updatedImages);
        } catch (e) { console.warn('bringToFront image callbacks failed', e); }
        return updatedImages;
      });
    }
    // Ensure overall ordering is normalized after change
    sortElementsByZIndex();
  };

  const sendToBack = (id, type) => {
    // Move element to absolute bottom by computing min zIndex across both texts and images
    if (type === "text") {
      setTexts((textItems) => {
        const textsMin = textItems.length > 0 ? Math.min(...textItems.map((it) => it.zIndex || 0)) : 0;
        const imagesMin = images.length > 0 ? Math.min(...images.map((it) => it.zIndex || 0)) : 0;
        const minZIndex = Math.min(textsMin, imagesMin);
        const updatedTexts = textItems.map((item) =>
          item.id === id ? { ...item, zIndex: minZIndex - 1 } : item
        );
        try {
          if (onTextsChange) onTextsChange(updatedTexts);
          if (onTextsChangeComplete) onTextsChangeComplete(updatedTexts);
        } catch (e) { console.warn('sendToBack callbacks failed', e); }
        return updatedTexts;
      });
    } else if (type === "image") {
      setImages((imageItems) => {
        const textsMin = texts.length > 0 ? Math.min(...texts.map((it) => it.zIndex || 0)) : 0;
        const imagesMin = imageItems.length > 0 ? Math.min(...imageItems.map((it) => it.zIndex || 0)) : 0;
        const minZIndex = Math.min(textsMin, imagesMin);
        const updatedImages = imageItems.map((item) =>
          item.id === id ? { ...item, zIndex: minZIndex - 1 } : item
        );
        try {
          if (onImagesChange) onImagesChange(updatedImages);
          if (onImagesChangeComplete) onImagesChangeComplete(updatedImages);
        } catch (e) { console.warn('sendToBack image callbacks failed', e); }
        return updatedImages;
      });
    }
    // Normalize ordering
    sortElementsByZIndex();
  };

  // Allow parent (Canvas) to call addText or getSVG
  useImperativeHandle(ref, () => ({
    addText,
  addTextWithData,
    getSVG: () => svgRef.current,
    toggleTextVisibility,
    deleteText,
    updateTextStyle,
    updateText,
    updatePosition,
    texts,
    addImage,
    toggleImageVisibility,
    deleteImage,
    images,
    updateImageSize,
    updateImageRotation,
    setSelectedImageId,
    setSelectedTextId,
    selectTextFromLayer: (textId) => {
      setSelectedTextId(textId);
      setSelectedImageId(null);
      if (onSelectionChange) {
        onSelectionChange({ type: 'text', id: textId });
      }
    },
    selectImageFromLayer: (imageId) => {
      setSelectedImageId(imageId);
      setSelectedTextId(null);
      if (onSelectionChange) {
        onSelectionChange({ type: 'image', id: imageId });
      }
    },
    clearSelection: () => {
      setSelectedTextId(null);
      setSelectedImageId(null);
      if (onSelectionChange) {
        onSelectionChange(null);
      }
    },
    updateTextZIndex,
    updateImageZIndex,
    bringToFront,
    sendToBack,
    /**
     * Replace the internal texts/images state with a snapshot.
     * Used by undo/redo stacks to restore canvas state.
     * @param {{texts: Array, images: Array}} snapshot
     */
    replaceState: (snapshot) => {
      if (!snapshot) return;
      if (Array.isArray(snapshot.texts)) {
        setTexts(snapshot.texts.map(t => ({ ...t })));
        if (onTextsChange) onTextsChange(snapshot.texts.map(t => ({ ...t })));
        if (onTextsChangeComplete) onTextsChangeComplete(snapshot.texts.map(t => ({ ...t })));
      }
      if (Array.isArray(snapshot.images)) {
        setImages(snapshot.images.map(i => ({ ...i })));
        if (onImagesChange) onImagesChange(snapshot.images.map(i => ({ ...i })));
        if (onImagesChangeComplete) onImagesChangeComplete(snapshot.images.map(i => ({ ...i })));
      }
    },
  }));

  const svgRef = React.useRef();

  // Sort texts and images by zIndex before rendering
  const sortedTexts = [...texts].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  const sortedImages = [...images].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  // Ensure rendering order respects z-index across texts and images
  const sortedElements = [
    ...texts.map((text) => ({ ...text, type: "text", flipX: text.flipX || false, flipY: text.flipY || false })),
    ...images.map((image) => ({ ...image, type: "image", flipX: image.flipX || false, flipY: image.flipY || false })),
  ].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  // Rendering sortedElements (debug logging removed)

  return (
    <svg
      ref={svgRef}
      id="design-svg"
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: width,
        height: height,
        backgroundColor: "white",
      }}
      onClick={handleCanvasClick}
    >
      {sortedElements.map((element) => {
        if (element.type === "text") {
          const { id, x, y, text, isEditing, visible, fontSize = 18, font = "Comic Neue", isBold = false, isItalic = false, isUnderline = false, isStrikethrough = false, rotation = 0, textAlign = 'left', color = '#000000', isCurved = false, curveType = 'Arch Up', curveIntensity = 0 } = element;
          return (
            visible && (
              <g 
                key={`text-${id}`} // Ensure unique key for text elements
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpecificTextClick(id);
                }}
              >
                <TextItem
                  svgRef={svgRef}
                  id={id}
                  x={x}
                  y={y}
                  initialText={text}
                  font={font}
                  fontSize={fontSize}
                  isBold={isBold}
                  isItalic={isItalic}
                  isUnderline={isUnderline}
                  isStrikethrough={isStrikethrough}
                  rotation={rotation}
                  textAlign={textAlign}
                  color={color}
                  isCurved={isCurved}
                  curveType={curveType}
                  curveIntensity={curveIntensity}
                  flipX={element.flipX}
                  flipY={element.flipY}
                  isSelected={selectedTextId === id}
                  isEditing={isEditing}
                  onChange={(newText) => updateText(id, newText)}
                  onEditComplete={() => finishEditing(id)}
                  onPositionChange={(pos) => updatePosition(id, pos)}
                  onRotationChange={(rotation) => updateTextRotation(id, rotation)}
                  onFontSizeChange={(fontSize) => updateTextStyle(id, { fontSize })}
                  onSelect={(textId) => {
                    setSelectedTextId(textId);
                    setSelectedImageId(null);
                    if (onSelectionChange) {
                      onSelectionChange({ type: 'text', id: textId });
                    }
                  }}
                />
              </g>
            )
          );
        } else if (element.type === "image") {
          const { id, x, y, src, width, height, rotation = 0, visible } = element;
          return (
            visible && (
              <g 
                key={`image-${id}`} // Ensure unique key for image elements
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageClick(id);
                }}
              >
                <ImageItem
                  id={id}
                  x={x}
                  y={y}
                  src={src}
                  width={width}
                  height={height}
                  rotation={rotation}
                  visible={visible}
                  isSelected={selectedImageId === id}
                  flipX={element.flipX}
                  flipY={element.flipY}
                  onPositionChange={updateImagePosition}
                  onSizeChange={updateImageSize}
                  onRotationChange={updateImageRotation}
                  onClick={handleImageClick}
                />
              </g>
            )
          );
        }
        return null;
      })}
    </svg>
  );
});

export default DesignArea;