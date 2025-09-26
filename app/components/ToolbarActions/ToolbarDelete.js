
/**
 * Deletes the selected layer.
 * @param {string|number|null} selectedLayerId - The id of the currently selected layer
 * @param {object} designAreaRef - Ref of the DesignArea component
 * @param {function} setCanvasTexts - Function to update the text layer state
 * @param {function} setCanvasImages - Function to update the image layer state
 * @param {function} setSelectedLayerId - Function to update the selected layer id state
 * @param {function} [setLayers] - (Optional) Function to update the fake layer state
 */
export function handleToolbarDelete({
  selectedLayerId,
  designAreaRef,
  setCanvasTexts,
  setCanvasImages,
  setSelectedLayerId,
  setLayers,
  layers
}) {
  if (!selectedLayerId) return;

  // Helper to compute the next selection from arrays of texts/images
  const computeAndSelectNext = ({ canvasTexts = [], canvasImages = [] }) => {
    // Build the displayLayers in the same shape as the app: texts then images
    const displayLayers = [
      ...canvasTexts.map(text => ({ id: `text-${text.id}`, type: 'text', originalId: text.id })),
      ...canvasImages.map(img => ({ id: `image-${img.id}`, type: 'image', originalId: img.id })),
    ];

    const removedId = selectedLayerId;
    const index = displayLayers.findIndex(l => l.id === removedId);

    // Build remaining list after removal
    const remaining = displayLayers.filter(l => l.id !== removedId);

    // Choose the next candidate: the item at the same index (which shifted into place),
    // otherwise the previous item, otherwise null
    let candidate = null;
    if (remaining.length > 0) {
      if (index >= 0 && index < remaining.length) {
        candidate = remaining[index];
      } else if (index - 1 >= 0 && index - 1 < remaining.length) {
        candidate = remaining[index - 1];
      } else {
        candidate = remaining[0];
      }
    }

    if (candidate) {
      setSelectedLayerId(candidate.id);
      // Ask design area to visually select it
      if (candidate.type === 'text' && designAreaRef.current?.selectTextFromLayer) {
        designAreaRef.current.selectTextFromLayer(candidate.originalId);
      } else if (candidate.type === 'image' && designAreaRef.current?.selectImageFromLayer) {
        designAreaRef.current.selectImageFromLayer(candidate.originalId);
      }
    } else {
      setSelectedLayerId(null);
      if (designAreaRef.current?.clearSelection) {
        designAreaRef.current.clearSelection();
      }
    }
  };

  if (selectedLayerId.startsWith('text-')) {
  const textId = selectedLayerId.replace('text-', '');
    if (designAreaRef.current?.deleteText) {
      designAreaRef.current.deleteText(textId);
    }
    setCanvasTexts((prev) => {
      const next = prev.filter(t => t.id !== textId);
      // compute next selection based on updated arrays
      computeAndSelectNext({ canvasTexts: next, canvasImages: [] });
      return next;
    });
  } else if (selectedLayerId.startsWith('image-')) {
  const imageId = selectedLayerId.replace('image-', '');
    if (designAreaRef.current?.deleteImage) {
      designAreaRef.current.deleteImage(imageId);
    }
    setCanvasImages((prev) => {
      const next = prev.filter(img => img.id !== imageId);
      computeAndSelectNext({ canvasTexts: [], canvasImages: next });
      return next;
    });
  } else if (setLayers && layers) {
    // Fallback for static layers array
    const nextLayers = layers.filter(layer => layer.id !== selectedLayerId);
    setLayers(nextLayers);
    // compute next selection based on provided layers (assume layers correspond to displayLayers)
    const display = nextLayers.map(l => ({ id: l.id, type: l.type || 'layer', originalId: l.originalId }));
    if (display.length > 0) {
      setSelectedLayerId(display[0].id);
    } else {
      setSelectedLayerId(null);
    }
  }
}
