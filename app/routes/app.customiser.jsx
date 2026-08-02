import React, { useState, useRef, useEffect } from "react";

import { handleToolbarZoom } from "../components/ToolbarActions/ToolbarZoom"; // Ensure ToolbarZoom is imported only as a function
import { handleToolbarDelete } from "../components/ToolbarActions/ToolbarDelete";
import { handleToolbarRevert } from "../components/ToolbarActions/ToolbarRevert";
import { handleToolbarCopy } from "../components/ToolbarActions/ToolbarCopy";
import ToolbarZIndexActions from "../components/ToolbarActions/ToolbarZIndexActions";
import { handleToolbarUndo, handleToolbarRedo } from "../components/ToolbarActions/ToolbarUndoRedo.js";

// Importing various icons from lucide-react for UI buttons and controls
import {
  Star, 
  Share, 
  Heart, 
  Undo2, 
  Redo2, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Trash, 
  BringToFront, 
  SendToBack, 
  Group, 
  Ungroup, 
  FlipHorizontal, 
  FlipVertical, 
  Grip, 
  Copy, 
  Crop, 
  AlignStartVertical, 
  AlignHorizontalJustifyCenter, 
  AlignEndVertical, 
  AlignStartHorizontal, 
  AlignCenterHorizontal, 
  AlignEndHorizontal, 
  Layers, 
  Check,
  ShoppingCart,
  CreditCard,
} from "lucide-react";
import { handleToolbarFlipHorizontal } from "../components/ToolbarActions/ToolbarFlipHorizontal";
import { handleToolbarFlipVertical } from "../components/ToolbarActions/ToolbarFlipVertical";

// Import team member's canvas components
import DesignArea from "../utils/DesignArea";
import { useImageUpload } from "../utils/Image";
import TextStyleSidebar from "../components/TextStyleSidebar";
import CropDialog from "../components/customiser/CropDialog";
import TipsDialog from "../components/customiser/TipsDialog";
import UserLibraryDialog from "../components/customiser/UserLibraryDialog";
import DesignLibraryDialog from "../components/customiser/DesignLibraryDialog";
import ProductPickerDialog from "../components/customiser/ProductPickerDialog";
import { categories, designTools, productViewAssets, views } from "../components/customiser/config";

// CSS keyframes for "shaking" heart animation
const shakeKeyframes = `
@keyframes shake {
  0% { transform: rotate(0deg); }
  20% { transform: rotate(-15deg); }
  40% { transform: rotate(10deg); }
  60% { transform: rotate(-10deg); }
  80% { transform: rotate(5deg); }
  100% { transform: rotate(0deg); }
}
`;

// Component to inject shake animation CSS into the page
function HeartShakeStyle() {
  return <style>{`.animate-shake { animation: shake 0.4s; }\n${shakeKeyframes}`}</style>;
}

// Example price breakdown data
const priceBreakdown = [
  { label: 'Base Price', value: 10.5 },
  { label: 'Medium Size', value: 2.5 },
  { label: 'Layout Request', value: 3.19 },
];

// Example product data (would normally be fetched from Shopify API)
const demoProducts = [{
  name: "Custom T-Shirt",
  basePrice: "15.99",
  reviewCount: 245,
  minOrderQuantity: 1,
  availableColors: [
    { name: "White", hex: "#FFFFFF" },
    { name: "Silver", hex: "#C0C0C0" },
    { name: "Gray", hex: "#808080" },
    { name: "Black", hex: "#000000" },
    { name: "Brown", hex: "#A52A2A" },
    { name: "Maroon", hex: "#800000" },
    { name: "Navy", hex: "#000080" },
    { name: "Purple", hex: "#800080" },
    { name: "Olive", hex: "#808000" },
    { name: "Teal", hex: "#008080" },
    { name: "Red", hex: "#FF0000" },
    { name: "Orange", hex: "#FFA500" },
    { name: "Coral", hex: "#FF7F50" },
    { name: "Yellow", hex: "#FFFF00" },
    { name: "Lime", hex: "#00FF80" },
    { name: "Green", hex: "#00FF00" },
    { name: "Aqua", hex: "#00FFFF" },
    { name: "Blue", hex: "#0000FF" },
    { name: "Fuchsia", hex: "#FF00FF" },
    { name: "Pink", hex: "#FFC0CB" },
  ],
  availableSizes: ["S", "M", "L", "XL"]
}, {
  name: "Custom Tote Bag",
  basePrice: "12.99",
  reviewCount: 186,
  minOrderQuantity: 1,
  availableColors: [
    { name: "White", hex: "#FFFFFF" },
    { name: "Natural", hex: "#E5D3B3" },
    { name: "Black", hex: "#000000" },
    { name: "Navy", hex: "#000080" },
    { name: "Olive", hex: "#808000" },
    { name: "Red", hex: "#FF0000" },
  ],
  availableSizes: ["Small", "Medium", "Large"],
}];

// Browser demo catalogue. Selecting a card changes only the product details;
// the design already on the canvas remains untouched.
const productCatalogue = [
  {
    ...demoProducts[0],
    id: "classic-white-tee",
    name: "Classic Oversized T-Shirt",
    brand: "FLAIR Basics",
    priceLabel: "$15.99",
    image: "/assets/tshirt-mockup.png",
  },
  {
    ...demoProducts[0],
    id: "essential-black-tee",
    name: "Essential Heavy T-Shirt",
    brand: "FLAIR Studio",
    basePrice: "18.99",
    priceLabel: "$18.99",
    image: "/assets/tshirt-mockup.png",
    imageClass: "brightness-50 contrast-125",
  },
  {
    ...demoProducts[0],
    id: "soft-white-tee",
    name: "Soft Cotton T-Shirt",
    brand: "FLAIR Select",
    basePrice: "16.99",
    priceLabel: "$16.99",
    image: "/assets/tshirt-mockup.png",
  },
];

