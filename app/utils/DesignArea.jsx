import React, { forwardRef, useState, useImperativeHandle, useEffect } from "react";
import TextItem from "./TextItem";
import { ImageItem } from "./Image";

const DesignArea = forwardRef(({ coords, productView = "Front", productImageSrc = "/assets/tshirt-mockup.png", onTextsChange, onImagesChange, onSelectionChange, onTextsChangeComplete, onImagesChangeComplete }, ref) => {
  const { x, y, width, height } = coords;

  const [texts, setTexts] = useState([
    { 
      id: '1', 
      x: width / 2,
      y: height / 2,
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
  // Safari can expand an SVG foreignObject during a pointer repaint. The
  // editable control is rendered in this normal HTML overlay instead.
  const [editorOverlay, setEditorOverlay] = useState(null);

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
      const activeItem = items.find((item) => item.id === id);
      const groupId = activeItem?.groupId;
      const next = items.map((item) =>
        item.id === id || (groupId && item.groupId === groupId)
          ? { ...item, text: newText }
          : item
      );
      return next;
    });
  };

  const updatePosition = (id, pos) => {
    setTexts((items) => {
      const activeItem = items.find((item) => item.id === id);
      const groupId = activeItem?.groupId;
      const deltaX = pos.x - (activeItem?.x ?? pos.x);
      const deltaY = pos.y - (activeItem?.y ?? pos.y);
      const next = items.map((item) => {
        if (item.id === id) return { ...item, x: pos.x, y: pos.y };
        if (groupId && item.groupId === groupId) {
          return { ...item, x: item.x + deltaX, y: item.y + deltaY };
        }
        return item;
      });

      if (groupId) {
        setImages((imageItems) =>
          imageItems.map((item) =>
            item.groupId === groupId
              ? { ...item, x: item.x + deltaX, y: item.y + deltaY }
              : item,
          ),
        );
      }
      return next;
    });
  };

  const updateTextStyle = (id, style) => {
    setTexts((items) => {
      const activeItem = items.find((item) => item.id === id);
      if (!activeItem) return items;

      const groupId = activeItem.groupId;
      const isResizingGroup = groupId && style.fontSize !== undefined;
      const scale = isResizingGroup
        ? style.fontSize / (activeItem.fontSize || 18)
        : 1;
      const next = items.map((item) => {
        if (item.id === id) return { ...item, ...style };
        if (groupId && item.groupId === groupId) {
          return {
            ...item,
            // Colour, font, weight and other style choices apply to every
            // tile in a pattern. Font-size changes also preserve its layout.
            ...style,
            ...(isResizingGroup
              ? {
                  x: activeItem.x + (item.x - activeItem.x) * scale,
                  y: activeItem.y + (item.y - activeItem.y) * scale,
                  fontSize: Math.max(8, (item.fontSize || 18) * scale),
                }
              : {}),
          };
        }
        return item;
      });

      if (isResizingGroup) {
        setImages((imageItems) =>
          imageItems.map((item) =>
            item.groupId === groupId
              ? {
                  ...item,
                  x: activeItem.x + (item.x - activeItem.x) * scale,
                  y: activeItem.y + (item.y - activeItem.y) * scale,
                  width: item.width * scale,
                  height: item.height * scale,
                }
              : item,
          ),
        );
      }
      return next;
    });
  };

  const updateTextRotation = (id, rotation) => {
    setTexts((items) => {
      const activeItem = items.find((item) => item.id === id);
      const groupId = activeItem?.groupId;
      const rotationDelta = rotation - (activeItem?.rotation || 0);
      const next = items.map((item) =>
        item.id === id
          ? { ...item, rotation }
          : groupId && item.groupId === groupId
            ? { ...item, rotation: (item.rotation || 0) + rotationDelta }
            : item
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
      x: width / 2,
      y: height / 2,
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
      x: imageData.x !== undefined ? imageData.x : width / 2 - 50,
      y: imageData.y !== undefined ? imageData.y : height / 2 - 50,
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
      const activeItem = items.find((item) => item.id === id);
      const groupId = activeItem?.groupId;
      const deltaX = newX - (activeItem?.x ?? newX);
      const deltaY = newY - (activeItem?.y ?? newY);
      const next = items.map((item) => {
        if (item.id === id) return { ...item, x: newX, y: newY };
        if (groupId && item.groupId === groupId) {
          return { ...item, x: item.x + deltaX, y: item.y + deltaY };
        }
        return item;
      });

      if (groupId) {
        setTexts((textItems) =>
          textItems.map((item) =>
            item.groupId === groupId
              ? { ...item, x: item.x + deltaX, y: item.y + deltaY }
              : item,
          ),
        );
      }
      return next;
    });
  };

  const updateImageSize = (id, newWidth, newHeight, newX, newY) => {
    setImages((items) => {
      const activeItem = items.find((item) => item.id === id);
      if (!activeItem) return items;

      const groupId = activeItem.groupId;
      const targetX = newX !== undefined ? newX : activeItem.x;
      const targetY = newY !== undefined ? newY : activeItem.y;
      const scaleX = activeItem.width ? newWidth / activeItem.width : 1;
      const scaleY = activeItem.height ? newHeight / activeItem.height : 1;
      const textScale = (scaleX + scaleY) / 2;
      const next = items.map((item) => {
        if (item.id === id) {
          return { ...item, width: newWidth, height: newHeight, x: targetX, y: targetY };
        }
        if (groupId && item.groupId === groupId) {
          return {
            ...item,
            x: targetX + (item.x - activeItem.x) * scaleX,
            y: targetY + (item.y - activeItem.y) * scaleY,
            width: item.width * scaleX,
            height: item.height * scaleY,
          };
        }
        return item;
      });

      if (groupId) {
        setTexts((textItems) =>
          textItems.map((item) =>
            item.groupId === groupId
              ? {
                  ...item,
                  x: targetX + (item.x - activeItem.x) * scaleX,
                  y: targetY + (item.y - activeItem.y) * scaleY,
                  fontSize: Math.max(8, (item.fontSize || 18) * textScale),
                }
              : item,
          ),
        );
      }
      try {
        if (onImagesChange) onImagesChange(next);
        if (onImagesChangeComplete) onImagesChangeComplete(next);
      } catch (e) { console.warn('updateImageSize callbacks failed', e); }
      return next;
    });
  };

  const updateImageRotation = (id, newRotation) => {
    setImages((items) => {
      const activeItem = items.find((item) => item.id === id);
      const groupId = activeItem?.groupId;
      const rotationDelta = newRotation - (activeItem?.rotation || 0);
      const next = items.map((item) =>
        item.id === id
          ? { ...item, rotation: newRotation }
          : groupId && item.groupId === groupId
            ? { ...item, rotation: (item.rotation || 0) + rotationDelta }
            : item
      );
      return next;
    });
  };

  const applyImageCrop = ({ id, src, x, y, width: croppedWidth, height: croppedHeight }) => {
    setImages((items) => {
      const activeItem = items.find((item) => item.id === id);
      if (!activeItem) return items;
      const patternGroupId = activeItem.patternId ? activeItem.groupId : null;
      const next = items.map((item) => {
        if (item.id === id) {
          return { ...item, src, x, y, width: croppedWidth, height: croppedHeight };
        }
        // Pattern tiles remain one layer, so their source changes together.
        if (patternGroupId && item.groupId === patternGroupId) {
          return { ...item, src };
        }
        return item;
      });
      if (onImagesChange) onImagesChange(next);
      if (onImagesChangeComplete) onImagesChangeComplete(next);
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

  const groupLayers = (layerIds) => {
    if (!Array.isArray(layerIds) || layerIds.length < 2) return;

    const textIds = new Set(
      layerIds
        .filter((layerId) => layerId.startsWith("text-"))
        .map((layerId) => layerId.slice(5)),
    );
    const imageIds = new Set(
      layerIds
        .filter((layerId) => layerId.startsWith("image-"))
        .map((layerId) => layerId.slice(6)),
    );
    const groupId = `group-${Date.now()}`;

    setTexts((items) => {
      const next = items.map((item) =>
        textIds.has(item.id) ? { ...item, groupId } : item,
      );
      if (onTextsChange) onTextsChange(next);
      if (onTextsChangeComplete) onTextsChangeComplete(next);
      return next;
    });
    setImages((items) => {
      const next = items.map((item) =>
        imageIds.has(item.id) ? { ...item, groupId } : item,
      );
      if (onImagesChange) onImagesChange(next);
      if (onImagesChangeComplete) onImagesChangeComplete(next);
      return next;
    });
  };

  const ungroupLayers = (layerIds) => {
    if (!Array.isArray(layerIds) || layerIds.length === 0) return;
    const selectedIds = new Set(layerIds);
    const groupIds = new Set();
    texts.forEach((item) => {
      if (selectedIds.has(`text-${item.id}`) && item.groupId) groupIds.add(item.groupId);
    });
    images.forEach((item) => {
      if (selectedIds.has(`image-${item.id}`) && item.groupId) groupIds.add(item.groupId);
    });
    if (groupIds.size === 0) return;

    setTexts((items) => {
      const next = items.map((item) =>
        groupIds.has(item.groupId) ? { ...item, groupId: null } : item,
      );
      if (onTextsChange) onTextsChange(next);
      if (onTextsChangeComplete) onTextsChangeComplete(next);
      return next;
    });
    setImages((items) => {
      const next = items.map((item) =>
        groupIds.has(item.groupId) ? { ...item, groupId: null } : item,
      );
      if (onImagesChange) onImagesChange(next);
      if (onImagesChangeComplete) onImagesChangeComplete(next);
      return next;
    });
  };

  const alignSelected = ({ type, id, position }) => {
    const padding = 6;
    const positionInLayout = (itemWidth, itemHeight) => ({
      x: {
        left: layoutArea.x + padding,
        center: layoutArea.x + (layoutArea.width - itemWidth) / 2,
        right: layoutArea.x + layoutArea.width - itemWidth - padding,
      }[position],
      y: {
        top: layoutArea.y + padding,
        middle: layoutArea.y + (layoutArea.height - itemHeight) / 2,
        bottom: layoutArea.y + layoutArea.height - itemHeight - padding,
      }[position],
    });

    if (type === "image") {
      setImages((items) => {
        const next = items.map((item) => {
          if (item.id !== id) return item;
          const nextPosition = positionInLayout(item.width || 0, item.height || 0);
          return {
            ...item,
            x: nextPosition.x ?? item.x,
            y: nextPosition.y ?? item.y,
          };
        });
        if (onImagesChange) onImagesChange(next);
        if (onImagesChangeComplete) onImagesChangeComplete(next);
        return next;
      });
      return;
    }

    if (type === "text") {
      setTexts((items) => {
        const next = items.map((item) => {
          if (item.id !== id) return item;
          const fontSize = item.fontSize || 18;
          const lines = (item.text || "").split("\n");
          const longestLine = lines.reduce(
            (longest, line) => Math.max(longest, line.length),
            1,
          );
          const textWidth = Math.min(
            layoutArea.width - padding * 2,
            Math.max(fontSize, longestLine * fontSize * 0.6),
          );
          const textHeight = Math.min(
            layoutArea.height - padding * 2,
            Math.max(fontSize, lines.length * fontSize * 1.2),
          );
          const nextPosition = positionInLayout(textWidth, textHeight);

          // TextItem stores x/y at the centre of the text bounds.
          return {
            ...item,
            x: nextPosition.x === undefined ? item.x : nextPosition.x + textWidth / 2,
            y: nextPosition.y === undefined ? item.y : nextPosition.y + textHeight / 2,
          };
        });
        if (onTextsChange) onTextsChange(next);
        if (onTextsChangeComplete) onTextsChangeComplete(next);
        return next;
      });
    }
  };

  const createPattern = ({ type, id }) => {
    const padding = 8;
    const gap = 8;
    const availableWidth = Math.max(1, layoutArea.width - padding * 2);
    const availableHeight = Math.max(1, layoutArea.height - padding * 2);
    const timestamp = Date.now();
    // A pattern is represented by several rendered tiles, but they share one
    // identifier so the editor can treat them as one design object.
    const patternId = `pattern-${timestamp}`;
    const grid = (tileWidth, tileHeight) => {
      const columns = Math.min(6, Math.max(1, Math.floor((availableWidth + gap) / (tileWidth + gap))));
      const rows = Math.min(6, Math.max(1, Math.floor((availableHeight + gap) / (tileHeight + gap))));
      return {
        columns,
        rows,
        stepX: columns === 1 ? 0 : (availableWidth - tileWidth) / (columns - 1),
        stepY: rows === 1 ? 0 : (availableHeight - tileHeight) / (rows - 1),
      };
    };

    if (type === "image") {
      setImages((items) => {
        const source = items.find((item) => item.id === id);
        if (!source) return items;
        const scale = Math.min(
          1,
          (availableWidth / 3) / Math.max(1, source.width),
          (availableHeight / 3) / Math.max(1, source.height),
        );
        const tileWidth = Math.max(18, source.width * scale);
        const tileHeight = Math.max(18, source.height * scale);
        const { columns, rows, stepX, stepY } = grid(tileWidth, tileHeight);
        const patternedItems = [];

        for (let row = 0; row < rows; row += 1) {
          for (let column = 0; column < columns; column += 1) {
            const isSource = row === 0 && column === 0;
            patternedItems.push({
              ...source,
              id: isSource ? source.id : `${source.id}-pattern-${timestamp}-${row}-${column}`,
              groupId: patternId,
              patternId,
              isPatternPrimary: isSource,
              x: layoutArea.x + padding + column * stepX,
              y: layoutArea.y + padding + row * stepY,
              width: tileWidth,
              height: tileHeight,
            });
          }
        }

        const next = [...items.filter((item) => item.id !== source.id), ...patternedItems];
        if (onImagesChange) onImagesChange(next);
        if (onImagesChangeComplete) onImagesChangeComplete(next);
        return next;
      });
      return;
    }

    if (type === "text") {
      setTexts((items) => {
        const source = items.find((item) => item.id === id);
        if (!source) return items;
        const fontSize = source.fontSize || 18;
        const lines = (source.text || "").split("\n");
        const longestLine = lines.reduce((longest, line) => Math.max(longest, line.length), 1);
        const tileWidth = Math.max(18, Math.min(availableWidth / 3, longestLine * fontSize * 0.6));
        const tileHeight = Math.max(fontSize, Math.min(availableHeight / 3, lines.length * fontSize * 1.2));
        const { columns, rows, stepX, stepY } = grid(tileWidth, tileHeight);
        const patternedItems = [];

        for (let row = 0; row < rows; row += 1) {
          for (let column = 0; column < columns; column += 1) {
            const isSource = row === 0 && column === 0;
            patternedItems.push({
              ...source,
              id: isSource ? source.id : `${source.id}-pattern-${timestamp}-${row}-${column}`,
              groupId: patternId,
              patternId,
              isPatternPrimary: isSource,
              isEditing: false,
              x: layoutArea.x + padding + tileWidth / 2 + column * stepX,
              y: layoutArea.y + padding + tileHeight / 2 + row * stepY,
            });
          }
        }

        const next = [...items.filter((item) => item.id !== source.id), ...patternedItems];
        if (onTextsChange) onTextsChange(next);
        if (onTextsChangeComplete) onTextsChangeComplete(next);
        return next;
      });
    }
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
    applyImageCrop,
    alignSelected,
    createPattern,
    groupLayers,
    ungroupLayers,
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

  // The existing grey design layout is positioned on the T-shirt's chest.
  // Its contents stay within this visible print-layout square.
  const isSideView = productView === "Right" || productView === "Left";
  const isLeftView = productView === "Left";
  const shirtFrame = isSideView
    ? {
        x: width * 0.1,
        y: height * 0.1,
        width: width * 0.9,
        height: height * 0.8,
      }
    : {
        x: -width * 0.075,
        y: 0,
        width: width * 1.15,
        height,
      };
  const layoutArea = isSideView
    ? {
        x: width * (isLeftView ? 0.385 : 0.455),
        y: height * 0.44,
        width: width * 0.16,
        height: height * 0.34,
      }
    : {
        x: width * 0.292,
        y: height * 0.3,
        width: width * 0.416,
        height: height * 0.416,
      };

  // Rendering sortedElements (debug logging removed)

  return (
    <>
    <svg
      ref={svgRef}
      id="design-svg"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: width,
        height: height,
        display: "block",
        backgroundColor: "transparent",
      }}
      onClick={handleCanvasClick}
    >
      <defs>
        <clipPath id="tshirt-design-layout">
          <rect
            x={layoutArea.x}
            y={layoutArea.y}
            width={layoutArea.width}
            height={layoutArea.height}
            rx="3"
          />
        </clipPath>
      </defs>
      {/* Product mockup stays behind user-added design elements. */}
      <g
        key={productView}
        transform={isLeftView ? `translate(${width} 0) scale(-1 1)` : undefined}
      >
        <image
          href={productImageSrc}
          x={shirtFrame.x}
          y={shirtFrame.y}
          width={shirtFrame.width}
          height={shirtFrame.height}
          preserveAspectRatio="xMidYMid meet"
          pointerEvents="none"
        />
      </g>
      <rect
        x={layoutArea.x}
        y={layoutArea.y}
        width={layoutArea.width}
        height={layoutArea.height}
        rx="3"
        fill="#e5e7eb"
        pointerEvents="none"
      />
      <g clipPath="url(#tshirt-design-layout)">
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
                  editorOverlay={editorOverlay}
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
      </g>
    </svg>
    <div
      ref={setEditorOverlay}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        pointerEvents: "none",
      }}
    />
    </>
  );
});

export default DesignArea;
