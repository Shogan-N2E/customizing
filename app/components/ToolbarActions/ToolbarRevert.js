// ToolbarRevert.js
// Function to revert a layer to its initial creation state

/**
 * Reverts the selected layer to its initial creation state.
 * @param {string|number|null} selectedLayerId - The id of the currently selected layer
 * @param {object} designAreaRef - Ref of the DesignArea component
 * @param {function} setCanvasTexts - Function to update the text layer state
 * @param {function} setCanvasImages - Function to update the image layer state
 * @param {object[]} initialTexts - Array of initial states for each text layer
 * @param {object[]} initialImages - Array of initial states for each image layer
 */
export function handleToolbarRevert({
  selectedLayerId,
  designAreaRef,
  setCanvasTexts,
  setCanvasImages,
  initialTexts,
  initialImages
}) {
  if (!selectedLayerId) return;

  console.log("Revert triggered for layer:", selectedLayerId);
  console.log("Initial texts:", initialTexts);

  if (selectedLayerId.startsWith('text-')) {
  const textId = selectedLayerId.replace('text-', '');
    const initial = initialTexts.find(t => t.id === textId);
    if (initial) {
      console.log("Reverting text layer:", initial);
      setCanvasTexts(prev => prev.map(t => t.id === textId ? { ...initial } : t));
      if (designAreaRef.current?.updateTextStyle) {
        designAreaRef.current.updateTextStyle(textId, initial);
      }
      if (designAreaRef.current?.updateText) {
        designAreaRef.current.updateText(textId, initial.text);
      }
      if (designAreaRef.current?.updatePosition) {
        designAreaRef.current.updatePosition(textId, { x: initial.x, y: initial.y });
      }
    } else {
      console.warn("No initial state found for text layer:", textId);
    }
  } else if (selectedLayerId.startsWith('image-')) {
  const imageId = selectedLayerId.replace('image-', '');
    const initial = initialImages.find(img => img.id === imageId);
    if (initial) {
      console.log("Reverting image layer:", initial);
      setCanvasImages(prev => prev.map(img => img.id === imageId ? { ...initial } : img));
      if (designAreaRef.current?.updateImagePosition) {
        designAreaRef.current.updateImagePosition(imageId, initial.x, initial.y);
      }
      if (designAreaRef.current?.updateImageSize) {
        designAreaRef.current.updateImageSize(imageId, initial.width, initial.height, initial.x, initial.y);
      }
      if (designAreaRef.current?.updateImageRotation) {
        designAreaRef.current.updateImageRotation(imageId, initial.rotation || 0);
      }
    } else {
      console.warn("No initial state found for image layer:", imageId);
    }
  }
}