export default function Customiser() {
  // Zoom state for canvas
  const [zoom, setZoom] = useState(1);
  // 최초 상태 저장용
  const [initialTexts, setInitialTexts] = useState([]);
  const [initialImages, setInitialImages] = useState([]);
// State for product selections and UI
  const [selectedCategory, setSelectedCategory] = useState("Apparel");
  const [selectedColor, setSelectedColor] = useState("White");
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [selectedView, setSelectedView] = useState("Front");
  const [showPopup, setShowPopup] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showPriceList, setShowPriceList] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showDesignLibrary, setShowDesignLibrary] = useState(false);
  const [showUserLibrary, setShowUserLibrary] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [cropBounds, setCropBounds] = useState({ left: 0, top: 0, right: 0, bottom: 0 });
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [selectedLayerIds, setSelectedLayerIds] = useState([]);

  // Ref for design area to access team member's canvas functions
  const designAreaRef = useRef(null);
  
  // Product selection state
  const [selectedProduct, setSelectedProduct] = useState(demoProducts[0]);


  // Canvas texts state (synced with DesignArea)
  const [canvasTexts, setCanvasTexts] = useState([]);
  // Undo/Redo stacks store snapshots { texts, images }
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const isRestoringRef = useRef(false);
  const lastSnapshotRef = useRef(null);
  // live text updates (do not push snapshot here)
  const setCanvasTextsLive = (texts) => {
    setCanvasTexts(texts);
  };

  // called when user finishes an edit/drag/interaction — set state then push snapshot in next tick
  const handleTextsChangeComplete = (texts) => {
    // apply latest texts
    setCanvasTexts(texts);
    // Ensure initialTexts contains an entry for any text that doesn't already have one
    if (texts.length > 0) {
      setInitialTexts(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const toAdd = texts.filter(t => !existingIds.has(t.id)).map(t => ({ ...t }));
        return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
      });
    }
    if (!isRestoringRef.current) {
      // ensure state has been flushed before snapshot
      setTimeout(() => {
        pushSnapshot({ texts: texts, images: canvasImages });
      }, 0);
    }
  };

  // Canvas images state
  const [canvasImages, setCanvasImages] = useState([]);

  const setCanvasImagesLive = (images) => {
    setCanvasImages(images);
  };

  const handleImagesChangeComplete = (images) => {
    setCanvasImages(images);
    // Ensure initialImages contains an entry for any image that doesn't already have one
    if (images.length > 0) {
      setInitialImages(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const toAdd = images.filter(i => !existingIds.has(i.id)).map(i => ({ ...i }));
        return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
      });
    }
    if (!isRestoringRef.current) {
      setTimeout(() => {
        pushSnapshot({ texts: canvasTexts, images: images });
      }, 0);
    }
  };

  // Helpers for external toolbar actions that update canvas state and should
  // produce a snapshot immediately after the change is applied.
  const setCanvasTextsWithComplete = (updater) => {
    setCanvasTexts(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (initialTexts.length === 0 && next.length > 0) {
        setInitialTexts(next.map(t => ({ ...t })));
      }
      if (!isRestoringRef.current) {
        setTimeout(() => pushSnapshot({ texts: next, images: canvasImages }), 0);
      }
      return next;
    });
  };

  const setCanvasImagesWithComplete = (updater) => {
    setCanvasImages(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (initialImages.length === 0 && next.length > 0) {
        setInitialImages(next.map(i => ({ ...i })));
      }
      if (!isRestoringRef.current) {
        setTimeout(() => pushSnapshot({ texts: canvasTexts, images: next }), 0);
      }
      return next;
    });
  };

  // Push snapshot helper - keep stack size reasonable (e.g., 50)
  const pushSnapshot = (snapshot) => {
    try {
      const normalized = {
        texts: Array.isArray(snapshot.texts) ? snapshot.texts.map(t => ({ ...t })) : [],
        images: Array.isArray(snapshot.images) ? snapshot.images.map(i => ({ ...i })) : []
      };

      // Deduplicate snapshots to avoid redundant entries
      const normalizedString = JSON.stringify(normalized);
      if (lastSnapshotRef.current === normalizedString) return;
      lastSnapshotRef.current = normalizedString;

      // Add snapshot to undo stack
      setUndoStack(prev => {
        const next = [...prev, normalized];
        if (next.length > 50) next.shift(); // Limit stack size to 50
        return next;
      });

      // Clear redo stack on new action
      setRedoStack([]);
    } catch (e) {
      console.error('Failed to push snapshot', e);
    }
  };

  // Undo/Redo handlers
  const undo = () => {
    if (undoStack.length === 0 || !designAreaRef.current?.replaceState) return;
    const prevSnapshot = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    // push current state to redo
    const current = { texts: canvasTexts.map(t => ({ ...t })), images: canvasImages.map(i => ({ ...i })) };
    setRedoStack(prev => [...prev, current]);
    // restore (prevent pushSnapshot during restore)
    isRestoringRef.current = true;
    designAreaRef.current.replaceState(prevSnapshot);
    setCanvasTexts(prevSnapshot.texts || []);
    setCanvasImages(prevSnapshot.images || []);
    // update lastSnapshotRef to the restored snapshot so dedupe matches
    try {
      lastSnapshotRef.current = JSON.stringify({ texts: prevSnapshot.texts || [], images: prevSnapshot.images || [] });
    } catch (e) {}
    setTimeout(() => { isRestoringRef.current = false; }, 0);
  };

  const redo = () => {
    if (redoStack.length === 0 || !designAreaRef.current?.replaceState) return;
    const nextSnapshot = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, prev.length - 1));

    // Push current state to undo stack
    const current = {
      texts: canvasTexts.map(t => ({ ...t })),
      images: canvasImages.map(i => ({ ...i }))
    };
    setUndoStack(prev => [...prev, current]);

    // Restore state (prevent pushSnapshot during restore)
    isRestoringRef.current = true;
    designAreaRef.current.replaceState(nextSnapshot);
    setCanvasTexts(nextSnapshot.texts || []);
    setCanvasImages(nextSnapshot.images || []);

    // Update lastSnapshotRef to match the restored snapshot
    try {
      lastSnapshotRef.current = JSON.stringify({
        texts: nextSnapshot.texts || [],
        images: nextSnapshot.images || []
      });
    } catch (e) {
      console.error('Failed to stringify snapshot', e);
    }

    // Ensure isRestoringRef is reset after state restoration
    setTimeout(() => {
      isRestoringRef.current = false;
    }, 0);
  };

    // first time texts/images are added, capture initial state for reversion
  useEffect(() => {
    if ((canvasTexts.length > 0 || canvasImages.length > 0) && initialTexts.length === 0 && initialImages.length === 0 && undoStack.length === 0) {
      const textsCopy = canvasTexts.map(t => ({ ...t }));
      const imagesCopy = canvasImages.map(i => ({ ...i }));
      setInitialTexts(textsCopy);
      setInitialImages(imagesCopy);
      setUndoStack([{ texts: textsCopy, images: imagesCopy }]);
      lastSnapshotRef.current = JSON.stringify({ texts: textsCopy, images: imagesCopy });
    }
  }, [canvasTexts, canvasImages, initialTexts.length, initialImages.length, undoStack.length]);

  // Image upload hook
  const { triggerImageUpload, createFileInput } = useImageUpload();

  // Example layer data for design editing
  const [layers, setLayers] = useState([
    { id: 1, type: "image", name: "Logo", visible: true, locked: false },
    { id: 2, type: "text", name: "Text", visible: true, locked: false },
    { id: 3, type: "image", name: "Decoration", visible: true, locked: false },
    { id: 4, type: "text", name: "Slogan", visible: true, locked: false }
  ]);

  // Use only real canvas texts and images as layers; do not fallback to fake layers
  const displayLayers = (() => {
    const textLayers = canvasTexts.map(text => ({
      id: `text-${text.id}`,
      type: "text",
      // A pattern is still the original text layer, so keep its real label.
      name: text.text || "Text",
      visible: text.visible,
      locked: false,
      originalId: text.id,
      zIndex: text.zIndex || 0,
      patternId: text.patternId,
      isPatternPrimary: text.isPatternPrimary,
    }));

    const imageLayers = canvasImages.map(image => ({
      id: `image-${image.id}`,
      type: "image", 
      name: "Image",
      src: image.src, // Add image source
      visible: image.visible,
      locked: false,
      originalId: image.id,
      zIndex: image.zIndex || 0,
      patternId: image.patternId,
      isPatternPrimary: image.isPatternPrimary,
    }));

    // Combine and dedupe layers by id to avoid duplicate entries in the UI when state
    // accidentally contains duplicates. Keep the first occurrence to preserve order.
    const combined = [...textLayers, ...imageLayers];
    const seen = new Set();
    return combined.filter(layer => {
      // Pattern tiles remain separate SVG elements for rendering, but are shown
      // in the layer panel as one selectable pattern layer.
      const layerKey = layer.patternId
        ? `pattern-${layer.type}-${layer.patternId}`
        : layer.id;
      if (seen.has(layerKey)) return false;
      seen.add(layerKey);
      return true;
    });
  })();

  // Layer visibility toggle function
  const toggleLayerVisible = (id) => {
    if (id.startsWith('text-')) {
      // Keep original id as string because DesignArea stores text ids as strings
      const originalId = id.replace('text-', '');
      if (designAreaRef.current?.toggleTextVisibility) {
        designAreaRef.current.toggleTextVisibility(originalId);
      }
    } else if (id.startsWith('image-')) {
      const originalId = id.replace('image-', '');
      if (designAreaRef.current?.toggleImageVisibility) {
        designAreaRef.current.toggleImageVisibility(originalId);
      }
    } else {
      // Fallback for fake layers
      setLayers((prev) => prev.map(layer =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      ));
    }
  };

  // Handle selection change from design area
  const handleSelectionChange = (selection) => {
    if (selection) {
      if (selection.type === 'text') {
        const layerId = `text-${selection.id}`;
        setSelectedLayerId(layerId);
        setSelectedLayerIds([layerId]);
      } else if (selection.type === 'image') {
        const layerId = `image-${selection.id}`;
        setSelectedLayerId(layerId);
        setSelectedLayerIds([layerId]);
      }
    } else {
      setSelectedLayerId(null);
      setSelectedLayerIds([]);
    }
  };

  // Handle image addition
  const handleImageAdd = (imageData) => {
    if (designAreaRef.current?.addImage) {
      const newImage = designAreaRef.current.addImage(imageData);
      if (newImage) {
        // DesignArea already updates images and calls onImagesChange/onImagesChangeComplete.
        // Rely on those callbacks to update parent state and snapshots. Just select the new image.
        const layerId = `image-${newImage.id}`;
        setSelectedLayerId(layerId);
        setSelectedLayerIds([layerId]);
        if (designAreaRef.current?.selectImageFromLayer) {
          designAreaRef.current.selectImageFromLayer(newImage.id);
        }
      } else {
        setCanvasImagesWithComplete(prev => [...prev, imageData]);
      }
    } else {
      setCanvasImagesWithComplete(prev => [...prev, imageData]);
    }
  };

  // Price calculation function
  const calculatePrice = () => {
    const basePrice = parseFloat(selectedProduct.basePrice);
    return (basePrice * quantity).toFixed(2);
  };

  // Add to Cart handler (UI only)
  const handleAddToCart = () => {
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 1000);
    // Actual implementation would call Shopify Cart API here
  };

  // Buy Now handler (UI only)
  const handleBuyNow = () => {
    // Actual implementation would call Shopify Checkout API here
  // Buy now clicked - debug log removed
  };

  // Z-index update function
  const updateZIndex = (id, newZIndex) => {
  // zIndex update triggered
    if (id.startsWith("text-")) {
      const originalId = id.replace("text-", "");
      if (designAreaRef.current?.updateTextZIndex) {
  // updating text zIndex
        designAreaRef.current.updateTextZIndex(originalId, newZIndex);
      } else {
  console.error("updateTextZIndex method not found on designAreaRef");
      }
    } else if (id.startsWith("image-")) {
      const originalId = id.replace("image-", "");
      if (designAreaRef.current?.updateImageZIndex) {
  // updating image zIndex
        designAreaRef.current.updateImageZIndex(originalId, newZIndex);
      } else {
  console.error("updateImageZIndex method not found on designAreaRef");
      }
    } else {
  console.error("Invalid layer ID:", id);
    }
  };

  const handleBringForward = () => {
    if (!selectedLayerId) return;
    const selectedLayer = displayLayers.find((layer) => layer.id === selectedLayerId);
    if (!selectedLayer) return;
    const originalId = selectedLayer.originalId;
    const type = selectedLayer.type;
    // Use DesignArea's bringToFront to always move to top in one action
    if (designAreaRef.current?.bringToFront) {
      designAreaRef.current.bringToFront(originalId, type);
    } else {
      // Fallback: compute a single-step zIndex change
      const newZIndex = (selectedLayer.zIndex || 0) + 1;
      updateZIndex(selectedLayerId, newZIndex);
    }
  };

  const handleSendBackward = () => {
    if (!selectedLayerId) return;
    const selectedLayer = displayLayers.find((layer) => layer.id === selectedLayerId);
    if (!selectedLayer) return;
    const originalId = selectedLayer.originalId;
    const type = selectedLayer.type;
    // Use DesignArea's sendToBack to always move to bottom in one action
    if (designAreaRef.current?.sendToBack) {
      designAreaRef.current.sendToBack(originalId, type);
    } else {
      const newZIndex = (selectedLayer.zIndex || 0) - 1;
      updateZIndex(selectedLayerId, newZIndex);
    }
  };

  const handleAlignSelected = (position) => {
    if (!selectedLayerId || !designAreaRef.current?.alignSelected) return;

    const type = selectedLayerId.startsWith("text-") ? "text" : "image";
    const id = selectedLayerId.slice(type === "text" ? 5 : 6);
    designAreaRef.current.alignSelected({ type, id, position });
  };

  const handleGroupSelected = () => {
    if (selectedLayerIds.length < 2 || !designAreaRef.current?.groupLayers) return;
    designAreaRef.current.groupLayers(selectedLayerIds);
  };

  const handleUngroupSelected = () => {
    if (!selectedLayerId || !designAreaRef.current?.ungroupLayers) return;
    designAreaRef.current.ungroupLayers([selectedLayerId]);
  };

  const handleCreatePattern = () => {
    if (!selectedLayerId || !designAreaRef.current?.createPattern) return;
    const type = selectedLayerId.startsWith("text-") ? "text" : "image";
    const id = selectedLayerId.slice(type === "text" ? 5 : 6);
    designAreaRef.current.createPattern({ type, id });
  };

  const selectedCropImage = selectedLayerId?.startsWith("image-")
    ? canvasImages.find((image) => `image-${image.id}` === selectedLayerId)
    : null;

  const openCropDialog = () => {
    if (!selectedCropImage) return;
    setCropBounds({ left: 0, top: 0, right: 0, bottom: 0 });
    setShowCropDialog(true);
  };

  const updateCropBound = (side, value) => {
    setCropBounds((current) => {
      const next = { ...current, [side]: value };
      const opposite = side === "left" ? "right" : side === "right" ? "left" : side === "top" ? "bottom" : "top";
      const axisTotal = (side === "left" || side === "right")
        ? next.left + next.right
        : next.top + next.bottom;
      if (axisTotal > 90) next[opposite] = Math.max(0, 90 - value);
      return next;
    });
  };

  const applyCrop = () => {
    if (!selectedCropImage || !designAreaRef.current?.applyImageCrop) return;
    const source = new window.Image();
    source.onload = () => {
      const cropWidthPercent = 100 - cropBounds.left - cropBounds.right;
      const cropHeightPercent = 100 - cropBounds.top - cropBounds.bottom;
      const sourceX = Math.round(source.naturalWidth * (cropBounds.left / 100));
      const sourceY = Math.round(source.naturalHeight * (cropBounds.top / 100));
      const sourceWidth = Math.max(1, Math.round(source.naturalWidth * (cropWidthPercent / 100)));
      const sourceHeight = Math.max(1, Math.round(source.naturalHeight * (cropHeightPercent / 100)));
      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = sourceWidth;
      cropCanvas.height = sourceHeight;
      const context = cropCanvas.getContext("2d");
      if (!context) return;
      context.drawImage(source, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);
      designAreaRef.current.applyImageCrop({
        id: selectedCropImage.id,
        src: cropCanvas.toDataURL("image/png"),
        x: selectedCropImage.x + selectedCropImage.width * (cropBounds.left / 100),
        y: selectedCropImage.y + selectedCropImage.height * (cropBounds.top / 100),
        width: selectedCropImage.width * (cropWidthPercent / 100),
        height: selectedCropImage.height * (cropHeightPercent / 100),
      });
      setShowCropDialog(false);
    };
    source.src = selectedCropImage.src;
  };

  // per-layer undo/redo stacks
const [layerStacks, setLayerStacks] = useState({});

const pushLayerSnapshot = (layerId, snapshot) => {
  setLayerStacks((prev) => {
    const layerStack = prev[layerId] || { undoStack: [], redoStack: [] };
    const normalized = {
      texts: Array.isArray(snapshot.texts) ? snapshot.texts.map(t => ({ ...t })) : [],
      images: Array.isArray(snapshot.images) ? snapshot.images.map(i => ({ ...i })) : []
    };
    const normalizedString = JSON.stringify(normalized);
    if (layerStack.undoStack.length > 0 && JSON.stringify(layerStack.undoStack[layerStack.undoStack.length - 1]) === normalizedString) {
      return prev;
    }
    return {
      ...prev,
      [layerId]: {
        undoStack: [...layerStack.undoStack, normalized],
        redoStack: []
      }
    };
  });
};

const undoLayer = (layerId) => {
  setLayerStacks((prev) => {
    const layerStack = prev[layerId];
    if (!layerStack || layerStack.undoStack.length === 0) return prev;
    const undoStack = [...layerStack.undoStack];
    const redoStack = [...layerStack.redoStack, undoStack.pop()];
    const snapshot = undoStack[undoStack.length - 1];
    if (snapshot) {
      designAreaRef.current.replaceState(snapshot);
      setCanvasTexts(snapshot.texts || []);
      setCanvasImages(snapshot.images || []);
    }
    return {
      ...prev,
      [layerId]: { undoStack, redoStack }
    };
  });
};

const redoLayer = (layerId) => {
  setLayerStacks((prev) => {
    const layerStack = prev[layerId];
    if (!layerStack || layerStack.redoStack.length === 0) return prev;
    const redoStack = [...layerStack.redoStack];
    const undoStack = [...layerStack.undoStack, redoStack.pop()];
    const snapshot = undoStack[undoStack.length - 1];
    if (snapshot) {
      designAreaRef.current.replaceState(snapshot);
      setCanvasTexts(snapshot.texts || []);
      setCanvasImages(snapshot.images || []);
    }
    return {
      ...prev,
      [layerId]: { undoStack, redoStack }
    };
  });
};

  return (
    <>
      <HeartShakeStyle />
      {/* Hidden file input for image upload */}
      {createFileInput(handleImageAdd)}
      <div className="h-screen flex flex-col bg-white font-inter overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
          <div className="flex items-center py-0.5 pr-4" style={{ minHeight: 48 }}>
            <div className="w-40 flex flex-col items-center justify-center h-14">
              <div className="flex-1 flex items-center justify-center">
                <div className="bg-purple-500 rounded-2xl px-4 py-1.5 shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="text-white font-black text-xl tracking-wide">
                      FLAIR
                    </div>
                    <div className="text-white text-lg">✨</div>
                  </div>
                </div>
              </div>
            </div>
            <nav className="flex-1 flex justify-between">
              {categories.map((category) => (
                <div
                  key={category}
                  className={`w-28 h-10 flex items-center justify-center rounded-full bg-white transition-all duration-150 ${
                    selectedCategory === category
                      ? "border-4 border-pink-400 shadow-pink-active" 
                      : "border-2 border-pink-300 shadow-pink-default"
                  }`}
                >
                  <button
                    className={`w-full h-full flex items-center justify-center text-sm md:text-base font-semibold transition-colors rounded-full focus:outline-none truncate ${
                      selectedCategory === category
                        ? "bg-pink-400 text-white"
                        : "text-black bg-white hover:bg-pink-50"
                    }`}
                    onClick={() => setSelectedCategory(category)}
                    title={category}
                  >
                    {category}
                  </button>
                </div>
              ))}
            </nav>
          </div>
        </header>

        {/* Main Layout */}
        <div className="w-full flex gap-0 overflow-hidden flex-1 h-0">
          <div className="flex w-full h-full min-h-0 justify-between">
            {/* Toolbar + Left + Center + View Controls */}
            <div className="flex flex-col flex-1 min-w-0">
              {/* Toolbar */}
              <div className="z-10 bg-white border-b border-gray-200 px-4 py-0.5 flex items-center min-h-0 w-full" style={{height: 40}}>
                <div className="flex w-full items-center justify-between gap-4">
                  <div className="w-3 flex-shrink-0" />
                  
                  {/* Toolbar Icons Groups */}
                  <div className="flex flex-col items-center gap-0">
                    <div className="flex items-center gap-4">
                      <div className="relative flex flex-col items-center group">
                        <button
                          type="button"
                          className="flex items-center justify-center rounded-full transition-all duration-150 hover:bg-purple-50 hover:scale-105 focus:outline-none"
                          onClick={() => handleToolbarRevert({
                            selectedLayerId,
                            designAreaRef,
                            setCanvasTexts: setCanvasTextsWithComplete,
                            setCanvasImages: setCanvasImagesWithComplete,
                            initialTexts,
                            initialImages
                          })}
                          disabled={!selectedLayerId}
                          aria-label="Revert selected layer"
                        >
                          <RotateCcw className="w-7 h-7 text-gray-700 hover:text-purple-600 cursor-pointer" />
                        </button>
                        <span className="absolute left-1/2 top-full mt-2.5 -translate-x-1/2 text-sm bg-white text-black rounded-xl px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-200 font-bold">Revert</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-6 w-px bg-gray-300 mx-2" />
                  
                  <div className="flex items-center gap-4">
                    <div className="relative flex flex-col items-center group">
                      <button
                        type="button"
                        onClick={() => handleToolbarUndo({ undo })}
                        disabled={undoStack.length === 0}
                        className="flex items-center justify-center rounded-full transition-all duration-150 hover:bg-purple-50 hover:scale-105 focus:outline-none"
                        aria-label="Undo"
                      >
                        <Undo2 className="w-7 h-7 text-gray-700 hover:text-purple-600 cursor-pointer" />
                      </button>
                      <span className="absolute left-1/2 top-full mt-2.5 -translate-x-1/2 text-sm bg-white text-black rounded-xl px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-200 font-bold">Undo</span>
                    </div>
                    <div className="relative flex flex-col items-center group">
                      <button
                        type="button"
                        onClick={() => handleToolbarRedo({ redo })}
                        disabled={redoStack.length === 0}
                        className="flex items-center justify-center rounded-full transition-all duration-150 hover:bg-purple-50 hover:scale-105 focus:outline-none"
                        aria-label="Redo"
                      >
                        <Redo2 className="w-7 h-7 text-gray-700 hover:text-purple-600 cursor-pointer" />
                      </button>
                      <span className="absolute left-1/2 top-full mt-2.5 -translate-x-1/2 text-sm bg-white text-black rounded-xl px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-200 font-bold">Redo</span>
                    </div>
                  </div>
                  
                  <div className="h-6 w-px bg-gray-300 mx-2" />
                  
                  <div className="flex items-center gap-4">
                    <div className="relative flex flex-col items-center group">
                      <button
                        type="button"
                        className="flex items-center justify-center rounded-full transition-all duration-150 hover:bg-purple-50 hover:scale-105 focus:outline-none"
                        onClick={() => handleToolbarZoom({
                          designAreaRef,
                          zoom,
                          setZoom,
                          delta: 1
                        })}
                        aria-label="Zoom In"
                      >
                        <ZoomIn className="w-7 h-7 text-gray-700 hover:text-purple-600 cursor-pointer" />
                      </button>
                      <span className="absolute left-1/2 top-full mt-2.5 -translate-x-1/2 text-sm bg-white text-black rounded-xl px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-200 font-bold">Zoom In</span>
                    </div>
                    <div className="relative flex flex-col items-center group">
                      <button
                        type="button"
                        className="flex items-center justify-center rounded-full transition-all duration-150 hover:bg-purple-50 hover:scale-105 focus:outline-none"
                        onClick={() => handleToolbarZoom({
                          designAreaRef,
                          zoom,
                          setZoom,
                          delta: -1
                        })}
                        aria-label="Zoom Out"
                      >
                        <ZoomOut className="w-7 h-7 text-gray-700 hover:text-purple-600 cursor-pointer" />
                      </button>
                      <span className="absolute left-1/2 top-full mt-2.5 -translate-x-1/2 text-sm bg-white text-black rounded-xl px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-200 font-bold">Zoom Out</span>
                    </div>
                  </div>
                  
                  <div className="h-6 w-px bg-gray-300 mx-2" />
                  
                  <div className="flex items-center gap-4">
                      <div className="relative flex flex-col items-center group">
                        <button
                          type="button"
                          className="flex items-center justify-center rounded-full transition-all duration-150 hover:bg-purple-50 hover:scale-105 focus:outline-none"
                          onClick={() => handleToolbarDelete({
                              selectedLayerId,
                              designAreaRef,
                              setCanvasTexts: setCanvasTextsWithComplete,
                              setCanvasImages: setCanvasImagesWithComplete,
                              setSelectedLayerId,
                              setLayers,
                              layers,
                              // pass current arrays so delete helper can compute next selection
                              canvasTexts: canvasTexts,
                              canvasImages: canvasImages
                            })}
                          disabled={!selectedLayerId}
                          aria-label="Delete selected layer"
                        >
                          <Trash className="w-7 h-7 text-gray-700 hover:text-purple-600 cursor-pointer" />
                        </button>
                        <span className="absolute left-1/2 top-full mt-2.5 -translate-x-1/2 text-sm bg-white text-black rounded-xl px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-200 font-bold">Delete</span>
                      </div>
                  </div>
                  
                  <div className="h-6 w-px bg-gray-300 mx-2" />
                  
                  <div className="flex items-center gap-4">
                    <div className="relative flex flex-col items-center group">
                      <button
                        type="button"
                        className="flex items-center justify-center rounded-full transition-all duration-150 hover:bg-purple-50 hover:scale-105 focus:outline-none"
                        onClick={handleBringForward}
                        disabled={!selectedLayerId}
                        aria-label="Bring Forward"
                      >
                        <BringToFront className="w-7 h-7 text-gray-700 hover:text-purple-600 cursor-pointer" />
                      </button>
                      <span className="absolute left-1/2 top-full mt-2.5 -translate-x-1/2 text-sm bg-white text-black rounded-xl px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-200 font-bold">Forward</span>
                    </div>
                    <div className="relative flex flex-col items-center group">
                      <button
                        type="button"
                        className="flex items-center justify-center rounded-full transition-all duration-150 hover:bg-purple-50 hover:scale-105 focus:outline-none"
                        onClick={handleSendBackward}
                        disabled={!selectedLayerId}
                        aria-label="Send Backward"
                      >
                        <SendToBack className="w-7 h-7 text-gray-700 hover:text-purple-600 cursor-pointer" />
                      </button>
                      <span className="absolute left-1/2 top-full mt-2.5 -translate-x-1/2 text-sm bg-white text-black rounded-xl px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-200 font-bold">Backward</span>
                    </div>
                  </div>
                  
                  <div className="h-6 w-px bg-gray-300 mx-2" />
                  
                  <div className="flex items-center gap-4">
                    <div className="relative flex flex-col items-center group">
                      <button
                        type="button"
                        onClick={handleGroupSelected}
                        disabled={selectedLayerIds.length < 2}
                        aria-label="Group selected layers"
                        className="flex items-center justify-center rounded-full transition-all duration-150 hover:bg-purple-50 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Group className="w-7 h-7 text-gray-700 hover:text-purple-600 cursor-pointer" />
                      </button>
                      <span className="absolute left-1/2 top-full mt-2.5 -translate-x-1/2 text-sm bg-white text-black rounded-xl px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-200 font-bold">Group (⌘/Ctrl + click)</span>
                    </div>
                    <div className="relative flex flex-col items-center group">
                      <button
                        type="button"
                        onClick={handleUngroupSelected}
                        disabled={!selectedLayerId}
                        aria-label="Ungroup selected layer"
                        className="flex items-center justify-center rounded-full transition-all duration-150 hover:bg-purple-50 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Ungroup className="w-7 h-7 text-gray-700 hover:text-purple-600 cursor-pointer" />
                      </button>
                      <span className="absolute left-1/2 top-full mt-2.5 -translate-x-1/2 text-sm bg-white text-black rounded-xl px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-200 font-bold">Ungroup</span>
                    </div>
                  </div>
                  
                  <div className="h-6 w-px bg-gray-300 mx-2" />
                  
                  <div className="flex items-center gap-4">
                    <div className="relative flex flex-col items-center group">
                      <div className="flex items-center justify-center rounded-full transition-all duration-150 hover:bg-purple-50 hover:scale-105">
                        <button
                          type="button"
                          onClick={() => handleToolbarFlipHorizontal({
                            selectedLayerId,
                            designAreaRef,
                            setCanvasTexts: setCanvasTextsWithComplete,
                            setCanvasImages: setCanvasImagesWithComplete,
                          })}
                          disabled={!selectedLayerId}
                          className="flex items-center justify-center"
                        >
                          <FlipHorizontal className="w-7 h-7 text-gray-700 hover:text-purple-600 cursor-pointer" />
                        </button>
                      </div>
                      <span className="absolute left-1/2 top-full mt-2.5 -translate-x-1/2 text-sm bg-white text-black rounded-xl px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-200 font-bold">Horizontal Flip</span>
                    </div>
                    <div className="relative flex flex-col items-center group">
                      <div className="flex items-center justify-center rounded-full transition-all duration-150 hover:bg-purple-50 hover:scale-105">
                        <button
                          type="button"
                          onClick={() => handleToolbarFlipVertical({
                            selectedLayerId,
                            designAreaRef,
                            setCanvasTexts: setCanvasTextsWithComplete,
                            setCanvasImages: setCanvasImagesWithComplete,
                          })}
                          disabled={!selectedLayerId}
                          className="flex items-center justify-center"
                        >
                          <FlipVertical className="w-7 h-7 text-gray-700 hover:text-purple-600 cursor-pointer" />
                        </button>
                      </div>
                      <span className="absolute left-1/2 top-full mt-2.5 -translate-x-1/2 text-sm bg-white text-black rounded-xl px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-200 font-bold">Vertical Flip</span>
                    </div>
                    <div className="relative flex flex-col items-center group">
                      <button
                        type="button"
                        onClick={handleCreatePattern}
                        disabled={!selectedLayerId}
                        aria-label="Fill layout with selected layer pattern"
                        className="flex items-center justify-center rounded-full transition-all duration-150 hover:bg-purple-50 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Grip className="w-7 h-7 text-gray-700 hover:text-purple-600 cursor-pointer" />
                      </button>
                      <span className="absolute left-1/2 top-full mt-2.5 -translate-x-1/2 text-sm bg-white text-black rounded-xl px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-200 font-bold">Pattern</span>
                    </div>
                    <div className="relative flex flex-col items-center group">
                      <div className="flex items-center justify-center rounded-full transition-all duration-150 hover:bg-purple-50 hover:scale-105">
                        <button
                          type="button"
                          className="flex items-center justify-center"
                          onClick={() => handleToolbarCopy({
                            selectedLayerId,
                            designAreaRef,
                            setCanvasTexts: setCanvasTextsWithComplete,
                            setCanvasImages: setCanvasImagesWithComplete,
                            setSelectedLayerId
                          })}
                          disabled={!selectedLayerId}
                          aria-label="Duplicate selected layer"
                        >
                          <Copy className="w-7 h-7 text-gray-700 hover:text-purple-600 cursor-pointer" />
                        </button>
                      </div>
                      <span className="absolute left-1/2 top-full mt-2.5 -translate-x-1/2 text-sm bg-white text-black rounded-xl px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-200 font-bold">Duplicate</span>
                    </div>
                    <div className="relative flex flex-col items-center group">
                      <button
                        type="button"
                        onClick={openCropDialog}
                        disabled={!selectedCropImage}
                        aria-label="Crop selected image"
                        className="flex items-center justify-center rounded-full transition-all duration-150 hover:bg-purple-50 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Crop className="w-7 h-7 text-gray-700 hover:text-purple-600 cursor-pointer" />
                      </button>
                      <span className="absolute left-1/2 top-full mt-2.5 -translate-x-1/2 text-sm bg-white text-black rounded-xl px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-200 font-bold">Crop</span>
                    </div>
                  </div>
                  
                  <div className="h-6 w-px bg-gray-300 mx-2" />
                  
                  <div className="flex items-center gap-4">
                    <div className="relative flex flex-col items-center group">
                      <button
                        type="button"
                        onClick={() => handleAlignSelected("left")}
                        disabled={!selectedLayerId}
                        aria-label="Align selected layer left"
                        className="flex items-center justify-center rounded-full transition-all duration-150 hover:bg-purple-50 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <AlignStartVertical className="w-7 h-7 text-gray-700 hover:text-purple-600 cursor-pointer" />
                      </button>
                      <span className="absolute left-1/2 top-full mt-2.5 -translate-x-1/2 text-sm bg-white text-black rounded-xl px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-200 font-bold">Left</span>
                    </div>
                    <div className="relative flex flex-col items-center group">
                      <button
                        type="button"
                        onClick={() => handleAlignSelected("center")}
                        disabled={!selectedLayerId}
                        aria-label="Align selected layer horizontally centered"
                        className="flex items-center justify-center rounded-full transition-all duration-150 hover:bg-purple-50 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <AlignHorizontalJustifyCenter className="w-7 h-7 text-gray-700 hover:text-purple-600 cursor-pointer" />
                      </button>
                      <span className="absolute left-1/2 top-full mt-2.5 -translate-x-1/2 text-sm bg-white text-black rounded-xl px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-200 font-bold">Center</span>
                    </div>
                    <div className="relative flex flex-col items-center group">
                      <button
                        type="button"
                        onClick={() => handleAlignSelected("right")}
                        disabled={!selectedLayerId}
                        aria-label="Align selected layer right"
                        className="flex items-center justify-center rounded-full transition-all duration-150 hover:bg-purple-50 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <AlignEndVertical className="w-7 h-7 text-gray-700 hover:text-purple-600 cursor-pointer" />
                      </button>
                      <span className="absolute left-1/2 top-full mt-2.5 -translate-x-1/2 text-sm bg-white text-black rounded-xl px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-200 font-bold">Right</span>
                    </div>
                    <div className="relative flex flex-col items-center group">
                      <button
                        type="button"
                        onClick={() => handleAlignSelected("top")}
                        disabled={!selectedLayerId}
                        aria-label="Align selected layer top"
                        className="flex items-center justify-center rounded-full transition-all duration-150 hover:bg-purple-50 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <AlignStartHorizontal className="w-7 h-7 text-gray-700 hover:text-purple-600 cursor-pointer" />
                      </button>
                      <span className="absolute left-1/2 top-full mt-2.5 -translate-x-1/2 text-sm bg-white text-black rounded-xl px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-200 font-bold">Top</span>
                    </div>
                    <div className="relative flex flex-col items-center group">
                      <button
                        type="button"
                        onClick={() => handleAlignSelected("middle")}
                        disabled={!selectedLayerId}
                        aria-label="Align selected layer vertically centered"
                        className="flex items-center justify-center rounded-full transition-all duration-150 hover:bg-purple-50 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <AlignCenterHorizontal className="w-7 h-7 text-gray-700 hover:text-purple-600 cursor-pointer" />
                      </button>
                      <span className="absolute left-1/2 top-full mt-2.5 -translate-x-1/2 text-sm bg-white text-black rounded-xl px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-200 font-bold">Middle</span>
                    </div>
                    <div className="relative flex flex-col items-center group">
                      <button
                        type="button"
                        onClick={() => handleAlignSelected("bottom")}
                        disabled={!selectedLayerId}
                        aria-label="Align selected layer bottom"
                        className="flex items-center justify-center rounded-full transition-all duration-150 hover:bg-purple-50 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <AlignEndHorizontal className="w-7 h-7 text-gray-700 hover:text-purple-600 cursor-pointer" />
                      </button>
                      <span className="absolute left-1/2 top-full mt-2.5 -translate-x-1/2 text-sm bg-white text-black rounded-xl px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-200 font-bold">Bottom</span>
                    </div>
                  </div>
                  
                  <div className="w-3 flex-shrink-0" />
                </div>
              </div>
              
              {/* Left+Center+View Controls Row */}
              <div className="flex flex-1 min-h-0 h-0">
                {/* Left Side Panel */}
                <div className="w-48 bg-[#ECDBEF] flex flex-col items-center justify-start relative h-full min-h-0">
                  <div className="flex flex-col space-y-3 mt-8 w-full items-center">
                    <button
                      type="button"
                      onClick={() => setShowTips(true)}
                      className="w-36 h-12 bg-white border-2 border-black hover:border-purple-600 flex flex-row items-center rounded-full shadow-none px-4 text-lg font-extrabold relative"
                    >
                      <Check className="w-5 h-5 absolute left-3" />
                      <span className="font-extrabold text-black text-lg flex-1 text-center">Check</span>
                    </button>
                    <button
                      className={`w-36 h-12 bg-white border-2 ${showLayerPanel ? 'border-purple-600' : 'border-black'} hover:border-purple-600 flex flex-row items-center justify-start rounded-full shadow-none px-4 text-lg font-extrabold gap-2`}
                      onClick={() => setShowLayerPanel((prev) => !prev)}
                    >
                      <Layers className={`w-7 h-7 mr-2 ${showLayerPanel ? 'text-purple-600' : 'text-black'}`} />
                      <span className={`font-extrabold text-lg ${showLayerPanel ? 'text-purple-600' : 'text-black'}`}>Layer</span>
                      <span className={`text-base ml-2 ${showLayerPanel ? 'text-purple-600' : 'text-black'}`}>{showLayerPanel ? '▲' : '▼'}</span>
                    </button>
                    
                    {/* Layer Panel */}
                    {showLayerPanel && displayLayers.length > 0 && (
                      <div className="w-44 bg-transparent rounded-2xl mt-3 flex flex-col gap-2 p-2 border-2 border-purple-600 shadow-lg">
                        {displayLayers.map((layer) => {
                          const isSelected = selectedLayerIds.includes(layer.id);
                          return (
                            <div
                              key={layer.id}
                              className={`flex items-center justify-between pr-2 py-1 rounded-full border-2 bg-white cursor-pointer transition-all min-h-[44px] h-[52px] relative
                                ${isSelected ? 'border-pink-400 bg-pink-50' : 'border-black'}`}
                              onClick={(event) => {
                                const isMultiSelect = event.metaKey || event.ctrlKey;
                                if (isMultiSelect) {
                                  setSelectedLayerIds((previous) =>
                                    previous.includes(layer.id)
                                      ? previous.filter((id) => id !== layer.id)
                                      : [...previous, layer.id],
                                  );
                                } else {
                                  setSelectedLayerIds([layer.id]);
                                }
                                setSelectedLayerId(layer.id);
                                // Canvas selection is intentionally kept single. Calling it
                                // during multi-select would overwrite the layer-panel selection.
                                if (!isMultiSelect) {
                                  if (layer.type === "text" && designAreaRef.current?.selectTextFromLayer) {
                                    designAreaRef.current.selectTextFromLayer(layer.originalId);
                                  } else if (layer.type === "image" && designAreaRef.current?.selectImageFromLayer) {
                                    designAreaRef.current.selectImageFromLayer(layer.originalId);
                                  }
                                }
                              }}
                              style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.04)' }}
                            >
                              <span className="h-10 flex items-center justify-center bg-gray-100 rounded-full border border-gray-300 flex-1 ml-2 mr-2 px-2 min-w-0">
                                {layer.type === "image" && layer.src ? (
                                  <img 
                                    src={layer.src} 
                                    alt="layer preview"
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  <span className="text-xs truncate text-center">{layer.name}</span>
                                )}
                              </span>
                              <button
                                type="button"
                                className="focus:outline-none flex-shrink-0"
                                onClick={e => {
                                  e.stopPropagation();
                                  toggleLayerVisible(layer.id);
                                }}
                              >
                                {layer.visible ? (
                                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block align-middle text-black">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                  </svg>
                                ) : (
                                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block align-middle text-black">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.94 17.94A10.05 10.05 0 0 1 12 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 0 1 4.422-5.568M6.1 6.1A9.956 9.956 0 0 1 12 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 0 1-4.293 5.428" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47" />
                                    <line x1="3" y1="3" x2="21" y2="21" strokeWidth="2" stroke="#000" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Center Canvas */}
                <div className="flex-1 flex items-center justify-center relative h-full min-h-0 bg-white">
                  <div
                    className="relative w-full max-w-[600px] aspect-square flex items-center justify-center overflow-hidden"
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: 'center center',
                      transition: 'transform 0.2s',
                    }}
                  >
                    <DesignArea
                      ref={designAreaRef}
                      coords={{ x: 0, y: 0, width: 600, height: 600 }}
                      productView={selectedView}
                      productImageSrc={productViewAssets[selectedView]}
                      onTextsChange={setCanvasTextsLive}
                      onImagesChange={setCanvasImagesLive}
                      onTextsChangeComplete={handleTextsChangeComplete}
                      onImagesChangeComplete={handleImagesChangeComplete}
                      onSelectionChange={handleSelectionChange}
                    />
                  </div>
                </div>
                
                {/* View Controls */}
                <div className="w-48 bg-[#ECDBEF] flex flex-col items-center relative h-full min-h-0 overflow-y-auto">
                  <div className="flex flex-col items-center justify-between w-full h-full py-6">
                      {views.map((view) => {
                        const isSideView = view === "Right" || view === "Left";
                        const isLeftView = view === "Left";
                        let pillClass = 'border-2 border-black text-black bg-white';
                        if (selectedView === view) {
                          pillClass = 'border-2 border-[#f87171] text-[#f87171] bg-white';
                        }

                        let borderColor = '#000';
                        if (selectedView === view) {
                          borderColor = '#f87171';
                        }

                        const borderWidth = 2.5;
                        const overlap = borderWidth;

                        return (
                          <div key={view} className="flex flex-col items-center gap-0 relative" style={{ width: 160 }}>
                            <button
                              type="button"
                              aria-label={`${view} view`}
                              aria-pressed={selectedView === view}
                              className="relative w-[160px] h-[205px] overflow-hidden"
                              style={{
                                background: 'white',
                                borderRadius: '1.5rem',
                                border: `${borderWidth}px solid ${borderColor}`,
                                cursor: 'pointer',
                                zIndex: 2,
                              }}
                              onClick={() => setSelectedView(view)}
                            >
                              <img
                                src={productViewAssets[view]}
                                alt={`${view} t-shirt preview`}
                                className="absolute left-1/2 top-1/2 h-[145%] w-[145%] max-w-none object-contain"
                                style={{
                                  transform: `translate(-50%, -50%) scaleX(${isLeftView ? -1 : 1})`,
                                }}
                              />
                              <span
                                aria-hidden="true"
                                className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 border border-dashed border-gray-700 ${isSideView ? 'top-[65%] h-14 w-9' : 'top-[52%] h-12 w-8'}`}
                              />
                            </button>
                            <button
                              className={`min-w-[90px] px-3 py-0.5 rounded-full font-bold text-base transition-colors duration-150 ${pillClass}`}
                              style={{
                                marginTop: `-${overlap}px`,
                                zIndex: 3,
                                position: 'relative',
                                lineHeight: 1.05,
                              }}
                              onClick={() => setSelectedView(view)}
                            >
                              {view}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Sidebar */}
            <div className="w-[30rem] bg-white border-l border-gray-200 overflow-y-auto h-full min-h-0 flex flex-col">
              {selectedLayerId && selectedLayerId.startsWith("text-") ? (
                <TextStyleSidebar 
                  selectedText={canvasTexts.find(t => `text-${t.id}` === selectedLayerId)}
                  onChangeTextStyle={(style) => {
                    const selectedText = canvasTexts.find(t => `text-${t.id}` === selectedLayerId);
                    if (selectedText && designAreaRef.current?.updateTextStyle) {
                      // Updating text style
                      designAreaRef.current.updateTextStyle(selectedText.id, style);
                    }
                  }}
                  onGoBack={() => {
                    // Clear text selection and return to previous toolbar
                    setSelectedLayerId(null);
                    setSelectedLayerIds([]);
                    if (designAreaRef.current?.clearSelection) {
                      designAreaRef.current.clearSelection();
                    }
                  }}
                />
              ) : (
                <div className="p-6 flex flex-col justify-between h-full">
                  {/* Brand Name header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xl text-gray-600 font-bold">Brand Name</div>
                    <div className="flex items-center space-x-3">
                      <Share className="w-7 h-7 text-gray-600" />
                      <button
                        aria-label="좋아요"
                        onClick={() => setLiked((prev) => !prev)}
                        className="focus:outline-none bg-transparent border-none p-0 m-0"
                        style={{ lineHeight: 0 }}
                      >
                        <Heart
                          className={`w-7 h-7 transition-all duration-200 ${liked ? 'fill-red-500 text-red-500 animate-shake' : 'text-gray-600'}`}
                        />
                      </button>
                    </div>
                  </div>

              {/* Product Info */}
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{selectedProduct.name}</h2>
                <div className="text-sm text-gray-600 mb-1">1EA or more ${selectedProduct.basePrice}</div>
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {[...Array(4)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <defs>
                        <linearGradient id="halfStar" x1="0" y1="0" x2="24" y2="0" gradientUnits="userSpaceOnUse">
                          <stop offset="50%" stopColor="#facc15" />
                          <stop offset="50%" stopColor="white" />
                        </linearGradient>
                      </defs>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="url(#halfStar)" stroke="#facc15" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600 ml-2 underline cursor-pointer">Reviews {selectedProduct.reviewCount.toLocaleString()}</span>
                </div>
              </div>

              {/* Color Selection */}
              <div className="mb-4">
                <h3 className="font-extrabold text-gray-900 mb-4 text-lg">Color • {selectedColor}</h3>
                <div className="grid grid-cols-10 gap-1 mb-3">
                  {selectedProduct.availableColors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color.name)}
                      className="w-8 h-8 rounded-full border-2 hover:scale-110 transition-all duration-200 hover:shadow-md"
                      style={{ 
                        backgroundColor: color.hex,
                        borderColor: color.name === selectedColor ? '#f87171' : '#9ca3af',
                        borderWidth: color.name === selectedColor ? '3px' : '2px',
                        transform: color.name === selectedColor ? 'scale(1.05)' : 'scale(1)'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mb-4">
                <h3 className="font-extrabold text-gray-900 mb-4 text-lg">Size</h3>
                <div className="flex justify-between gap-4">
                  {selectedProduct.availableSizes.map((size) => (
                    <button
                      key={size}
                      className={`w-24 h-10 rounded-full text-base font-normal px-0 text-center border-2 transition-colors duration-150 ${
                        selectedSize === size ? "border-red-400 text-red-500 bg-white" : "border-black text-black bg-white hover:border-red-400"
                      }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-4">
                <h3 className="font-extrabold text-gray-900 mb-4 text-lg">Quantity</h3>
                <div className="flex items-center gap-x-2 mb-2">
                  <div className="flex items-center rounded-full border-2 border-black px-6 py-1 bg-white w-80 justify-between h-10">
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-full text-lg hover:bg-gray-100"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      min="1"
                      className="w-16 text-center border-none focus:ring-0 focus:outline-none bg-transparent text-base appearance-none"
                      style={{ MozAppearance: 'textfield' }}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                    <style>{`
                      input[type=number]::-webkit-inner-spin-button, 
                      input[type=number]::-webkit-outer-spin-button {
                        -webkit-appearance: none;
                        margin: 0;
                      }
                      input[type=number] {
                        -moz-appearance: textfield;
                      }
                    `}</style>
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-full text-lg hover:bg-gray-100"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="flex flex-col items-center justify-center rounded-full border-2 border-black bg-white px-4 py-1 text-xs font-normal w-32 h-10"
                    type="button"
                  >
                    <span>Bulk Order</span>
                    <span>Price Policy</span>
                  </button>
                </div>
                <p className="text-xs text-gray-600">{selectedProduct.minOrderQuantity} set minimum order</p>
              </div>

              {/* Design Tools */}
              <div className="mb-4">
                <div className="grid grid-cols-3 gap-3">
                  {designTools.map((tool, index) => (
                    <button
                      key={index}
                      className="flex flex-col items-center p-3 bg-purple-100 rounded-lg transition-colors group hover:bg-purple-200 hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      tabIndex={0}
                      onClick={async () => {
                        if (tool.label === "Text" && designAreaRef.current?.addText) {
                          // Let DesignArea.addText update internal texts and call onTextsChange/onTextsChangeComplete.
                          // Rely on those callbacks to update parent state and snapshots. We only need to trigger
                          // the add and then select the created text for the sidebar.
                          const newText = designAreaRef.current.addText();
                          if (newText) {
                            const layerId = `text-${newText.id}`;
                            setSelectedLayerId(layerId);
                            setSelectedLayerIds([layerId]);
                            if (designAreaRef.current?.selectTextFromLayer) {
                              designAreaRef.current.selectTextFromLayer(newText.id);
                            }
                          }
                        } else if (tool.label === "Image") {
                          // Image upload trigger
                          triggerImageUpload();
                        } else if (tool.label === "Change") {
                          setShowProductPicker(true);
                        } else if (tool.label === "Design") {
                          setShowDesignLibrary(true);
                        } else if (tool.label === "Library") {
                          setShowUserLibrary(true);
                        }
                      }}
                    >
                      <tool.icon className="w-5 h-5 text-purple-600 mb-1 group-hover:text-purple-800 transition-colors" />
                      <span className="text-xs font-medium text-gray-700 group-hover:text-purple-800 transition-colors">{tool.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Input */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Please enter your request for the designer!"
                  className="w-full focus:ring-purple-600 focus:border-purple-600 h-8 placeholder:text-gray-400/70 px-3 py-1 border border-gray-300 rounded-md"
                />
              </div>

              {/* Price and Actions */}
              <div className="border-t border-gray-200 pt-6 relative">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600">{quantity}EA</span>
                  <span className="text-xl font-bold text-gray-900">${calculatePrice()}</span>
                  <button
                    aria-label="가격 상세 보기"
                    onClick={() => setShowPriceList((prev) => !prev)}
                    className="focus:outline-none bg-transparent border-none p-0 m-0 flex items-center"
                    style={{ lineHeight: 0 }}
                  >
                    <span style={{ color: '#f87171', fontSize: '1.25rem', lineHeight: 1, display: 'inline-block', fontWeight: 700, transition: 'transform 0.2s' }}>
                      {showPriceList ? '▼' : '▲'}
                    </span>
                  </button>
                </div>
                
                {/* Price List Slide */}
                <div
                  className="absolute left-0 w-full z-10"
                  style={{
                    bottom: showPriceList ? '100%' : '0',
                    opacity: showPriceList ? 1 : 0,
                    pointerEvents: showPriceList ? 'auto' : 'none',
                    transition: 'bottom 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s',
                  }}
                >
                  <div className="rounded-2xl border border-gray-300 bg-white shadow-lg px-6 py-4 mb-2 mx-0">
                    <ul className="mb-0 px-2">
                      {priceBreakdown.map((item) => (
                        <li key={item.label} className="flex justify-between items-center py-1 text-base font-semibold">
                          <span className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-red-400 mr-2"></span>
                            {item.label}
                          </span>
                          <span className="text-gray-900 font-bold">${item.value.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button 
                    className="flex-1 flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-base ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-4 bg-red-400 text-black hover:bg-red-500 font-semibold shadow-sm"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add To Cart
                  </button>
                  <button 
                    className="flex-1 flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-base ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-4 bg-red-400 text-black hover:bg-red-500 font-semibold shadow-sm"
                    onClick={handleBuyNow}
                  >
                    <CreditCard className="w-5 h-5" />
                    Buy
                  </button>
                </div>
              </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {showCropDialog && <CropDialog image={selectedCropImage} bounds={cropBounds} onBoundsChange={updateCropBound} onApply={applyCrop} onClose={() => setShowCropDialog(false)} />}

        {showTips && <TipsDialog
          onClose={() => setShowTips(false)}
          onUpload={() => { setShowTips(false); triggerImageUpload(); }}
          onInsertText={() => {
            const newText = designAreaRef.current?.addText?.();
            if (newText) {
              const layerId = `text-${newText.id}`;
              setSelectedLayerId(layerId);
              setSelectedLayerIds([layerId]);
              designAreaRef.current?.selectTextFromLayer?.(newText.id);
            }
            setShowTips(false);
          }}
          onOpenDesign={() => { setShowTips(false); setShowDesignLibrary(true); }}
        />}

        {showUserLibrary && <UserLibraryDialog onClose={() => setShowUserLibrary(false)} onUpload={() => { setShowUserLibrary(false); triggerImageUpload(); }} />}

        {showDesignLibrary && <DesignLibraryDialog onClose={() => setShowDesignLibrary(false)} />}

        {showProductPicker && <ProductPickerDialog
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          products={productCatalogue}
          onClose={() => setShowProductPicker(false)}
          onSelectProduct={(product) => {
            setSelectedProduct(product);
            setSelectedColor(product.availableColors[0]?.name || "White");
            setSelectedSize(product.availableSizes[0] || "M");
            setShowProductPicker(false);
          }}
        />}

        {/* Popup */}
        {showPopup && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-pink-100 border-2 border-pink-300 text-pink-700 px-8 py-4 rounded-2xl shadow-2xl z-50 text-xl font-semibold flex items-center gap-2 animate-fadein drop-shadow-lg">
            <span role="img" aria-label="cart">🛒</span>
            Added to cart!
          </div>
        )}
      </div>
    </>
  );
}
